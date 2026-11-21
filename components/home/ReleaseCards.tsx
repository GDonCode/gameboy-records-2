// components/home/ReleaseCards.tsx
// The featured releases: a framed still, the title and the listen-on buttons. The YouTube button plays
// the video in the site's floating player.
'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import ListenOn from '@/components/ListenOn';
import Button from '@/components/ui/Button';
import Icon from '@/components/icons';
import { usePlayer } from '@/components/player/PlayerProvider';
import type { FeaturedRelease } from '@/lib/releases';

/** Averages the poster's colour, darkened, for the card's 3D edge. Falls back to the brand green. */
const FALLBACK_EDGE = '#05652E';
function useEdgeColor(imgRef: React.RefObject<HTMLImageElement | null>) {
  const [edge, setEdge] = useState(FALLBACK_EDGE);
  function sample() {
    const img = imgRef.current;
    if (!img || !img.complete || !img.naturalWidth) return;
    try {
      const c = document.createElement('canvas');
      c.width = c.height = 16;
      const ctx = c.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, 16, 16);
      const d = ctx.getImageData(0, 0, 16, 16).data;
      let r = 0, g = 0, b = 0;
      for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2]; }
      const n = d.length / 4;
      const k = 0.6; // darken so the edge reads as the card's side
      setEdge(`rgb(${Math.round((r / n) * k)}, ${Math.round((g / n) * k)}, ${Math.round((b / n) * k)})`);
    } catch {
      /* canvas blocked: keep the fallback */
    }
  }
  useEffect(sample, [imgRef]);
  return { edge, sample };
}

// A stack of 1px steps down and to the right reads as a solid edge, not a soft shadow.
const extrude = (color: string) =>
  Array.from({ length: 10 }, (_, i) => `${i + 1}px ${i + 1}px 0 ${color}`).join(', ');

function ReleaseImage({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLImageElement>(null);
  const { edge, sample } = useEdgeColor(ref);
  return (
    <div className="relative aspect-[4/5] bg-ink mr-2.5 mb-2.5" style={{ boxShadow: extrude(edge) }}>
      <div className="absolute inset-0 overflow-hidden">
        <Image ref={ref} src={src} alt={alt} fill crossOrigin="anonymous" onLoad={sample} sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
      </div>
    </div>
  );
}

export default function ReleaseCards({ releases }: { releases: readonly FeaturedRelease[] }) {
  const { play } = usePlayer();
  return (
    <>
    <ul className="list-none p-0 m-0 grid gap-12 md:grid-cols-2 md:gap-10 lg:gap-16">
      {releases.map((r) => (
        <li key={r.youtubeId} className="flex flex-col gap-6">
          <ReleaseImage src={r.poster} alt={`${r.title}, cover still`} />
          <div>
            <p className="eyebrow text-green-deep m-0 mb-3">{r.artist}</p>
            <h3 className="m-0 display text-[1.6rem] sm:text-[2rem]">{r.title}</h3>
          </div>
          <ListenOn title={r.title} links={r.links} onPlay={() => play(r.youtubeId, r.title)} className="!justify-start" compactOnPhone />
        </li>
      ))}
    </ul>
    <div className="mt-12 md:mt-16 flex justify-center">
      <Button href="/music" variant="green" size="lg">
        View full discography
        <Icon name="arrow-right" className="w-3.5 h-3.5" />
      </Button>
    </div>
    </>
  );
}
