// components/AccountSettings.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export interface DashboardArtist {
  id: string;
  name: string;
  email: string;
  portrait_url: string | null;
}

interface AccountSettingsProps {
  artist: DashboardArtist;
  onArtistUpdated: (artist: DashboardArtist) => void;
}

export default function AccountSettings({ artist, onArtistUpdated }: AccountSettingsProps) {
  const router = useRouter();

  const [isUploadingPortrait, setIsUploadingPortrait] = useState(false);
  const [portraitError, setPortraitError] = useState<string | null>(null);

  const [name, setName] = useState(artist.name);
  const [nameStatus, setNameStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSavingName, setIsSavingName] = useState(false);

  const [email, setEmail] = useState(artist.email);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [credentialsStatus, setCredentialsStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSavingCredentials, setIsSavingCredentials] = useState(false);

  async function handlePortraitChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPortrait(true);
    setPortraitError(null);

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/artist/portrait', { method: 'POST', body: formData });
    const data = await res.json();

    setIsUploadingPortrait(false);

    if (!res.ok) {
      setPortraitError(data.error || 'Upload failed.');
      return;
    }

    onArtistUpdated({ ...artist, portrait_url: data.url });
    router.refresh();
  }

  async function handleNameSave() {
    setIsSavingName(true);
    setNameStatus(null);

    const res = await fetch('/api/artist/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();

    setIsSavingName(false);

    if (!res.ok) {
      setNameStatus({ type: 'error', message: data.error || 'Failed to update name.' });
      return;
    }

    onArtistUpdated({ ...artist, name });
    setNameStatus({ type: 'success', message: 'Name updated.' });
    router.refresh();
  }

  async function handleCredentialsSave() {
    setIsSavingCredentials(true);
    setCredentialsStatus(null);

    const payload: Record<string, string> = {};
    if (email !== artist.email) payload.email = email;
    if (newPassword) {
      payload.newPassword = newPassword;
      payload.currentPassword = currentPassword;
    }

    if (Object.keys(payload).length === 0) {
      setIsSavingCredentials(false);
      setCredentialsStatus({ type: 'error', message: 'No changes to save.' });
      return;
    }

    const res = await fetch('/api/artist/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    setIsSavingCredentials(false);

    if (!res.ok) {
      setCredentialsStatus({ type: 'error', message: data.error || 'Failed to update.' });
      return;
    }

    onArtistUpdated({ ...artist, email });
    setCurrentPassword('');
    setNewPassword('');
    setCredentialsStatus({ type: 'success', message: 'Credentials updated. Re-login to refresh your session.' });
    router.refresh();
  }

  return (
    <div className="max-w-[640px] mx-auto flex flex-col gap-10">
      <h1
        className="text-[1.8em] tracking-[0.1em] text-[#4dff91]"
        style={{ fontFamily: "'Hemisphers Bold Sans', monospace", textShadow: '0 0 20px rgba(77,255,145,0.25)' }}
      >
        ACCOUNT SETTINGS
      </h1>

      <section className="flex flex-col gap-3">
        <h2 className="text-[0.9em] tracking-[0.14em] text-white/70" style={{ fontFamily: "'Arvo', monospace" }}>
          PORTRAIT
        </h2>
        <div className="flex items-center gap-5">
          {artist.portrait_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={artist.portrait_url}
              alt={artist.name}
              className="w-20 h-20 rounded-full object-cover border-2 border-[#4dff91]"
            />
          ) : (
            <div className="w-20 h-20 rounded-full flex items-center justify-center border-2 border-[#4dff91] text-white/50 text-[0.7em]" style={{ fontFamily: "'Arvo', monospace" }}>
              NO PHOTO
            </div>
          )}
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handlePortraitChange}
              disabled={isUploadingPortrait}
              className="text-[0.8em] text-white/70"
              style={{ fontFamily: "'Arvo', monospace" }}
            />
            {isUploadingPortrait && (
              <p className="text-[#4dff91] text-[0.78em] mt-1" style={{ fontFamily: "'Arvo', monospace" }}>
                Uploading…
              </p>
            )}
            {portraitError && (
              <p className="text-[#ff6b6b] text-[0.78em] mt-1" style={{ fontFamily: "'Arvo', monospace" }}>
                {portraitError}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-[0.9em] tracking-[0.14em] text-white/70" style={{ fontFamily: "'Arvo', monospace" }}>
          DISPLAY NAME
        </h2>
        <input
          className="bg-white/5 border border-[rgba(26,158,74,0.25)] text-white text-[0.9em] px-3.5 py-2.5 rounded-[2px] w-full outline-none focus:border-[#4dff91]"
          style={{ fontFamily: "'Arvo', monospace" }}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          onClick={handleNameSave}
          disabled={isSavingName || name === artist.name}
          className="self-start text-[0.85em] tracking-[0.14em] text-white h-[42px] px-5 rounded-[2px] border border-[#1a9e4a] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ fontFamily: "'Hemisphers Bold Sans', monospace", background: 'linear-gradient(175deg, #22b85a 0%, #178f42 100%)' }}
        >
          {isSavingName ? 'SAVING…' : 'SAVE NAME'}
        </button>
        {nameStatus && (
          <p className={`text-[0.8em] ${nameStatus.type === 'success' ? 'text-[#4dff91]' : 'text-[#ff6b6b]'}`} style={{ fontFamily: "'Arvo', monospace" }}>
            {nameStatus.message}
          </p>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-[0.9em] tracking-[0.14em] text-white/70" style={{ fontFamily: "'Arvo', monospace" }}>
          EMAIL & PASSWORD
        </h2>

        <label className="text-[0.78em] tracking-[0.1em] text-white/50" style={{ fontFamily: "'Arvo', monospace" }}>
          Email
        </label>
        <input
          type="email"
          className="bg-white/5 border border-[rgba(26,158,74,0.25)] text-white text-[0.9em] px-3.5 py-2.5 rounded-[2px] w-full outline-none focus:border-[#4dff91]"
          style={{ fontFamily: "'Arvo', monospace" }}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label className="text-[0.78em] tracking-[0.1em] text-white/50 mt-2" style={{ fontFamily: "'Arvo', monospace" }}>
          Current Password (required to set a new password)
        </label>
        <input
          type="password"
          className="bg-white/5 border border-[rgba(26,158,74,0.25)] text-white text-[0.9em] px-3.5 py-2.5 rounded-[2px] w-full outline-none focus:border-[#4dff91]"
          style={{ fontFamily: "'Arvo', monospace" }}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="••••••••"
        />

        <label className="text-[0.78em] tracking-[0.1em] text-white/50 mt-2" style={{ fontFamily: "'Arvo', monospace" }}>
          New Password (leave blank to keep current password)
        </label>
        <input
          type="password"
          className="bg-white/5 border border-[rgba(26,158,74,0.25)] text-white text-[0.9em] px-3.5 py-2.5 rounded-[2px] w-full outline-none focus:border-[#4dff91]"
          style={{ fontFamily: "'Arvo', monospace" }}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="••••••••"
        />

        <button
          onClick={handleCredentialsSave}
          disabled={isSavingCredentials}
          className="self-start text-[0.85em] tracking-[0.14em] text-white h-[42px] px-5 rounded-[2px] border border-[#1a9e4a] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          style={{ fontFamily: "'Hemisphers Bold Sans', monospace", background: 'linear-gradient(175deg, #22b85a 0%, #178f42 100%)' }}
        >
          {isSavingCredentials ? 'SAVING…' : 'SAVE CHANGES'}
        </button>
        {credentialsStatus && (
          <p className={`text-[0.8em] ${credentialsStatus.type === 'success' ? 'text-[#4dff91]' : 'text-[#ff6b6b]'}`} style={{ fontFamily: "'Arvo', monospace" }}>
            {credentialsStatus.message}
          </p>
        )}
      </section>
    </div>
  );
}