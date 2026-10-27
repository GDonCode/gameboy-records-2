// lib/support.ts
// Support request topics and validation, shared by the support form (instant feedback) and the API (the real check).

export const SUPPORT_TOPICS = [
  { id: 'order', label: 'An order' },
  { id: 'merch', label: 'Merch & the shop' },
  { id: 'account', label: 'My account or signing in' },
  { id: 'rewards', label: 'Points & rewards' },
  { id: 'shows', label: 'Shows & tickets' },
  { id: 'music', label: 'Music, features & bookings' },
  { id: 'other', label: 'Something else' },
] as const;

export type SupportTopic = (typeof SUPPORT_TOPICS)[number]['id'];

export const SUBJECT_MAX = 120;
export const MESSAGE_MIN = 10;
export const MESSAGE_MAX = 5000;
export const ORDER_NUMBER_MAX = 40;
export const MAX_REQUESTS_PER_DAY = 5;
export const MAX_OPEN_REQUESTS = 5;

export function topicLabel(id: string): string {
  return SUPPORT_TOPICS.find((t) => t.id === id)?.label ?? 'Something else';
}

export interface SupportInput {
  topic: SupportTopic;
  subject: string;
  message: string;
  order_number: string | null;
}

export type SupportErrors = Partial<Record<keyof SupportInput, string>>;

export function validateSupportRequest(raw: unknown): { value: SupportInput } | { errors: SupportErrors } {
  const body = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const errors: SupportErrors = {};

  const topic = SUPPORT_TOPICS.find((t) => t.id === body.topic)?.id;
  if (!topic) errors.topic = 'Choose what your question is about.';

  const subject = typeof body.subject === 'string' ? body.subject.trim().replace(/\s+/g, ' ') : '';
  if (!subject) errors.subject = 'Add a short subject.';
  else if (subject.length > SUBJECT_MAX) errors.subject = `Keep the subject under ${SUBJECT_MAX} characters.`;

  // Keep line breaks in the message, but trim the ends and collapse runs of blank lines.
  const message = typeof body.message === 'string' ? body.message.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim() : '';
  if (message.length < MESSAGE_MIN) errors.message = 'Tell us a little more so we can help (at least 10 characters).';
  else if (message.length > MESSAGE_MAX) errors.message = `Keep your message under ${MESSAGE_MAX.toLocaleString('en-US')} characters.`;

  const order = typeof body.order_number === 'string' ? body.order_number.trim() : '';
  if (order.length > ORDER_NUMBER_MAX) errors.order_number = 'That order number is too long.';

  if (Object.keys(errors).length > 0) return { errors };
  return { value: { topic: topic!, subject, message, order_number: order || null } };
}

/** Escapes member-written text before it goes into an HTML email. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
