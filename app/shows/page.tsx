// app/shows/page.tsx
'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import MobileBottomNav from '@/components/MobileBottomNav';
import Footer from '@/components/Footer';
import GameIconsBackground from '@/components/GameIconsBackground';

export default function ShowsPage() {
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
    <div className="flex flex-col h-screen overflow-hidden">
      <style>{`
        .shows-placeholder-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: linear-gradient(175deg, #22b85a 0%, #178f42 100%);
          border: 1px solid #1a9e4a;
          border-bottom-color: #0d5c29;
          border-right-color: #126e32;
          box-shadow: 0 4px 0 #0d5c29, 0 6px 16px rgba(13,92,41,0.5), inset 0 1px 0 rgba(255,255,255,0.35);
        }
        .shows-email-input {
          flex: 1;
          min-width: 0;
          height: 48px;
          padding: 0 1rem;
          border: 1px solid rgba(26,158,74,0.25);
          border-radius: 2px;
          outline: none;
          background: rgba(255,255,255,0.05);
          color: #fff;
          font-family: 'Poppins', monospace;
          font-size: 0.9em;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .shows-email-input::placeholder { color: rgba(255,255,255,0.3); }
        .shows-email-input:focus {
          border-color: #4dff91;
          box-shadow: 0 0 0 1px #4dff91, 0 0 12px rgba(77,255,145,0.15);
        }
        .shows-notify-btn {
          font-family: 'Poppins_semibold', monospace;
          font-size: 0.9em;
          letter-spacing: 0.18em;
          color: #fff;
          text-shadow: 0 1px 2px rgba(0,0,0,0.5);
          display: inline-flex;
          align-items: center;
          padding: 0 22px;
          height: 48px;
          background: linear-gradient(175deg, #22b85a 0%, #178f42 100%);
          border: 1px solid #1a9e4a;
          border-bottom-color: #0d5c29;
          border-right-color: #126e32;
          box-shadow: 0 4px 0 #0d5c29, 0 6px 16px rgba(13,92,41,0.5), inset 0 1px 0 rgba(255,255,255,0.35);
          cursor: pointer;
          transition: transform 0.07s ease, box-shadow 0.07s ease, background 0.08s ease;
          user-select: none;
        }
        .shows-notify-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          background: linear-gradient(175deg, #2bd06a 0%, #1aa64c 100%);
          border-color: #4dff91;
          box-shadow: 0 6px 0 #0d5c29, 0 8px 14px rgba(13,92,41,0.4), 0 0 14px rgba(77,255,145,0.45);
        }
        .shows-notify-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      <Header />
      <MobileBottomNav />

      <div
        className="flex-1 overflow-y-auto relative"
        style={{ background: 'linear-gradient(160deg, #1c2e20 0%, #181f1a 60%, #10160f 100%)' }}
      >
        <GameIconsBackground />

        <div className="relative z-[1] flex flex-col items-center px-6 py-20 text-center">
          <h1
            style={{
              fontFamily: "'Poppins_semibold', monospace",
              fontSize: '3em',
              color: '#4dff91',
              letterSpacing: '0.2em',
              textShadow: '0 0 20px rgba(77,255,145,0.25)',
            }}
          >
            SHOWS
          </h1>
          <p
            className="mt-3 max-w-[560px]"
            style={{ fontFamily: "'Poppins', monospace", fontSize: '1.1em', color: '#e8f5ec', lineHeight: 1.6, opacity: 0.8 }}
          >
            Tour dates are being booked. Be the first to know when we announce a show near you.
          </p>

          {/* Placeholder show-info icons */}
          <div className="flex flex-wrap items-center justify-center gap-10 mt-14">
            <div className="flex flex-col items-center gap-3">
              <span className="shows-placeholder-icon">
                <svg viewBox="0 0 640 640" className="w-7 h-7" fill="#fff">
                  <path d="M224 64C241.7 64 256 78.3 256 96L256 128L384 128L384 96C384 78.3 398.3 64 416 64C433.7 64 448 78.3 448 96L448 128L480 128C515.3 128 544 156.7 544 192L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 192C96 156.7 124.7 128 160 128L192 128L192 96C192 78.3 206.3 64 224 64zM160 304L160 336C160 344.8 167.2 352 176 352L208 352C216.8 352 224 344.8 224 336L224 304C224 295.2 216.8 288 208 288L176 288C167.2 288 160 295.2 160 304z" />
                </svg>
              </span>
              <span style={{ fontFamily: "'Poppins_semibold', monospace", fontSize: '0.85em', letterSpacing: '0.14em', color: '#4dff91' }}>
                DATE — TBA
              </span>
            </div>

            <div className="flex flex-col items-center gap-3">
              <span className="shows-placeholder-icon">
                <svg viewBox="0 0 384 512" className="w-6 h-6" fill="#fff">
                  <path d="M172.3 501.7C27 291 0 269.4 0 192 0 86 86 0 192 0S384 86 384 192c0 77.4-27 99-172.3 309.7-9.5 13.8-29.9 13.8-39.4 0zM192 256a64 64 0 1 0 0-128 64 64 0 1 0 0 128z" />
                </svg>
              </span>
              <span style={{ fontFamily: "'Poppins_semibold', monospace", fontSize: '0.85em', letterSpacing: '0.14em', color: '#4dff91' }}>
                VENUE — TBA
              </span>
            </div>

            <div className="flex flex-col items-center gap-3">
              <span className="shows-placeholder-icon">
                <svg viewBox="0 0 640 640" className="w-7 h-7" fill="#fff">
                  <path d="M64 200C64 168.9 89.1 143.9 120 144L520 144C550.9 144 576 169.1 576 200L576 232C558.3 232 544 246.3 544 264C544 281.7 558.3 296 576 296L576 360C558.3 360 544 374.3 544 392C544 409.7 558.3 424 576 424L576 456C576 486.9 550.9 512 520 512L120 512C89.1 512 64 486.9 64 456L64 424C81.7 424 96 409.7 96 392C96 374.3 81.7 360 64 360L64 296C81.7 296 96 281.7 96 264C96 246.3 81.7 232 64 232L64 200z" />
                </svg>
              </span>
              <span style={{ fontFamily: "'Poppins_semibold', monospace", fontSize: '0.85em', letterSpacing: '0.14em', color: '#4dff91' }}>
                TICKETS — TBA
              </span>
            </div>
          </div>

          {/* Email capture */}
          <div className="w-full max-w-[480px] mt-16">
            <h3 style={{ fontFamily: "'Poppins_semibold', monospace", fontSize: '1.3em', letterSpacing: '0.12em', color: '#fff' }}>
              GET NOTIFIED
            </h3>
            <p className="mt-2 mb-5" style={{ fontFamily: "'Poppins', monospace", fontSize: '0.95em', color: '#e8f5ec', opacity: 0.7, lineHeight: 1.5 }}>
              Drop your email and we’ll let you know the second dates go live.
            </p>
            <form onSubmit={handleNotify} className="flex gap-2">
              <input
                type="email"
                name="email"
                placeholder="Your email"
                aria-label="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="shows-email-input"
              />
              <button type="submit" disabled={isSubmitting} className="shows-notify-btn">
                {isSubmitting ? 'SENDING…' : 'NOTIFY ME'}
              </button>
            </form>
            {status.type && (
              <p
                role="status"
                className="mt-3"
                style={{ fontFamily: "'Poppins', monospace", fontSize: '0.8em', color: status.type === 'success' ? '#4dff91' : '#ff6b6b' }}
              >
                {status.message}
              </p>
            )}
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}