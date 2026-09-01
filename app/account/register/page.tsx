// app/account/register/page.tsx
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const res = await fetch('/api/account/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, displayName }),
    });
    const data = await res.json();

    if (!res.ok) {
      setIsSubmitting(false);
      setError(data.error || 'Registration failed.');
      return;
    }

    const signInRes = await signIn('user-credentials', { email, password, redirect: false });
    setIsSubmitting(false);

    if (signInRes?.error) {
      router.push('/account/login');
      return;
    }

    router.push('/account');
    router.refresh();
  };

  return (
    <>
      <style>{`
        .acct-wrap {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(160deg, #1c2e20 0%, #181f1a 60%, #10160f 100%);
        }
        .acct-card {
          width: 380px;
          background: #0f1a12;
          border: 1px solid rgba(26,158,74,0.3);
          border-radius: 4px;
          padding: 40px 32px;
        }
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
        .acct-error {
          color: #ff6b6b;
          font-family: 'Arvo', monospace;
          font-size: 0.82em;
          margin-bottom: 14px;
          text-align: center;
        }
        .acct-link {
          display: block;
          text-align: center;
          margin-top: 18px;
          font-family: 'Arvo', monospace;
          font-size: 0.8em;
          color: #4dff91;
          opacity: 0.75;
        }
      `}</style>

      <div className="acct-wrap">
        <div className="acct-card">
          <div className="acct-title">CREATE ACCOUNT</div>

          {error && <div className="acct-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="acct-input"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="acct-input"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="acct-input"
            />
            <button type="submit" disabled={isSubmitting} className="acct-submit">
              {isSubmitting ? 'CREATING…' : 'CREATE ACCOUNT'}
            </button>
          </form>

          <Link href="/account/login" className="acct-link">
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </>
  );
}