// app/api/account/avatar/route.ts
// Upload (POST) or remove (DELETE) the member's profile photo.
import { NextResponse } from 'next/server';
import { getMemberId } from '@/lib/account-session';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { awardPoints } from '@/lib/points';
import { PROFILE_PHOTO_POINTS } from '@/lib/quests';

const BUCKET = 'user-avatars';
const MAX_BYTES = 5 * 1024 * 1024;

// The file's real type comes from its first bytes, not from the browser-supplied name or MIME type.
function sniffImageType(bytes: Uint8Array): { type: string; ext: string } | null {
  const at = (i: number) => bytes[i];
  if (at(0) === 0xff && at(1) === 0xd8 && at(2) === 0xff) return { type: 'image/jpeg', ext: 'jpg' };
  if (at(0) === 0x89 && at(1) === 0x50 && at(2) === 0x4e && at(3) === 0x47) return { type: 'image/png', ext: 'png' };
  if (at(0) === 0x47 && at(1) === 0x49 && at(2) === 0x46 && at(3) === 0x38) return { type: 'image/gif', ext: 'gif' };
  const ascii = (from: number, to: number) => String.fromCharCode(...bytes.slice(from, to));
  if (ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') return { type: 'image/webp', ext: 'webp' };
  return null;
}

// Removes the member's stored photos, except `keep` (the file just uploaded).
async function removeStoredPhotos(userId: string, keep?: string) {
  const { data, error } = await supabaseAdmin.storage.from(BUCKET).list(userId, { limit: 100 });
  if (error) {
    console.error('Failed to list old avatars:', error.message);
    return;
  }
  const stale = (data ?? []).map((f) => `${userId}/${f.name}`).filter((p) => p !== keep);
  if (stale.length === 0) return;
  const { error: removeError } = await supabaseAdmin.storage.from(BUCKET).remove(stale);
  if (removeError) console.error('Failed to remove old avatars:', removeError.message);
}

export async function POST(request: Request) {
  const userId = await getMemberId();
  if (!userId) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const formData = await request.formData().catch(() => null);
  const file = formData?.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: 'Choose an image to upload.' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Image must be under 5 MB.' }, { status: 400 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const kind = sniffImageType(bytes);
  if (!kind) {
    return NextResponse.json({ error: 'Use a JPG, PNG, WebP or GIF image.' }, { status: 400 });
  }

  const path = `${userId}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${kind.ext}`;
  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, bytes, { contentType: kind.type, cacheControl: '31536000' });

  if (uploadError) {
    console.error('Avatar upload failed:', uploadError.message);
    return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 });
  }

  const { data: publicUrlData } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);

  const { error: updateError } = await supabaseAdmin
    .from('users')
    .update({ avatar_url: publicUrlData.publicUrl })
    .eq('id', userId);

  if (updateError) {
    console.error('Failed to save avatar URL:', updateError.message);
    await supabaseAdmin.storage.from(BUCKET).remove([path]);
    return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 });
  }

  await removeStoredPhotos(userId, path);
  await awardPoints(userId, PROFILE_PHOTO_POINTS, 'profile_photo');

  return NextResponse.json({ url: publicUrlData.publicUrl });
}

export async function DELETE() {
  const userId = await getMemberId();
  if (!userId) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const { error } = await supabaseAdmin.from('users').update({ avatar_url: null }).eq('id', userId);
  if (error) {
    console.error('Failed to clear avatar:', error.message);
    return NextResponse.json({ error: 'Could not remove your photo. Please try again.' }, { status: 500 });
  }

  await removeStoredPhotos(userId);
  return NextResponse.json({ url: null });
}
