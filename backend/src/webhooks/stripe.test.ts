import { afterAll, beforeAll, expect, test } from "bun:test";
import { and, eq } from "drizzle-orm";
import Stripe from "stripe";
import db from "~/database";
import { courseEvent, profile, reservation, user } from "~/database/schema";
import { Status } from "~/database/schema";
import { getStripe } from "~/utils/stripe";
import { handleStripeWebhook, processStripeWebhookEvent } from "./stripe";

const WH_SECRET = "whsec_test_webhook";

beforeAll(() => {
  process.env.STRIPE_WEBHOOK_SECRET = WH_SECRET;
  if (!process.env.STRIPE_SECRET) {
    process.env.STRIPE_SECRET = "sk_test_dummy";
  }
});

afterAll(() => {
  process.env.STRIPE_WEBHOOK_SECRET = undefined;
});

test("handleStripeWebhook verifies signature for invoice.paid", async () => {
  const stripe = getStripe();
  const event = {
    id: "evt_123",
    object: "event",
    type: "invoice.paid" as const,
    data: { object: { id: "in_wh_test", object: "invoice" } as Stripe.Invoice },
  };
  const payload = JSON.stringify(event);
  const header = await stripe.webhooks.generateTestHeaderStringAsync({
    payload,
    secret: WH_SECRET,
  });
  const parsed = await handleStripeWebhook(Buffer.from(payload), header);
  expect(parsed.type).toBe("invoice.paid");
});

test("processStripeWebhookEvent sets reservation paid", async () => {
  const [u] = await db.client
    .select()
    .from(user)
    .where(eq(user.email, "example1@gmail.com"));
  if (!u) throw new Error("user");
  const [p] = await db.client
    .select()
    .from(profile)
    .where(eq(profile.accountId, u.id));
  if (!p) throw new Error("profile");
  const [ev] = await db.client.select().from(courseEvent).limit(1);
  if (!ev) throw new Error("event");
  const invId = "in_webhook_e2e_test";
  await db.client
    .delete(reservation)
    .where(
      and(
        eq(reservation.profileId, p.id),
        eq(reservation.courseEventId, ev.id),
      ),
    );
  await db.client.insert(reservation).values({
    profileId: p.id,
    courseEventId: ev.id,
    creditHours: "0",
    paymentStatus: "unpaid",
    status: "registered",
    stripeInvoiceId: invId,
  });
  const paidEvent: Stripe.Event = {
    id: "evt_999",
    object: "event",
    type: "invoice.paid",
    data: { object: { id: invId, object: "invoice" } as Stripe.Invoice },
  } as Stripe.Event;
  await processStripeWebhookEvent(paidEvent);
  const [r] = await db.client
    .select()
    .from(reservation)
    .where(
      and(
        eq(reservation.profileId, p.id),
        eq(reservation.courseEventId, ev.id),
      ),
    );
  expect(r?.paymentStatus).toBe(Status.Paid);
  await db.client
    .delete(reservation)
    .where(
      and(
        eq(reservation.profileId, p.id),
        eq(reservation.courseEventId, ev.id),
      ),
    );
});
