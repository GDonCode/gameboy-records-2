// lib/account-session.ts
// Server-only: the signed-in member's id for account API routes, or null for guests and artist logins.

import { auth } from '@/auth';

export async function getMemberId(): Promise<string | null> {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string } | undefined;
  return user?.id && user.role === 'user' ? user.id : null;
}
