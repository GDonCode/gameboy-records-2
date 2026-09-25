// app/feed/[slug]/page.tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { supabasePublic } from '@/lib/supabase-public';
import GameIconsBackground from '@/components/GameIconsBackground';
import MobileBottomNav from '@/components/MobileBottomNav';
import CommentSection from '@/components/CommentSection';
import { auth } from '@/auth';

export const revalidate = 0;

interface PostDetail {
  id: string;
  title: string;
  slug: string;
  teaser: string;
  body: string;
  tag: string;
  cover_image_url: string | null;
  cover_media_type: 'image' | 'video' | null;
  published_at: string;
  artists: { name: string } | null;
}

async function getPost(slug: string): Promise<PostDetail | null> {
  const { data, error } = await supabasePublic
    .from('posts')
    .select('id, title, slug, teaser, body, tag, cover_image_url, cover_media_type, published_at, artists ( name )')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error || !data) return null;
  return data as unknown as PostDetail;
}

interface Comment {
  id: string;
  body: string;
  author_name: string;
  created_at: string;
  avatar_url: string | null;
}

async function getComments(postId: string): Promise<Comment[]> {
  const { data, error } = await supabasePublic
    .from('comments')
    .select('id, body, author_name, created_at, users ( avatar_url )')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error || !data) return [];

  return data.map((c: any) => ({
    id: c.id,
    body: c.body,
    author_name: c.author_name,
    created_at: c.created_at,
    avatar_url: c.users?.avatar_url ?? null,
  }));
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).toUpperCase();
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) notFound();

  const [comments, session] = await Promise.all([
    getComments(post.id),
    auth(),
  ]);

   return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />
      <MobileBottomNav />

      <div
        className="flex-1 overflow-y-auto px-12 py-16"
        style={{ background: 'linear-gradient(160deg, #1c2e20 0%, #181f1a 60%, #10160f 100%)' }}
      >
        <GameIconsBackground />
        <div className="w-full flex gap-6 items-start z-10 relative">
          <div className="w-[25%] flex-shrink-0 sticky top-0">
            <Link
              href="/feed"
              className="inline-block no-underline mb-8"
              style={{ fontFamily: "'Poppins', monospace", fontSize: '0.9em', letterSpacing: '0.16em', color: '#4dff91', opacity: 0.75 }}
            >
              ← BACK TO FEED
            </Link>

            <CommentSection
              postId={post.id}
              initialComments={comments}
              currentUser={
                session?.user
                  ? { id: (session.user as any).id, name: session.user.name || 'Anonymous' }
                  : null
              }
            />
          </div>

          <div className="flex-1 min-w-0">
            <div style={{ background: '#fef8f3', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ padding: '32px 32px 0' }}>
                <div style={{ fontFamily: "'Poppins', monospace", fontSize: '0.85em', letterSpacing: '0.2em', color: '#149262', opacity: 0.8, marginBottom: '10px' }}>
                  {formatDate(post.published_at)} · {post.artists?.name?.toUpperCase() || 'GAMEBOY RECORDS'}
                </div>

                <h1
                  style={{
                    fontFamily: "'Poppins', monospace",
                    fontSize: '2.2em',
                    color: '#1a1a1a',
                    letterSpacing: '0.06em',
                    lineHeight: 1.25,
                    marginBottom: '16px',
                  }}
                >
                  {post.title}
                </h1>

                <span
                  style={{
                    display: 'inline-block',
                    marginBottom: '28px',
                    fontFamily: "'Poppins', monospace",
                    fontSize: '0.78em',
                    letterSpacing: '0.2em',
                    color: '#149262',
                    border: '1px solid rgba(20,146,98,0.3)',
                    padding: '2px 10px',
                    borderRadius: '2px',
                  }}
                >
                  {post.tag}
                </span>
              </div>

              {post.cover_image_url && (
                <div
                  className="relative w-full aspect-video"
                  style={{ background: '#0c1510' }}
                >
                  {post.cover_media_type === 'video' ? (
                    <video
                      src={post.cover_image_url}
                      className="absolute inset-0 w-full h-full object-contain"
                      controls
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.cover_image_url}
                      alt={post.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}
                </div>
              )}

              <div
                style={{
                  fontFamily: "'Poppins', monospace",
                  fontSize: '1em',
                  color: '#1a1a1a',
                  lineHeight: 1.8,
                  whiteSpace: 'pre-wrap',
                  padding: '32px',
                }}
              >
                {post.body}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}