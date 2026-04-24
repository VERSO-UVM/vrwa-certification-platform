import Stripe from "stripe";

/** Pinned to match Stripe account API version. */
const STRIPE_API_VERSION = "2026-04-22.dahlia" as const;

function requireStripeSecret(): string {
  const key = process.env.STRIPE_SECRET;
  if (!key) {
    throw new Error(
      "STRIPE_SECRET is not set. Add it to backend/.env for Stripe features.",
    );
  }
  return key;
}

let _stripe: Stripe | undefined;

/** Stripe client (singleton). Requires STRIPE_SECRET. */
export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(requireStripeSecret(), {
      apiVersion: STRIPE_API_VERSION,
    });
  }
  return _stripe;
}
