// components/CommentSection.tsx
'use client';

import { useState } from 'react';

interface Comment {
  id: string;
  body: string;
  author_name: string;
  created_at: string;
  avatar_url: string | null;
}

interface CurrentUser {
  id: string;
  name: string;
}

interface CommentSectionProps {
  postId: string;
  initialComments: Comment[];
  currentUser: CurrentUser | null;
}

function formatCommentDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function CommentSection({ postId, initialComments, currentUser }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [draft, setDraft] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!draft.trim()) return;

    setIsSubmitting(true);
    setError(null);

    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: draft }),
    });

    const data = await res.json().catch(() => ({}));
    setIsSubmitting(false);

    if (!res.ok) {
      setError(data.error || 'Failed to post comment.');
      return;
    }

    setComments((prev) => [...prev, data.comment]);
    setDraft('');
  }

  return (
    <div>
      <div
        style={{
          fontFamily: "'Poppins', monospace",
          fontSize: '1.1em',
          letterSpacing: '0.1em',
          color: '#4dff91',
          marginBottom: '16px',
        }}
      >
        COMMENTS ({comments.length})
      </div>

      {comments.length === 0 && (
        <p style={{ fontFamily: "'Poppins', monospace", fontSize: '0.85em', color: 'rgba(255,255,255,0.5)', marginBottom: '20px' }}>
          No comments yet.
        </p>
      )}

      <div className="flex flex-col gap-4 mb-6">
        {comments.map((c) => (
          <div key={c.id} style={{ display: 'flex', gap: '10px', borderBottom: '1px solid rgba(77,255,145,0.15)', paddingBottom: '12px' }}>
            {c.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={c.avatar_url}
                alt={c.author_name}
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                style={{ border: '1px solid rgba(77,255,145,0.4)' }}
              />
            ) : (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ border: '1px solid rgba(77,255,145,0.4)', background: 'rgba(255,255,255,0.05)' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" className="w-4 h-4" style={{ opacity: 0.6 }}>
                  <path fill="#4dff91" d="M320 312C386.3 312 440 258.3 440 192C440 125.7 386.3 72 320 72C253.7 72 200 125.7 200 192C200 258.3 253.7 312 320 312zM290.3 368C191.8 368 112 447.8 112 546.3C112 562.7 125.3 576 141.7 576L498.3 576C514.7 576 528 562.7 528 546.3C528 447.8 448.2 368 349.7 368L290.3 368z" />
                </svg>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div style={{ fontFamily: "'Poppins', monospace", fontSize: '0.78em', letterSpacing: '0.1em', color: '#4dff91', opacity: 0.8, marginBottom: '4px' }}>
                {c.author_name} · {formatCommentDate(c.created_at)}
              </div>
              <div style={{ fontFamily: "'Poppins', monospace", fontSize: '0.85em', color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {c.body}
              </div>
            </div>
          </div>
        ))}
      </div>

      {currentUser ? (
        <div>
          {error && (
            <p style={{ fontFamily: "'Poppins', monospace", fontSize: '0.78em', color: '#ff6b6b', marginBottom: '8px' }}>
              {error}
            </p>
          )}
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Add a comment…"
            rows={3}
            className="w-full bg-white/5 border border-[rgba(26,158,74,0.25)] text-white text-[0.85em] px-3 py-2.5 rounded-[2px] outline-none mb-2.5 focus:border-[#4dff91] resize-y"
            style={{ fontFamily: "'Poppins', monospace" }}
          />
          <button
            type="button"
            disabled={isSubmitting || !draft.trim()}
            onClick={handleSubmit}
            className="text-[0.8em] tracking-[0.12em] text-white h-[40px] px-5 rounded-[2px] border border-[#1a9e4a] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: "'Poppins', monospace", background: 'linear-gradient(175deg, #22b85a 0%, #178f42 100%)' }}
          >
            {isSubmitting ? 'POSTING…' : 'POST COMMENT'}
          </button>
        </div>
      ) : (
        <p style={{ fontFamily: "'Poppins', monospace", fontSize: '0.82em', color: 'rgba(255,255,255,0.6)' }}>
          <a href="/account/login" style={{ color: '#4dff91', textDecoration: 'underline' }}>
            Log in
          </a>{' '}
          to leave a comment.
        </p>
      )}
    </div>
  );
}