'use client';

import { useCallback, useRef } from 'react';
import Link from 'next/link';

interface PostListItem {
  id: string;
  title: string;
  slug: string;
  teaser: string;
  tag: string;
  cover_image_url: string | null;
  cover_media_type: 'image' | 'video' | null;
  published_at: string;
  artists: { name: string } | null;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).toUpperCase();
}

const SNAP_LOCK_MS = 500;

export default function FeedScrollList({ posts }: { posts: PostListItem[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const lockedRef = useRef(false);

  const handleMediaWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>, index: number) => {
      e.preventDefault();
      e.stopPropagation();

      if (lockedRef.current) return;

      const direction = e.deltaY > 0 ? 1 : -1;
      const targetIndex = Math.min(Math.max(index + direction, 0), posts.length - 1);
      const targetCard = cardRefs.current[targetIndex];

      if (targetCard) {
        lockedRef.current = true;
        targetCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(() => {
          lockedRef.current = false;
        }, SNAP_LOCK_MS);
      }
    },
    [posts.length]
  );

  return (
    <div
      ref={containerRef}
      className="flex flex-col gap-6 overflow-hidden"
      style={{ maxHeight: '600px' }}
    >
      {posts.map((post, index) => (
        <Link
          key={post.id}
          href={`/feed/${post.slug}`}
          ref={(el) => {
            cardRefs.current[index] = el;
          }}
          className="group block p-5 no-underline hover:translate-y-[-4px] transition-all duration-150 feed-card"
          style={{
            background: '#fef8f3',
            border: '1px solid rgba(26,158,74,0.3)',
            borderRadius: '4px',
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="feed-card-avatar" />
            <div className="flex flex-col">
              <span
                style={{
                  fontFamily: "'Hemisphers Bold Sans', monospace",
                  fontSize: '0.78em',
                  letterSpacing: '0.08em',
                  color: '#16432a',
                }}
              >
                {post.artists?.name?.toUpperCase() || 'GAMEBOY RECORDS'}
              </span>
              <span
                style={{
                  fontFamily: "'Arvo', monospace",
                  fontSize: '0.72em',
                  color: '#1a1a1a',
                  opacity: 0.55,
                }}
              >
                {formatDate(post.published_at)} &nbsp;•&nbsp; {post.tag}
              </span>
            </div>
          </div>

          <div
            className="group-hover:underline"
            style={{ fontFamily: "'Arvo', monospace", fontSize: '1.15em', color: '#1a1a1a', lineHeight: 1.35, marginBottom: '8px' }}
          >
            {post.title}
          </div>

          <div style={{ fontFamily: "'Arvo', monospace", fontSize: '0.85em', color: '#1a1a1a', lineHeight: 1.6, marginBottom: '12px' }}>
            {post.teaser}
          </div>

          {/* Media block — the ONLY area that captures wheel input for snap-scroll */}
          <div
            className="relative w-full aspect-video mb-3 rounded overflow-hidden"
            style={{ border: '1px solid rgba(26,158,74,0.2)', background: '#0c1510' }}
            onWheel={(e) => handleMediaWheel(e, index)}
          >
            {post.cover_image_url && post.cover_media_type === 'video' ? (
              <video
                src={post.cover_image_url}
                className="absolute inset-0 w-full h-full object-contain"
                autoPlay
                muted
                loop
                playsInline
              />
            ) : post.cover_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.cover_image_url}
                alt={post.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div
                className="absolute inset-0 flex items-center justify-center opacity-40"
                style={{
                  background: 'linear-gradient(135deg, rgba(26,158,74,0.15), rgba(26,158,74,0.05))',
                  fontFamily: "'Arvo', monospace",
                  fontSize: '0.85em',
                  letterSpacing: '0.3em',
                  color: '#4dff91',
                }}
              >
                IMAGE
              </div>
            )}
          </div>

          <div className="feed-card-actions">
            <span className="feed-card-action-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
              COMMENT
            </span>
            <span className="feed-card-action-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7M16 6l-4-4-4 4M12 2v13" />
              </svg>
              SHARE
            </span>
            <span className="feed-card-action-btn ml-auto">
              READ →
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}