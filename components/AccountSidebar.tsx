// components/AccountSidebar.tsx
'use client';

import {
  House,
  Truck,
  ReceiptText,
  Heart,
  UserRound,
  MapPin,
  Lock,
  CreditCard,
  MessageCircleMore,
  LogOut,
  type LucideIcon,
} from 'lucide-react';
import type { AccountTab } from '@/components/account/types';

interface NavItem {
  tab: AccountTab;
  label: string;
  subtitle: string;
  icon: LucideIcon;
}

interface NavGroup {
  heading: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    heading: 'Account',
    items: [
      { tab: 'home', label: 'Home', subtitle: 'Rewards & overview', icon: House },
      { tab: 'orders', label: 'My orders', subtitle: 'Track, manage & return', icon: Truck },
      { tab: 'archived', label: 'Archived orders', subtitle: 'Past & completed orders', icon: ReceiptText },
      { tab: 'saved', label: 'Saved items', subtitle: 'Merch you saved for later', icon: Heart },
    ],
  },
  {
    heading: 'Settings',
    items: [
      { tab: 'personal', label: 'Personal info', subtitle: 'Photo, name & email', icon: UserRound },
      { tab: 'addresses', label: 'Your addresses', subtitle: 'Add a shipping address', icon: MapPin },
      { tab: 'security', label: 'Login & security', subtitle: 'Password & sign-in', icon: Lock },
      { tab: 'payments', label: 'Payments', subtitle: 'Add a payment method', icon: CreditCard },
    ],
  },
];

const SUPPORT_ITEM: NavItem = {
  tab: 'support',
  label: 'Customer support',
  subtitle: 'Get help with orders & more',
  icon: MessageCircleMore,
};

interface AccountSidebarProps {
  displayName: string;
  avatarUrl: string | null;
  activeTab: AccountTab;
  onSelectTab: (tab: AccountTab) => void;
  signOutAction: () => Promise<void>;
  className?: string;
}

const ROW_BASE =
  'group flex items-center gap-4 w-full pl-3 pr-3 py-2.5 rounded-r-[10px] border-l-[3px] text-left transition-colors duration-200 cursor-pointer';
const ROW_IDLE = 'border-transparent text-[#16432a] hover:bg-[#1a9e4a]/10';
const ROW_ACTIVE = 'border-[#1a9e4a] bg-[#1a9e4a]/15 text-[#1a9e4a]';

function IconTile({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="flex items-center justify-center w-10 h-10 flex-shrink-0 rounded-[8px] bg-white border border-[#16432a]/10 shadow-[0_1px_2px_rgba(22,67,42,0.08)]">
      <Icon className="w-5 h-5 text-[#1a9e4a]" strokeWidth={2.25} />
    </span>
  );
}

function RowText({ label, subtitle }: { label: string; subtitle: string }) {
  return (
    <span className="flex flex-col min-w-0">
      <span style={{ fontFamily: "'Poppins_semibold', 'Poppins', sans-serif" }}>{label}</span>
      <span className="text-[0.8em] text-[#16432a]/60">{subtitle}</span>
    </span>
  );
}

export default function AccountSidebar({
  displayName,
  avatarUrl,
  activeTab,
  onSelectTab,
  signOutAction,
  className = '',
}: AccountSidebarProps) {
  const firstName = displayName.split(' ')[0] || displayName;

  const renderItem = (item: NavItem) => {
    const active = item.tab === activeTab;
    return (
      <button
        key={item.tab}
        type="button"
        onClick={() => onSelectTab(item.tab)}
        aria-current={active ? 'page' : undefined}
        className={`${ROW_BASE} ${active ? ROW_ACTIVE : ROW_IDLE}`}
      >
        <IconTile icon={item.icon} />
        <RowText label={item.label} subtitle={item.subtitle} />
      </button>
    );
  };

  return (
    <aside
      aria-label="Account navigation"
      className={`flex-shrink-0 w-full md:w-[300px] md:h-full md:overflow-y-auto bg-[#EDEAE0] px-4 pt-20 pb-10 md:pt-8 md:border-r border-[#16432a]/10 ${className}`}
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      {/* Account header */}
      <div className="flex items-center gap-3 px-3 pb-5 mb-2 border-b border-[#16432a]/15">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-[#1a9e4a]" />
        ) : (
          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[#16432a] text-white">
            {firstName.charAt(0).toUpperCase()}
          </span>
        )}
        <span className="text-[#16432a] text-[1.05em]" style={{ fontFamily: "'Poppins_semibold', 'Poppins', sans-serif" }}>
          {firstName}&apos;s Account
        </span>
      </div>

      <nav className="flex flex-col">
        {NAV_GROUPS.map((group) => (
          <div key={group.heading} className="flex flex-col gap-1 py-3 border-b border-[#16432a]/15">
            <h2
              className="px-3 pt-1 pb-2 text-[0.75em] tracking-[0.2em] text-[#16432a]/70"
              style={{ fontFamily: "'Poppins_semibold', sans-serif" }}
            >
              {group.heading.toUpperCase()}
            </h2>
            {group.items.map(renderItem)}
          </div>
        ))}

        <div className="flex flex-col gap-1 py-3">
          <h2
            className="px-3 pt-1 pb-2 text-[0.75em] tracking-[0.2em] text-[#16432a]/70"
            style={{ fontFamily: "'Poppins_semibold', sans-serif" }}
          >
            HELP
          </h2>
          {renderItem(SUPPORT_ITEM)}

          <form action={signOutAction}>
            <button type="submit" className={`${ROW_BASE} ${ROW_IDLE}`}>
              <IconTile icon={LogOut} />
              <RowText label="Log out" subtitle="Sign out of this device" />
            </button>
          </form>
        </div>
      </nav>
    </aside>
  );
}
