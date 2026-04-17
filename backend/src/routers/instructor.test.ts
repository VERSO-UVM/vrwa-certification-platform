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
  if (!account) {
    throw new Error(`Missing seeded account for ${email}`);
  }

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
  if (!activeSession) {
    throw new Error("Unable to create session for test");
  }

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

let instructorCaller: ReturnType<typeof appRouter.createCaller>;
let traineeCaller: ReturnType<typeof appRouter.createCaller>;
let seededEventId = "";
let seededProfileId = "";

beforeAll(async () => {
  instructorCaller = appRouter.createCaller(
    await getContextForEmail("example2@gmail.com"),
  );
  traineeCaller = appRouter.createCaller(
    await getContextForEmail("example1@gmail.com"),
  );
  const roster = await instructorCaller.instructor.getEventRoster({
    courseEventId: "lecture_b7558486c6e97e9c",
  });
  if (roster.length > 0) {
    const first = roster[0];
    if (!first) throw new Error("Missing seeded roster row");
    seededEventId = first.courseEventId;
    seededProfileId = first.profileId;
  }
  if (!seededEventId || !seededProfileId) {
    throw new Error("Missing seeded instructor roster data");
  }
});

test("non-instructor cannot access roster", async () => {
  await expect(
    traineeCaller.instructor.getEventRoster({
      courseEventId: seededEventId || "lecture_b7558486c6e97e9c",
    }),
  ).rejects.toThrow("FORBIDDEN");
});

test("mark/unmark attendance updates credit hours", async () => {
  const marked = await instructorCaller.instructor.markAttendance({
    courseEventId: seededEventId,
    profileId: seededProfileId,
    creditHours: 2.5,
  });
  if (!marked) throw new Error("Expected updated reservation");
  expect(marked.creditHours).toBe("2.5");
  expect(marked.attendanceMarkedAt).toBeTruthy();

  const unmarked = await instructorCaller.instructor.unmarkAttendance({
    courseEventId: seededEventId,
    profileId: seededProfileId,
  });
  if (!unmarked) throw new Error("Expected updated reservation");
  expect(unmarked.creditHours).toBe("0");
  expect(unmarked.attendanceMarkedAt).toBeNull();
});

test("markAttendance rejects non-existent reservation", async () => {
  await expect(
    instructorCaller.instructor.markAttendance({
      courseEventId: seededEventId,
      profileId: "profile_missing",
      creditHours: 1,
    }),
  ).rejects.toThrow("Reservation not found");
});
