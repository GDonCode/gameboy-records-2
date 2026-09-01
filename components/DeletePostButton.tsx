// components/DeletePostButton.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeletePostButton({ postId }: { postId: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm('Delete this post? This cannot be undone.')) return;

    setIsDeleting(true);
    const res = await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
    setIsDeleting(false);

    if (res.ok) {
      router.refresh();
    } else {
      alert('Failed to delete post.');
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      style={{
        fontFamily: "'Arvo', monospace",
        fontSize: '0.78em',
        letterSpacing: '0.1em',
        color: '#ff6b6b',
        background: 'rgba(255,107,107,0.1)',
        border: '1px solid rgba(255,107,107,0.35)',
        padding: '6px 12px',
        borderRadius: '2px',
        cursor: isDeleting ? 'not-allowed' : 'pointer',
        opacity: isDeleting ? 0.5 : 1,
      }}
    >
      {isDeleting ? 'DELETING…' : 'DELETE'}
    </button>
  );
}