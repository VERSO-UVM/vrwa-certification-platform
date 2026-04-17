import { beforeAll, expect, test } from "bun:test";
import { desc, eq } from "drizzle-orm";
import db from "~/database";
import {
  course,
  courseEvent,
  profile,
  reservation,
  session,
  user,
} from "~/database/schema";
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
let profileId = "";
let pastEventId = "";

beforeAll(async () => {
  caller = appRouter.createCaller(
    await getContextForEmail("example1@gmail.com"),
  );
  const [seededProfile] = await db.client
    .select()
    .from(profile)
    .where(eq(profile.firstName, "John"));
  if (!seededProfile) throw new Error("Seed profile missing");
  profileId = seededProfile.id;

  const [existingPast] = await db.client
    .select()
    .from(courseEvent)
    .where(eq(courseEvent.locationType, "virtual"))
    .orderBy(desc(courseEvent.classStartDatetime));

  if (existingPast) {
    pastEventId = existingPast.id;
  }
});

test("getMyPastSessions returns past sessions", async () => {
  const sessions = await caller.trainee.getMyPastSessions();
  expect(Array.isArray(sessions)).toBe(true);
});

test("registerForSession rejects duplicate registration", async () => {
  const available = await caller.trainee.getAllAvailableSessions();
  const first = available[0];
  expect(first).toBeTruthy();
  if (!first) throw new Error("Missing available session");

  await caller.trainee
    .registerForSession({
      profileId,
      courseEventId: first.id,
    })
    .catch(() => {});

  await expect(
    caller.trainee.registerForSession({
      profileId,
      courseEventId: first.id,
    }),
  ).rejects.toThrow("Already registered");
});

test("registerForSession rejects past event", async () => {
  const [pastCourse] = await db.client
    .insert(course)
    .values({
      id: generatePrefixedId("course"),
      courseName: "Past Session Test",
      description: "Past course for tests",
      creditHours: 1,
      priceCents: 1000,
    })
    .returning();
  if (!pastCourse) throw new Error("Failed to create past course");

  const [pastEvent] = await db.client
    .insert(courseEvent)
    .values({
      id: generatePrefixedId("courseEvent"),
      courseId: pastCourse.id,
      locationType: "virtual",
      classStartDatetime: new Date(Date.now() - 1000 * 60 * 60 * 24),
      seats: 1,
    })
    .returning();
  if (!pastEvent) throw new Error("Failed to create past event");

  pastEventId = pastEvent.id;

  await expect(
    caller.trainee.registerForSession({
      profileId,
      courseEventId: pastEventId,
    }),
  ).rejects.toThrow("Cannot register for a past session");
});

test("registerForSession waitlists when event is full", async () => {
  const [fullCourse] = await db.client
    .insert(course)
    .values({
      id: generatePrefixedId("course"),
      courseName: "Full Session Test",
      description: "Full course for tests",
      creditHours: 2,
      priceCents: 2000,
    })
    .returning();
  if (!fullCourse) throw new Error("Failed to create full course");

  const [fullEvent] = await db.client
    .insert(courseEvent)
    .values({
      id: generatePrefixedId("courseEvent"),
      courseId: fullCourse.id,
      locationType: "in-person",
      classStartDatetime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
      seats: 1,
    })
    .returning();
  if (!fullEvent) throw new Error("Failed to create full event");

  const [otherProfile] = await db.client
    .select()
    .from(profile)
    .where(eq(profile.firstName, "Alexander"));
  if (!otherProfile) throw new Error("Other profile missing");

  await db.client.insert(reservation).values({
    profileId: otherProfile.id,
    courseEventId: fullEvent.id,
    creditHours: "0",
    paymentStatus: "unpaid",
    status: "registered",
  });

  const result = await caller.trainee.registerForSession({
    profileId,
    courseEventId: fullEvent.id,
  });
  expect(result.status).toBe("waitlisted");
});
