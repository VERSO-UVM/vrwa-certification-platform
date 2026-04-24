import { beforeAll, beforeEach, expect, mock, test } from "bun:test";
import { desc, eq } from "drizzle-orm";
import type nodemailer from "nodemailer";
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
import { setTransporterForTests } from "~/services/email";

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
let otherTraineeCaller: ReturnType<typeof appRouter.createCaller>;
let completedProfileId = "";
let completedEventId = "";
let incompleteEventId = "";

beforeAll(async () => {
  adminCaller = appRouter.createCaller(
    await getContextForEmail("founders@gmail.com"),
  );
  traineeCaller = appRouter.createCaller(
    await getContextForEmail("example1@gmail.com"),
  );
  otherTraineeCaller = appRouter.createCaller(
    await getContextForEmail("example3@gmail.com"),
  );

  const [johnProfile] = await db.client
    .select()
    .from(profile)
    .where(eq(profile.firstName, "John"));
  if (!johnProfile) throw new Error("Expected John profile missing");
  completedProfileId = johnProfile.id;

  const [testCourse] = await db.client
    .insert(course)
    .values({
      id: generatePrefixedId("course"),
      courseName: "Certificate Test Course",
      description: "Certificate tests",
      creditHours: 3,
      priceCents: 3000,
    })
    .returning();
  if (!testCourse) throw new Error("Failed creating test course");

  const [completedEvent] = await db.client
    .insert(courseEvent)
    .values({
      id: generatePrefixedId("courseEvent"),
      courseId: testCourse.id,
      locationType: "virtual",
      classStartDatetime: new Date(Date.now() - 1000 * 60 * 60 * 24),
      seats: 20,
    })
    .returning();
  if (!completedEvent) throw new Error("Failed creating completed event");
  completedEventId = completedEvent.id;

  const [notCompletedEvent] = await db.client
    .insert(courseEvent)
    .values({
      id: generatePrefixedId("courseEvent"),
      courseId: testCourse.id,
      locationType: "virtual",
      classStartDatetime: new Date(Date.now() - 1000 * 60 * 60 * 48),
      seats: 20,
    })
    .returning();
  if (!notCompletedEvent) throw new Error("Failed creating incomplete event");
  incompleteEventId = notCompletedEvent.id;

  await db.client.insert(reservation).values({
    profileId: completedProfileId,
    courseEventId: completedEventId,
    creditHours: "3",
    paymentStatus: "paid",
    status: "registered",
    attendanceMarkedAt: new Date(),
  });

  await db.client.insert(reservation).values({
    profileId: completedProfileId,
    courseEventId: incompleteEventId,
    creditHours: "0",
    paymentStatus: "unpaid",
    status: "registered",
    attendanceMarkedAt: null,
  });
});

beforeEach(() => {
  process.env.SMTP_FROM = "noreply@test.dev";
});

test("getCertificate returns base64 pdf for completed reservation", async () => {
  const result = await traineeCaller.certificateRouter.getCertificate({
    profileId: completedProfileId,
    courseEventId: completedEventId,
  });

  expect(result.filename.endsWith(".pdf")).toBe(true);
  expect(result.pdf.length).toBeGreaterThan(50);
});

test("getCertificate rejects when attendance is not marked", async () => {
  await expect(
    traineeCaller.certificateRouter.getCertificate({
      profileId: completedProfileId,
      courseEventId: incompleteEventId,
    }),
  ).rejects.toThrow("Certificate unavailable");
});

test("getCertificate rejects cross-account access", async () => {
  await expect(
    otherTraineeCaller.certificateRouter.getCertificate({
      profileId: completedProfileId,
      courseEventId: completedEventId,
    }),
  ).rejects.toThrow("FORBIDDEN");
});

test("bulkSendCertificates sends one email per recipient", async () => {
  const sendMail = mock(async () => ({ messageId: "sent" }));
  setTransporterForTests({
    sendMail,
  } as unknown as nodemailer.Transporter);

  const result = await adminCaller.certificateRouter.bulkSendCertificates({
    recipients: [
      { profileId: completedProfileId, courseEventId: completedEventId },
      { profileId: completedProfileId, courseEventId: completedEventId },
    ],
    emailSubject: "Subject",
    emailBody: "<p>Body</p>",
  });

  expect(result.sent).toBe(2);
  expect(result.errors.length).toBe(0);
  expect(sendMail).toHaveBeenCalledTimes(2);
});

test("bulkSendCertificates returns per-recipient errors", async () => {
  const sendMail = mock(async () => {
    throw new Error("Mail failure");
  });
  setTransporterForTests({
    sendMail,
  } as unknown as nodemailer.Transporter);

  const result = await adminCaller.certificateRouter.bulkSendCertificates({
    recipients: [
      { profileId: completedProfileId, courseEventId: completedEventId },
    ],
    emailSubject: "Subject",
    emailBody: "<p>Body</p>",
  });

  expect(result.sent).toBe(0);
  expect(result.errors.length).toBe(1);
  expect(result.errors[0]?.profileId).toBe(completedProfileId);
});

test("non-admin cannot bulk send certificates", async () => {
  await expect(
    traineeCaller.certificateRouter.bulkSendCertificates({
      recipients: [
        { profileId: completedProfileId, courseEventId: completedEventId },
      ],
      emailSubject: "Subject",
      emailBody: "<p>Body</p>",
    }),
  ).rejects.toThrow("FORBIDDEN");
});
