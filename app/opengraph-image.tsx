// app/opengraph-image.tsx — the share card used when a page doesn't set its own image.
import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const alt = 'Gameboy Records — independent label of Alexx A-Game';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  const [semi, regular] = await Promise.all([
    readFile(join(process.cwd(), 'public/fonts/Poppins/Poppins-SemiBold.ttf')),
    readFile(join(process.cwd(), 'public/fonts/Poppins/Poppins-Regular.ttf')),
  ]);
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '72px 80px', background: '#0B0A07', fontFamily: 'Poppins' }}>
        <div style={{ fontSize: 22, letterSpacing: 8, color: '#E2BA0A', textTransform: 'uppercase', marginBottom: 28 }}>Gameboy Records · Founded by Alexx A-Game</div>
        <div
          style={{
            fontSize: 104,
            fontWeight: 600,
            lineHeight: 1.02,
            letterSpacing: 8,
            color: '#d9ffe8',
            textTransform: 'uppercase',
            textShadow: '0 0 6px rgba(77,255,145,0.6), 0 0 24px rgba(77,255,145,0.35)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <span>Realest sound.</span>
          <span>Truest vision.</span>
        </div>
        <div style={{ marginTop: 36, height: 6, width: 160, background: '#2C8663' }} />
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Poppins', data: semi, weight: 600, style: 'normal' },
        { name: 'Poppins', data: regular, weight: 400, style: 'normal' },
      ],
    }
  );
}
