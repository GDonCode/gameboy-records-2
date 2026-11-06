// components/home/ReleaseCards.tsx
// The featured releases: a framed still, the title and the listen-on buttons. The YouTube button plays
// the video in the site's floating player.
'use client';

import Image from 'next/image';
import ListenOn from '@/components/ListenOn';
import { usePlayer } from '@/components/player/PlayerProvider';
import type { FeaturedRelease } from '@/lib/releases';

export default function ReleaseCards({ releases }: { releases: readonly FeaturedRelease[] }) {
  const { play } = usePlayer();
  return (
    <ul className="list-none p-0 m-0 grid gap-12 md:grid-cols-2 md:gap-10 lg:gap-16">
      {releases.map((r) => (
        <li key={r.youtubeId} className="flex flex-col gap-6">
          <div className="relative aspect-[4/5] overflow-hidden bg-ink border-[3px] border-ink hard">
            <Image src={r.poster} alt={`${r.title}, cover still`} fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
          </div>
          <div>
            <p className="eyebrow text-green-deep m-0 mb-3">{r.artist}</p>
            <h3 className="m-0 display text-[1.6rem] sm:text-[2rem]">{r.title}</h3>
          </div>
          <ListenOn title={r.title} links={r.links} onPlay={() => play(r.youtubeId, r.title)} className="!justify-start" />
        </li>
      ))}
    </ul>
  );
}
