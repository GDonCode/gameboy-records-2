// components/home/VibesLaunch.tsx
// Launcher for the two games. Karaoke and Trivia are full, stateful, audio-driven pages, so Home only points at them.
import Button from '@/components/ui/Button';
import Icon from '@/components/icons';
import GameIconsBackground from '@/components/GameIconsBackground';
import SectionTitle from '@/components/home/SectionTitle';

const GAMES = [
  {
    href: '/karaoke',
    title: 'Karaoke',
    kicker: 'Sing along',
    blurb: 'Pick a record from the catalogue and sing it with the lyrics on screen.',
    cta: 'Start singing',
    icon: 'microphone-lines',
  },
  {
    href: '/trivia',
    title: 'Do You Know A-Game?',
    kicker: "Prove you're a fan",
    blurb: 'Three rounds, fifteen questions, ten seconds each. Top the leaderboard and earn Club Points.',
    cta: 'Play trivia',
    // Placeholder: Font Awesome Pro's "messages-question" (Solid) is wanted here once it is added to components/icons.tsx.
    icon: 'circle-question',
  },
] as const;

export default function VibesLaunch() {
  return (
    <section id="vibes" aria-labelledby="vibes-title" tabIndex={-1} className="on-ink paper-ink relative overflow-hidden text-paper section-y outline-none">
      <GameIconsBackground />
      <div className="relative z-[1] container-site max-w-[1000px]">
        <SectionTitle ghost="Play" id="vibes-title" tone="dark">
          Vibes
        </SectionTitle>
        <ul className="list-none p-0 m-0 grid gap-5 md:grid-cols-2 md:gap-8">
          {GAMES.map((g) => {
            return (
              <li key={g.href} className="panel-ink flex flex-col gap-4 p-7 md:p-9">
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-green shadow-[4px_4px_0_#E2BA0A]" aria-hidden="true">
                  <Icon name={g.icon} className="h-6 w-6 text-white" />
                </span>
                <p className="eyebrow m-0 text-gold">{g.kicker}</p>
                <h3 className="display m-0 text-[1.6rem] md:text-[2rem]">{g.title}</h3>
                <p className="m-0 max-w-[40ch] text-paper/80 leading-relaxed">{g.blurb}</p>
                <div className="mt-auto pt-3">
                  <Button href={g.href} variant="primary" size="lg">
                    {g.cta}
                    <Icon name="arrow-right" className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
