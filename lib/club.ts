// lib/club.ts
// Playaz Club rules shown to visitors and applied on the server. Safe to import anywhere.

/** Club Points a new member starts with. */
export const SIGNUP_BONUS_POINTS = 40;

/** Club Points earned per whole US dollar spent on a paid, completed order. */
export const POINTS_PER_DOLLAR = 10;

/** Club Points for an order total, in whole dollars, before shipping and tax. */
export function pointsForOrder(subtotal: number): number {
  return Math.max(0, Math.floor(subtotal)) * POINTS_PER_DOLLAR;
}
