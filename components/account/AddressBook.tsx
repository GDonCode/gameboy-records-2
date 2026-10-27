// components/account/AddressBook.tsx
'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { MapPin, Plus } from 'lucide-react';
import { COUNTRY_CODES, PRIORITY_COUNTRIES, countryName } from '@/lib/countries';
import { MAX_ADDRESSES, validateAddress, type AddressErrors, type AddressInput } from '@/lib/account-validation';
import {
  BODY,
  DANGER_TEXT_BUTTON,
  ERROR_TEXT,
  INPUT_CLASS,
  LABEL_CLASS,
  PRIMARY_BUTTON,
  SECONDARY_BUTTON,
  SEMI,
  SUCCESS_TEXT,
  TEXT_BUTTON,
  readError,
} from './formStyles';
import type { Address } from './types';

type Draft = Record<keyof AddressInput, string>;

const EMPTY: Draft = {
  full_name: '',
  line1: '',
  line2: '',
  city: '',
  region: '',
  postal_code: '',
  country_code: 'JM',
  phone: '',
};

function toDraft(a: Address): Draft {
  return {
    full_name: a.full_name,
    line1: a.line1,
    line2: a.line2 ?? '',
    city: a.city,
    region: a.region ?? '',
    postal_code: a.postal_code ?? '',
    country_code: a.country_code,
    phone: a.phone ?? '',
  };
}

function AddressLines({ a }: { a: Address }) {
  const cityLine = [a.city, a.region, a.postal_code].filter(Boolean).join(', ');
  return (
    <address className="not-italic text-[0.9em] leading-relaxed text-white/75">
      <span className="text-white" style={SEMI}>{a.full_name}</span>
      <br />
      {a.line1}
      {a.line2 && (<><br />{a.line2}</>)}
      <br />
      {cityLine}
      <br />
      {countryName(a.country_code)}
      {a.phone && (<><br />{a.phone}</>)}
    </address>
  );
}

function Field({
  id,
  label,
  error,
  optional,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className={LABEL_CLASS}>
        {label}
        {optional && <span className="text-white/35"> (optional)</span>}
      </label>
      {children}
      {error && <p id={`${id}-error`} className={`${ERROR_TEXT} mt-1`}>{error}</p>}
    </div>
  );
}

function AddressForm({
  initial,
  canSetDefault,
  busy,
  serverError,
  serverFieldErrors,
  onSubmit,
  onCancel,
}: {
  initial: Draft;
  canSetDefault: boolean;
  busy: boolean;
  serverError: string | null;
  serverFieldErrors: AddressErrors;
  onSubmit: (draft: Draft, makeDefault: boolean) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<Draft>(initial);
  const [makeDefault, setMakeDefault] = useState(false);
  const [clientErrors, setClientErrors] = useState<AddressErrors>({});
  const errors = { ...serverFieldErrors, ...clientErrors };

  const countries = useMemo(() => {
    const rest = COUNTRY_CODES.filter((c) => !PRIORITY_COUNTRIES.includes(c))
      .map((c) => ({ code: c, name: countryName(c) }))
      .sort((a, b) => a.name.localeCompare(b.name));
    return { top: PRIORITY_COUNTRIES.map((c) => ({ code: c, name: countryName(c) })), rest };
  }, []);

  const set = (key: keyof Draft) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setDraft((d) => ({ ...d, [key]: e.target.value }));
    if (clientErrors[key]) setClientErrors((errs) => ({ ...errs, [key]: undefined }));
  };

  function submit(e: FormEvent) {
    e.preventDefault();
    const result = validateAddress(draft);
    if ('errors' in result) {
      setClientErrors(result.errors);
      return;
    }
    setClientErrors({});
    onSubmit(draft, makeDefault);
  }

  const input = (key: keyof Draft, autoComplete: string, extra: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <input
      id={`addr-${key}`}
      className={INPUT_CLASS}
      value={draft[key]}
      onChange={set(key)}
      autoComplete={autoComplete}
      disabled={busy}
      aria-invalid={!!errors[key]}
      aria-describedby={errors[key] ? `addr-${key}-error` : undefined}
      {...extra}
    />
  );

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4 rounded-[10px] border border-[#1a9e4a]/40 bg-[#1a9e4a]/5 p-5" style={BODY}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Field id="addr-country_code" label="Country" error={errors.country_code}>
            <select
              id="addr-country_code"
              className={`${INPUT_CLASS} cursor-pointer [&>*]:text-black`}
              value={draft.country_code}
              onChange={set('country_code')}
              autoComplete="country"
              disabled={busy}
            >
              {countries.top.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
              <option disabled>──────────</option>
              {countries.rest.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
            </select>
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field id="addr-full_name" label="Full name" error={errors.full_name}>{input('full_name', 'shipping name', { maxLength: 100 })}</Field>
        </div>
        <div className="sm:col-span-2">
          <Field id="addr-line1" label="Street address" error={errors.line1}>{input('line1', 'shipping address-line1', { maxLength: 120 })}</Field>
        </div>
        <div className="sm:col-span-2">
          <Field id="addr-line2" label="Apartment, suite, etc." optional error={errors.line2}>{input('line2', 'shipping address-line2', { maxLength: 120 })}</Field>
        </div>
        <Field id="addr-city" label="City / town" error={errors.city}>{input('city', 'shipping address-level2', { maxLength: 80 })}</Field>
        <Field id="addr-region" label="Parish / state / province" optional={!['US', 'CA', 'AU'].includes(draft.country_code)} error={errors.region}>
          {input('region', 'shipping address-level1', { maxLength: 80 })}
        </Field>
        <Field id="addr-postal_code" label="Postal code" optional error={errors.postal_code}>{input('postal_code', 'shipping postal-code', { maxLength: 20 })}</Field>
        <Field id="addr-phone" label="Phone" optional error={errors.phone}>{input('phone', 'shipping tel', { type: 'tel', maxLength: 30 })}</Field>
      </div>

      {canSetDefault && (
        <label className="flex items-center gap-2 text-[0.85em] text-white/80 cursor-pointer">
          <input type="checkbox" checked={makeDefault} onChange={(e) => setMakeDefault(e.target.checked)} disabled={busy} className="accent-[#1a9e4a] w-4 h-4" />
          Use as my default shipping address
        </label>
      )}

      {serverError && <p role="alert" className={ERROR_TEXT}>{serverError}</p>}

      <div className="flex gap-3">
        <button type="submit" className={PRIMARY_BUTTON} disabled={busy}>{busy ? 'SAVING…' : 'SAVE ADDRESS'}</button>
        <button type="button" className={SECONDARY_BUTTON} disabled={busy} onClick={onCancel}>CANCEL</button>
      </div>
    </form>
  );
}

type Mode = { kind: 'list' } | { kind: 'add' } | { kind: 'edit'; id: string };

export default function AddressBook({ initialAddresses }: { initialAddresses: Address[] }) {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [mode, setMode] = useState<Mode>({ kind: 'list' });
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<AddressErrors>({});
  const [notice, setNotice] = useState<string | null>(null);

  function open(next: Mode) {
    setMode(next);
    setError(null);
    setFieldErrors({});
    setNotice(null);
  }

  async function send(url: string, method: string, body: unknown, busyKey: string, done: string) {
    setBusyId(busyKey);
    setError(null);
    setFieldErrors({});
    setNotice(null);
    try {
      const res = await fetch(url, {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) {
        const data = await res.clone().json().catch(() => null);
        if (data?.fieldErrors) setFieldErrors(data.fieldErrors);
        setError(await readError(res));
        return false;
      }
      const data = await res.json();
      setAddresses(data.addresses);
      setMode({ kind: 'list' });
      setNotice(done);
      return true;
    } catch {
      setError('Something went wrong. Check your connection and try again.');
      return false;
    } finally {
      setBusyId(null);
    }
  }

  function save(draft: Draft, makeDefault: boolean) {
    const body = { ...draft, ...(makeDefault ? { is_default: true } : {}) };
    if (mode.kind === 'edit') {
      send(`/api/account/addresses/${mode.id}`, 'PATCH', body, 'form', 'Address updated.');
    } else {
      send('/api/account/addresses', 'POST', body, 'form', 'Address saved.');
    }
  }

  function remove(a: Address) {
    if (!window.confirm(`Delete the address for ${a.full_name} (${a.line1})?`)) return;
    send(`/api/account/addresses/${a.id}`, 'DELETE', null, a.id, 'Address deleted.');
  }

  const editing = mode.kind === 'edit' ? addresses.find((a) => a.id === mode.id) : undefined;
  const atLimit = addresses.length >= MAX_ADDRESSES;

  return (
    <div className="flex flex-col gap-5" style={BODY}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[1.15em] text-white" style={SEMI}>Shipping addresses</h2>
          <p className="text-[0.85em] text-white/55">
            Your default address is used at checkout. You can save up to {MAX_ADDRESSES}.
          </p>
        </div>
        {mode.kind === 'list' && addresses.length > 0 && !atLimit && (
          <button type="button" className={SECONDARY_BUTTON} onClick={() => open({ kind: 'add' })}>
            <Plus className="w-4 h-4" /> ADD ADDRESS
          </button>
        )}
      </div>

      {notice && <p role="status" className={SUCCESS_TEXT}>{notice}</p>}
      {error && mode.kind === 'list' && <p role="alert" className={ERROR_TEXT}>{error}</p>}

      {mode.kind === 'add' && (
        <AddressForm
          initial={EMPTY}
          canSetDefault={addresses.length > 0}
          busy={busyId === 'form'}
          serverError={error}
          serverFieldErrors={fieldErrors}
          onSubmit={save}
          onCancel={() => open({ kind: 'list' })}
        />
      )}

      {mode.kind === 'list' && addresses.length === 0 && (
        <div className="flex flex-col items-center text-center gap-4 rounded-[10px] border border-dashed border-white/15 py-10 px-4">
          <span className="flex items-center justify-center w-12 h-12 rounded-full bg-[#1a9e4a]/15 border border-[#1a9e4a]/40">
            <MapPin className="w-5 h-5 text-[#4dff91]" strokeWidth={2} />
          </span>
          <p className="text-[0.95em] text-white/70">No saved addresses yet. Add one for faster checkout.</p>
          <button type="button" className={PRIMARY_BUTTON} onClick={() => open({ kind: 'add' })}>
            <Plus className="w-4 h-4" /> ADD ADDRESS
          </button>
        </div>
      )}

      {addresses.length > 0 && (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((a) =>
            mode.kind === 'edit' && mode.id === a.id && editing ? (
              <li key={a.id} className="md:col-span-2">
                <AddressForm
                  initial={toDraft(editing)}
                  canSetDefault={!editing.is_default}
                  busy={busyId === 'form'}
                  serverError={error}
                  serverFieldErrors={fieldErrors}
                  onSubmit={save}
                  onCancel={() => open({ kind: 'list' })}
                />
              </li>
            ) : (
              <li
                key={a.id}
                className={`flex flex-col gap-4 rounded-[10px] border p-5 ${
                  a.is_default ? 'border-[#4dff91]/60 bg-[#1a9e4a]/10' : 'border-white/10 bg-white/[0.02]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <AddressLines a={a} />
                  {a.is_default && (
                    <span className="flex-shrink-0 px-2.5 py-1 rounded-full text-[0.65em] tracking-[0.15em] text-[#0c1510] bg-[#4dff91]" style={SEMI}>
                      DEFAULT
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-4 mt-auto">
                  <button type="button" className={TEXT_BUTTON} disabled={busyId !== null || mode.kind !== 'list'} onClick={() => open({ kind: 'edit', id: a.id })}>
                    Edit
                  </button>
                  {!a.is_default && (
                    <button
                      type="button"
                      className={TEXT_BUTTON}
                      disabled={busyId !== null || mode.kind !== 'list'}
                      onClick={() => send(`/api/account/addresses/${a.id}`, 'PATCH', { is_default: true }, a.id, 'Default address updated.')}
                    >
                      Make default
                    </button>
                  )}
                  <button type="button" className={DANGER_TEXT_BUTTON} disabled={busyId !== null || mode.kind !== 'list'} onClick={() => remove(a)}>
                    {busyId === a.id ? 'Working…' : 'Delete'}
                  </button>
                </div>
              </li>
            )
          )}
        </ul>
      )}
    </div>
  );
}
