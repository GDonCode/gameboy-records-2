// components/AuthForm.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import GameIconsBackground from '@/components/GameIconsBackground';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          prompt: () => void;
          cancel: () => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

type Mode = 'signin' | 'register';

export default function AuthForm({ initialMode = 'signin' }: { initialMode?: Mode }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);

  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signInError, setSignInError] = useState<string | null>(null);
  const [signInNotice, setSignInNotice] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const [displayName, setDisplayName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  const googleSignInBtnRef = useRef<HTMLDivElement>(null);
  const googleRegisterBtnRef = useRef<HTMLDivElement>(null);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSigningIn(true);
    setSignInError(null);
    setSignInNotice(null);

    const res = await signIn('user-credentials', { email: signInEmail, password: signInPassword, redirect: false });

    setIsSigningIn(false);

    if (res?.error) {
      setSignInError('Invalid email or password.');
      return;
    }

    router.push('/account');
    router.refresh();
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsRegistering(true);
    setRegisterError(null);

    const res = await fetch('/api/account/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: registerEmail, password: registerPassword, displayName }),
    });
    const data = await res.json();

    if (!res.ok) {
      setIsRegistering(false);
      setRegisterError(data.error || 'Registration failed.');
      return;
    }

    const signInRes = await signIn('user-credentials', { email: registerEmail, password: registerPassword, redirect: false });
    setIsRegistering(false);

    if (signInRes?.error) {
      setSignInEmail(registerEmail);
      setSignInNotice('Account created. Sign in to continue.');
      setMode('signin');
      return;
    }

    router.push('/account');
    router.refresh();
  };

  const handleGoogleCredential = async (response: { credential?: string }) => {
    if (!response.credential) return;
    setSignInError(null);
    setSignInNotice(null);

    const res = await signIn('google-onetap', { credential: response.credential, redirect: false });

    if (res?.error) {
      setMode('signin');
      setSignInError('Google sign-in failed. Try again or use your email.');
      return;
    }

    router.push('/account');
    router.refresh();
  };

  const startGoogleOneTap = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId || !window.google) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleGoogleCredential,
      context: 'signin',
      cancel_on_tap_outside: false,
      use_fedcm_for_prompt: true,
    });
   const buttonOptions = {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      shape: 'pill',
      logo_alignment: 'left',
      width: 280,
    };
    if (googleSignInBtnRef.current) {
      window.google.accounts.id.renderButton(googleSignInBtnRef.current, { ...buttonOptions, text: 'signin_with' });
    }
    if (googleRegisterBtnRef.current) {
      window.google.accounts.id.renderButton(googleRegisterBtnRef.current, { ...buttonOptions, text: 'signup_with' });
    }
  };

  useEffect(() => {
    return () => window.google?.accounts.id.cancel();
  }, []);

  return (
    <>
      <style>{`
        .acct-wrap {
          position: relative;
          flex-shrink: 0;
          min-height: calc(100vh - 90px);
          display: flex;
          padding: 24px 16px;
          background: linear-gradient(160deg, #1c2e20 0%, #181f1a 60%, #10160f 100%);
        }
        .acct-inner {
          position: relative;
          z-index: 1;
          margin: auto;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
        }
        .acct-toggle {
          position: relative;
          display: grid;
          grid-template-columns: 1fr 1fr;
          width: 100%;
          max-width: 380px;
          padding: 4px;
          background: #FEFEFA;
          border: 1px solid rgba(26,158,74,0.3);
          border-radius: 999px;
        }
        .acct-toggle-thumb {
          position: absolute;
          top: 4px;
          bottom: 4px;
          left: 4px;
          width: calc(50% - 4px);
          border-radius: 999px;
          background: linear-gradient(175deg, #22b85a 0%, #178f42 100%);
          box-shadow: 0 0 12px rgba(77,255,145,0.25);
          transition: transform 0.25s ease;
        }
        .acct-toggle-thumb[data-mode="register"] { transform: translateX(100%); }
        .acct-toggle-btn {
          position: relative;
          z-index: 1;
          height: 40px;
          background: none;
          border: 0;
          cursor: pointer;
          font-family: 'Hemisphers Bold Sans', monospace;
          font-size: 0.75em;
          letter-spacing: 0.14em;
          color: #3c5e4c;
          transition: color 0.2s ease;
        }
        .acct-toggle-btn[aria-selected="true"] { color: #fff; }
        .acct-container {
          position: relative;
          width: 100%;
          max-width: 380px;
          background: #FEFEFA;
          border: 1px solid rgba(26,158,74,0.2);
          border-radius: 10px;
          box-shadow: 0 14px 28px rgba(0,0,0,0.45), 0 10px 10px rgba(0,0,0,0.35);
          overflow: hidden;
        }
        .acct-form-box.is-hidden { display: none; }
        .acct-form {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          padding: 40px 32px;
          background: #FEFEFA;
          text-align: center;
        }
        .acct-title {
          font-family: 'Hemisphers Bold Sans', monospace;
          font-size: 1.6em;
          letter-spacing: 0.1em;
          color: #16432a;
          text-align: center;
          margin-bottom: 28px;
        }
        .acct-input {
          background: #fff;
          border: 1px solid rgba(22,67,42,0.2);
          color: #16432a;
          font-family: 'Arvo', monospace;
          font-size: 0.9em;
          padding: 10px 14px;
          border-radius: 2px;
          width: 100%;
          outline: none;
          margin-bottom: 14px;
        }
        .acct-input::placeholder { color: rgba(22,67,42,0.4); }
        .acct-input:focus {
          border-color: #1a9e4a;
          box-shadow: 0 0 0 1px #1a9e4a, 0 0 12px rgba(26,158,74,0.15);
        }
        .acct-submit,
        .acct-ghost {
          font-family: 'Hemisphers Bold Sans', monospace;
          font-size: 0.85em;
          letter-spacing: 0.16em;
          color: #fff;
          height: 48px;
          padding: 0 45px;
          border-radius: 999px;
          cursor: pointer;
          transition: transform 80ms ease-in;
        }
        .acct-submit {
          width: 100%;
          margin-top: 6px;
          background: linear-gradient(175deg, #22b85a 0%, #178f42 100%);
          border: 1px solid #1a9e4a;
          border-bottom-color: #0d5c29;
        }
        .acct-ghost {
          background: transparent;
          border: 1px solid #FEFEFA;
          color: #FEFEFA;
        }
        .acct-submit:active,
        .acct-ghost:active { transform: scale(0.95); }
        .acct-submit:focus-visible,
        .acct-ghost:focus-visible {
          outline: 2px solid #4dff91;
          outline-offset: 3px;
        }
        .acct-submit:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .acct-error,
        .acct-notice {
          font-family: 'Arvo', monospace;
          font-size: 0.82em;
          margin-bottom: 14px;
          text-align: center;
        }
        .acct-error { color: #c0392b; }
        .acct-notice { color: #1a9e4a; }
                .acct-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          margin: 18px 0 14px;
          font-family: 'Arvo', monospace;
          font-size: 0.78em;
          color: rgba(22,67,42,0.45);
        }
        .acct-divider::before,
        .acct-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(22,67,42,0.15);
        }
        .acct-google {
          display: flex;
          justify-content: center;
          width: 100%;
          min-height: 44px;
        }
        .acct-overlay-container { display: none; }
        @media (min-width: 768px) {
          .acct-toggle { display: none; }
          .acct-container {
            width: 768px;
            max-width: 100%;
            min-height: 520px;
          }
          .acct-form-box,
          .acct-form-box.is-hidden {
            display: block;
            position: absolute;
            top: 0;
            left: 0;
            width: 50%;
            height: 100%;
            transition: all 0.6s ease-in-out;
          }
          .acct-form { padding: 0 50px; }
          .acct-signin { z-index: 2; }
          .acct-signup { opacity: 0; z-index: 1; }
          .acct-container.is-register .acct-signin { transform: translateX(100%); }
          .acct-container.is-register .acct-signup {
            transform: translateX(100%);
            opacity: 1;
            z-index: 5;
            animation: acct-show 0.6s;
          }
          .acct-overlay-container {
            display: block;
            position: absolute;
            top: 0;
            left: 50%;
            width: 50%;
            height: 100%;
            overflow: hidden;
            transition: transform 0.6s ease-in-out;
            z-index: 100;
          }
          .acct-container.is-register .acct-overlay-container { transform: translateX(-100%); }
          .acct-overlay {
            position: relative;
            left: -100%;
            width: 200%;
            height: 100%;
            background: linear-gradient(to right, #178f42, #22b85a);
            color: #FEFEFA;
            transform: translateX(0);
            transition: transform 0.6s ease-in-out;
          }
          .acct-container.is-register .acct-overlay { transform: translateX(50%); }
          .acct-overlay-panel {
            position: absolute;
            top: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 50%;
            height: 100%;
            padding: 0 40px;
            text-align: center;
            transform: translateX(0);
            transition: transform 0.6s ease-in-out;
          }
          .acct-overlay-left { transform: translateX(-20%); }
          .acct-container.is-register .acct-overlay-left { transform: translateX(0); }
          .acct-overlay-right { right: 0; transform: translateX(0); }
          .acct-container.is-register .acct-overlay-right { transform: translateX(20%); }
          .acct-overlay-title {
            font-family: 'Hemisphers Bold Sans', monospace;
            font-size: 1.6em;
            letter-spacing: 0.1em;
            color: #FEFEFA;
          }
          .acct-overlay-text {
            font-family: 'Arvo', monospace;
            font-size: 0.85em;
            line-height: 1.6;
            margin: 20px 0 30px;
            color: rgba(254,254,250,0.85);
          }
        }
        @keyframes acct-show {
          0%, 49.99% { opacity: 0; z-index: 1; }
          50%, 100% { opacity: 1; z-index: 5; }
        }
        @media (prefers-reduced-motion: reduce) {
          .acct-form-box,
          .acct-overlay-container,
          .acct-overlay,
          .acct-overlay-panel,
          .acct-toggle-thumb { transition: none !important; animation: none !important; }
        }
      `}</style>

      <div className="acct-wrap">
        <GameIconsBackground density={0.6} />
        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onReady={startGoogleOneTap} />

        <div className="acct-inner">
          <div className="acct-toggle" role="tablist" aria-label="Account">
            <span className="acct-toggle-thumb" data-mode={mode} aria-hidden="true" />
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'signin'}
              aria-controls="acct-signin"
              className="acct-toggle-btn"
              onClick={() => setMode('signin')}
            >
              SIGN IN
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'register'}
              aria-controls="acct-register"
              className="acct-toggle-btn"
              onClick={() => setMode('register')}
            >
              CREATE ACCOUNT
            </button>
          </div>

          <div className={`acct-container${mode === 'register' ? ' is-register' : ''}`}>
            <div id="acct-register" className={`acct-form-box acct-signup${mode === 'register' ? '' : ' is-hidden'}`}>
              <form className="acct-form" onSubmit={handleRegister}>
                <div className="acct-title">CREATE ACCOUNT</div>

                {registerError && <div className="acct-error">{registerError}</div>}

                <input
                  type="text"
                  placeholder="Display name"
                  autoComplete="nickname"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  className="acct-input"
                />
                <input
                  type="email"
                  placeholder="Email"
                  autoComplete="email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  required
                  className="acct-input"
                />
                <input
                  type="password"
                  placeholder="Password"
                  autoComplete="new-password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  required
                  className="acct-input"
                />
                <button type="submit" disabled={isRegistering} className="acct-submit">
                  {isRegistering ? 'CREATING…' : 'CREATE ACCOUNT'}
                </button>

                <div className="acct-divider">or</div>
                <div ref={googleRegisterBtnRef} className="acct-google" />
              </form>
            </div>

            <div id="acct-signin" className={`acct-form-box acct-signin${mode === 'signin' ? '' : ' is-hidden'}`}>
              <form className="acct-form" onSubmit={handleSignIn}>
                <div className="acct-title">SIGN IN</div>

                {signInNotice && <div className="acct-notice">{signInNotice}</div>}
                {signInError && <div className="acct-error">{signInError}</div>}

                <input
                  type="email"
                  placeholder="Email"
                  autoComplete="email"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  required
                  className="acct-input"
                />
                <input
                  type="password"
                  placeholder="Password"
                  autoComplete="current-password"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  required
                  className="acct-input"
                />
                <button type="submit" disabled={isSigningIn} className="acct-submit">
                  {isSigningIn ? 'SIGNING IN…' : 'SIGN IN'}
                </button>

                <div className="acct-divider">or</div>
                <div ref={googleSignInBtnRef} className="acct-google" />
              </form>
            </div>

            <div className="acct-overlay-container">
              <div className="acct-overlay">
                <div className="acct-overlay-panel acct-overlay-left">
                  <div className="acct-overlay-title">WELCOME BACK</div>
                  <p className="acct-overlay-text">Sign in to see your orders and points.</p>
                  <button type="button" className="acct-ghost" onClick={() => setMode('signin')}>
                    SIGN IN
                  </button>
                </div>
                <div className="acct-overlay-panel acct-overlay-right">
                  <div className="acct-overlay-title">NEW HERE?</div>
                  <p className="acct-overlay-text">Create an account to track orders and collect points.</p>
                  <button type="button" className="acct-ghost" onClick={() => setMode('register')}>
                    CREATE ACCOUNT
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}