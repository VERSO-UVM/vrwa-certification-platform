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
  process.env.STRIPE_BYPASS_INVOICES = "1";
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

test("registerMultipleForSession registers multiple profiles", async () => {
  const [johnAccount] = await db.client
    .select()
    .from(user)
    .where(eq(user.email, "example1@gmail.com"));
  if (!johnAccount) throw new Error("Missing trainee account for batch test");

  const [johnProfile] = await db.client
    .select()
    .from(profile)
    .where(eq(profile.firstName, "John"));
  if (!johnProfile) throw new Error("Missing John profile for batch test");

  const [extraProfile] = await db.client
    .insert(profile)
    .values({
      id: generatePrefixedId("profile"),
      accountId: johnAccount.id,
      firstName: "Batch",
      lastName: "Tester",
      address: "123 Test Road",
      city: "Burlington",
      state: "VT",
      postalCode: "05401",
      phoneNumber: "802-555-0303",
      isMember: true,
    })
    .returning();
  if (!extraProfile) throw new Error("Failed to create extra profile");

  const [testCourse] = await db.client
    .insert(course)
    .values({
      id: generatePrefixedId("course"),
      courseName: "Batch Registration Test",
      description: "Batch registration course",
      creditHours: 2,
      priceCents: 3500,
    })
    .returning();
  if (!testCourse) throw new Error("Failed to create test course");

  const [testEvent] = await db.client
    .insert(courseEvent)
    .values({
      id: generatePrefixedId("courseEvent"),
      courseId: testCourse.id,
      locationType: "hybrid",
      classStartDatetime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      seats: 10,
    })
    .returning();
  if (!testEvent) throw new Error("Failed to create test event");

  const profileIds = [johnProfile.id, extraProfile.id];
  const result = await caller.trainee.registerMultipleForSession({
    profileIds,
    courseEventId: testEvent.id,
  });

  expect(result.results.length).toBe(profileIds.length);
  expect(result.results[0]?.status).toBe("registered");
  expect(result.results[0]).toHaveProperty("hostedInvoiceUrl");
  expect(result.results[0]?.hostedInvoiceUrl).toBeNull();
  expect(result.results[1]?.hostedInvoiceUrl).toBeNull();
});

test("getMyRegistrations returns future registrations for account profiles", async () => {
  const rows = await caller.trainee.getMyRegistrations();
  expect(Array.isArray(rows)).toBe(true);
  for (const row of rows) {
    expect(row).toHaveProperty("profileId");
    expect(row).toHaveProperty("courseEventId");
  }
});

test("registerMultipleForSession handles waitlist and already registered", async () => {
  const [johnAccount] = await db.client
    .select()
    .from(user)
    .where(eq(user.email, "example1@gmail.com"));
  if (!johnAccount)
    throw new Error("Missing trainee account for mixed status test");

  const [johnProfile] = await db.client
    .select()
    .from(profile)
    .where(eq(profile.firstName, "John"));
  if (!johnProfile) throw new Error("Expected John profile is missing");

  const [waitlistProfile] = await db.client
    .insert(profile)
    .values({
      id: generatePrefixedId("profile"),
      accountId: johnAccount.id,
      firstName: "Waitlist",
      lastName: "Tester",
      address: "456 Test Road",
      city: "Burlington",
      state: "VT",
      postalCode: "05401",
      phoneNumber: "802-555-0404",
      isMember: false,
    })
    .returning();
  if (!waitlistProfile) throw new Error("Failed to create waitlist profile");

  const [testCourse] = await db.client
    .insert(course)
    .values({
      id: generatePrefixedId("course"),
      courseName: "Batch Mixed Status Test",
      description: "Mixed status registration course",
      creditHours: 2,
      priceCents: 4000,
    })
    .returning();
  if (!testCourse) throw new Error("Failed to create mixed status course");

  const [testEvent] = await db.client
    .insert(courseEvent)
    .values({
      id: generatePrefixedId("courseEvent"),
      courseId: testCourse.id,
      locationType: "virtual",
      classStartDatetime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10),
      seats: 1,
    })
    .returning();
  if (!testEvent) throw new Error("Failed to create mixed status event");

  await db.client.insert(reservation).values({
    profileId: johnProfile.id,
    courseEventId: testEvent.id,
    creditHours: "0",
    paymentStatus: "unpaid",
    status: "registered",
  });

  const result = await caller.trainee.registerMultipleForSession({
    profileIds: [johnProfile.id, waitlistProfile.id],
    courseEventId: testEvent.id,
  });

  expect(
    result.results.find((entry) => entry.profileId === johnProfile.id)?.status,
  ).toBe("already_registered");
  expect(
    result.results.find((entry) => entry.profileId === waitlistProfile.id)
      ?.status,
  ).toBe("waitlisted");
});
