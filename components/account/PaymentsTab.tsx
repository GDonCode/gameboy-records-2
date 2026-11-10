// components/account/PaymentsTab.tsx
'use client';

import { useState } from 'react';
import { CreditCard, Lock, Plus } from 'lucide-react';
import AddPaymentMethod from './payments/AddPaymentMethod';
import { Panel, TabHeading } from './Panel';
import {
  BODY,
  DANGER_TEXT_BUTTON,
  ERROR_TEXT,
  PRIMARY_BUTTON,
  SECONDARY_BUTTON,
  SEMI,
  SUCCESS_TEXT,
  TEXT_BUTTON,
  readError,
} from './formStyles';
import type { PaymentMethod, PaymentsInfo } from './types';

const MAX_METHODS = 5;

const BRAND_NAMES: Record<string, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  amex: 'American Express',
  discover: 'Discover',
  jcb: 'JCB',
  diners: 'Diners Club',
  unionpay: 'UnionPay',
};

function methodName(m: PaymentMethod): string {
  if (m.type === 'paypal') return 'PayPal';
  return BRAND_NAMES[m.brand ?? ''] ?? (m.brand ? m.brand[0].toUpperCase() + m.brand.slice(1) : 'Card');
}

type ExpiryState = 'ok' | 'soon' | 'expired';

/** Cards are valid through the end of their expiry month. "Soon" = this month or next. */
export function expiryState(m: PaymentMethod, now = new Date()): ExpiryState {
  if (!m.exp_month || !m.exp_year) return 'ok';
  const months = (m.exp_year - now.getFullYear()) * 12 + (m.exp_month - (now.getMonth() + 1));
  if (months < 0) return 'expired';
  if (months <= 1) return 'soon';
  return 'ok';
}

function MethodCard({
  m,
  busy,
  onDefault,
  onRemove,
}: {
  m: PaymentMethod;
  busy: boolean;
  onDefault: () => void;
  onRemove: () => void;
}) {
  const expiry = expiryState(m);
  return (
    <li
      className={`flex flex-col gap-4 rounded-[10px] border p-5 ${
        m.is_default ? 'border-[#4dff91]/60 bg-[#1a9e4a]/10' : 'border-white/10 bg-white/[0.02]'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <span className="flex items-center justify-center w-11 h-8 flex-shrink-0 rounded-[6px] bg-white/10 border border-white/15">
            <CreditCard className="w-5 h-5 text-white/80" />
          </span>
          <div className="min-w-0">
            <p className="text-white" style={SEMI}>
              {methodName(m)}
              {m.last4 && <span className="ml-2 tracking-[0.1em]">•••• {m.last4}</span>}
            </p>
            {m.label && <p className="text-[0.85em] text-white/60 break-all">{m.label}</p>}
            {m.exp_month && m.exp_year && (
              <p className={`text-[0.85em] ${expiry === 'expired' ? 'text-[#ff6b6b]' : expiry === 'soon' ? 'text-[#f5c542]' : 'text-white/60'}`}>
                {expiry === 'expired' ? 'Expired' : 'Expires'} {String(m.exp_month).padStart(2, '0')}/{String(m.exp_year).slice(-2)}
                {expiry === 'soon' && ' · expiring soon'}
              </p>
            )}
          </div>
        </div>
        {m.is_default && (
          <span className="flex-shrink-0 px-2.5 py-1 rounded-full text-[0.65em] tracking-[0.15em] text-[#0c1510] bg-[#4dff91]" style={SEMI}>
            DEFAULT
          </span>
        )}
      </div>
      {expiry === 'expired' && (
        <p className="text-[0.8em] text-white/60">This card can’t be used. Remove it and add a current one.</p>
      )}
      <div className="flex flex-wrap gap-4">
        {!m.is_default && expiry !== 'expired' && (
          <button type="button" className={TEXT_BUTTON} disabled={busy} onClick={onDefault}>Make default</button>
        )}
        <button type="button" className={DANGER_TEXT_BUTTON} disabled={busy} onClick={onRemove}>Remove</button>
      </div>
    </li>
  );
}

export default function PaymentsTab({ payments }: { payments: PaymentsInfo }) {
  const [methods, setMethods] = useState(payments.methods);
  const [adding, setAdding] = useState<{ provider: string; setup: Record<string, unknown> } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function request(url: string, init: RequestInit, key: string, done: string): Promise<boolean> {
    setBusy(key);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch(url, init);
      if (!res.ok) {
        setError(await readError(res));
        return false;
      }
      const data = await res.json();
      setMethods(data.methods);
      setNotice(done);
      return true;
    } catch {
      setError('Something went wrong. Check your connection and try again.');
      return false;
    } finally {
      setBusy(null);
    }
  }

  async function startAdding() {
    setBusy('setup');
    setError(null);
    setNotice(null);
    try {
      const res = await fetch('/api/account/payment-methods/setup', { method: 'POST' });
      if (!res.ok) {
        setError(await readError(res, 'Could not start adding a payment method. Please try again.'));
        return;
      }
      setAdding(await res.json());
    } catch {
      setError('Something went wrong. Check your connection and try again.');
    } finally {
      setBusy(null);
    }
  }

  async function save(reference: string, makeDefault: boolean) {
    const ok = await request(
      '/api/account/payment-methods',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reference, makeDefault }) },
      'save',
      'Payment method saved.'
    );
    if (ok) setAdding(null);
  }

  function remove(m: PaymentMethod) {
    const name = `${methodName(m)}${m.last4 ? ` ending in ${m.last4}` : ''}`;
    if (!window.confirm(`Remove ${name}?`)) return;
    request(`/api/account/payment-methods/${m.id}`, { method: 'DELETE' }, m.id, 'Payment method removed.');
  }

  const canAdd = !!payments.provider && methods.length < MAX_METHODS;

  return (
    <div className="flex flex-col gap-8">
      <TabHeading title="Payments" subtitle="Cards and accounts saved for faster checkout." />

      <Panel className="flex flex-col gap-5" >
        <div className="flex flex-wrap items-center justify-between gap-3" style={BODY}>
          <div>
            <h2 className="text-[1.15em] text-white" style={SEMI}>Saved payment methods</h2>
            <p className="text-[0.85em] text-white/55">
              Your default method is selected first at checkout. You can save up to {MAX_METHODS}.
            </p>
          </div>
          {canAdd && !adding && methods.length > 0 && (
            <button type="button" className={SECONDARY_BUTTON} disabled={busy !== null} onClick={startAdding}>
              <Plus className="w-4 h-4" /> {busy === 'setup' ? 'LOADING…' : 'ADD PAYMENT METHOD'}
            </button>
          )}
        </div>

        {notice && <p role="status" className={SUCCESS_TEXT} style={BODY}>{notice}</p>}
        {error && !adding && <p role="alert" className={ERROR_TEXT} style={BODY}>{error}</p>}

        {adding && (
          <AddPaymentMethod
            provider={adding.provider}
            setup={adding.setup}
            busy={busy === 'save'}
            error={error}
            canSetDefault={methods.length > 0}
            onReference={save}
            onCancel={() => { setAdding(null); setError(null); }}
          />
        )}

        {methods.length === 0 && !adding && (
          <div className="flex flex-col items-center text-center gap-4 rounded-[10px] border border-dashed border-white/15 py-10 px-4" style={BODY}>
            <span className="flex items-center justify-center w-12 h-12 rounded-full bg-[#1a9e4a]/15 border border-[#1a9e4a]/40">
              <CreditCard className="w-5 h-5 text-[#4dff91]" />
            </span>
            {payments.provider ? (
              <>
                <p className="text-[0.95em] text-white/70">No saved payment methods yet. Add one for faster checkout.</p>
                <button type="button" className={PRIMARY_BUTTON} disabled={busy !== null} onClick={startAdding}>
                  <Plus className="w-4 h-4" /> {busy === 'setup' ? 'LOADING…' : 'ADD PAYMENT METHOD'}
                </button>
              </>
            ) : (
              <p className="max-w-[380px] text-[0.95em] text-white/70">
                You’ll be able to save a card here when merch checkout opens.
              </p>
            )}
          </div>
        )}

        {methods.length > 0 && (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4" style={BODY}>
            {methods.map((m) => (
              <MethodCard
                key={m.id}
                m={m}
                busy={busy !== null}
                onDefault={() =>
                  request(
                    `/api/account/payment-methods/${m.id}`,
                    { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_default: true }) },
                    m.id,
                    'Default payment method updated.'
                  )
                }
                onRemove={() => remove(m)}
              />
            ))}
          </ul>
        )}
      </Panel>

      <Panel className="flex items-start gap-4">
        <Lock className="w-5 h-5 mt-0.5 flex-shrink-0 text-[#4dff91]" />
        <div className="text-[0.85em] text-white/65" style={BODY}>
          <p className="text-white text-[1.05em] mb-1" style={SEMI}>How your payment details are kept safe</p>
          Card numbers and security codes go straight to our payment processor and are never stored on Gameboy
          Records’ servers. We only keep the card type, last four digits and expiry date so you can tell your cards
          apart. Adding or removing a payment method shows up in Login &amp; security.
        </div>
      </Panel>
    </div>
  );
}
