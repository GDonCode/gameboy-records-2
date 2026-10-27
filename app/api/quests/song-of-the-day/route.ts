// app/api/quests/song-of-the-day/route.ts
// Daily quest: open today's song of the day on Spotify, YouTube or Apple Music.
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { awardPoints } from '@/lib/points';
import { localDayKey } from '@/lib/day';
import { SONG_OF_THE_DAY_POINTS, getSongOfTheDay, isStreamPlatform } from '@/lib/song-of-the-day';

export async function POST(request: Request) {
  const session = await auth();

  const user = session?.user as { id?: string; role?: string } | undefined;
  const userId = user?.id;
  if (!userId || user?.role !== 'user') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!isStreamPlatform(body?.platform)) {
    return NextResponse.json({ error: 'Invalid platform' }, { status: 400 });
  }

  // One award per local day: the ref_id is the day, so repeat clicks are no-ops.
  const today = localDayKey();
  const song = getSongOfTheDay(today);
  const balance = await awardPoints(userId, SONG_OF_THE_DAY_POINTS, 'song_of_the_day', `${today}:${song.id}`);

  if (balance === null) {
    return NextResponse.json({ error: 'Failed to record stream' }, { status: 500 });
  }

  return NextResponse.json({ success: true, balance });
}
