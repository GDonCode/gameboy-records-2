// components/account/PersonalInfoTab.tsx
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
      <TabHeading title="Personal info" subtitle="Your photo, name and email." />

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
    </div>
  );
}
