// components/account/payments/AddPaymentMethod.tsx
'use client';

// The browser half of adding a payment method. Each processor has its own secure widget (Stripe Elements,
// PayPal buttons, a gateway's hosted fields…) that collects the card and returns a reference; that reference
// is all this site ever sees. Add a case below when a real processor is plugged in (see lib/payments/provider.ts).

import { useState } from 'react';
import { BODY, ERROR_TEXT, LABEL_CLASS, INPUT_CLASS, PRIMARY_BUTTON, SECONDARY_BUTTON } from '../formStyles';

export interface AddMethodProps {
  provider: string;
  setup: Record<string, unknown>;
  busy: boolean;
  error: string | null;
  /** Called with the processor's reference for the new method. */
  onReference: (reference: string, makeDefault: boolean) => void;
  onCancel: () => void;
  canSetDefault: boolean;
}

const TEST_CARD_LABELS: Record<string, string> = {
  test_visa: 'Visa •••• 4242',
  test_mastercard: 'Mastercard •••• 4444',
  test_amex: 'American Express •••• 8431',
  test_expired: 'Visa •••• 0069 (expired)',
  test_declined: 'Card that gets declined',
};

function TestCardForm({ setup, busy, error, onReference, onCancel, canSetDefault }: AddMethodProps) {
  const cards = Array.isArray(setup.cards) ? (setup.cards as string[]) : [];
  const [card, setCard] = useState(cards[0] ?? '');
  const [makeDefault, setMakeDefault] = useState(false);
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onReference(card, makeDefault); }}
      className="flex flex-col gap-4 rounded-[10px] border border-[#f5c542]/40 bg-[#f5c542]/5 p-5 max-w-[460px]"
      style={BODY}
    >
      <p className="text-[0.8em] text-[#f5c542]">
        Test mode: no real card is used. This only appears on your own computer, never on the live site.
      </p>
      <div>
        <label htmlFor="test-card" className={LABEL_CLASS}>Test card</label>
        <select id="test-card" className={`${INPUT_CLASS} cursor-pointer [&>*]:text-black`} value={card} onChange={(e) => setCard(e.target.value)} disabled={busy}>
          {cards.map((c) => <option key={c} value={c}>{TEST_CARD_LABELS[c] ?? c}</option>)}
        </select>
      </div>
      {canSetDefault && (
        <label className="flex items-center gap-2 text-[0.85em] text-white/80 cursor-pointer">
          <input type="checkbox" checked={makeDefault} onChange={(e) => setMakeDefault(e.target.checked)} disabled={busy} className="accent-[#1a9e4a] w-4 h-4" />
          Use as my default payment method
        </label>
      )}
      {error && <p role="alert" className={ERROR_TEXT}>{error}</p>}
      <div className="flex gap-3">
        <button type="submit" className={PRIMARY_BUTTON} disabled={busy || !card}>{busy ? 'SAVING…' : 'SAVE CARD'}</button>
        <button type="button" className={SECONDARY_BUTTON} disabled={busy} onClick={onCancel}>CANCEL</button>
      </div>
    </form>
  );
}

export default function AddPaymentMethod(props: AddMethodProps) {
  switch (props.provider) {
    case 'test':
      return <TestCardForm {...props} />;
    // case 'stripe': return <StripeCardForm {...props} />;
    default:
      return (
        <p role="alert" className={ERROR_TEXT} style={BODY}>
          Adding payment methods isn’t available right now. Please try again later.
        </p>
      );
  }
}
