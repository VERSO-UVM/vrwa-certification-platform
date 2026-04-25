import { and, eq } from "drizzle-orm";
import db from "~/database";
import { reservation, type PaymentStatus } from "~/database/schema";
import { getStripe } from "./stripe";

export async function updateReservationPaymentByInvoiceId(
  stripeInvoiceId: string,
  paymentStatus: PaymentStatus,
): Promise<void> {
  await db.client
    .update(reservation)
    .set({ paymentStatus })
    .where(eq(reservation.stripeInvoiceId, stripeInvoiceId));
}

export type RegistrationInvoiceResult = {
  stripeInvoiceId: string | null;
  hostedInvoiceUrl: string | null;
};

/**
 * Creates a finalized Stripe Invoice for a course registration and stores the id on the reservation.
 * No-op when price is zero (no invoice line item required).
 */
export async function createAndLinkRegistrationInvoice(options: {
  profileId: string;
  courseEventId: string;
  priceCents: number;
  courseName: string;
  stripeCustomerId: string;
}): Promise<RegistrationInvoiceResult> {
  if (options.priceCents <= 0) {
    return { stripeInvoiceId: null, hostedInvoiceUrl: null };
  }

  if (process.env.STRIPE_BYPASS_INVOICES === "1") {
    const fake = `in_test_bypass_${options.profileId.slice(-8)}_${options.courseEventId.slice(-8)}`;
    await db.client
      .update(reservation)
      .set({ stripeInvoiceId: fake })
      .where(
        and(
          eq(reservation.profileId, options.profileId),
          eq(reservation.courseEventId, options.courseEventId),
        ),
      );
    return { stripeInvoiceId: fake, hostedInvoiceUrl: null };
  }

  const stripe = getStripe();

  const draft = await stripe.invoices.create({
    customer: options.stripeCustomerId,
    collection_method: "send_invoice",
    days_until_due: 30,
    auto_advance: false,
    metadata: {
      profileId: options.profileId,
      courseEventId: options.courseEventId,
    },
  });

  await stripe.invoiceItems.create({
    customer: options.stripeCustomerId,
    invoice: draft.id,
    amount: options.priceCents,
    currency: "usd",
    description: `Registration: ${options.courseName}`,
  });

  const finalized = await stripe.invoices.finalizeInvoice(draft.id);

  await db.client
    .update(reservation)
    .set({ stripeInvoiceId: finalized.id })
    .where(
      and(
        eq(reservation.profileId, options.profileId),
        eq(reservation.courseEventId, options.courseEventId),
      ),
    );

  const hosted =
    typeof finalized.hosted_invoice_url === "string"
      ? finalized.hosted_invoice_url
      : null;

  return { stripeInvoiceId: finalized.id, hostedInvoiceUrl: hosted };
}
