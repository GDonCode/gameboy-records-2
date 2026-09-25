// components/AuthForm.tsx
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

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

  return (
    <>
      <style>{`
        .acct-wrap {
          height: 100vh;
          overflow-y: auto;
          display: flex;
          padding: 24px 16px;
          background: linear-gradient(160deg, #1c2e20 0%, #181f1a 60%, #10160f 100%);
        }
        .acct-inner {
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
          background: #0f1a12;
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
          color: rgba(255,255,255,0.6);
          transition: color 0.2s ease;
        }
        .acct-toggle-btn[aria-selected="true"] { color: #fff; }
        .acct-panels {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
          width: 100%;
        }
        .acct-card {
          width: 100%;
          max-width: 380px;
          background: #0f1a12;
          border: 1px solid rgba(26,158,74,0.3);
          border-radius: 4px;
          padding: 40px 32px;
        }
        .acct-card.is-hidden { display: none; }
        .acct-title {
          font-family: 'Hemisphers Bold Sans', monospace;
          font-size: 1.6em;
          letter-spacing: 0.1em;
          color: #4dff91;
          text-align: center;
          margin-bottom: 28px;
          text-shadow: 0 0 20px rgba(77,255,145,0.25);
        }
        .acct-input {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(26,158,74,0.25);
          color: #fff;
          font-family: 'Arvo', monospace;
          font-size: 0.9em;
          padding: 10px 14px;
          border-radius: 2px;
          width: 100%;
          outline: none;
          margin-bottom: 14px;
        }
        .acct-input:focus {
          border-color: #4dff91;
          box-shadow: 0 0 0 1px #4dff91, 0 0 12px rgba(77,255,145,0.15);
        }
        .acct-submit {
          font-family: 'Hemisphers Bold Sans', monospace;
          font-size: 0.95em;
          letter-spacing: 0.16em;
          color: #fff;
          width: 100%;
          height: 48px;
          background: linear-gradient(175deg, #22b85a 0%, #178f42 100%);
          border: 1px solid #1a9e4a;
          border-bottom-color: #0d5c29;
          cursor: pointer;
        }
        .acct-submit:disabled { opacity: 0.5; cursor: not-allowed; }
        .acct-error,
        .acct-notice {
          font-family: 'Arvo', monospace;
          font-size: 0.82em;
          margin-bottom: 14px;
          text-align: center;
        }
        .acct-error { color: #ff6b6b; }
        .acct-notice { color: #4dff91; }
        @media (min-width: 768px) {
          .acct-toggle { display: none; }
          .acct-panels {
            flex-direction: row;
            justify-content: center;
            align-items: stretch;
          }
          .acct-card.is-hidden { display: block; }
        }
      `}</style>

      <div className="acct-wrap">
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

          <div className="acct-panels">
            <div id="acct-signin" className={`acct-card${mode === 'signin' ? '' : ' is-hidden'}`}>
              <div className="acct-title">SIGN IN</div>

              {signInNotice && <div className="acct-notice">{signInNotice}</div>}
              {signInError && <div className="acct-error">{signInError}</div>}

              <form onSubmit={handleSignIn}>
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
              </form>
            </div>

            <div id="acct-register" className={`acct-card${mode === 'register' ? '' : ' is-hidden'}`}>
              <div className="acct-title">CREATE ACCOUNT</div>

              {registerError && <div className="acct-error">{registerError}</div>}

              <form onSubmit={handleRegister}>
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
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}