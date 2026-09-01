// components/PostForm.tsx
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

interface PostFormProps {
  post?: PostFields;
  onSaved: () => void;
}

export default function PostForm({ post, onSaved }: PostFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(post?.title || '');
  const [teaser, setTeaser] = useState(post?.teaser || '');
  const [body, setBody] = useState(post?.body || '');
  const [tag, setTag] = useState(post?.tag || 'NEWS');
  const [coverImageUrl, setCoverImageUrl] = useState(post?.cover_image_url || '');
  const [coverMediaType, setCoverMediaType] = useState<'image' | 'video' | null>(post?.cover_media_type || null);
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

    const url = post ? `/api/posts/${post.id}` : '/api/posts';
    const method = post ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method,
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

    router.refresh();
    onSaved();
  }

  return (
    <div className="max-w-[640px] mx-auto">
      <div
        className="text-[1.8em] tracking-[0.1em] text-[#4dff91] mb-7"
        style={{ fontFamily: "'Hemisphers Bold Sans', monospace", textShadow: '0 0 20px rgba(77,255,145,0.25)' }}
      >
        {post ? 'EDIT POST' : 'NEW POST'}
      </div>

      {error && (
        <div className="text-[#ff6b6b] text-[0.82em] mb-3.5" style={{ fontFamily: "'Arvo', monospace" }}>
          {error}
        </div>
      )}

      <label className="block text-[0.78em] tracking-[0.12em] text-white/50 mb-1.5" style={{ fontFamily: "'Arvo', monospace" }}>
        Title
      </label>
      <input
        className="bg-white/5 border border-[rgba(26,158,74,0.25)] text-white text-[0.9em] px-3.5 py-2.5 rounded-[2px] w-full outline-none mb-3.5 focus:border-[#4dff91]"
        style={{ fontFamily: "'Arvo', monospace" }}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g. New single out now"
      />

      <label className="block text-[0.78em] tracking-[0.12em] text-white/50 mb-1.5" style={{ fontFamily: "'Arvo', monospace" }}>
        Teaser (short summary shown in feed)
      </label>
      <input
        className="bg-white/5 border border-[rgba(26,158,74,0.25)] text-white text-[0.9em] px-3.5 py-2.5 rounded-[2px] w-full outline-none mb-3.5 focus:border-[#4dff91]"
        style={{ fontFamily: "'Arvo', monospace" }}
        value={teaser}
        onChange={(e) => setTeaser(e.target.value)}
        placeholder="One or two sentences"
      />

      <label className="block text-[0.78em] tracking-[0.12em] text-white/50 mb-1.5" style={{ fontFamily: "'Arvo', monospace" }}>
        Tag
      </label>
      <select
        className="bg-white/5 border border-[rgba(26,158,74,0.25)] text-white text-[0.9em] px-3.5 py-2.5 rounded-[2px] w-full outline-none mb-3.5 focus:border-[#4dff91]"
        style={{ fontFamily: "'Arvo', monospace" }}
        value={tag}
        onChange={(e) => setTag(e.target.value)}
      >
        {TAGS.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      <label className="block text-[0.78em] tracking-[0.12em] text-white/50 mb-1.5" style={{ fontFamily: "'Arvo', monospace" }}>
        Cover Image or Video (optional)
      </label>
      <input
        type="file"
        accept="image/*,video/*"
        onChange={handleFileChange}
        disabled={isUploading}
        className="bg-white/5 border border-[rgba(26,158,74,0.25)] text-white text-[0.9em] px-3.5 py-2 rounded-[2px] w-full outline-none mb-3.5"
      />
      {isUploading && (
        <p className="text-[#4dff91] text-[0.78em] -mt-1.5 mb-3.5" style={{ fontFamily: "'Arvo', monospace" }}>
          Uploading…
        </p>
      )}
      {coverImageUrl && !isUploading && coverMediaType === 'video' && (
        <video
          src={coverImageUrl}
          controls
          className="w-full max-h-[160px] object-cover rounded-[2px] mb-3.5 border border-[rgba(26,158,74,0.25)]"
        />
      )}
      {coverImageUrl && !isUploading && coverMediaType !== 'video' && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={coverImageUrl}
          alt="Cover preview"
          className="w-full max-h-[160px] object-cover rounded-[2px] mb-3.5 border border-[rgba(26,158,74,0.25)]"
        />
      )}

      <label className="block text-[0.78em] tracking-[0.12em] text-white/50 mb-1.5" style={{ fontFamily: "'Arvo', monospace" }}>
        Body
      </label>
      <textarea
        className="bg-white/5 border border-[rgba(26,158,74,0.25)] text-white text-[0.9em] px-3.5 py-2.5 rounded-[2px] w-full outline-none mb-3.5 focus:border-[#4dff91] resize-y"
        style={{ fontFamily: "'Arvo', monospace" }}
        rows={10}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write the full post…"
      />

      <div className="flex gap-3 mt-2">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => submitPost('draft')}
          className="text-[0.85em] tracking-[0.14em] text-white h-[46px] px-6 rounded-[2px] border border-white/25 bg-transparent disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-px transition-transform"
          style={{ fontFamily: "'Hemisphers Bold Sans', monospace" }}
        >
          SAVE DRAFT
        </button>
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => submitPost('published')}
          className="text-[0.85em] tracking-[0.14em] text-white h-[46px] px-6 rounded-[2px] border border-[#1a9e4a] disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-px transition-transform"
          style={{ fontFamily: "'Hemisphers Bold Sans', monospace", background: 'linear-gradient(175deg, #22b85a 0%, #178f42 100%)' }}
        >
          {isSubmitting
            ? post ? 'SAVING…' : 'PUBLISHING…'
            : post ? (post.status === 'published' ? 'UPDATE' : 'PUBLISH') : 'PUBLISH'}
        </button>
      </div>
    </div>
  );
}