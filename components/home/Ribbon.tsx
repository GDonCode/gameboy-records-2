// components/home/Ribbon.tsx
// A slow ticker of what the label does. Decorative, so it is hidden from screen readers and stops for reduced motion.
const WORDS = ['New music', 'Exclusive merch', 'Live shows', 'Karaoke', 'Trivia', 'Earn Points'];

export default function Ribbon() {
  return (
    <div aria-hidden="true" className="bg-ink text-gold overflow-hidden border-y-[3px] border-ink">
      <div className="ribbon-track">
        {[0, 1].map((copy) => (
          <ul key={copy} className="flex shrink-0 list-none p-0 m-0">
            {WORDS.map((w) => (
              <li key={w} className="flex items-center gap-7 pr-7 py-3.5 text-[1rem] font-bold uppercase tracking-[0.24em] whitespace-nowrap">
                {w}
                <span className="inline-block w-2 h-2 bg-green" />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
