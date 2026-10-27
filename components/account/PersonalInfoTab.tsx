// components/account/PersonalInfoTab.tsx
import AccountAvatar from '@/components/AccountAvatar';
import AddressBook from './AddressBook';
import { Panel, TabHeading } from './Panel';
import ProfileDetails from './ProfileDetails';
import type { AccountUser, Address } from './types';

export default function PersonalInfoTab({
  user,
  memberSince,
  addresses,
}: {
  user: AccountUser;
  memberSince: string;
  addresses: Address[];
}) {
  return (
    <div className="flex flex-col gap-8">
      <TabHeading title="Personal info" subtitle="Your photo, name, email and shipping addresses." />

      <Panel className="flex flex-col gap-6">
        <AccountAvatar displayName={user.display_name} initialAvatarUrl={user.avatar_url} />
        <ProfileDetails user={user} memberSince={memberSince} />
      </Panel>

      <Panel>
        <AddressBook initialAddresses={addresses} />
      </Panel>
    </div>
  );
}
