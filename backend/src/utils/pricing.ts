import { PaymentRate } from "../database/schema";

/** Member registration price as a fraction of the full course price. */
export const MEMBER_PRICE_MULTIPLIER = 0.5;

/**
 * Unit price in cents for one seat.
 */
export function unitPriceCents(
  priceCents: number,
  paymentRate: PaymentRate,
): number {
  switch (paymentRate) {
    case PaymentRate.NonMember:
      return priceCents;
    case PaymentRate.Member:
      return Math.round(priceCents * MEMBER_PRICE_MULTIPLIER);
  }
}
