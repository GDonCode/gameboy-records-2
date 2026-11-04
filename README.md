# Gameboy Records

The website of Gameboy Records, the independent label founded by Alexx A-Game: music, limited apparel,
live shows and the Playaz Club membership (Club Points, quests and rewards).

**Stack:** Next.js 16 (App Router, TypeScript) · Tailwind CSS 4 · Supabase · Auth.js · WooCommerce + Tapstitch · Hostinger

```bash
npm ci
cp .env.example .env.local   # fill in the values
npm run dev                  # http://localhost:3000
```

## Where things live

| Page | Route | Notes |
| --- | --- | --- |
| Home | `app/page.tsx` | Hero, apparel feature, two featured releases (`lib/releases.ts`), shows call to action |
| Shop | `app/shop` | Products from WooCommerce (`lib/catalog.ts`); search, filters and sort in the URL (`lib/shop-filters.ts`) |
| Cart / checkout | `app/cart`, `app/api/checkout` | Creates the WooCommerce order and opens its secure payment page |
| Orders + Club Points | `app/api/webhooks/woocommerce` | Mirrors paid orders into Supabase and awards Club Points (`lib/club.ts`) |
| Shows | `app/shows`, `lib/shows.ts` | Add dates in `lib/shows.ts` |
| Music | `app/music`, `lib/discography.ts` | Official releases from the artist's YouTube channel, looping reel |
| Karaoke / Trivia | `app/karaoke`, `app/trivia` | |
| Playaz Club | `app/account` | Members' area; the join invitation is `components/PlayazClubPopup.tsx` |

**Design system:** tokens and shared styles in `app/globals.css`; `components/ui/Button.tsx`, `components/icons.tsx`,
`components/NeonHeading.tsx` (page titles). Contact details and social links: `lib/site.ts`.

**Placeholders:** images still to be supplied point at `public/assets/placeholder.jpg` and are marked
`This is a placeholder image` in the code. Replace the file (or the paths) with real photography.

Deployment: see [DEPLOY.md](DEPLOY.md).
