import type { Stripe } from "stripe";
import { Status } from "~/database/schema";
import { getStripe } from "~/utils/stripe";
import { updateReservationPaymentByInvoiceId } from "~/utils/stripe-reservation";

export async function handleStripeWebhook(
  rawBody: Buffer,
  signature: string | undefined,
): Promise<Stripe.Event> {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not set");
  }
  if (!signature) {
    throw new Error("Missing Stripe-Signature header");
  }
  const stripe = getStripe();
  return await stripe.webhooks.constructEventAsync(rawBody, signature, secret);
}

export async function processStripeWebhookEvent(event: Stripe.Event) {
  if (event.type !== "invoice.paid") {
    return;
  }
  const invoice = event.data.object as Stripe.Invoice;
  await updateReservationPaymentByInvoiceId(invoice.id, Status.Paid);
}
