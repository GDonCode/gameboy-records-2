// components/account/AccountBottomNav.tsx
// Phones: a bottom bar to move between the Account sections (the sidebar is desktop only).
'use client';

import { House, Truck, UserRound, Lock, MessageCircleMore, type LucideIcon } from 'lucide-react';
import type { AccountTab } from '@/components/account/types';

const ITEMS: { tab: AccountTab; label: string; icon: LucideIcon }[] = [
  { tab: 'home', label: 'Home', icon: House },
  { tab: 'orders', label: 'Orders', icon: Truck },
  { tab: 'personal', label: 'Profile', icon: UserRound },
  { tab: 'security', label: 'Security', icon: Lock },
  { tab: 'support', label: 'Help', icon: MessageCircleMore },
];

export default function AccountBottomNav({ activeTab, onSelectTab }: { activeTab: AccountTab; onSelectTab: (tab: AccountTab) => void }) {
  return (
    <nav
      aria-label="Account sections"
      className="on-light md:hidden shrink-0 border-t-[3px] border-[#067F3A] bg-white pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="m-0 flex list-none p-0">
        {ITEMS.map(({ tab, label, icon: Icon }) => {
          const active = tab === activeTab;
          return (
            <li key={tab} className="flex-1">
              <button
                type="button"
                onClick={() => onSelectTab(tab)}
                aria-current={active ? 'page' : undefined}
                className={`flex h-[60px] w-full cursor-pointer flex-col items-center justify-center gap-1 border-0 bg-transparent text-[0.68rem] font-semibold tracking-[0.06em] transition-colors ${
                  active ? 'text-[#067F3A]' : 'text-[#0B0A07]/65 active:text-[#067F3A]'
                }`}
                style={{ fontFamily: "'Poppins_semibold', 'Poppins', sans-serif" }}
              >
                <span className={`flex h-7 w-12 items-center justify-center rounded-full ${active ? 'bg-[#067F3A]/15' : ''}`}>
                  <Icon className="h-5 w-5" strokeWidth={2.25} aria-hidden="true" />
                </span>
                {label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
