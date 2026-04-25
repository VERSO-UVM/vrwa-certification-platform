import { beforeAll, expect, test } from "bun:test";
import { desc, eq } from "drizzle-orm";
import db from "~/database";
import { profile, session, user } from "~/database/schema";
import { appRouter } from "~/trpc";
import { generatePrefixedId } from "~/utils/id";

async function getContextForEmail(email: string) {
  const [account] = await db.client
    .select()
    .from(user)
    .where(eq(user.email, email));
  if (!account) throw new Error(`Missing seeded account for ${email}`);

  let [activeSession] = await db.client
    .select()
    .from(session)
    .where(eq(session.userId, account.id))
    .orderBy(desc(session.createdAt));

  if (!activeSession) {
    [activeSession] = await db.client
      .insert(session)
      .values({
        id: generatePrefixedId("session"),
        token: generatePrefixedId("session"),
        userId: account.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
  }
  if (!activeSession) throw new Error("Unable to create session for test");

  return {
    req: {} as never,
    res: {} as never,
    db,
    account,
    session: {
      ...activeSession,
      activeProfileId: activeSession.activeProfileId ?? "",
    },
  };
}

let caller: ReturnType<typeof appRouter.createCaller>;

beforeAll(async () => {
  caller = appRouter.createCaller(
    await getContextForEmail("example1@gmail.com"),
  );
});

test("createProfile inserts row for current account", async () => {
  const created = await caller.profile.createProfile({
    firstName: "Unit",
    lastName: "TestProfile",
    address: "1 Test Ln",
    city: "Montpelier",
    state: "VT",
    postalCode: "05602",
    phoneNumber: "802-555-0199",
    isMember: false,
  });

  expect(created.firstName).toBe("Unit");
  expect(created.accountId).toBeTruthy();

  await db.client.delete(profile).where(eq(profile.id, created.id));
});

test("switchProfile rejects profile owned by another account", async () => {
  const [other] = await db.client
    .select()
    .from(user)
    .where(eq(user.email, "founders@gmail.com"));
  if (!other) throw new Error("seed admin");
  const [foreignProfile] = await db.client
    .select()
    .from(profile)
    .where(eq(profile.accountId, other.id))
    .limit(1);
  if (!foreignProfile) throw new Error("seed admin profile");

  await expect(
    caller.profile.switchProfile({ profileId: foreignProfile.id }),
  ).rejects.toThrow(/Invalid profile/i);
});
