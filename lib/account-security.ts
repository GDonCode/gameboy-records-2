// lib/account-security.ts
// Server-only: security activity log, wrong-password rate limiting and session revocation.

import bcrypt from 'bcryptjs';
import type { JWT } from 'next-auth/jwt';
import { supabaseAdmin } from '@/lib/supabase-admin';
import type { SecurityEvent, SecurityEventKind, SecurityInfo } from '@/components/account/types';

export const PASSWORD_FAILURE_LIMIT = 5;
export const PASSWORD_FAILURE_WINDOW_MINUTES = 15;

function userAgentOf(request?: Request | null): string | null {
  const ua = request?.headers.get('user-agent');
  return ua ? ua.slice(0, 400) : null;
}

/** Best effort: a failed log write never blocks the action being logged. */
export async function logSecurityEvent(userId: string, kind: SecurityEventKind, request?: Request | null) {
  const { error } = await supabaseAdmin
    .from('account_security_events')
    .insert({ user_id: userId, kind, user_agent: userAgentOf(request) });
  if (error) console.error(`Failed to log security event (${kind}):`, error.message);
}

export async function getSecurityEvents(userId: string, limit = 10): Promise<SecurityEvent[]> {
  const { data, error } = await supabaseAdmin
    .from('account_security_events')
    .select('id, kind, user_agent, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.error('Failed to load security events:', error.message);
    return [];
  }
  return (data ?? []) as SecurityEvent[];
}

/** True when the member has had too many wrong password attempts recently. */
export async function tooManyPasswordFailures(userId: string): Promise<boolean> {
  const since = new Date(Date.now() - PASSWORD_FAILURE_WINDOW_MINUTES * 60_000).toISOString();
  const { count, error } = await supabaseAdmin
    .from('account_security_events')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('kind', 'password_check_failed')
    .gte('created_at', since);
  if (error) {
    console.error('Failed to count password failures:', error.message);
    return false;
  }
  return (count ?? 0) >= PASSWORD_FAILURE_LIMIT;
}

export type PasswordCheck = 'ok' | 'wrong' | 'locked';

/**
 * Checks a member's current password for a sensitive account action.
 * Wrong answers are logged and counted; after 5 in 15 minutes every attempt is refused.
 */
export async function checkCurrentPassword(
  userId: string,
  passwordHash: string,
  password: unknown,
  request?: Request | null
): Promise<PasswordCheck> {
  if (await tooManyPasswordFailures(userId)) return 'locked';
  const valid =
    typeof password === 'string' &&
    password.length > 0 &&
    Buffer.byteLength(password, 'utf8') <= 72 &&
    (await bcrypt.compare(password, passwordHash));
  if (valid) return 'ok';
  await logSecurityEvent(userId, 'password_check_failed', request);
  return 'wrong';
}

export const PASSWORD_CHECK_ERRORS: Record<Exclude<PasswordCheck, 'ok'>, { error: string; status: number }> = {
  wrong: { error: 'Your current password is incorrect.', status: 400 },
  locked: {
    error: `Too many wrong passwords. Try again in ${PASSWORD_FAILURE_WINDOW_MINUTES} minutes.`,
    status: 429,
  },
};

/** Signs the member out everywhere: sessions that signed in before now stop working. */
export async function revokeSessions(userId: string): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('users')
    .update({ sessions_valid_after: new Date().toISOString() })
    .eq('id', userId);
  if (error) {
    console.error('Failed to revoke sessions:', error.message);
    return false;
  }
  return true;
}

/**
 * When the member's sessions were last revoked, or null if never.
 * Returns undefined when it can't be read (e.g. the migration hasn't run yet), so callers can fail open.
 */
export async function getSessionsValidAfter(userId: string): Promise<number | null | undefined> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('sessions_valid_after')
    .eq('id', userId)
    .maybeSingle();
  if (error) return undefined;
  if (!data) return Number.POSITIVE_INFINITY; // account deleted: every session is invalid
  return data.sessions_valid_after ? Date.parse(data.sessions_valid_after) : null;
}

/** Everything the Login & security tab shows. Tolerates the migration not having run yet. */
export async function getSecurityInfo(userId: string, hasPassword: boolean): Promise<SecurityInfo> {
  const [{ data }, events] = await Promise.all([
    supabaseAdmin.from('users').select('password_changed_at').eq('id', userId).maybeSingle(),
    getSecurityEvents(userId),
  ]);
  return { hasPassword, passwordChangedAt: data?.password_changed_at ?? null, events };
}

// How often a signed-in member's session is re-checked against password changes / "sign out of other devices".
export const SESSION_CHECK_INTERVAL_MS = 60_000;

/**
 * Called from the JWT callback. False means the session signed in before the member's sessions were
 * revoked and must end. Checks the database at most once a minute (recording the time on the token);
 * if the check can't run, the session is kept rather than signing everyone out.
 */
export async function memberSessionStillValid(token: JWT): Promise<boolean> {
  const checkedAt = typeof token.sessionCheckedAt === 'number' ? token.sessionCheckedAt : 0;
  if (Date.now() - checkedAt <= SESSION_CHECK_INTERVAL_MS) return true;

  const validAfter = await getSessionsValidAfter(String(token.accountId));
  if (validAfter === undefined) return true;

  // Sessions from before this feature have no signedInAt and count as signed in at time 0.
  const signedInAt = typeof token.signedInAt === 'number' ? token.signedInAt : 0;
  if (validAfter !== null && signedInAt < validAfter) return false;

  token.sessionCheckedAt = Date.now();
  return true;
}
