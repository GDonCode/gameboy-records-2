// app/feed/page.tsx
import './feed.css';
import Link from 'next/link';
import Header from '@/components/Header';
import { supabasePublic } from '@/lib/supabase-public';
import GameIconsBackground from '@/components/GameIconsBackground';
import MobileBottomNav from '@/components/MobileBottomNav';
import PostCreationWidget from '@/components/PostCreationWidget';

export const revalidate = 0;

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

async function getPublishedPosts(): Promise<PostListItem[]> {
  const { data, error } = await supabasePublic
    .from('posts')
    .select('id, title, slug, teaser, tag, cover_image_url, cover_media_type, published_at, artists ( name )')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch posts:', error.message);
    return [];
  }

  return (data || []) as unknown as PostListItem[];
}

function Corners() {
  return (
    <>
      <span className="absolute top-0 left-0 w-5 h-5 border-t-[3px] border-l-[3px] border-[#1a9e4a] pointer-events-none z-50" />
      <span className="absolute top-0 right-0 w-5 h-5 border-t-[3px] border-r-[3px] border-[#1a9e4a] pointer-events-none z-50" />
      <span className="absolute bottom-0 left-0 w-5 h-5 border-b-[3px] border-l-[3px] border-[#1a9e4a] pointer-events-none z-50" />
      <span className="absolute bottom-0 right-0 w-5 h-5 border-b-[3px] border-r-[3px] border-[#1a9e4a] pointer-events-none z-50" />
    </>
  );
}

function formatDate(iso: string) {
// ... existing code below ...
  return new Date(iso).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).toUpperCase();
}

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const posts = await getPublishedPosts();
  const { tag } = await searchParams;

  const activeTag = tag || null;
  const uniqueTags = Array.from(new Set(posts.map((p) => p.tag))).sort();
  const filteredPosts = activeTag
    ? posts.filter((p) => p.tag === activeTag)
    : posts;

  return (
    <>
      <style>{`
        .tag-sidebar::after {
          content: '';
          position: absolute;
          right: 0; top: 0; bottom: 0;
          width: 1px;
          background: linear-gradient(180deg, transparent, rgba(26,158,74,0.35) 20%, rgba(26,158,74,0.18) 60%, rgba(26,158,74,0.35) 80%, transparent);
          pointer-events: none;
        }
        .tag-link {
          transition: background 0.15s, color 0.15s;
          color: #16432a;
          background: transparent;
        }
        .tag-link-active {
          color: #ffffff !important;
          background: #1a9e4a !important;
        }
        .tag-link:not(.tag-link-active):hover {
          background: rgba(26,158,74,0.08);
          color: #0c5d3c;
        }
        .no-scrollbar { scrollbar-width: none; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

       <div className="flex flex-col h-screen overflow-hidden">
        <Header />
        <MobileBottomNav />

        <div
          className="flex flex-1 overflow-hidden"
          style={{ background: 'linear-gradient(160deg, #1c2e20 0%, #181f1a 60%, #10160f 100%)' }}
        >
          {/* ── TAG FILTER SIDEBAR ──────────────────────────────────── */}
          <aside className="tag-sidebar no-scrollbar relative flex flex-col w-64 flex-shrink-0 bg-[#fef8f3] z-[25] overflow-y-auto">
            <Corners />
            <div className="p-6">
              <div
                style={{
                  fontFamily: "'Hemisphers Bold Sans', monospace",
                  fontSize: '0.85em',
                  letterSpacing: '0.2em',
                  color: '#16432a',
                  marginBottom: '18px',
                }}
              >
                FILTER BY TAG
              </div>
              <nav className="flex flex-col gap-1">
                <Link
                  href="/feed"
                  className={`tag-link block no-underline${!activeTag ? ' tag-link-active' : ''}`}
                  style={{
                    fontFamily: "'Arvo', monospace",
                    fontSize: '1em',
                    letterSpacing: '0.05em',
                    padding: '8px 10px',
                    borderRadius: '2px',
                  }}
                >
                  ALL POSTS
                </Link>
                {uniqueTags.map((t) => (
                  <Link
                    key={t}
                    href={`/feed?tag=${encodeURIComponent(t)}`}
                    className={`tag-link block no-underline${activeTag === t ? ' tag-link-active' : ''}`}
                    style={{
                      fontFamily: "'Arvo', monospace",
                      fontSize: '1em',
                      letterSpacing: '0.05em',
                      padding: '8px 10px',
                      borderRadius: '2px',
                    }}
                  >
                    {t}
                  </Link>
                ))}
              </nav>
            </div>
          </aside>

          {/* ── MAIN SCROLL COLUMN ──────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto relative">
            <GameIconsBackground/>
            {/* Post Creation Widget*/}
            <div className="relative py-6 px-12">
              <PostCreationWidget />
            </div>
            <div className="mx-auto px-12 mt-6 z-10 relative">

            {filteredPosts.length === 0 ? (
              <p style={{ fontFamily: "'Arvo', monospace", color: 'rgba(255,255,255,0.5)' }}>
                No posts yet — check back soon.
              </p>
            ) : (
              <>
                {/* Featured post — newest article gets a full-width hero treatment */}
                <Link
                  href={`/feed/${filteredPosts[0].slug}`}
                  className="group block mb-10 no-underline"
                >
                  <article
                    className="grid grid-cols-1 md:grid-cols-2 hover:translate-y-[-4px] transition-all duration-150 overflow-hidden"
                    style={{ background: '#fef8f3', border: '4px solid #3dc97e', borderRadius: '4px' }}
                  >
                    <div
                      className="relative w-full aspect-video overflow-hidden"
                      style={{ background: '#0c1510' }}
                    >
                      {filteredPosts[0].cover_image_url && filteredPosts[0].cover_media_type === 'video' ? (
                        <video
                          src={filteredPosts[0].cover_image_url}
                          className="absolute inset-0 w-full h-full object-contain"
                          autoPlay
                          muted
                          loop
                          playsInline
                        />
                      ) : filteredPosts[0].cover_image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={filteredPosts[0].cover_image_url}
                          alt={filteredPosts[0].title}
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

                    <div className="p-8 flex flex-col justify-center">
                      <span
                        style={{
                          display: 'inline-block',
                          marginBottom: '14px',
                          fontFamily: "'Hemisphers Bold Sans', monospace",
                          fontSize: '0.7em',
                          letterSpacing: '0.3em',
                          color: '#ffffff',
                          background: 'rgba(26,158,74)',
                          padding: '4px 12px',
                          borderRadius: '2px',
                          width: 'fit-content',
                        }}
                      >
                        FEATURED · {filteredPosts[0].tag}
                      </span>

                      <div
                        className="group-hover:underline"
                        style={{
                          fontFamily: "'Arvo', monospace",
                          fontSize: '1.6em',
                          color: '#1a1a1a',
                          lineHeight: 1.25,
                          marginBottom: '10px',
                        }}
                      >
                        {filteredPosts[0].title}
                      </div>

                      <div
                        style={{
                          fontFamily: "'Arvo', monospace",
                          fontSize: '0.85em',
                          letterSpacing: '0.1em',
                          color: '#1a1a1a',
                          opacity: 0.65,
                          marginBottom: '14px',
                        }}
                      >
                        {(filteredPosts[0].artists?.name?.toUpperCase() || 'GAMEBOY RECORDS')} &nbsp;•&nbsp; {formatDate(filteredPosts[0].published_at)}
                      </div>

                      <div style={{ fontFamily: "'Arvo', monospace", fontSize: '0.95em', color: '#1a1a1a', lineHeight: 1.6, marginBottom: '16px' }}>
                        {filteredPosts[0].teaser}
                      </div>

                      <span
                        style={{
                          fontFamily: "'Hemisphers Bold Sans', monospace",
                          fontSize: '0.75em',
                          letterSpacing: '0.2em',
                          color: '#1a9e4a',
                        }}
                      >
                        CONTINUE READING →
                      </span>
                    </div>
                  </article>
                </Link>

                {/* Remaining posts — standard feed card grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredPosts.slice(1).map((post) => (
                    <Link
                      key={post.id}
                      href={`/feed/${post.slug}`}
                      className="group block p-6 no-underline hover:translate-y-[-6px] transition-all duration-150"
                      style={{
                        background: '#fef8f3',
                        border: '4px solid #3dc97e',
                        borderRadius: '4px',
                      }}
                    >
                      <div
                        className="relative w-full aspect-video mb-4 rounded overflow-hidden"
                        style={{ border: '1px solid rgba(26,158,74,0.2)', background: '#0c1510' }}
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

                      <div
                        style={{
                          fontFamily: "'Arvo', monospace",
                          fontSize: '0.78em',
                          letterSpacing: '0.1em',
                          color: '#1a1a1a',
                          opacity: 0.65,
                          marginBottom: '10px',
                        }}
                      >
                        {(post.artists?.name?.toUpperCase() || 'GAMEBOY RECORDS')} &nbsp;•&nbsp; {formatDate(post.published_at)}
                      </div>

                      <div
                        className="group-hover:underline"
                        style={{ fontFamily: "'Arvo', monospace", fontSize: '1.2em', color: '#1a1a1a', lineHeight: 1.35, marginBottom: '8px' }}
                      >
                        {post.title}
                      </div>

                      <div style={{ fontFamily: "'Arvo', monospace", fontSize: '0.85em', color: '#1a1a1a', lineHeight: 1.6, marginBottom: '12px' }}>
                        {post.teaser}
                      </div>

                      <div className="flex items-center justify-between">
                        <span
                          style={{
                            fontFamily: "'Hemisphers Bold Sans', monospace",
                            fontSize: '0.7em',
                            letterSpacing: '0.2em',
                            color: '#ffffff',
                            background: 'rgba(26,158,74)',
                            padding: '4px 10px',
                            borderRadius: '2px',
                          }}
                        >
                          {post.tag}
                        </span>
                        <span
                          style={{
                            fontFamily: "'Hemisphers Bold Sans', monospace",
                            fontSize: '0.7em',
                            letterSpacing: '0.15em',
                            color: '#1a9e4a',
                          }}
                        >
                          READ →
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}