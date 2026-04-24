import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import db from "~/database";
import { user } from "~/database/schema";
import { getStripe } from "./stripe";

/**
 * Ensures the Better Auth user has a Stripe Customer and returns its id.
 */
export async function getOrCreateStripeCustomerId(
  accountUserId: string,
): Promise<string> {
  const [u] = await db.client
    .select()
    .from(user)
    .where(eq(user.id, accountUserId));

  if (!u) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "User not found.",
    });
  }

  if (u.stripeCustomerId) {
    return u.stripeCustomerId;
  }

  if (process.env.STRIPE_BYPASS_INVOICES === "1") {
    const fake = "cus_test_bypass";
    await db.client
      .update(user)
      .set({ stripeCustomerId: fake })
      .where(eq(user.id, u.id));
    return fake;
  }

  const stripe = getStripe();
  const customer = await stripe.customers.create({
    email: u.email,
    name: u.name,
    metadata: { userId: u.id },
  });

  await db.client
    .update(user)
    .set({ stripeCustomerId: customer.id })
    .where(eq(user.id, u.id));

  return customer.id;
}
