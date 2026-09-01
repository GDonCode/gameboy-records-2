// components/EditPostForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const TAGS = ['NEWS', 'RELEASE', 'LIVE', 'STUDIO', 'LABEL', 'TOUR', 'MIXES', 'ROSTER'];

interface PostFields {
  id: string;
  title: string;
  teaser: string;
  body: string;
  tag: string;
  status: string;
  cover_image_url?: string | null;
  cover_media_type?: 'image' | 'video' | null;
}

export default function EditPostForm({ post }: { post: PostFields }) {
  const router = useRouter();
  const [title, setTitle] = useState(post.title);
  const [teaser, setTeaser] = useState(post.teaser);
  const [body, setBody] = useState(post.body);
  const [tag, setTag] = useState(post.tag);
  const [coverImageUrl, setCoverImageUrl] = useState(post.cover_image_url || '');
  const [coverMediaType, setCoverMediaType] = useState<'image' | 'video' | null>(post.cover_media_type || null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await res.json();

    setIsUploading(false);

    if (!res.ok) {
      setError(data.error || 'Upload failed.');
      return;
    }

    setCoverImageUrl(data.url);
    setCoverMediaType(file.type.startsWith('video/') ? 'video' : 'image');
  }

  async function submitPost(status: 'draft' | 'published') {
    setIsSubmitting(true);
    setError(null);

    const res = await fetch(`/api/posts/${post.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        teaser,
        body,
        tag,
        status,
        cover_image_url: coverImageUrl || null,
        cover_media_type: coverMediaType,
      }),
    });

    setIsSubmitting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Failed to save post.');
      return;
    }

    router.push('/dashboard/posts');
    router.refresh();
  }

  return (
    <>
      <style>{`
        .post-form-wrap {
          height: 100vh;
          overflow-y: auto;
          padding: 60px 24px;
          display: flex;
          justify-content: center;
          background: linear-gradient(160deg, #1c2e20 0%, #181f1a 60%, #10160f 100%);
        }
        .post-form-card { width: 100%; max-width: 640px; }
        .post-form-title {
          font-family: 'Hemisphers Bold Sans', monospace;
          font-size: 1.8em;
          letter-spacing: 0.1em;
          color: #4dff91;
          text-shadow: 0 0 20px rgba(77,255,145,0.25);
          margin-bottom: 28px;
        }
        .post-input, .post-textarea, .post-select {
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
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .post-input:focus, .post-textarea:focus, .post-select:focus {
          border-color: #4dff91;
          box-shadow: 0 0 0 1px #4dff91, 0 0 12px rgba(77,255,145,0.15);
        }
        .post-label {
          display: block;
          font-family: 'Arvo', monospace;
          font-size: 0.78em;
          letter-spacing: 0.12em;
          color: rgba(255,255,255,0.5);
          margin-bottom: 6px;
        }
        .post-actions { display: flex; gap: 12px; margin-top: 8px; }
        .post-btn {
          font-family: 'Hemisphers Bold Sans', monospace;
          font-size: 0.85em;
          letter-spacing: 0.14em;
          color: #fff;
          height: 46px;
          padding: 0 24px;
          border-radius: 2px;
          cursor: pointer;
          transition: transform 0.07s ease;
        }
        .post-btn:hover:not(:disabled) { transform: translateY(-1px); }
        .post-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .post-btn-publish {
          background: linear-gradient(175deg, #22b85a 0%, #178f42 100%);
          border: 1px solid #1a9e4a;
        }
        .post-btn-draft {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.25);
        }
        .post-error {
          color: #ff6b6b;
          font-family: 'Arvo', monospace;
          font-size: 0.82em;
          margin-bottom: 14px;
        }
      `}</style>

      <div className="post-form-wrap">
        <div className="post-form-card">
          <div className="post-form-title">EDIT POST</div>

          {error && <div className="post-error">{error}</div>}

          <label className="post-label">Title</label>
          <input className="post-input" value={title} onChange={(e) => setTitle(e.target.value)} />

          <label className="post-label">Teaser (short summary shown in feed)</label>
          <input className="post-input" value={teaser} onChange={(e) => setTeaser(e.target.value)} />

          <label className="post-label">Tag</label>
          <select className="post-select" value={tag} onChange={(e) => setTag(e.target.value)}>
            {TAGS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <label className="post-label">Cover Image or Video (optional)</label>
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            disabled={isUploading}
            className="post-input"
            style={{ padding: '8px 14px' }}
          />
          {isUploading && (
            <p style={{ fontFamily: "'Arvo', monospace", fontSize: '0.78em', color: '#4dff91', marginTop: '-6px', marginBottom: '14px' }}>
              Uploading…
            </p>
          )}
          {coverImageUrl && !isUploading && coverMediaType === 'video' && (
            <video
              src={coverImageUrl}
              controls
              style={{ width: '100%', maxHeight: '160px', objectFit: 'cover', borderRadius: '2px', marginBottom: '14px', border: '1px solid rgba(26,158,74,0.25)' }}
            />
          )}
          {coverImageUrl && !isUploading && coverMediaType !== 'video' && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverImageUrl}
              alt="Cover preview"
              style={{ width: '100%', maxHeight: '160px', objectFit: 'cover', borderRadius: '2px', marginBottom: '14px', border: '1px solid rgba(26,158,74,0.25)' }}
            />
          )}

          <label className="post-label">Body</label>
          <textarea
            className="post-textarea"
            rows={10}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            style={{ resize: 'vertical' }}
          />

          <div className="post-actions">
            <button
              type="button"
              className="post-btn post-btn-draft"
              disabled={isSubmitting}
              onClick={() => submitPost('draft')}
            >
              SAVE AS DRAFT
            </button>
            <button
              type="button"
              className="post-btn post-btn-publish"
              disabled={isSubmitting}
              onClick={() => submitPost('published')}
            >
              {isSubmitting ? 'SAVING…' : post.status === 'published' ? 'UPDATE' : 'PUBLISH'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}