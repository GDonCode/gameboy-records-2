// components/shows/ShowsBoard.tsx
// The Shows page body, in the original Shows design: neon title, game-icon background, the three
// date / venue / tickets badges and the "Get notified" sign-up. When dates are added in lib/shows.ts
// they replace the TBA badges, one row per show.
'use client';

import { useState } from 'react';
import NeonHeading from '@/components/NeonHeading';
import GameIconsBackground from '@/components/GameIconsBackground';
import type { Show } from '@/lib/shows';

const SEMI = "'Poppins_semibold', 'Poppins', sans-serif";
const BODY = "'Poppins', sans-serif";

const ICON_CALENDAR =
  'M224 64C241.7 64 256 78.3 256 96L256 128L384 128L384 96C384 78.3 398.3 64 416 64C433.7 64 448 78.3 448 96L448 128L480 128C515.3 128 544 156.7 544 192L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 192C96 156.7 124.7 128 160 128L192 128L192 96C192 78.3 206.3 64 224 64zM160 304L160 336C160 344.8 167.2 352 176 352L208 352C216.8 352 224 344.8 224 336L224 304C224 295.2 216.8 288 208 288L176 288C167.2 288 160 295.2 160 304z';
const ICON_PIN =
  'M172.3 501.7C27 291 0 269.4 0 192 0 86 86 0 192 0S384 86 384 192c0 77.4-27 99-172.3 309.7-9.5 13.8-29.9 13.8-39.4 0zM192 256a64 64 0 1 0 0-128 64 64 0 1 0 0 128z';
const ICON_TICKET =
  'M64 200C64 168.9 89.1 143.9 120 144L520 144C550.9 144 576 169.1 576 200L576 232C558.3 232 544 246.3 544 264C544 281.7 558.3 296 576 296L576 360C558.3 360 544 374.3 544 392C544 409.7 558.3 424 576 424L576 456C576 486.9 550.9 512 520 512L120 512C89.1 512 64 486.9 64 456L64 424C81.7 424 96 409.7 96 392C96 374.3 81.7 360 64 360L64 296C81.7 296 96 281.7 96 264C96 246.3 81.7 232 64 232L64 200z';

function Badge({ viewBox, d, label, size = 'w-7 h-7' }: { viewBox: string; d: string; label: string; size?: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <span className="shows-placeholder-icon" aria-hidden="true">
        <svg viewBox={viewBox} className={size} fill="#fff">
          <path d={d} />
        </svg>
      </span>
      <span style={{ fontFamily: SEMI, fontSize: '0.85em', letterSpacing: '0.14em', color: '#4dff91' }}>{label}</span>
    </div>
  );
}

function ShowRow({ show }: { show: Show }) {
  const d = new Date(show.date);
  const date = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' }).toUpperCase();
  const directions = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${show.venue}, ${show.address}`)}`;
  const label = show.status === 'sold-out' ? 'SOLD OUT' : show.status === 'announced' ? 'ON SALE SOON' : show.status === 'members-presale' ? 'MEMBERS PRESALE' : 'TICKETS';
  return (
    <li className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 px-6 py-5 text-left border border-[rgba(26,158,74,0.25)] bg-[rgba(255,255,255,0.03)]">
      <span style={{ fontFamily: SEMI, letterSpacing: '0.14em', color: '#4dff91' }} className="sm:w-[150px] shrink-0">
        {date}
      </span>
      <span className="flex-1" style={{ fontFamily: BODY }}>
        <span className="block text-white" style={{ fontFamily: SEMI, letterSpacing: '0.08em' }}>
          {show.city.toUpperCase()}, {show.country.toUpperCase()}
        </span>
        <a href={directions} target="_blank" rel="noopener noreferrer" className="text-[0.9em] text-[#e8f5ec]/70 underline underline-offset-4 hover:text-white">
          {show.venue}
        </a>
      </span>
      {show.ticketUrl && (show.status === 'on-sale' || show.status === 'members-presale') ? (
        <a href={show.ticketUrl} target="_blank" rel="noopener noreferrer" className="shows-notify-btn zoom-content justify-center" aria-label={`${label}: ${show.city} (opens in a new tab)`}>
          <span>{label}</span>
        </a>
      ) : (
        <span style={{ fontFamily: SEMI, fontSize: '0.85em', letterSpacing: '0.14em', color: '#e8f5ec', opacity: 0.6 }}>{label}</span>
      )}
    </li>
  );
}

export default function ShowsBoard({ shows }: { shows: Show[] }) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  const handleNotify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: null, message: '' });
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
      setStatus({ type: 'success', message: data.message || 'You’re on the list!' });
      setEmail('');
    } catch (err) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : 'Something went wrong. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="relative flex-1 overflow-hidden min-h-[calc(100svh-var(--header-h))]"
      style={{ background: 'linear-gradient(160deg, #1c2e20 0%, #181f1a 60%, #10160f 100%)' }}
    >
      <style>{`
        .shows-placeholder-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: linear-gradient(175deg, #34a57a 0%, #2C8663 100%);
          border: 1px solid #2C8663;
          border-bottom-color: #1A5640;
          border-right-color: #226B4F;
          box-shadow: 0 4px 0 #1A5640, 0 6px 16px rgba(26,86,64,0.5), inset 0 1px 0 rgba(255,255,255,0.35);
        }
        .shows-email-input {
          flex: 1 1 auto;
          min-width: 0;
          height: 48px;
          padding: 0 1rem;
          border: 1px solid rgba(26,158,74,0.25);
          border-radius: 2px;
          outline: none;
          background: rgba(255,255,255,0.05);
          color: #fff;
          font-family: 'Poppins', sans-serif;
          font-size: 0.9em;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .shows-email-input::placeholder { color: rgba(255,255,255,0.45); }
        .shows-email-input:focus {
          border-color: #4dff91;
          box-shadow: 0 0 0 1px #4dff91, 0 0 12px rgba(77,255,145,0.15);
        }
        /* Primary call to action, in the gold: the original raised button shape. */
        .shows-notify-btn {
          font-family: 'Poppins_semibold', sans-serif;
          font-size: 0.9em;
          letter-spacing: 0.18em;
          color: #0B0A07;
          display: inline-flex;
          align-items: center;
          padding: 0 22px;
          height: 48px;
          background: linear-gradient(175deg, #F0C928 0%, #E2BA0A 100%);
          border: 1px solid #E2BA0A;
          border-bottom-color: #8A7006;
          border-right-color: #B39208;
          box-shadow: 0 4px 0 #8A7006, 0 6px 16px rgba(138,112,6,0.45), inset 0 1px 0 rgba(255,255,255,0.45);
          cursor: pointer;
          transition: box-shadow 0.07s ease, background 0.08s ease;
          user-select: none;
          white-space: nowrap;
        }
        .shows-notify-btn:hover:not(:disabled) {
          background: linear-gradient(175deg, #F5D44A 0%, #E8C21C 100%);
          box-shadow: 0 4px 0 #8A7006, 0 8px 18px rgba(138,112,6,0.5), 0 0 14px rgba(226,186,10,0.45);
        }
        .shows-notify-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      <GameIconsBackground />

      <div className="relative z-[1] flex flex-col items-center px-6 py-20 text-center">
        <NeonHeading>Shows</NeonHeading>
        <p className="mt-5 max-w-[560px]" style={{ fontFamily: BODY, fontSize: '1.1em', color: '#e8f5ec', lineHeight: 1.6, opacity: 0.8 }}>
          {shows.length > 0 ? 'Upcoming dates. Playaz Club members get first access to tickets.' : 'Tour dates are being booked. Be the first to know when we announce a show near you.'}
        </p>

        {shows.length > 0 ? (
          <ul className="w-full max-w-[860px] mt-14 flex flex-col gap-3 list-none p-0">
            {shows.map((s) => (
              <ShowRow key={`${s.date}-${s.city}`} show={s} />
            ))}
          </ul>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-10 mt-14">
            <Badge viewBox="0 0 640 640" d={ICON_CALENDAR} label="DATE — TBA" />
            <Badge viewBox="0 0 384 512" d={ICON_PIN} label="VENUE — TBA" size="w-6 h-6" />
            <Badge viewBox="0 0 640 640" d={ICON_TICKET} label="TICKETS — TBA" />
          </div>
        )}

        {/* Email capture */}
        <div className="w-full max-w-[480px] mt-16">
          <h2 className="m-0" style={{ fontFamily: SEMI, fontSize: '1.3em', letterSpacing: '0.12em', color: '#fff' }}>
            GET NOTIFIED
          </h2>
          <p className="mt-2 mb-5" style={{ fontFamily: BODY, fontSize: '0.95em', color: '#e8f5ec', opacity: 0.75, lineHeight: 1.5 }}>
            Drop your email and we’ll let you know the second dates go live.
          </p>
          <form onSubmit={handleNotify} className="flex flex-col sm:flex-row gap-2">
            <label htmlFor="shows-email" className="sr-only">
              Email address
            </label>
            <input
              id="shows-email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="shows-email-input"
            />
            <button type="submit" disabled={isSubmitting} className="shows-notify-btn zoom-content justify-center">
              <span>{isSubmitting ? 'SENDING…' : 'NOTIFY ME'}</span>
            </button>
          </form>
          <p role="status" aria-live="polite" className="mt-3 min-h-[1.4em]" style={{ fontFamily: BODY, fontSize: '0.85em', color: status.type === 'success' ? '#4dff91' : '#ff8a8a' }}>
            {status.message}
          </p>
        </div>
      </div>
    </div>
  );
}
