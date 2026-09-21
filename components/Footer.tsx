'use client';

import { useState } from 'react';

const MEDIA_BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media`;

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
        <footer className="relative z-[2] flex flex-shrink-0 w-full min-h-[160px] bg-[#EDEAE0] border-t border-[rgba(186, 132, 132, 0.25)]">
      <style>{`
        .footer-email-input {
          flex: 1;
          min-width: 0;
          height: 44px;
          padding: 0 14px;
          font-family: 'Poppins', monospace;
          font-size: 0.9em;
          color: #16432a;
          background: #fff;
          border: 1px solid rgba(26,158,74,0.45);
          border-radius: 2px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .footer-email-input:focus {
          border-color: #1a9e4a;
          box-shadow: 0 0 0 1px #1a9e4a;
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
          border: 1px solid #1a9e4a;
          border-bottom-color: #0d5c29;
          border-right-color: #126e32;
          box-shadow: 0 4px 0 #0d5c29, 0 6px 16px rgba(13,92,41,0.5), inset 0 1px 0 rgba(255,255,255,0.35);
          cursor: pointer;
          transition: transform 0.07s ease, box-shadow 0.07s ease, background 0.08s ease;
          user-select: none;
        }
        .footer-subscribe-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          background: linear-gradient(175deg, #2bd06a 0%, #1aa64c 100%);
          border-color: #4dff91;
          box-shadow: 0 6px 0 #0d5c29, 0 8px 14px rgba(13,92,41,0.4), 0 0 14px rgba(77,255,145,0.45);
        }
        .footer-subscribe-btn:active:not(:disabled) {
          transform: translateY(4px);
          box-shadow: inset 0 2px 6px rgba(0,0,0,0.25);
        }
        .footer-subscribe-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
            {/* Left half — image + text */}
      <div className="flex-1 flow-root px-6 py-8 text-left">
                <div className="float-left mr-5 mb-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${MEDIA_BASE}/IMG_2591.jpg`}
          alt="Gameboy Records"
          className="w-auto h-auto max-w-[200px] max-h-[180px] block rounded-[2px] border-[3px] border-[#1a9e4a]"
        />
      </div>
        <p className="mb-3" style={{ fontFamily: "'Poppins', monospace", fontSize: '0.8em', color: '#3c5e4c', lineHeight: 1.6 }}>
          Alexx A-Game, born Alex Gallimore, grew up in Wood’s Town, Discovery Bay, in St. Ann, Jamaica. A William Knibb High School graduate, he picked up his stage name in late 2013 from his constant use of the slang “a-game.”
        </p>
        <p className="mb-3" style={{ fontFamily: "'Poppins', monospace", fontSize: '0.8em', color: '#3c5e4c', lineHeight: 1.6 }}>
          His sound blends dancehall with hip-hop, shaped by Damian Marley, Shabba Ranks and US and UK rap culture. Bass-heavy beats and sharp, witty lyrics defined his early mixtape <em>RealnTrue Vol. 1</em>, and he has since worked with international producers including Benny Page, Swing Ting and Famous Eno.
        </p>
        <p style={{ fontFamily: "'Poppins', monospace", fontSize: '0.8em', color: '#3c5e4c', lineHeight: 1.6 }}>
          A musician first, Alexx has pushed for a fresher, more visual approach to Jamaican music, and was cast as Peter Tosh in Paramount’s <em>Bob Marley: One Love</em>. Gameboy Records is where that vision lives: realest sound, truest vision.
        </p>
      </div>

      {/* Divider — my-6 keeps it clear of the top and bottom edges */}
      <div className="my-6 w-px bg-[#181818]" aria-hidden="true" />

      {/* Right half — newsletter signup */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-[420px] flex flex-col gap-3">
          <h3 style={{ fontFamily: "'Poppins_semibold', monospace", fontSize: '1.4em', letterSpacing: '0.15em', color: '#16432a', lineHeight: 1 }}>
            JOIN THE NEWSLETTER
          </h3>
          <p style={{ fontFamily: "'Poppins', monospace", fontSize: '0.85em', color: '#3c5e4c', lineHeight: 1.6 }}>
            New drops, shows and behind-the-scenes, straight to your inbox.
          </p>
          <form onSubmit={handleSubscribe} className="flex gap-2">
            <input
              type="email"
              name="email"
              placeholder="Your email"
              aria-label="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="footer-email-input"
            />
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