// scripts/seed-first-artist.ts
//
// Run once to create the first artist account.
// Usage: npx tsx scripts/seed-first-artist.ts
//
// Required env vars (.env.local or shell):
//   NEXT_PUBLIC_SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY   <-- service role, NEVER expose client-side
//
// Edit the ARTIST object below before running.

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const ARTIST = {
  email: 'alexx@gameboyrecords.com',   // ← set real login email
  password: 'password123', // ← set real temp password
  name: 'Alexx A-Game',
  role: 'GAMEBOY RECORDS · ARTIST',
  portrait_url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/agame-portrait.jpg`,
  channel_id: 'UC2M7qSo99KTIq-WgnCNq50Q',
  is_admin: true, // only artist on the label — make admin so they can manage the roster later
};

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env.');
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const passwordHash = await bcrypt.hash(ARTIST.password, 12);

  const { data, error } = await supabase
    .from('artists')
    .insert({
      email: ARTIST.email,
      password_hash: passwordHash,
      name: ARTIST.name,
      role: ARTIST.role,
      portrait_url: ARTIST.portrait_url,
      channel_id: ARTIST.channel_id,
      is_admin: ARTIST.is_admin,
    })
    .select('id, email, name, is_admin')
    .single();

  if (error) {
    console.error('❌ Failed to create artist:', error.message);
    process.exit(1);
  }

  console.log('✅ Artist account created:');
  console.log(data);
  console.log('\n⚠️  Now delete or blank out the password in this file, and tell the artist to log in and change it.');
}

main();