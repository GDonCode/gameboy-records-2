// app/about/page.tsx — About Alexx A-Game
import type { Metadata } from 'next';
import Image from 'next/image';
import PageShell from '@/components/PageShell';
import NeonHeading from '@/components/NeonHeading';
import JsonLd from '@/components/JsonLd';
import Icon from '@/components/icons';
import Button from '@/components/ui/Button';
import { ARTIST, CLUB_NAME, MEDIA_BASE, OG_IMAGE, SITE_NAME, SITE_URL, SOCIAL } from '@/lib/site';

const PORTRAIT = (n: 1 | 2 | 3 | 4) => `${MEDIA_BASE}/portrait${n}.jpg`;

export const metadata: Metadata = {
  title: 'About',
  description: `${ARTIST} is a Jamaican singer, songwriter and guitarist, and the founder of ${SITE_NAME}. From A-Game Everyday to Still A Rise.`,
  alternates: { canonical: '/about' },
  openGraph: {
    url: '/about',
    title: `About ${ARTIST}`,
    type: 'profile',
    images: [{ url: PORTRAIT(3), alt: `${ARTIST}, portrait` }, OG_IMAGE],
  },
};

const person = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: ARTIST,
  url: `${SITE_URL}/about`,
  image: [PORTRAIT(1), PORTRAIT(2), PORTRAIT(3), PORTRAIT(4)],
  jobTitle: 'Singer, songwriter and guitarist',
  nationality: 'Jamaican',
  founder: { '@id': `${SITE_URL}/#label` },
  sameAs: [SOCIAL.spotify, SOCIAL.appleMusic, SOCIAL.youtube, SOCIAL.tiktok, SOCIAL.audiomack, SOCIAL.soundcloud],
};

/** A portrait in a frame that holds still while the photo zooms on hover. */
function Portrait({ n, alt, className = '', sizes, priority }: { n: 1 | 2 | 3 | 4; alt: string; className?: string; sizes: string; priority?: boolean }) {
  return (
    <figure className={`zoom-media relative m-0 overflow-hidden bg-ink-2 ${className}`}>
      <Image src={PORTRAIT(n)} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
    </figure>
  );
}

export default function AboutPage() {
  return (
    <PageShell>
      <JsonLd data={person} />

      {/* Title */}
      <section className="bg-ink pt-16 pb-12 md:pt-24 md:pb-16">
        <div className="container-site">
          <NeonHeading kicker="Singer · Songwriter · Guitarist" subtitle={`Founder of ${SITE_NAME}`}>
            {ARTIST}
          </NeonHeading>
        </div>
      </section>

      {/* 1 — Introduction */}
      <section aria-label="Introduction" className="bg-ink pb-20 md:pb-28">
        <div className="container-site grid gap-10 lg:grid-cols-12 lg:items-center">
          <Portrait n={1} alt={`${ARTIST} in a green beret and black suit, one hand raised to his face`} className="aspect-[4/5] lg:col-span-6" sizes="(min-width: 1024px) 50vw, 100vw" priority />
          <div className="lg:col-span-5 lg:col-start-8 flex flex-col gap-6 text-[1.05rem] leading-relaxed text-paper/85">
            <p className="m-0 text-[1.35rem] md:text-[1.6rem] leading-snug text-paper">
              {ARTIST} is a Jamaican singer, songwriter and guitarist, and the founder of {SITE_NAME}.
            </p>
            <p className="m-0">
              His music lives where reggae and dancehall meet: melodic, direct, and built around one message that runs
              through everything he puts out. Rise up, whatever is in front of you.
            </p>
          </div>
        </div>
      </section>

      {/* 2 — Beginnings */}
      <section aria-labelledby="about-start" className="on-light bg-bone text-ink section-y">
        <div className="container-site grid gap-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5 flex flex-col gap-6 text-[1.05rem] leading-relaxed text-stone order-2 lg:order-1">
            <h2 id="about-start" className="display m-0 text-[2rem] md:text-[2.75rem] text-ink">
              The start
            </h2>
            <p className="m-0">
              He released his first music video, A-Game Everyday, in 2014. Rise Up Now followed in 2016, and it has stayed
              at the centre of his catalogue ever since, alongside Only Time Will Tell on the Cloud 10 Riddim.
            </p>
            <p className="m-0">
              2018 brought Go Harda and Double, a collaboration with Tory Lanez. In 2019 he linked with Ding Dong on Chuck It
              and appeared on the Lonely Road Riddim with Real To Di Link.
            </p>
          </div>
          <Portrait n={2} alt={`${ARTIST} in dark sunglasses and a sleeveless black top, against a white background`} className="aspect-square lg:col-span-6 lg:col-start-7 order-1 lg:order-2" sizes="(min-width: 1024px) 50vw, 100vw" />
        </div>
      </section>

      {/* Pull quote */}
      <section aria-label="In his words" className="bg-ink section-y">
        <figure className="container-site m-0 text-center">
          <blockquote className="m-0">
            <p className="neon-heading neon-heading--lg m-0 mx-auto max-w-[20ch]">Time fi every go getta rise up.</p>
          </blockquote>
          <figcaption className="mt-6 eyebrow text-gold-light">{ARTIST} · Rise Up Now (Guitar Version)</figcaption>
        </figure>
      </section>

      {/* 3 — Growth */}
      <section aria-labelledby="about-growth" className="bg-ink pb-20 md:pb-28">
        <div className="container-site grid gap-10 lg:grid-cols-12 lg:items-center">
          <Portrait n={3} alt={`${ARTIST} in a tan suede jacket and sunglasses, standing in low light`} className="aspect-[2/3] max-h-[760px] lg:col-span-5" sizes="(min-width: 1024px) 42vw, 100vw" />
          <div className="lg:col-span-6 lg:col-start-7 flex flex-col gap-6 text-[1.05rem] leading-relaxed text-paper/85">
            <h2 id="about-growth" className="display m-0 text-[2rem] md:text-[2.75rem] text-paper">
              The work
            </h2>
            <p className="m-0">
              Life Of a G and My Typa Badness arrived in 2020. Hurt Inside, in 2023, and More Life, in 2024, showed a more
              personal side of his writing.
            </p>
            <p className="m-0">
              In 2024 he walked the red carpet at the premiere of Bob Marley: One Love.
            </p>
            <p className="m-0">
              Everything he releases goes out through {SITE_NAME}, the label he built to keep his music, his merch and his
              shows in his own hands.
            </p>
          </div>
        </div>
      </section>

      {/* 4 — Now */}
      <section aria-labelledby="about-now" className="relative isolate overflow-hidden bg-ink">
        <div className="grid lg:grid-cols-2">
          <Portrait n={4} alt={`${ARTIST} on stage, singing into a microphone with an electric guitar`} className="aspect-[4/5] lg:aspect-auto lg:min-h-[720px]" sizes="(min-width: 1024px) 50vw, 100vw" />
          <div className="flex items-center px-4 py-16 md:px-12 lg:px-16">
            <div className="flex flex-col gap-6 max-w-[48ch] text-[1.05rem] leading-relaxed text-paper/85">
              <h2 id="about-now" className="display m-0 text-[2rem] md:text-[2.75rem] text-paper">
                Now
              </h2>
              <p className="m-0">
                In 2026 he went back to where it started. Rise Up Now, re-recorded with one guitar and one voice, and Still
                A Rise, a song for anyone who has been counted out and kept going anyway.
              </p>
              <p className="m-0">
                On stage it is the same: the guitar in his hands and the message front and centre.
              </p>
              <p className="m-0">
                The {CLUB_NAME} is where his supporters come first, with early access to new music, merch and show tickets.
              </p>
              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <Button href="/music" variant="primary" size="lg">
                  <Icon name="play" className="w-3 h-3" />
                  Hear the music
                </Button>
                <Button href="/shows" variant="outline" size="lg">
                  Shows
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
