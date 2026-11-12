import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import Stripe from "stripe";
import { and, eq, inArray, ne } from "drizzle-orm";
import db from "~/database";
import { PaymentRate, PaymentStatus, reservation } from "~/database/schema";

export const stripe = new Stripe(import.meta.env.STRIPE_API_SECRET_KEY || "", {
  apiVersion: "2026-10-28.endive",
});

const webhookSecret = import.meta.env.STRIPE_WEBHOOK_SECRET || "";

/** Mark reservations for a Checkout Session as Paid. */
export async function markReservationsPaidForSession(sessionId: string) {
  await db.client
    .update(reservation)
    .set({ paymentStatus: PaymentStatus.Paid })
    .where(
      and(
        eq(reservation.stripeCheckoutSessionId, sessionId),
        ne(reservation.paymentStatus, PaymentStatus.Paid),
      ),
    );
}

/**
 * Release seats held by unpaid reservations when a Checkout Session expires.
 * Only deletes Draft/Open rows so Paid/Refunded rows are never touched.
 */
export async function releaseReservationsForExpiredSession(sessionId: string) {
  await db.client
    .delete(reservation)
    .where(
      and(
        eq(reservation.stripeCheckoutSessionId, sessionId),
        inArray(reservation.paymentStatus, [
          PaymentStatus.Draft,
          PaymentStatus.Open,
        ]),
      ),
    );
}

export function stripeWebhook(app: FastifyInstance) {
  app.addContentTypeParser(
    "application/json",
    { parseAs: "buffer" },
    (req, body, done) => {
      // Preserve raw bytes for signature verification
      (req as any).rawBody = body;
      try {
        done(null, JSON.parse(body.toString()));
      } catch (err) {
        done(err as Error, undefined);
      }
    },
  );

  app.post("/webhook", handleWebhook);
}

async function handleWebhook(request: FastifyRequest, reply: FastifyReply) {
  const signature = request.headers["stripe-signature"];
  const rawBody = (request as any).rawBody as Buffer<ArrayBufferLike>;

  if (!signature || !rawBody) {
    return reply.status(400).send({ error: "Missing signature or body" });
  }

  let notification: Stripe.V2.Core.EventNotification;
  try {
    notification = await stripe.parseEventNotificationAsync(
      rawBody,
      signature,
      webhookSecret,
    );
  } catch (err) {
    request.log.warn({ err }, "Webhook signature verification failed");
    return reply.status(400).send({ error: "Invalid signature" });
  }

  reply.status(200).send({ received: true });

  try {
    await handleEventNotification(notification);
  } catch (err) {
    request.log.error({ err }, "Webhook handler failed");
  }
}

async function handleEventNotification(
  notification: Stripe.V2.Core.EventNotification,
) {
  switch (notification.type) {
    case "v1.checkout.session.completed":
    case "v1.checkout.session.async_payment_succeeded": {
      const session =
        (await notification.fetchRelatedObject()) as Stripe.Checkout.Session | null;
      if (!session?.id) return;
      // Only fulfill when payment is complete (async methods start unpaid)
      if (session.payment_status === "paid") {
        await markReservationsPaidForSession(session.id);
      }
      break;
    }
    case "v1.checkout.session.expired": {
      const session =
        (await notification.fetchRelatedObject()) as Stripe.Checkout.Session | null;
      if (!session?.id) return;
      await releaseReservationsForExpiredSession(session.id);
      break;
    }
  }
}

/**
 * Email a pay-by-check invoice via Stripe Invoicing.
 */
export async function sendCheckInvoice({
  userId,
  courseId,
  paymentRate,
  reservationIds,
  email,
  courseName,
  amountCents,
}: {
  userId: string;
  courseId: string;
  paymentRate: PaymentRate;
  reservationIds: string[];
  email: string;
  courseName: string;
  amountCents: number;
}) {
  const invoiceKey = `check-invoice-${userId}}-${courseId}`;

  const existing = await stripe.customers.list({ email, limit: 1 });
  const customer =
    existing.data[0] ??
    (await stripe.customers.create(
      { email },
      { idempotencyKey: `${invoiceKey}-customer` },
    ));

  const invoice = await stripe.invoices.create(
    {
      customer: customer.id,
      collection_method: "send_invoice",
      days_until_due: 30,
      pending_invoice_items_behavior: "exclude",
      description: `Registration for ${courseName} (pay by check)`,
      metadata: { reservationIds: reservationIds.join(",") },
    },
    { idempotencyKey: `${invoiceKey}-invoice` },
  );

  await stripe.invoiceItems.create(
    {
      customer: customer.id,
      invoice: invoice.id,
      currency: "usd",
      amount: amountCents,
      description: `${courseName} — ${reservationIds.length} seat(s) - ${paymentRate}`,
    },
    { idempotencyKey: `${invoiceKey}-item` },
  );

  await stripe.invoices.finalizeInvoice(invoice.id, { auto_advance: false });
  await stripe.invoices.sendInvoice(invoice.id);

  await db.client
    .update(reservation)
    .set({ stripeInvoiceId: invoice.id })
    .where(inArray(reservation.id, reservationIds));

  return invoice.id;
}
