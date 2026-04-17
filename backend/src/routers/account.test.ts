import { beforeAll, expect, test } from "bun:test";
import { desc, eq } from "drizzle-orm";
import db from "~/database";
import { session, user } from "~/database/schema";
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

let adminCaller: ReturnType<typeof appRouter.createCaller>;
let traineeCaller: ReturnType<typeof appRouter.createCaller>;

beforeAll(async () => {
  adminCaller = appRouter.createCaller(
    await getContextForEmail("founders@gmail.com"),
  );
  traineeCaller = appRouter.createCaller(
    await getContextForEmail("example1@gmail.com"),
  );
});

test("non-admin cannot list users", async () => {
  await expect(traineeCaller.account.list()).rejects.toThrow("FORBIDDEN");
});

test("admin can list users", async () => {
  const users = await adminCaller.account.list();
  expect(users.length).toBeGreaterThan(0);
});

test("admin can update role", async () => {
  const users = await adminCaller.account.list();
  const target = users.find((u) => u.email === "example1@gmail.com");
  if (!target) throw new Error("Seeded trainee user missing");

  await adminCaller.account.updateRole({
    userId: target.id,
    role: "instructor",
  });

  const [updated] = await db.client
    .select()
    .from(user)
    .where(eq(user.id, target.id));
  expect(updated?.role).toBe("instructor");

  // restore for e2e expectations
  await adminCaller.account.updateRole({
    userId: target.id,
    role: "user",
  });
});
