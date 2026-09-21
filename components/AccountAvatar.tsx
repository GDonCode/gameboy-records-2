// components/AccountAvatar.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AccountAvatarProps {
  displayName: string;
  initialAvatarUrl: string | null;
}

export default function AccountAvatar({ displayName, initialAvatarUrl }: AccountAvatarProps) {
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/account/avatar', { method: 'POST', body: formData });
    const data = await res.json();

    setIsUploading(false);

    if (!res.ok) {
      setError(data.error || 'Upload failed.');
      return;
    }

    setAvatarUrl(data.url);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-5">
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt={displayName}
          className="w-20 h-20 rounded-full object-cover border-2 border-[#4dff91]"
        />
      ) : (
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center border-2 border-[#4dff91] text-white/50 text-[0.7em]"
          style={{ fontFamily: "'Poppins', monospace" }}
        >
          NO PHOTO
        </div>
      )}
      <div>
        <input
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          disabled={isUploading}
          className="text-[0.8em] text-white/70"
          style={{ fontFamily: "'Poppins', monospace" }}
        />
        {isUploading && (
          <p className="text-[#4dff91] text-[0.78em] mt-1" style={{ fontFamily: "'Poppins', monospace" }}>
            Uploading…
          </p>
        )}
        {error && (
          <p className="text-[#ff6b6b] text-[0.78em] mt-1" style={{ fontFamily: "'Poppins', monospace" }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}