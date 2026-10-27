// components/AccountAvatar.tsx
'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera } from 'lucide-react';
import { BODY, DANGER_TEXT_BUTTON, ERROR_TEXT, PRIMARY_BUTTON, readError } from '@/components/account/formStyles';

interface AccountAvatarProps {
  displayName: string;
  initialAvatarUrl: string | null;
}

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export default function AccountAvatar({ displayName, initialAvatarUrl }: AccountAvatarProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [busy, setBusy] = useState<'upload' | 'remove' | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ''; // let the same file be picked again after an error
    if (!file) return;

    // Quick checks here; the server checks the actual file contents.
    if (!ACCEPTED.includes(file.type)) {
      setError('Use a JPG, PNG, WebP or GIF image.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError('Image must be under 5 MB.');
      return;
    }

    setBusy('upload');
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/account/avatar', { method: 'POST', body: formData });
      if (!res.ok) {
        setError(await readError(res, 'Upload failed. Please try again.'));
        return;
      }
      const data = await res.json();
      setAvatarUrl(data.url);
      router.refresh();
    } catch {
      setError('Upload failed. Check your connection and try again.');
    } finally {
      setBusy(null);
    }
  }

  async function handleRemove() {
    if (!window.confirm('Remove your profile photo?')) return;
    setBusy('remove');
    setError(null);
    try {
      const res = await fetch('/api/account/avatar', { method: 'DELETE' });
      if (!res.ok) {
        setError(await readError(res, 'Could not remove your photo. Please try again.'));
        return;
      }
      setAvatarUrl(null);
      router.refresh();
    } catch {
      setError('Could not remove your photo. Check your connection and try again.');
    } finally {
      setBusy(null);
    }
  }

  const initial = displayName.trim().charAt(0).toUpperCase() || '?';

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-5" style={BODY}>
      <div className="relative w-20 h-20 flex-shrink-0">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="" className="w-20 h-20 rounded-full object-cover border-2 border-[#4dff91]" />
        ) : (
          <span
            className="flex w-20 h-20 items-center justify-center rounded-full border-2 border-[#4dff91] bg-[#16432a] text-white text-[1.8em]"
            aria-hidden="true"
          >
            {initial}
          </span>
        )}
        {busy && (
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 text-[0.7em] text-white">
            {busy === 'upload' ? 'Uploading…' : 'Removing…'}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-white">Profile photo</p>
        <p className="text-[0.8em] text-white/50">JPG, PNG, WebP or GIF, up to 5 MB.</p>
        <div className="flex flex-wrap items-center gap-4">
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED.join(',')}
            onChange={handleFile}
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
          />
          <button type="button" className={PRIMARY_BUTTON} disabled={busy !== null} onClick={() => inputRef.current?.click()}>
            <Camera className="w-4 h-4" />
            {avatarUrl ? 'CHANGE PHOTO' : 'UPLOAD PHOTO'}
          </button>
          {avatarUrl && (
            <button type="button" className={DANGER_TEXT_BUTTON} disabled={busy !== null} onClick={handleRemove}>
              Remove
            </button>
          )}
        </div>
        {error && (
          <p role="alert" className={ERROR_TEXT}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
