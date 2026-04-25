import { beforeAll, afterAll, expect, test } from "bun:test";
import { and, eq } from "drizzle-orm";
import db from "~/database";
import {
  course,
  courseEvent,
  profile,
  reservation,
  user,
} from "~/database/schema";
import {
  createAndLinkRegistrationInvoice,
  updateReservationPaymentByInvoiceId,
} from "./stripe-reservation";
import { Status } from "~/database/schema";

let profileId: string;
let eventId: string;
beforeAll(async () => {
  process.env.STRIPE_BYPASS_INVOICES = "1";
  const [u] = await db.client
    .select()
    .from(user)
    .where(eq(user.email, "example1@gmail.com"));
  if (!u) throw new Error("seed user");
  const [p] = await db.client
    .select()
    .from(profile)
    .where(eq(profile.accountId, u.id));
  if (!p) throw new Error("seed profile");
  profileId = p.id;
  const [ev] = await db.client.select().from(courseEvent).limit(1);
  if (!ev) throw new Error("seed event");
  eventId = ev.id;

  await db.client
    .delete(reservation)
    .where(
      and(
        eq(reservation.profileId, profileId),
        eq(reservation.courseEventId, eventId),
      ),
    );
  await db.client.insert(reservation).values({
    profileId,
    courseEventId: eventId,
    creditHours: "0",
    paymentStatus: "unpaid",
    status: "registered",
  });
});

afterAll(async () => {
  await db.client
    .delete(reservation)
    .where(
      and(
        eq(reservation.profileId, profileId),
        eq(reservation.courseEventId, eventId),
      ),
    );
});

test("updateReservationPaymentByInvoiceId sets paymentStatus", async () => {
  const testInv = "in_reservation_test_123";
  await db.client
    .update(reservation)
    .set({ stripeInvoiceId: testInv, paymentStatus: "unpaid" })
    .where(
      and(
        eq(reservation.profileId, profileId),
        eq(reservation.courseEventId, eventId),
      ),
    );
  await updateReservationPaymentByInvoiceId(testInv, Status.Paid);
  const [r] = await db.client
    .select()
    .from(reservation)
    .where(
      and(
        eq(reservation.profileId, profileId),
        eq(reservation.courseEventId, eventId),
      ),
    );
  expect(r?.paymentStatus).toBe("paid");
});

test("createAndLinkRegistrationInvoice (bypass) sets stripe invoice id on reservation", async () => {
  const [cRow] = await db.client
    .select({ courseName: course.courseName })
    .from(courseEvent)
    .innerJoin(course, eq(courseEvent.courseId, course.id))
    .where(eq(courseEvent.id, eventId));
  if (!cRow) throw new Error("event join");
  const name = cRow.courseName;
  const invoice = await createAndLinkRegistrationInvoice({
    profileId,
    courseEventId: eventId,
    priceCents: 100,
    courseName: name,
    stripeCustomerId: "cus_bypass",
  });
  const expected = `in_test_bypass_${profileId.slice(-8)}_${eventId.slice(-8)}`;
  expect(invoice.stripeInvoiceId).toBe(expected);
  expect(invoice.hostedInvoiceUrl).toBeNull();
  const [r] = await db.client
    .select()
    .from(reservation)
    .where(
      and(
        eq(reservation.profileId, profileId),
        eq(reservation.courseEventId, eventId),
      ),
    );
  expect(r?.stripeInvoiceId).toBe(expected);
});
