'use client';

import { useRef, useState } from 'react';
import Header from '@/components/Header';
import MobileBottomNav from '@/components/MobileBottomNav';
import GameIconsBackground from '@/components/GameIconsBackground';
import Footer from '@/components/Footer';


const MEDIA_BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media`;

// ── CORNER BRACKETS ──────────────────────────────────────────────────────────
function Corners() {
  return (
    <>
      <span className="absolute top-0 left-0 w-5 h-5 border-t-[3px] border-l-[3px] border-[#1a9e4a] pointer-events-none z-50" />
      <span className="absolute top-0 right-0 w-5 h-5 border-t-[3px] border-r-[3px] border-[#1a9e4a] pointer-events-none z-50" />
      <span className="absolute bottom-0 left-0 w-5 h-5 border-b-[3px] border-l-[3px] border-[#1a9e4a] pointer-events-none z-50" />
      <span className="absolute bottom-0 right-0 w-5 h-5 border-b-[3px] border-r-[3px] border-[#1a9e4a] pointer-events-none z-50" />
    </>
  );
}

// ... existing code above ...
export default function Home() {
  const [playerMounted,  setPlayerMounted]  = useState(false);
  const [playerVisible,  setPlayerVisible]  = useState(false);
  const [playerSrc, setPlayerSrc] = useState(
    'https://www.youtube.com/embed/videoseries?list=PL5jjb3J99wR7DQiFdlhXnit_1bZt2a4Bo&autoplay=1&controls=1'
  );

  // Contact form state
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function openPlayer(embedSrc?: string) {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    if (embedSrc) setPlayerSrc(embedSrc);
    setPlayerMounted(true);
    setPlayerVisible(true);
  }

  function closePlayer() {
    setPlayerVisible(false);
    // Unmount after the .mini-player slide-out (0.38s) so the iframe stops playing
    closeTimerRef.current = setTimeout(() => {
      setPlayerMounted(false);
      closeTimerRef.current = null;
    }, 400);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to send message');

      setSubmitStatus({ type: 'success', message: 'Message sent! We’ll get back to you soon.' });
      setFormData({ name: '', email: '', message: '' });
    } catch {
      setSubmitStatus({ type: 'error', message: 'Something went wrong. Please try again later.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style>{`

        /* ── HERO TAGLINE — responsive size/spacing ── */
        .hero-tagline {
          font-size: 1.75em;
          letter-spacing: 0.1em;
        }
        @media (min-width: 768px) {
          .hero-tagline {
            font-size: 1.75em;
            letter-spacing: 0.28em;
          }
        }

        /* ── SIDEBAR GRADIENT RULE LINE (pseudo-element) ── */
        .news-sidebar::after {
          content: '';
          position: absolute;
          right: 0; top: 0; bottom: 0;
          width: 1px;
          background: linear-gradient(180deg, transparent, rgba(26,158,74,0.35) 20%, rgba(26,158,74,0.18) 60%, rgba(26,158,74,0.35) 80%, transparent);
          pointer-events: none;
        }

        /* ── SCANLINE OVERLAY (pseudo-element) ── */
        .scanline::before {
          content: '';
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.09) 3px, rgba(0,0,0,0.09) 4px);
          pointer-events: none;
          z-index: 2;
        }

        /* ── PARTNER CTA HOVER (box-shadow glow) ── */
        .partner-cta:hover {
          background: rgba(26,158,74,0.12);
          border-color: rgba(77,255,145,0.7) !important;
          box-shadow: 0 0 16px rgba(26,158,74,0.2);
        }

        /* ── SCROLLBAR HIDE ── */
        .no-scrollbar { scrollbar-width: none; }
        .no-scrollbar::-webkit-scrollbar { display: none; }

        /* ── HERO LISTEN NOW BUTTON ── */
        .listen-btn {
          font-family: 'Poppins_semibold', monospace;
          font-size: 1.1em;
          letter-spacing: 0.18em;
          color: #fff;
          text-shadow: 0 1px 2px rgba(0,0,0,0.5);
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 0 32px;
          height: 52px;
          background: linear-gradient(175deg, #22b85a 0%, #178f42 100%);
          border: 1px solid #1a9e4a;
          border-bottom-color: #0d5c29;
          border-right-color: #126e32;
          box-shadow: 0 4px 0 #0d5c29, 0 6px 16px rgba(13,92,41,0.5), inset 0 1px 0 rgba(255,255,255,0.35);
          cursor: pointer;
          transition: transform 0.07s ease, box-shadow 0.07s ease, background 0.08s ease;
          user-select: none;
        }
        .listen-btn:hover {
          transform: translateY(-2px);
          background: linear-gradient(175deg, #2bd06a 0%, #1aa64c 100%);
          border-color: #4dff91;
          border-bottom-color: #0d5c29;
          box-shadow: 0 6px 0 #0d5c29, 0 8px 20px rgba(13,92,41,0.5), inset 0 1px 0 rgba(255,255,255,0.4), 0 0 22px rgba(77,255,145,0.55);
        }
                .listen-btn:active {
          transform: translateY(4px);
          box-shadow: inset 0 2px 6px rgba(0,0,0,0.3), inset 0 0 16px rgba(77,255,145,0.2);
        }

        /* ── LISTEN ON (PLATFORM) BUTTONS ── */
        .listen-on-wrap {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 14px;
        }
        .listen-on-btn {
          font-family: 'Poppins_semibold', monospace;
          font-size: 0.85em;
          letter-spacing: 0.1em;
          color: #fff;
          text-shadow: 0 1px 2px rgba(0,0,0,0.5);
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 0 20px;
          height: 48px;
          background: rgba(10,20,14,0.55);
          border: 1px solid rgba(77,255,145,0.35);
          border-radius: 2px;
          cursor: pointer;
          text-decoration: none;
          transition: transform 0.07s ease, box-shadow 0.07s ease, background 0.15s ease, border-color 0.15s ease;
          user-select: none;
        }
        .listen-on-btn img {
          width: 22px;
          height: 22px;
          object-fit: contain;
          border-radius: 4px;
          flex-shrink: 0;
        }
        .listen-on-btn:hover {
          transform: translateY(-2px);
          background: rgba(26,158,74,0.25);
          border-color: #4dff91;
          box-shadow: 0 4px 14px rgba(13,92,41,0.5), 0 0 14px rgba(77,255,145,0.35);
        }
        .listen-on-btn:active {
          transform: translateY(1px);
        }

        /* ── FLOATING MINI-PLAYER ── */
        .mini-player {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 200;
          width: 340px;
          background: #050f08;
          border: 1px solid rgba(26,158,74,0.5);
          box-shadow: 0 0 0 1px rgba(26,158,74,0.08), 0 12px 48px rgba(0,0,0,0.85), 0 0 32px rgba(26,158,74,0.08);
          transform: translateY(calc(100% + 40px));
          opacity: 0;
          transition: transform 0.38s cubic-bezier(0.22,1,0.36,1), opacity 0.25s ease;
          pointer-events: none;
        }
        .mini-player.visible {
          transform: translateY(0);
          opacity: 1;
          pointer-events: auto;
        }
        .mini-player-close:hover { color: #fff; }

        /* ── CONTACT FORM STYLES ── */
        .contact-input {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(26,158,74,0.25);
          color: #fff;
          font-family: 'Poppins', monospace;
          font-size: 0.9em;
          padding: 10px 14px;
          border-radius: 2px;
          transition: border-color 0.2s, box-shadow 0.2s;
          outline: none;
          width: 100%;
        }
        .contact-input:focus {
          border-color: #4dff91;
          box-shadow: 0 0 0 1px #4dff91, 0 0 12px rgba(77,255,145,0.15);
        }
        .contact-input::placeholder {
          color: rgba(255,255,255,0.3);
        }
        .contact-submit {
          font-family: 'Poppins', monospace;
          font-size: 1em;
          letter-spacing: 0.18em;
          color: #fff;
          text-shadow: 0 1px 2px rgba(0,0,0,0.5);
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 0 32px;
          height: 52px;
          background: linear-gradient(175deg, #22b85a 0%, #178f42 100%);
          border: 1px solid #1a9e4a;
          border-bottom-color: #0d5c29;
          border-right-color: #126e32;
          box-shadow: 0 4px 0 #0d5c29, 0 6px 16px rgba(13,92,41,0.5), inset 0 1px 0 rgba(255,255,255,0.35);
          cursor: pointer;
          transition: transform 0.07s ease, box-shadow 0.07s ease, background 0.08s ease;
          user-select: none;
        }
        .contact-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          background: linear-gradient(175deg, #2bd06a 0%, #1aa64c 100%);
          border-color: #4dff91;
          border-bottom-color: #0d5c29;
          box-shadow: 0 6px 0 #0d5c29, 0 8px 14px rgba(13,92,41,0.4), 0 0 14px rgba(77,255,145,0.45);
        }
        .contact-submit:active:not(:disabled) {
          transform: translateY(4px);
          box-shadow: inset 0 2px 6px rgba(0,0,0,0.25);
        }
        .contact-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .status-message {
          font-family: 'Poppins', monospace;
          font-size: 0.85em;
          padding: 8px 14px;
          border-radius: 2px;
          margin-top: 8px;
        }
        .status-message.success {
          color: #4dff91;
          border: 1px solid rgba(77,255,145,0.3);
          background: rgba(77,255,145,0.08);
        }
        .status-message.error {
          color: #ff6b6b;
          border: 1px solid rgba(255,107,107,0.3);
          background: rgba(255,107,107,0.08);
        }
      `}</style>

      <div className="flex flex-col h-screen overflow-hidden">

        <Header />
        <MobileBottomNav />

        {/* ── BODY ROW ───────────────────────────────────────────────── */}
        <div className="flex flex-1 overflow-hidden">
          <div className="relative flex-1 overflow-hidden bg-[#1a2b1e]">

            {/* Active section — releases / home */}
            <div
              className="scanline absolute inset-0 flex overflow-hidden"
              style={{ background: 'linear-gradient(160deg, #1c2e20 0%, #181f1a 60%, #1a2420 100%)' }}
            >

              {/* ── NEWS SIDEBAR ──────────────────────────────────────── 
              <aside className="hidden md:flex news-sidebar relative flex-col w-80 flex-shrink-0 bg-[#fef8f3] z-[25] overflow-hidden">
                <Corners />

                <div className="no-scrollbar flex-1 overflow-y-auto">
                  {newsItems.length === 0 && (
                    <div className="p-5" style={{ fontFamily: "'Poppins', monospace", fontSize: '0.85em', color: '#3c5e4c', opacity: 0.7 }}>
                      No news yet.
                    </div>
                  )}
                  {newsItems.map((item) => (
                    <a
                      key={item.id}
                      href={`/feed/${item.slug}`}
                      className="block p-5 border-b border-[rgba(26,158,74,0.12)] transition-colors duration-150 hover:bg-[rgba(26,158,74,0.05)] no-underline"
                    >
                      {item.coverImageUrl && /\.(mp4|webm|mov|m4v)$/i.test(item.coverImageUrl) ? (
                        <video
                          src={item.coverImageUrl}
                          muted
                          playsInline
                          preload="metadata"
                          className="w-full h-[180px] mb-3 rounded-[3px] object-cover"
                          style={{ border: '1px solid rgba(26,158,74,0.15)' }}
                        />
                      ) : item.coverImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.coverImageUrl}
                          alt={item.title}
                          className="w-full h-[180px] mb-3 rounded-[3px] object-cover"
                          style={{ border: '1px solid rgba(26,158,74,0.15)' }}
                        />
                      ) : (
                        <div
                          className="w-full h-[180px] mb-3 rounded-[3px] flex items-center justify-center opacity-55"
                          style={{
                            background: 'linear-gradient(135deg, #e3f6e9, #cfeede)',
                            border: '1px solid rgba(26,158,74,0.15)',
                            fontFamily: "'Poppins', monospace",
                            fontSize: '0.85em',
                            letterSpacing: '0.3em',
                            color: '#1a9e4a',
                          }}
                        >
                          IMAGE
                        </div>
                      )}
                      <div style={{ fontFamily: "'Poppins', monospace", fontSize: '0.78em', letterSpacing: '0.22em', color: '#1a9e4a', opacity: 0.8, marginBottom: '6px' }}>
                        {item.date}
                      </div>
                      <div style={{ fontFamily: "'Poppins', monospace", fontSize: '0.9em', color: '#16432a', lineHeight: 1.45 }}>
                        {item.title}
                      </div>
                      <div style={{ fontFamily: "'Poppins', monospace", fontSize: '0.78em', color: '#3c5e4c', opacity: 0.7, lineHeight: 1.6, marginTop: '8px' }}>
                        {item.teaser}
                      </div>
                      <span style={{ display: 'inline-block', marginTop: '10px', fontFamily: "'Poppins', monospace", fontSize: '0.74em', letterSpacing: '0.3em', color: '#ffffff', opacity: 0.75, border: '1px solid rgba(26,158,74,0.25)', padding: '4px 12px', background: 'rgba(26,158,74)' }}>
                        {item.tag}
                      </span>
                    </a>
                  ))}
                </div>
              </aside> */}

              {/* ── MAIN SCROLL COLUMN ────────────────────────────────── */}
              <div className="no-scrollbar flex-1 min-h-0 overflow-y-auto flex flex-col pt-[60px] md:pt-0">

                {/* ═══ NEW LABEL HERO — "REALEST. TRUEST." ═══ */}
                <div
                  className="relative flex-shrink-0 overflow-hidden"
                  style={{ minHeight: 'calc(100vh - 90px)' }}
                >
                  {/* Background video */}
                  <video
                    src={`${MEDIA_BASE}/hero-vid.mp4`}
                    autoPlay muted loop playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                  />

                  {/* Overlays */}
                  <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.50)' }} />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(10,16,12,0.7) 0%, transparent 25%, transparent 60%, rgba(10,16,12,0.95) 100%)' }} />

                  {/* Content */}
                  <div
                    className="relative z-[3] flex flex-col items-center justify-center gap-6 px-10 text-center"
                    style={{ minHeight: '100vh' }}
                  >
                    <div className="flex flex-col items-center gap-1">
                       <h1
                        className="hidden md:block"
                        style={{
                          fontFamily: "'Poppins_semibold', monospace",
                          fontSize: '3em',
                          color: '#fff',
                          letterSpacing: '0.12em',
                          textShadow: '0 2px 28px rgba(0,0,0,0.9), 0 0 50px rgba(77,255,145,0.10)',
                          lineHeight: 1.0,
                        }}
                      >
                        GAMEBOY RECORDS
                      </h1>
                      <p
                        className="hero-tagline"
                        style={{
                          fontFamily: "'Poppins', monospace",
                          color: '#4dff91',
                          textShadow: '0 0 30px rgba(77,255,145,0.40)',
                          lineHeight: 1.2,
                          marginTop: '4px',
                        }}
                      >
                        REALEST SOUND.
                        <br className="md:hidden" />
                        {' '}TRUEST VISION.
                      </p>
                    </div>
                    <button
                      className="listen-btn"
                      onClick={() => openPlayer('https://www.youtube.com/embed/videoseries?list=PL5jjb3J99wR7DQiFdlhXnit_1bZt2a4Bo&autoplay=1&controls=1')}
                    >
                      <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0 block" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      TUNE IN
                    </button>

                    {/* Artist portraits strip 
                    <div className="flex flex-wrap items-center justify-center gap-8 mt-2 max-w-4xl">
                      // Alexx A-Game — portrait photo 
                      <a href="/artists" className="flex flex-col items-center gap-2 transition-all duration-200 hover:scale-110">
                        // eslint-disable-next-line @next/next/no-img-element 
                        <img
                          src="/alexx-portrait.jpg"
                          alt="Alexx A-Game"
                          className="w-[80px] h-[80px] rounded-full border-[3px] border-[#4dff91] object-cover object-top"
                          style={{ boxShadow: '0 0 0 2px rgba(77,255,145,0.5), 0 0 22px rgba(77,255,145,0.95), 0 0 8px rgba(77,255,145,0.6)' }}
                        />
                        <span style={{ fontFamily: "'Poppins', monospace", fontSize: '0.9em', letterSpacing: '0.12em', color: '#fff' }}>
                          Alexx A-Game
                        </span>
                      </a>

                      // DJ Karma 
                      <a href="/artists" className="flex flex-col items-center gap-2 transition-all duration-200 hover:scale-110">
                        <div
                          className="w-[80px] h-[80px] rounded-full flex items-center justify-center border-[3px] border-[#4dff91]"
                          style={{
                            background: 'linear-gradient(135deg, #c0392b, #78281f)',
                            fontFamily: "'Poppins', monospace",
                            fontSize: '2em',
                            color: '#fff',
                            textShadow: '0 1px 6px rgba(0,0,0,0.6)',
                            boxShadow: '0 0 0 2px rgba(77,255,145,0.5), 0 0 22px rgba(77,255,145,0.95), 0 0 8px rgba(77,255,145,0.6)',
                          }}
                        >
                          DK
                        </div>
                        <span style={{ fontFamily: "'Poppins', monospace", fontSize: '0.9em', letterSpacing: '0.12em', color: '#fff' }}>
                          DJ Karma
                        </span>
                      </a>

                      // Bassline 
                      <a href="/artists" className="flex flex-col items-center gap-2 transition-all duration-200 hover:scale-110">
                        <div
                          className="w-[80px] h-[80px] rounded-full flex items-center justify-center border-[3px] border-[#4dff91]"
                          style={{
                            background: 'linear-gradient(135deg, #2980b9, #1a5276)',
                            fontFamily: "'Poppins', monospace",
                            fontSize: '2em',
                            color: '#fff',
                            textShadow: '0 1px 6px rgba(0,0,0,0.6)',
                            boxShadow: '0 0 0 2px rgba(77,255,145,0.5), 0 0 22px rgba(77,255,145,0.95), 0 0 8px rgba(77,255,145,0.6)',
                          }}
                        >
                          BL
                        </div>
                        <span style={{ fontFamily: "'Poppins', monospace", fontSize: '0.9em', letterSpacing: '0.12em', color: '#fff' }}>
                          Bassline
                        </span>
                      </a>

                      // Neon Noir 
                      <a href="/artists" className="flex flex-col items-center gap-2 transition-all duration-200 hover:scale-110">
                        <div
                          className="w-[80px] h-[80px] rounded-full flex items-center justify-center border-[3px] border-[#4dff91]"
                          style={{
                            background: 'linear-gradient(135deg, #8e44ad, #5b2d6e)',
                            fontFamily: "'Poppins', monospace",
                            fontSize: '2em',
                            color: '#fff',
                            textShadow: '0 1px 6px rgba(0,0,0,0.6)',
                            boxShadow: '0 0 0 2px rgba(77,255,145,0.5), 0 0 22px rgba(77,255,145,0.95), 0 0 8px rgba(77,255,145,0.6)',
                          }}
                        >
                          NN
                        </div>
                        <span style={{ fontFamily: "'Poppins', monospace", fontSize: '0.9em', letterSpacing: '0.12em', color: '#fff' }}>
                          Neon Noir
                        </span>
                      </a>

                      // Vibe X 
                      <a href="/artists" className="flex flex-col items-center gap-2 transition-all duration-200 hover:scale-110">
                        <div
                          className="w-[80px] h-[80px] rounded-full flex items-center justify-center border-[3px] border-[#4dff91]"
                          style={{
                            background: 'linear-gradient(135deg, #d35400, #6e2c00)',
                            fontFamily: "'Poppins', monospace",
                            fontSize: '2em',
                            color: '#fff',
                            textShadow: '0 1px 6px rgba(0,0,0,0.6)',
                            boxShadow: '0 0 0 2px rgba(77,255,145,0.5), 0 0 22px rgba(77,255,145,0.95), 0 0 8px rgba(77,255,145,0.6)',
                          }}
                        >
                          VX
                        </div>
                        <span style={{ fontFamily: "'Poppins', monospace", fontSize: '0.9em', letterSpacing: '0.12em', color: '#fff' }}>
                          Vibe X
                        </span>
                      </a>

                    </div>
                    */}

                    
                  </div>
                </div>
                <div
                  className="relative flex-shrink-0 overflow-hidden"
                  style={{ minHeight: 'calc(100vh - 84px)' }}
                >
                  {/* Background video — blurred, stretched fill */}
                  <video
                    src={`${MEDIA_BASE}/Rise Up Now (Guitar Cover).mp4`}
                    autoPlay muted loop playsInline
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover scale-110"
                    style={{ filter: 'blur(5px) brightness(0.55)' }}
                  />

                  {/* Foreground video — true vertical aspect, centered, no crop */}
                  <video
                    src={`${MEDIA_BASE}/Rise Up Now (Guitar Cover).mp4`}
                    autoPlay muted loop playsInline
                    className="absolute inset-0 w-full h-full object-contain"
                  />

                  {/* Overlay layer 1 — uniform dark tint for readability */}
                  <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.25)' }} />
                  {/* Overlay layer 2 — top + bottom gradient fade */}
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(10,16,12,0.32) 0%, transparent 22%, transparent 62%, rgba(10,16,12,0.5) 100%)' }} />
                  {/* Hero content */}
                  <div
                    className="relative z-[3] flex flex-col items-center justify-center gap-10 px-10 text-center"
                    style={{ minHeight: 'calc(100vh - 84px)' }}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <h1 style={{ fontFamily: "'Poppins_semibold', monospace", fontSize: '3em', color: '#fff', letterSpacing: '0.12em', textShadow: '0 2px 28px rgba(0,0,0,0.9), 0 0 40px rgba(77,255,145,0.12)', lineHeight: 1 }}>
                        RISE UP NOW (GUITAR VERSION)
                      </h1>
                      <h2 style={{ fontFamily: "'Poppins', monospace", fontSize: '1.75em', color: '#4dff91', letterSpacing: '0.28em', textShadow: '0 0 24px rgba(77,255,145,0.55)', lineHeight: 1, marginTop: '12px' }}>
                        ALEXX A-GAME
                      </h2>
                    </div>
                    <div className="listen-on-wrap">
                      <button
                        className="listen-on-btn"
                        onClick={() => openPlayer('https://www.youtube.com/embed/etLGFz3dtsM?si=tzBYcOWR4rJUbu9J&autoplay=1&controls=1')}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/youtube.png" alt="YouTube" />
                        YOUTUBE
                      </button>
                      <a
                        href="https://music.apple.com/us/song/rise-up-now-guitar-version/6809729519"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="listen-on-btn"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/apple-music.png" alt="Apple Music" />
                        APPLE MUSIC
                      </a>
                      <a
                        href="https://open.spotify.com/track/3tcAFyDjx0YBBJ2Y6TvVVh?si=a50460c499134546"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="listen-on-btn"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/spotify.png" alt="Spotify" />
                        SPOTIFY
                      </a>
                      <a
                        href="https://audiomack.com/alexxagame"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="listen-on-btn"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/audiomack.png" alt="Audiomack" />
                        AUDIOMACK
                      </a>
                      <a
                        href="https://soundcloud.com/alexxagame"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="listen-on-btn"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/soundcloud.png" alt="Soundcloud" />
                        SOUNDCLOUD
                      </a>
                    </div>
                  </div>
                </div>

                <div
                  className="flex-shrink-0 relative z-[2]"
                  style={{ background: 'linear-gradient(180deg, #0f1a12 0%, #0c1510 100%)' }}
                >
                                  <GameIconsBackground />

                {/* About sub-section */}
                  <div className="relative z-[1] px-12 py-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-12 max-w-[1080px] mx-auto">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`${MEDIA_BASE}/IMG_2591.jpg`}
                        alt="Alexx A-Game"
                        className="w-full h-[440px] object-cover block rounded-[2px] border-[3px] border-[#1a9e4a]"
                      />
                      <div className="flex flex-col gap-4">
                        <h2 style={{ fontFamily: "'Poppins', monospace", fontSize: '3em', color: '#4dff91', letterSpacing: '0.05em', textShadow: '0 0 20px rgba(77,255,145,0.25)' }}>
                          WHO IS GAMEBOY?
                        </h2>
                        <p style={{ fontFamily: "'Poppins', monospace", fontSize: '1.25em', color: '#4dff91', opacity: 0.4 }}>
                          The story behind the sound.
                        </p>
                        <p style={{ fontFamily: "'Poppins', monospace", fontSize: '1em', color: '#e8f5ec', lineHeight: 1.6 }}>
                          <span className="font-bold text-[1.15em] text-[#fff]">Alexx A-Game</span>, born Alex Gallimore, grew up in Wood’s Town, Discovery Bay, in St. Ann, Jamaica. A William Knibb High School graduate, he picked up his stage name in late 2013 from his constant use of the slang “a-game.”
                        </p>
                        <p style={{ fontFamily: "'Poppins', monospace", fontSize: '1em', color: '#e8f5ec', lineHeight: 1.6 }}>
                          A musician first, Alexx has pushed for a fresher, more visual approach to Jamaican music, and was cast as Peter Tosh in Paramount’s <em>Bob Marley: One Love</em>. Gameboy Records is where that vision lives: realest sound, truest vision.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* TEMP DISABLED: Partners + Contact sub-sections (remove `{false && (<>` and matching `</>)}` to restore) */}
                  {false && (
                  <>
                  {/* Partners sub-section */}
                  <div className="px-12 py-10">
                    {/* Section header */}
                    <div className="flex flex-col items-center mb-12 text-center">
                      <h2 style={{ fontFamily: "'Poppins', monospace", fontSize: '3em', color: '#4dff91', letterSpacing: '0.2em', textShadow: '0 0 20px rgba(77,255,145,0.25)' }}>
                        Teammates
                      </h2>
                      <p style={{ fontFamily: "'Poppins', monospace", fontSize: '1.25em', color: '#4dff91', opacity: 0.4 }}>
                        Brands and organisations we work alongside.
                      </p>
                    </div>

                    {/* Vault showcase card */}
                    <div
                      className="relative grid grid-cols-2 max-w-[1080px] mx-auto bg-[#fef8f3] border-[4px] border-[#3dc97e] rounded"
                      style={{ minHeight: '420px', alignItems: 'stretch' }}
                    >

                      {/* Left — video */}
                      <div className="w-full h-[440px] overflow-hidden">
                        <video
                          src={`${MEDIA_BASE}/vault.mp4`}
                          poster={`${MEDIA_BASE}/the-vault-1.jpg`}
                          autoPlay muted loop playsInline
                          className="w-full h-full object-cover block"
                        />
                      </div>

                      {/* Right — content */}
                      <div className="flex flex-col items-start justify-center gap-8 px-8">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={`${MEDIA_BASE}/the-vault-logo.jpg`} alt="The Vault" className="max-w-[260px] h-auto block" />
                        <p  className="font-bold" style={{ fontFamily: "'Poppins', monospace", fontSize: '1em', color: '#16432a', lineHeight: 1.6 }}>
                          When we're in Negril, we voice at The Vault. <br></br> A partnering recording studio built for late-night sessions and serious sound. Located in the heart of the city's nightlife, it serves as the premium creative hub for bringing records to life.
                        </p>
                        <a
                          href="#"
                          className="listen-btn inline-flex items-center gap-2 no-underline transition-all duration-150"
                          style={{ letterSpacing: '0.2em', padding: '8px 20px' }}
                        >
                          BOOK A SESSION →
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Contact sub-section */}
                  <div className="px-12 py-20">
                    <div className="flex flex-col items-center mb-12 text-center">
                    <h2
                      style={{ fontFamily: "'Poppins', monospace", fontSize: '3em', color: '#4dff91', letterSpacing: '0.2em', textShadow: '0 0 20px rgba(77,255,145,0.25)' }}
                    >
                      SEND A MESSAGE
                    </h2>
                    <p
                      style={{ fontFamily: "'Poppins', monospace", fontSize: '1.25em', color: '#4dff91', opacity: 0.4 }}
                    >
                      We’ll get back to you within 24 hours.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="max-w-[600px] mx-auto flex flex-col gap-4">
                    <input
                      type="text"
                      name="name"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="contact-input"
                    />
                    <input
                      type="email"
                      name="email"
                      placeholder="Your email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="contact-input"
                    />
                    <textarea
                      name="message"
                      placeholder="Your message"
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      required
                      className="contact-input"
                      style={{ resize: 'vertical' }}
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="contact-submit self-start"
                    >
                      {isSubmitting ? 'SENDING…' : 'SEND MESSAGE'}
                    </button>
                    {submitStatus.type && (
                      <div className={`status-message ${submitStatus.type}`}>
                        {submitStatus.message}
                      </div>
                    )}
                  </form>
                  </div>{/* /contact sub-section */}
                  </>
                  )}
                </div>{/* /partners+contact shared wrapper */}

                <Footer />

              </div>{/* /main-scroll */}
            </div>{/* /section */}
          </div>
        </div>

      </div>
      {/* ── FLOATING MINI-PLAYER ───────────────────────────────────────
                     Mounted on open. Close button slides the panel out, then
           unmounts the iframe after the transition so playback stops.
      ─────────────────────────────────────────────────────────────── */}
      {playerMounted && (
        <div className={`mini-player${playerVisible ? ' visible' : ''}`}>

          {/* Header bar */}
          <div
            className="flex items-center justify-between px-3 border-b border-[rgba(26,158,74,0.25)]"
            style={{ height: '36px' }}
          >
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4dff91] animate-pulse" />
              <span style={{ fontFamily: "'Poppins', monospace", fontSize: '0.7em', letterSpacing: '0.28em', color: '#4dff91' }}>
                NOW PLAYING
              </span>
            </div>
            <button
              onClick={closePlayer}
              className="mini-player-close transition-colors"
              style={{ fontFamily: "'Poppins', monospace", fontSize: '1em', color: '#4dff91', background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px', lineHeight: 1 }}
              aria-label="Close player"
            >
              ✕
            </button>
          </div>

           <iframe
            src={playerSrc}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            title="Gameboy Records Player"
            className="w-full border-0 block"
            style={{ height: '191px' }}
          />

        </div>
      )}
    </>
  );
}