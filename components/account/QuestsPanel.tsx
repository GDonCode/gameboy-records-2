// components/account/QuestsPanel.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { Panel } from './Panel';
import type { AccountTab, QuestStatus } from './types';

const BODY = { fontFamily: "'Poppins', sans-serif" };
const SEMI = { fontFamily: "'Poppins_semibold', sans-serif" };

const BUTTON_CLASS =
  'px-4 py-2 rounded-[6px] bg-[#1a9e4a] text-white text-[0.8em] tracking-[0.1em] hover:bg-[#149262] transition-colors disabled:opacity-60 cursor-pointer';

export default function QuestsPanel({
  quests,
  email,
  onSelectTab,
}: {
  quests: QuestStatus[];
  email: string;
  onSelectTab: (tab: AccountTab) => void;
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const open = quests.filter((q) => !q.done);
  const done = quests.filter((q) => q.done);
  const available = open.reduce((sum, q) => sum + q.points, 0);

  async function subscribe(quest: QuestStatus) {
    setBusyId(quest.id);
    setError(null);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        setError('Could not subscribe right now. Try again.');
        return;
      }
      router.refresh();
    } catch {
      setError('Could not subscribe right now. Try again.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Panel className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-[1.3em] text-white" style={SEMI}>
          Quests
        </h2>
        <p className="text-[0.9em] text-white/60" style={BODY}>
          {available > 0
            ? `${available} pts up for grabs. Daily quests reset at midnight.`
            : 'All quests complete. Daily quests reset at midnight.'}
        </p>
      </div>

      {error && (
        <p className="text-[#ff6b6b] text-[0.85em]" style={BODY}>
          {error}
        </p>
      )}

      <ul className="flex flex-col gap-3">
        {[...open, ...done].map((q) => (
          <li
            key={q.id}
            className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 rounded-[10px] border px-4 py-3 ${
              q.done ? 'border-white/10 bg-white/[0.02] opacity-60' : 'border-[#1a9e4a]/40 bg-[#1a9e4a]/5'
            }`}
          >
            <span
              className={`flex items-center justify-center w-9 h-9 flex-shrink-0 rounded-full border-2 text-[0.75em] ${
                q.done ? 'bg-[#1a9e4a] border-[#4dff91] text-white' : 'border-white/20 text-white/50'
              }`}
              style={SEMI}
              aria-hidden="true"
            >
              {q.done ? <Check className="w-4 h-4" strokeWidth={3} /> : `+${q.points}`}
            </span>

            <div className="flex-1 min-w-0">
              <p className="text-white" style={SEMI}>
                {q.title}
                {q.cadence === 'daily' && (
                  <span className="ml-2 text-[0.7em] tracking-[0.15em] text-[#4dff91]">DAILY</span>
                )}
              </p>
              <p className="text-[0.85em] text-white/60" style={BODY}>
                {q.description}
              </p>
            </div>

            <span className="text-[0.85em] text-[#4dff91]" style={SEMI}>
              {q.done ? (q.cadence === 'daily' ? 'DONE TODAY' : 'DONE') : `+${q.points} PTS`}
            </span>

            {!q.done && q.action.kind === 'tab' && (
              <button type="button" className={BUTTON_CLASS} style={BODY} onClick={() => onSelectTab((q.action as { tab: AccountTab }).tab)}>
                {q.actionLabel}
              </button>
            )}
            {!q.done && q.action.kind === 'href' && (
              <Link href={q.action.href} className={BUTTON_CLASS} style={BODY}>
                {q.actionLabel}
              </Link>
            )}
            {!q.done && q.action.kind === 'subscribe' && (
              <button
                type="button"
                className={BUTTON_CLASS}
                style={BODY}
                disabled={busyId === q.id}
                onClick={() => subscribe(q)}
              >
                {busyId === q.id ? 'Subscribing…' : q.actionLabel}
              </button>
            )}
          </li>
        ))}
      </ul>
    </Panel>
  );
}