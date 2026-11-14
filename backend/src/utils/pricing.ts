import { PaymentRate } from "../database/schema";

export const MEMBER_PRICE_MULTIPLIER = 0.5;

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
