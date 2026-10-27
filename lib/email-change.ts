// lib/email-change.ts
// Server-only helpers for verified email changes: 6-digit codes, stored only as a hash.

import { createHash, randomInt, timingSafeEqual } from 'crypto';

export const CODE_TTL_MINUTES = 15;
export const MAX_CODE_ATTEMPTS = 5;
export const MAX_REQUESTS_PER_HOUR = 5;

export function generateCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, '0');
}

// Bound to the user and the new address, so a code can't be replayed for another account or email.
export function hashCode(userId: string, newEmail: string, code: string): string {
  return createHash('sha256').update(`${userId}:${newEmail}:${code}`).digest('hex');
}

export function codesMatch(expectedHash: string, actualHash: string): boolean {
  const a = Buffer.from(expectedHash, 'hex');
  const b = Buffer.from(actualHash, 'hex');
  return a.length === b.length && timingSafeEqual(a, b);
}
