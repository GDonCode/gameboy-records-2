// lib/guitar-audio.ts
const MEDIA_BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media`;

// Standard tuning, low to high — lane 0 = low E, lane 5 = high E
export const NOTE_FILES = [
  `${MEDIA_BASE}/guitar/note-e2.mp3`,
  `${MEDIA_BASE}/guitar/note-a2.mp3`,
  `${MEDIA_BASE}/guitar/note-d3.mp3`,
  `${MEDIA_BASE}/guitar/note-g3.mp3`,
  `${MEDIA_BASE}/guitar/note-b3.mp3`,
  `${MEDIA_BASE}/guitar/note-e4.mp3`,
];

let audioCtx: AudioContext | null = null;
const buffers: (AudioBuffer | null)[] = new Array(6).fill(null);
let loaded = false;

export async function loadGuitarNotes(): Promise<void> {
  if (loaded) return;
  audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

  await Promise.all(
    NOTE_FILES.map(async (url, i) => {
      try {
        const res = await fetch(url);
        const arr = await res.arrayBuffer();
        buffers[i] = await audioCtx!.decodeAudioData(arr);
      } catch (err) {
        console.error(`Failed to load guitar note ${i}:`, err);
      }
    })
  );
  loaded = true;
}

export function playNote(laneIndex: number): void {
  if (!audioCtx || !buffers[laneIndex]) return;
  const source = audioCtx.createBufferSource();
  source.buffer = buffers[laneIndex];
  source.connect(audioCtx.destination);
  source.start(0);
}

export function isLoaded(): boolean {
  return loaded;
}