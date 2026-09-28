// components/account/ComingSoonTab.tsx
import type { LucideIcon } from 'lucide-react';
import { Panel, TabHeading } from './Panel';

interface ComingSoonTabProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  message: string;
}

export default function ComingSoonTab({ icon: Icon, title, subtitle, message }: ComingSoonTabProps) {
  return (
    <div className="flex flex-col gap-8">
      <TabHeading title={title} subtitle={subtitle} />
      <Panel className="flex flex-col items-center text-center gap-4 py-14">
        <span className="flex items-center justify-center w-16 h-16 rounded-full bg-[#1a9e4a]/15 border border-[#1a9e4a]/40">
          <Icon className="w-7 h-7 text-[#4dff91]" strokeWidth={2} />
        </span>
        <span
          className="px-3 py-1 rounded-full text-[0.7em] tracking-[0.2em] text-[#0c1510] bg-[#4dff91]"
          style={{ fontFamily: "'Share Tech Mono', monospace" }}
        >
          COMING SOON
        </span>
        <p className="max-w-[360px] text-[0.95em] text-white/70" style={{ fontFamily: "'Poppins', monospace" }}>
          {message}
        </p>
      </Panel>
    </div>
  );
}
