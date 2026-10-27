// app/api/discography/route.ts
// More of the Discography feed for infinite scroll: GET /api/discography?pageToken=…
import { NextResponse } from 'next/server';
import { getDiscographyPage, isPageToken } from '@/lib/discography';

export async function GET(request: Request) {
  const pageToken = new URL(request.url).searchParams.get('pageToken');
  if (pageToken !== null && !isPageToken(pageToken)) {
    return NextResponse.json({ error: 'Invalid page token.' }, { status: 400 });
  }
  const page = await getDiscographyPage(pageToken);
  return NextResponse.json(page, {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
  });
}
