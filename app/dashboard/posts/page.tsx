// app/dashboard/posts/page.tsx
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import DeletePostButton from '@/components/DeletePostButton';

export const revalidate = 0;

interface OwnPost {
  id: string;
  title: string;
  slug: string;
  tag: string;
  status: string;
  created_at: string;
}

export default async function MyPostsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/account/login');

  const { data: posts, error } = await supabaseAdmin
    .from('posts')
    .select('id, title, slug, tag, status, created_at')
    .eq('author_id', session.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch own posts:', error.message);
  }

  const rows = (posts || []) as OwnPost[];

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '60px 24px',
        background: 'linear-gradient(160deg, #1c2e20 0%, #181f1a 60%, #10160f 100%)',
      }}
    >
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
          <h1
            style={{
              fontFamily: "'Poppins', monospace",
              fontSize: '1.8em',
              color: '#4dff91',
              letterSpacing: '0.1em',
              textShadow: '0 0 20px rgba(77,255,145,0.25)',
            }}
          >
            MY POSTS
          </h1>
          <Link
            href="/dashboard/posts/new"
            className="no-underline"
            style={{
              fontFamily: "'Poppins', monospace",
              fontSize: '0.8em',
              letterSpacing: '0.12em',
              color: '#fff',
              background: 'linear-gradient(175deg, #22b85a 0%, #178f42 100%)',
              border: '1px solid #1a9e4a',
              padding: '10px 18px',
              borderRadius: '2px',
            }}
          >
            + NEW POST
          </Link>
        </div>

        {rows.length === 0 ? (
          <p style={{ fontFamily: "'Poppins', monospace", color: 'rgba(255,255,255,0.5)' }}>
            You haven&apos;t written anything yet.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {rows.map((post) => (
              <div
                key={post.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(26,158,74,0.2)',
                  borderRadius: '4px',
                }}
              >
                <div>
                  <div style={{ fontFamily: "'Poppins', monospace", color: '#fff', fontSize: '0.95em', marginBottom: '4px' }}>
                    {post.title}
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span
                      style={{
                        fontFamily: "'Poppins', monospace",
                        fontSize: '0.75em',
                        letterSpacing: '0.14em',
                        color: post.status === 'published' ? '#4dff91' : 'rgba(255,255,255,0.5)',
                        border: `1px solid ${post.status === 'published' ? 'rgba(77,255,145,0.35)' : 'rgba(255,255,255,0.25)'}`,
                        padding: '2px 8px',
                        borderRadius: '2px',
                      }}
                    >
                      {post.status.toUpperCase()}
                    </span>
                    <span style={{ fontFamily: "'Poppins', monospace", fontSize: '0.75em', color: 'rgba(255,255,255,0.4)' }}>
                      {post.tag}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <Link
                    href={`/dashboard/posts/${post.id}/edit`}
                    className="no-underline"
                    style={{
                      fontFamily: "'Poppins', monospace",
                      fontSize: '0.78em',
                      color: '#4dff91',
                      border: '1px solid rgba(77,255,145,0.35)',
                      padding: '6px 14px',
                      borderRadius: '2px',
                    }}
                  >
                    EDIT
                  </Link>
                  <DeletePostButton postId={post.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}