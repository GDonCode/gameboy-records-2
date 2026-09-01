// scripts/seed-home-news.ts
//
// Migrates the hardcoded home-page news items into the posts table.
// Run once: npx tsx --env-file=.env.local scripts/seed-home-news.ts

import { createClient } from '@supabase/supabase-js';

const HARDCODED_NEWS = [
  { date: '28 MAY 2025', title: 'Behind the Boards: Studio Diary Vol. 3', teaser: 'An inside look at the making of our latest EP, from first session to final mix.', tag: 'STUDIO' },
  { date: '19 MAY 2025', title: 'We Signed Three New Artists This Spring', teaser: 'The roster is growing. Meet the newest members of the Gameboy Records family.', tag: 'ROSTER' },
  { date: '08 MAY 2025', title: 'Fabric Set Recap — What a Night', teaser: 'Sold-out room, incredible energy. Photos and full setlist inside.', tag: 'LIVE' },
  { date: '22 APR 2025', title: 'New Mix Series: Frequencies', teaser: 'A monthly mix dropping every last Friday. First edition from our own DJ roster.', tag: 'MIXES' },
  { date: '10 APR 2025', title: 'How We Record: The Signal Chain', teaser: 'A deep dive into our studio setup — from outboard gear to software routing.', tag: 'STUDIO' },
  { date: '01 APR 2025', title: 'Gameboy Records Turns Two', teaser: "Two years in. What we learned, and what's next.", tag: 'LABEL' },
];

function slugify(title: string) {
  return title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').slice(0, 80);
}

function parseHardcodedDate(d: string) {
  // "28 MAY 2025" -> ISO date
  return new Date(d).toISOString();
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env.');
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Assumes a single artist account exists — adjust the .eq() filter if you have multiple by now.
  const { data: artist, error: artistError } = await supabase
    .from('artists')
    .select('id, name')
    .limit(1)
    .single();

  if (artistError || !artist) {
    throw new Error('Could not find an artist to attribute these posts to: ' + artistError?.message);
  }

  console.log(`Attributing ${HARDCODED_NEWS.length} posts to artist: ${artist.name}`);

  for (const item of HARDCODED_NEWS) {
    const slug = `${slugify(item.title)}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const publishedAt = parseHardcodedDate(item.date);

    const { error } = await supabase.from('posts').insert({
      author_id: artist.id,
      title: item.title,
      slug,
      teaser: item.teaser,
      body: item.teaser, // no full body existed in the hardcoded version — using teaser as placeholder body
      tag: item.tag,
      status: 'published',
      published_at: publishedAt,
    });

    if (error) {
      console.error(`❌ Failed to insert "${item.title}":`, error.message);
    } else {
      console.log(`✅ Inserted "${item.title}"`);
    }
  }
}

main();