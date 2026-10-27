// lib/support-requests.ts
// Server-only: the member's support requests, newest first.

import { supabaseAdmin } from '@/lib/supabase-admin';
import type { SupportRequest } from '@/components/account/types';

export async function getSupportRequests(userId: string, limit = 20): Promise<SupportRequest[]> {
  const { data, error } = await supabaseAdmin
    .from('support_requests')
    .select('id, reference, topic, subject, message, order_number, status, created_at, resolved_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    // Also hit before the support_requests migration has run: show an empty list rather than break the page.
    console.error('Failed to load support requests:', error.message);
    return [];
  }
  return (data ?? []) as SupportRequest[];
}
