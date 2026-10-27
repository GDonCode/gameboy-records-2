// components/account/SupportTab.tsx
'use client';

import { useState, type FormEvent, type ReactNode } from 'react';
import { ChevronDown, Mail, MessageCircleMore } from 'lucide-react';
import {
  MESSAGE_MAX,
  ORDER_NUMBER_MAX,
  SUBJECT_MAX,
  SUPPORT_TOPICS,
  topicLabel,
  validateSupportRequest,
  type SupportErrors,
} from '@/lib/support';
import { Panel, TabHeading } from './Panel';
import {
  BODY,
  ERROR_TEXT,
  INPUT_CLASS,
  LABEL_CLASS,
  PRIMARY_BUTTON,
  SEMI,
  SUCCESS_TEXT,
  TEXT_BUTTON,
  readError,
} from './formStyles';
import type { AccountTab, SupportRequest } from './types';

const SUPPORT_EMAIL = 'info@gameboyrecords.com';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

// ── HELP TOPICS ──────────────────────────────────────────────────────────────
function HelpTopics({ onSelectTab }: { onSelectTab: (tab: AccountTab) => void }) {
  const go = (tab: AccountTab, label: string) => (
    <button type="button" className="text-[#4dff91] hover:underline underline-offset-4 cursor-pointer" onClick={() => onSelectTab(tab)}>
      {label}
    </button>
  );
  const topics: { q: string; a: ReactNode }[] = [
    {
      q: 'How do I earn points?',
      a: <>You get 40 points for joining. Earn more by completing quests on your {go('home', 'account Home')}, like adding a profile photo, joining the newsletter, and daily quests such as streaming A-Game&apos;s song of the day. Daily quests reset at midnight, Jamaica time.</>,
    },
    {
      q: 'How do I claim a reward?',
      a: <>When your points reach a tier on the Reward Pass ({go('home', 'account Home')}), tap CLAIM on it and we&apos;ll be in touch about delivery. It&apos;s marked DELIVERED once it&apos;s on its way to you.</>,
    },
    {
      q: 'Where can I see my orders?',
      a: <>Your merch orders appear in {go('orders', 'My orders')}. Current orders are under Current; delivered, cancelled and returned orders move to Archived.</>,
    },
    {
      q: 'How do I change my name, email or shipping address?',
      a: <>Go to {go('personal', 'Personal info')}. Changing your email sends a code to the new address to confirm it.</>,
    },
    {
      q: 'I signed up with Google. Can I sign in with a password too?',
      a: <>Yes. In {go('security', 'Login & security')}, choose Add password. We&apos;ll email you a code to confirm it&apos;s you first.</>,
    },
    {
      q: 'I think someone else got into my account.',
      a: <>In {go('security', 'Login & security')}, change your password (this signs out every other device) and check Recent security activity for anything you don&apos;t recognise. Then send us a message below so we can help.</>,
    },
  ];

  return (
    <Panel className="flex flex-col gap-2">
      <h2 className="text-[1.15em] text-white" style={SEMI}>Quick answers</h2>
      <div className="flex flex-col divide-y divide-white/10" style={BODY}>
        {topics.map((t) => (
          <details key={t.q} className="group py-1">
            <summary className="flex items-center justify-between gap-4 py-3 cursor-pointer list-none text-white hover:text-[#4dff91] [&::-webkit-details-marker]:hidden">
              {t.q}
              <ChevronDown className="w-4 h-4 flex-shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
            </summary>
            <p className="pb-4 pr-8 text-[0.9em] leading-relaxed text-white/70">{t.a}</p>
          </details>
        ))}
      </div>
    </Panel>
  );
}

// ── CONTACT FORM ─────────────────────────────────────────────────────────────
type Draft = { topic: string; subject: string; message: string; order_number: string };
const EMPTY: Draft = { topic: '', subject: '', message: '', order_number: '' };

function ContactForm({ email, onSent }: { email: string; onSent: (reference: string, requests: SupportRequest[]) => void }) {
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [errors, setErrors] = useState<SupportErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const set = (key: keyof Draft) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setDraft((d) => ({ ...d, [key]: e.target.value }));
    if (errors[key as keyof SupportErrors]) setErrors((x) => ({ ...x, [key]: undefined }));
  };

  async function submit(e: FormEvent) {
    e.preventDefault();
    const result = validateSupportRequest(draft);
    if ('errors' in result) {
      setErrors(result.errors);
      return;
    }
    setSending(true);
    setError(null);
    try {
      const res = await fetch('/api/account/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.value),
      });
      if (!res.ok) {
        const data = await res.clone().json().catch(() => null);
        if (data?.fieldErrors) setErrors(data.fieldErrors);
        setError(await readError(res, 'Could not send your message. Please try again.'));
        return;
      }
      const data = await res.json();
      setDraft(EMPTY);
      setErrors({});
      onSent(data.reference, data.requests);
    } catch {
      setError('Could not send your message. Check your connection and try again.');
    } finally {
      setSending(false);
    }
  }

  const describedBy = (k: keyof SupportErrors) => (errors[k] ? `support-${k}-error` : undefined);
  const fieldError = (k: keyof SupportErrors) =>
    errors[k] && <p id={`support-${k}-error`} className={`${ERROR_TEXT} mt-1`}>{errors[k]}</p>;

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4" style={BODY}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="support-topic" className={LABEL_CLASS}>What’s it about?</label>
          <select
            id="support-topic"
            className={`${INPUT_CLASS} cursor-pointer [&>*]:text-black`}
            value={draft.topic}
            onChange={set('topic')}
            disabled={sending}
            aria-invalid={!!errors.topic}
            aria-describedby={describedBy('topic')}
          >
            <option value="" disabled>Choose a topic</option>
            {SUPPORT_TOPICS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
          {fieldError('topic')}
        </div>
        {draft.topic === 'order' && (
          <div>
            <label htmlFor="support-order" className={LABEL_CLASS}>Order number <span className="text-white/35">(optional)</span></label>
            <input id="support-order" className={INPUT_CLASS} value={draft.order_number} onChange={set('order_number')} maxLength={ORDER_NUMBER_MAX} disabled={sending} aria-invalid={!!errors.order_number} aria-describedby={describedBy('order_number')} />
            {fieldError('order_number')}
          </div>
        )}
      </div>
      <div>
        <label htmlFor="support-subject" className={LABEL_CLASS}>Subject</label>
        <input id="support-subject" className={INPUT_CLASS} value={draft.subject} onChange={set('subject')} maxLength={SUBJECT_MAX} disabled={sending} aria-invalid={!!errors.subject} aria-describedby={describedBy('subject')} />
        {fieldError('subject')}
      </div>
      <div>
        <label htmlFor="support-message" className={LABEL_CLASS}>Message</label>
        <textarea
          id="support-message"
          className={`${INPUT_CLASS} min-h-[140px] resize-y`}
          value={draft.message}
          onChange={set('message')}
          maxLength={MESSAGE_MAX}
          disabled={sending}
          aria-invalid={!!errors.message}
          aria-describedby={describedBy('message') ?? 'support-message-count'}
        />
        <div className="flex justify-between gap-4">
          {fieldError('message') || <span />}
          <span id="support-message-count" className="mt-1 text-[0.75em] text-white/40 tabular-nums">
            {draft.message.length.toLocaleString('en-US')}/{MESSAGE_MAX.toLocaleString('en-US')}
          </span>
        </div>
      </div>
      <p className="text-[0.8em] text-white/50">We’ll reply to <span className="text-white/80 break-all">{email}</span>.</p>
      {error && <p role="alert" className={ERROR_TEXT}>{error}</p>}
      <button type="submit" className={`${PRIMARY_BUTTON} self-start`} disabled={sending}>
        {sending ? 'SENDING…' : 'SEND MESSAGE'}
      </button>
    </form>
  );
}

// ── YOUR REQUESTS ────────────────────────────────────────────────────────────
function RequestItem({ r, busy, onStatus }: { r: SupportRequest; busy: boolean; onStatus: (status: 'open' | 'resolved') => void }) {
  return (
    <li className="py-1">
      <details className="group">
        <summary className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
          <span className="flex-1 min-w-[200px]">
            <span className="block text-white" style={SEMI}>{r.subject}</span>
            <span className="block text-[0.8em] text-white/50">
              {r.reference} · {topicLabel(r.topic)} · {formatDate(r.created_at)}
            </span>
          </span>
          <span
            className={`px-2.5 py-1 rounded-full text-[0.65em] tracking-[0.15em] border ${
              r.status === 'open' ? 'border-[#4dff91]/50 text-[#4dff91] bg-[#4dff91]/10' : 'border-white/15 text-white/60 bg-white/5'
            }`}
            style={SEMI}
          >
            {r.status === 'open' ? 'OPEN' : 'RESOLVED'}
          </span>
          <ChevronDown className="w-4 h-4 text-white/60 transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>
        <div className="flex flex-col gap-3 pb-4">
          {r.order_number && <p className="text-[0.85em] text-white/60">Order number: <span className="text-white/85">{r.order_number}</span></p>}
          <p className="whitespace-pre-wrap break-words text-[0.9em] text-white/75 border-l-2 border-[#1a9e4a]/60 pl-3">{r.message}</p>
          <p className="text-[0.8em] text-white/50">
            {r.status === 'open'
              ? 'We’ll reply by email. To add details, reply to your confirmation email.'
              : `Marked resolved${r.resolved_at ? ` on ${formatDate(r.resolved_at)}` : ''}.`}
          </p>
          <button type="button" className={`${TEXT_BUTTON} self-start`} disabled={busy} onClick={() => onStatus(r.status === 'open' ? 'resolved' : 'open')}>
            {r.status === 'open' ? 'Mark as resolved' : 'Reopen'}
          </button>
        </div>
      </details>
    </li>
  );
}

export default function SupportTab({
  email,
  initialRequests,
  onSelectTab,
}: {
  email: string;
  initialRequests: SupportRequest[];
  onSelectTab: (tab: AccountTab) => void;
}) {
  const [requests, setRequests] = useState(initialRequests);
  const [sentRef, setSentRef] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);

  async function setStatus(r: SupportRequest, status: 'open' | 'resolved') {
    setBusyId(r.id);
    setListError(null);
    try {
      const res = await fetch(`/api/account/support/${r.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        setListError(await readError(res, 'Could not update the request. Please try again.'));
        return;
      }
      setRequests((await res.json()).requests);
    } catch {
      setListError('Could not update the request. Check your connection and try again.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <TabHeading title="Customer support" subtitle="Quick answers, or send us a message and we’ll reply by email." />

      <HelpTopics onSelectTab={onSelectTab} />

      <Panel className="flex flex-col gap-5">
        <div className="flex items-start gap-3">
          <MessageCircleMore className="w-5 h-5 mt-1 flex-shrink-0 text-[#4dff91]" aria-hidden="true" />
          <div style={BODY}>
            <h2 className="text-[1.15em] text-white" style={SEMI}>Send us a message</h2>
            <p className="text-[0.85em] text-white/55">
              Prefer email? Write to{' '}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-[#4dff91] hover:underline underline-offset-4">{SUPPORT_EMAIL}</a>.
            </p>
          </div>
        </div>
        {sentRef && (
          <div role="status" className="flex items-start gap-3 rounded-[10px] border border-[#4dff91]/40 bg-[#1a9e4a]/10 p-4" style={BODY}>
            <Mail className="w-5 h-5 mt-0.5 flex-shrink-0 text-[#4dff91]" aria-hidden="true" />
            <p className={`${SUCCESS_TEXT} text-[0.9em]`}>
              Message sent. Your reference is <strong>{sentRef}</strong>, and a copy is on its way to {email}.
            </p>
          </div>
        )}
        <ContactForm email={email} onSent={(ref, list) => { setSentRef(ref); setRequests(list); }} />
      </Panel>

      <Panel className="flex flex-col gap-2">
        <h2 className="text-[1.15em] text-white" style={SEMI}>Your requests</h2>
        {listError && <p role="alert" className={ERROR_TEXT} style={BODY}>{listError}</p>}
        {requests.length === 0 ? (
          <p className="py-6 text-center text-[0.9em] text-white/50" style={BODY}>You haven’t sent us any messages yet.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-white/10" style={BODY}>
            {requests.map((r) => (
              <RequestItem key={r.id} r={r} busy={busyId !== null} onStatus={(s) => setStatus(r, s)} />
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
