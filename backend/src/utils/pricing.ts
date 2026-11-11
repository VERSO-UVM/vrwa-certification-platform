/** Member registration price as a fraction of the full course price. */
export const MEMBER_PRICE_MULTIPLIER = 0.5;

/**
 * Unit price in cents for one seat.
 */
export function unitPriceCents(
  priceCents: number,
  memberRate: boolean,
): number {
  if (!memberRate) return priceCents;
  return Math.round(priceCents * MEMBER_PRICE_MULTIPLIER);
}
