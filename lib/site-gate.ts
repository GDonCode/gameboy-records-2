// lib/site-gate.ts
// Development-phase password gate. Set SITE_PASSWORD to turn it on; unset it to open the site.
// A correct password sets an httpOnly cookie holding an HMAC derived from the password, so changing
// SITE_PASSWORD locks everyone out again. Uses Web Crypto so it runs in the proxy and route handlers.

export const GATE_COOKIE = 'gbr_site_access';
export const GATE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export function gatePassword(): string | null {
  const pw = process.env.SITE_PASSWORD;
  return pw && pw.trim() ? pw : null;
}

async function hmac(key: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey('raw', enc.encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(message));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, '0')).join('');
}

function sameString(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** The cookie value that proves the visitor knows the current password. */
export function accessToken(password: string): Promise<string> {
  return hmac(password, 'gameboy-records-site-access-v1');
}

export async function hasAccess(cookieValue: string | undefined, password: string): Promise<boolean> {
  return !!cookieValue && sameString(cookieValue, await accessToken(password));
}

/** Compares a submitted password without leaking how much of it matched. */
export async function passwordMatches(submitted: string, password: string): Promise<boolean> {
  return sameString(await hmac(password, `check:${submitted}`), await hmac(password, `check:${password}`));
}

/** Only same-site paths are allowed as the post-unlock destination. */
export function safeNext(next: unknown): string {
  return typeof next === 'string' && next.startsWith('/') && !next.startsWith('//') && !next.startsWith('/\\') ? next : '/';
}
