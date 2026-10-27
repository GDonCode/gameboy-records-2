// components/account/PersonalInfoTab.tsx
import { MapPin } from 'lucide-react';
import AccountAvatar from '@/components/AccountAvatar';
import { Panel, TabHeading } from './Panel';
import type { AccountUser } from './types';

export default function PersonalInfoTab({ user, memberSince }: { user: AccountUser; memberSince: string }) {
  const rows = [
    { label: 'Name', value: user.display_name },
    { label: 'Email', value: user.email },
    { label: 'Member since', value: memberSince },
    { label: 'Points', value: (user.points_balance ?? 0).toLocaleString('en-US') },
  ];

  return (
    <div className="flex flex-col gap-8">
      <TabHeading title="Personal info" subtitle="Your photo, name, email and shipping address." />

      <Panel className="flex flex-col gap-8">
        <AccountAvatar displayName={user.display_name} initialAvatarUrl={user.avatar_url} />

        <dl className="flex flex-col divide-y divide-white/10" style={{ fontFamily: "'Poppins', sans-serif" }}>
          {rows.map((row) => (
            <div key={row.label} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6 py-4">
              <dt className="sm:w-[160px] text-[0.85em] text-white/50">{row.label}</dt>
              <dd className="text-white break-all">{row.value}</dd>
            </div>
          ))}
        </dl>
      </Panel>

      <Panel className="flex flex-col gap-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-[1.15em] text-white" style={{ fontFamily: "'Poppins_semibold', sans-serif" }}>
            Shipping address
          </h2>
          <span
            className="px-3 py-1 rounded-full text-[0.7em] tracking-[0.2em] text-[#0c1510] bg-[#4dff91]"
            style={{ fontFamily: "'Poppins_semibold', sans-serif" }}
          >
            COMING SOON
          </span>
        </div>
        <div className="flex items-center gap-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
          <span className="flex items-center justify-center w-12 h-12 flex-shrink-0 rounded-full bg-[#1a9e4a]/15 border border-[#1a9e4a]/40">
            <MapPin className="w-5 h-5 text-[#4dff91]" strokeWidth={2} />
          </span>
          <p className="text-[0.95em] text-white/70">
            You&apos;ll be able to save shipping addresses here for faster checkout.
          </p>
        </div>
      </Panel>
    </div>
  );
}
