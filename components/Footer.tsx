'use client';

import { useState } from 'react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  const handleSubscribe = async (e: React.FormEvent<HTMLFormElement>) => {
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

      setStatus({ type: 'success', message: data.message || 'You’re subscribed!' });
      setEmail('');
    } catch (err) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : 'Something went wrong. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

// ... existing code below ...
  return (
        <footer className="relative z-[2] flex flex-col md:flex-row flex-shrink-0 w-full min-h-[160px] bg-[#EDEAE0] border-t border-[rgba(186, 132, 132, 0.25)]">
      <style>{`
        .footer-email-input {
          flex: 1;
          min-width: 0;
          height: 44px;
          line-height: 28px;
          padding: 0 1rem;
          padding-left: 2.5rem;
          border: 2px solid transparent;
          border-radius: 8px;
          outline: none;
          background-color: #fff;
          color: #0d0c22;
          transition: .3s ease;
        }
        .footer-email-input::placeholder { color: rgba(22,67,42,0.4); }
        .footer-subscribe-btn {
          font-family: 'Poppins_semibold', monospace;
          font-size: 0.9em;
          letter-spacing: 0.18em;
          color: #fff;
          text-shadow: 0 1px 2px rgba(0,0,0,0.5);
          display: inline-flex;
          align-items: center;
          padding: 0 22px;
          height: 44px;
          background: linear-gradient(175deg, #22b85a 0%, #178f42 100%);
          cursor: pointer;
          transition: transform 0.07s ease, box-shadow 0.07s ease, background 0.08s ease;
          user-select: none;
        }
        .footer-subscribe-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          background: linear-gradient(175deg, #2bd06a 0%, #1aa64c 100%);
          border-color: #4dff91;
        }
        .footer-subscribe-btn:active:not(:disabled) {
          transform: translateY(4px);
          box-shadow: inset 0 2px 6px rgba(0,0,0,0.25);
        }
                .footer-subscribe-btn:disabled { opacity: 0.5; cursor: not-allowed; }
                .footer-social-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          padding: 8px;
          border-radius: 50%;
          background: #fff;
          border: 1px solid rgba(26,158,74,0.2);
          box-shadow: 0 3px 0 rgba(13,92,41,0.15), 0 4px 10px rgba(0,0,0,0.08);
          transition: transform 0.07s ease, box-shadow 0.07s ease;
          user-select: none;
        }
        .footer-social-link img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }
        .footer-social-link:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 0 rgba(13,92,41,0.15), 0 6px 14px rgba(0,0,0,0.12);
        }
      `}</style>
      {/* Left half — social links */}
      <div className="flex-1 flex flex-col justify-center px-6 py-8">
        <h3 style={{ fontFamily: "'Poppins_semibold', monospace", fontSize: '1.75em', letterSpacing: '0.15em', color: '#16432a', lineHeight: 1 }}>
          FOLLOW US
        </h3>
        <p className="mt-3 mb-6" style={{ fontFamily: "'Poppins', monospace", fontSize: '1em', color: '#3c5e4c', lineHeight: 1.6 }}>
          New drops, shows and behind-the-scenes — follow along.
        </p>
                <div className="flex flex-wrap items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <a href="https://www.instagram.com/gameboyrecordsofficial/" aria-label="Instagram" className="footer-social-link"><img src="/instagram.png" alt="Instagram" /></a>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <a href="https://www.tiktok.com/@alexxagame" aria-label="TikTok" className="footer-social-link"><img src="/tik-tok.png" alt="TikTok" /></a>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <a href="https://www.youtube.com/@LifeOfGameBoy" aria-label="YouTube" className="footer-social-link"><img src="/youtube.png" alt="YouTube" /></a>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <a href="https://open.spotify.com/artist/3BemerMhrSFpqDcAsqkdvh" aria-label="Spotify" className="footer-social-link"><img src="/spotify.png" alt="Spotify" /></a>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <a href="https://music.apple.com/us/artist/alexx-a-game/1093080428" aria-label="Apple Music" className="footer-social-link"><img src="/apple-music.png" alt="Apple Music" /></a>
        </div>
      </div>

      {/* Divider — my-6 keeps it clear of the top and bottom edges */}
      <div className="mx-6 h-px md:mx-0 md:my-6 md:h-auto md:w-px bg-[#181818]" aria-hidden="true" />

      {/* Right half — newsletter signup */}
      <div className="flex-1 flex items-center justify-start md:justify-center px-6 py-8">
        <div className="w-full max-w-[420px] flex flex-col">
          <h3 style={{ fontFamily: "'Poppins_semibold', monospace", fontSize: '1.75em', letterSpacing: '0.15em', color: '#16432a', lineHeight: 1 }}>
            JOIN THE NEWSLETTER
          </h3>
          <p className="mt-3" style={{ fontFamily: "'Poppins', monospace", fontSize: '1em', color: '#3c5e4c', lineHeight: 1.6 }}>
            New drops, shows and behind-the-scenes, straight to your inbox.
          </p>
          <form onSubmit={handleSubscribe} className="flex gap-2 mt-6">
            <div className="relative flex-1 min-w-0">
              {/* Font Awesome envelope icon (v7.3.1), CC BY 4.0 */}
              <svg
                aria-hidden="true"
                viewBox="0 0 640 640"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              >
                <path
                  fill="#16432a"
                  d="M125.4 128C91.5 128 64 155.5 64 189.4C64 190.3 64 191.1 64.1 192L64 192L64 448C64 483.3 92.7 512 128 512L512 512C547.3 512 576 483.3 576 448L576 192L575.9 192C575.9 191.1 576 190.3 576 189.4C576 155.5 548.5 128 514.6 128L125.4 128zM528 256.3L528 448C528 456.8 520.8 464 512 464L128 464C119.2 464 112 456.8 112 448L112 256.3L266.8 373.7C298.2 397.6 341.7 397.6 373.2 373.7L528 256.3zM112 189.4C112 182 118 176 125.4 176L514.6 176C522 176 528 182 528 189.4C528 193.6 526 197.6 522.7 200.1L344.2 335.5C329.9 346.3 310.1 346.3 295.8 335.5L117.3 200.1C114 197.6 112 193.6 112 189.4z"
                />
              </svg>
              <input
                type="email"
                name="email"
                placeholder="Your email"
                aria-label="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="footer-email-input w-full"
              />
            </div>
            <button type="submit" disabled={isSubmitting} className="footer-subscribe-btn">
              {isSubmitting ? 'SENDING…' : 'SUBSCRIBE'}
            </button>
          </form>
          {status.type && (
            <p
              role="status"
              style={{ fontFamily: "'Poppins', monospace", fontSize: '0.8em', color: status.type === 'success' ? '#1a9e4a' : '#c0392b' }}
            >
              {status.message}
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}