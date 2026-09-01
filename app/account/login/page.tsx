// app/account/login/page.tsx
'use client';

import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AccountLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    let res = await signIn('user-credentials', { email, password, redirect: false });

    if (res?.error) {
      res = await signIn('artist-credentials', { email, password, redirect: false });
    }

    if (res?.error) {
      setIsSubmitting(false);
      setError('Invalid email or password.');
      return;
    }

    const session = await getSession();
    const role = (session?.user as any)?.role;

    setIsSubmitting(false);
    router.push(role === 'artist' ? '/dashboard' : '/account');
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
          <div className="acct-title">SIGN IN</div>

          {error && <div className="acct-error">{error}</div>}

          <form onSubmit={handleSubmit}>
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
              {isSubmitting ? 'SIGNING IN…' : 'SIGN IN'}
            </button>
          </form>

          <Link href="/account/register" className="acct-link">
            Don't have an account? Create one
          </Link>
        </div>
      </div>
    </>
  );
}