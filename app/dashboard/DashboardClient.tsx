// app/dashboard/DashboardClient.tsx
'use client';

import { useState } from 'react';
import MyPostsList, { DashboardPost } from '@/components/MyPostsList';
import PostForm from '@/components/PostForm';
import AccountSettings, { DashboardArtist } from '@/components/AccountSettings';

type View = 'posts-list' | 'post-new' | 'post-edit' | 'settings';

interface DashboardClientProps {
  initialArtist: DashboardArtist & { is_admin: boolean; created_at: string };
  initialPosts: DashboardPost[];
  signOutAction: () => Promise<void>;
}

export default function DashboardClient({ initialArtist, initialPosts, signOutAction }: DashboardClientProps) {
  const [view, setView] = useState<View>('posts-list');
  const [artist, setArtist] = useState(initialArtist);
  const [editingPost, setEditingPost] = useState<DashboardPost | null>(null);

  function handleArtistUpdated(updated: DashboardArtist) {
    setArtist((prev) => ({ ...prev, ...updated }));
  }

  function handleEditPost(post: DashboardPost) {
    setEditingPost(post);
    setView('post-edit');
  }

  function handleFormSaved() {
    setEditingPost(null);
    setView('posts-list');
  }

  const memberSince = new Date(initialArtist.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Top banner */}
      <div className="flex items-center gap-5 px-8 py-6 bg-[#0f1a12] border-b border-[rgba(26,158,74,0.25)] flex-shrink-0">
        {artist.portrait_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={artist.portrait_url}
            alt={artist.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-[#4dff91]"
          />
        ) : (
          <div className="w-16 h-16 rounded-full flex items-center justify-center border-2 border-[#4dff91] text-white/50 text-[0.65em]" style={{ fontFamily: "'Arvo', monospace" }}>
            NO PHOTO
          </div>
        )}
        <div className="flex flex-col gap-1">
          <span
            className="text-[1.3em] tracking-[0.08em] text-[#4dff91]"
            style={{ fontFamily: "'Hemisphers Bold Sans', monospace" }}
          >
            WELCOME, {artist.name.toUpperCase()}
          </span>
          <div className="flex items-center gap-4 text-[0.78em] text-white/50" style={{ fontFamily: "'Arvo', monospace" }}>
            <span>{artist.email}</span>
            <span>Member since {memberSince}</span>
            {initialArtist.is_admin && <span className="text-[#4dff91]">Administrator</span>}
          </div>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <aside className="w-[220px] flex-shrink-0 bg-[#0c1510] border-r border-[rgba(26,158,74,0.2)] flex flex-col py-6">
          <button
            onClick={() => setView('posts-list')}
            className={`text-left px-6 py-3 text-[0.85em] tracking-[0.1em] transition-colors ${
              view === 'posts-list' || view === 'post-new' || view === 'post-edit'
                ? 'text-[#4dff91] bg-[rgba(26,158,74,0.1)]'
                : 'text-white/60 hover:text-white'
            }`}
            style={{ fontFamily: "'Hemisphers Bold Sans', monospace" }}
          >
            MY POSTS
          </button>
          <button
            onClick={() => setView('settings')}
            className={`text-left px-6 py-3 text-[0.85em] tracking-[0.1em] transition-colors ${
              view === 'settings' ? 'text-[#4dff91] bg-[rgba(26,158,74,0.1)]' : 'text-white/60 hover:text-white'
            }`}
            style={{ fontFamily: "'Hemisphers Bold Sans', monospace" }}
          >
            ACCOUNT SETTINGS
          </button>
          <form action={signOutAction} className="mt-auto">
            <button
              type="submit"
              className="text-left w-full px-6 py-3 text-[0.85em] tracking-[0.1em] text-[#ff6b6b] hover:bg-[rgba(255,107,107,0.08)] transition-colors"
              style={{ fontFamily: "'Hemisphers Bold Sans', monospace" }}
            >
              LOG OUT
            </button>
          </form>
        </aside>

        {/* Content */}
        <main className="flex-1 min-h-0 overflow-y-auto px-10 py-10" style={{ background: 'linear-gradient(160deg, #1c2e20 0%, #181f1a 60%, #10160f 100%)' }}>
          {view === 'posts-list' && (
            <MyPostsList posts={initialPosts} onCreateNew={() => setView('post-new')} onEditPost={handleEditPost} />
          )}
          {view === 'post-new' && <PostForm onSaved={handleFormSaved} />}
          {view === 'post-edit' && editingPost && <PostForm post={editingPost} onSaved={handleFormSaved} />}
          {view === 'settings' && <AccountSettings artist={artist} onArtistUpdated={handleArtistUpdated} />}
        </main>
      </div>
    </div>
  );
}