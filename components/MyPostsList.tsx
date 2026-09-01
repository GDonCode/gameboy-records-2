// components/MyPostsList.tsx
'use client';

import DeletePostButton from '@/components/DeletePostButton';

export interface DashboardPost {
  id: string;
  title: string;
  slug: string;
  teaser: string;
  body: string;
  tag: string;
  status: string;
  created_at: string;
  cover_image_url: string | null;
  cover_media_type: 'image' | 'video' | null;
}

interface MyPostsListProps {
  posts: DashboardPost[];
  onCreateNew: () => void;
  onEditPost: (post: DashboardPost) => void;
}

export default function MyPostsList({ posts, onCreateNew, onEditPost }: MyPostsListProps) {
  return (
    <div className="max-w-[760px] mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1
          className="text-[1.8em] tracking-[0.1em] text-[#4dff91]"
          style={{ fontFamily: "'Hemisphers Bold Sans', monospace", textShadow: '0 0 20px rgba(77,255,145,0.25)' }}
        >
          MY POSTS
        </h1>
        <button
          onClick={onCreateNew}
          className="text-[0.8em] tracking-[0.12em] text-white px-[18px] py-[10px] rounded-[2px] border border-[#1a9e4a] hover:-translate-y-px transition-transform"
          style={{ fontFamily: "'Hemisphers Bold Sans', monospace", background: 'linear-gradient(175deg, #22b85a 0%, #178f42 100%)' }}
        >
          + NEW POST
        </button>
      </div>

      {posts.length === 0 ? (
        <p className="text-white/50" style={{ fontFamily: "'Arvo', monospace" }}>
          You haven&apos;t written anything yet.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className="flex items-center justify-between px-5 py-4 bg-white/[0.03] border border-[rgba(26,158,74,0.2)] rounded"
            >
              <div>
                <div className="text-white text-[0.95em] mb-1" style={{ fontFamily: "'Arvo', monospace" }}>
                  {post.title}
                </div>
                <div className="flex gap-2.5 items-center">
                  <span
                    className="text-[0.75em] tracking-[0.14em] px-2 py-0.5 rounded-[2px] border"
                    style={{
                      fontFamily: "'Arvo', monospace",
                      color: post.status === 'published' ? '#4dff91' : 'rgba(255,255,255,0.5)',
                      borderColor: post.status === 'published' ? 'rgba(77,255,145,0.35)' : 'rgba(255,255,255,0.25)',
                    }}
                  >
                    {post.status.toUpperCase()}
                  </span>
                  <span className="text-[0.75em] text-white/40" style={{ fontFamily: "'Arvo', monospace" }}>
                    {post.tag}
                  </span>
                </div>
              </div>

              <div className="flex gap-2.5">
                <button
                  onClick={() => onEditPost(post)}
                  className="text-[0.78em] text-[#4dff91] border border-[rgba(77,255,145,0.35)] px-3.5 py-1.5 rounded-[2px]"
                  style={{ fontFamily: "'Arvo', monospace" }}
                >
                  EDIT
                </button>
                <DeletePostButton postId={post.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}