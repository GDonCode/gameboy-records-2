// app/account/AccountClient.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { LogOut } from 'lucide-react';
import AccountSidebar from '@/components/AccountSidebar';
import AccountBottomNav from '@/components/account/AccountBottomNav';
import HomeTab from '@/components/account/HomeTab';
import OrdersTab from '@/components/account/OrdersTab';
import SecurityTab from '@/components/account/SecurityTab';
import SupportTab from '@/components/account/SupportTab';
import PersonalInfoTab from '@/components/account/PersonalInfoTab';
import {
  isAccountTab,
  type AccountTab,
  type AccountUser,
  type Address,
  type SecurityInfo,
  type SupportRequest,
  type Order,
  type QuestStatus,
  type RewardClaim,
} from '@/components/account/types';

interface AccountClientProps {
  user: AccountUser;
  orders: Order[];
  addresses: Address[];
  security: SecurityInfo;
  supportRequests: SupportRequest[];
  quests: QuestStatus[];
  claims: RewardClaim[];
  initialTab: AccountTab | null;
  signOutAction: () => Promise<void>;
}

export default function AccountClient({ user, orders, addresses, security, supportRequests, quests, claims, initialTab, signOutAction }: AccountClientProps) {
  const [tab, setTab] = useState<AccountTab>(initialTab ?? 'home');
  const mainRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const memberSince = new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Keep the tab in sync with the browser back/forward buttons.
  useEffect(() => {
    function handlePopState() {
      const param = new URLSearchParams(window.location.search).get('tab');
      setTab(isAccountTab(param) ? param : 'home');
    }
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  function selectTab(next: AccountTab) {
    setTab(next);
    window.history.pushState(null, '', `${window.location.pathname}?tab=${next}`);
    mainRef.current?.scrollTo({ top: 0 });
    scrollRef.current?.scrollTo({ top: 0 });
  }

  function renderTab() {
    switch (tab) {
      case 'home':
        return <HomeTab user={user} memberSince={memberSince} quests={quests} claims={claims} onSelectTab={selectTab} />;
      case 'personal':
        return <PersonalInfoTab user={user} memberSince={memberSince} addresses={addresses} />;
      case 'orders':
        return <OrdersTab orders={orders} />;
      case 'security':
        return <SecurityTab email={user.email} security={security} />;
      case 'support':
        return <SupportTab email={user.email} initialRequests={supportRequests} onSelectTab={selectTab} />;
    }
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div ref={scrollRef} className="paper-ink flex-1 min-h-0 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden">
        <AccountSidebar activeTab={tab} onSelectTab={selectTab} signOutAction={signOutAction} className="hidden md:block" />

        <main id="main" ref={mainRef} className="flex-1 md:min-h-0 md:overflow-y-auto px-5 md:px-10 pt-8 pb-12 md:pt-10 md:pb-16">
          <div className="max-w-[960px] mx-auto flex flex-col gap-6">
            {/* Phones: the sidebar's Log out lives here, since the sections are in the bottom bar. */}
            <form action={signOutAction} className="md:hidden self-end -mb-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 border-0 bg-transparent p-0 text-[0.85em] tracking-[0.1em] text-[#38B26A] cursor-pointer"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
                LOG OUT
              </button>
            </form>

            {renderTab()}
          </div>
        </main>
      </div>
      <AccountBottomNav activeTab={tab} onSelectTab={selectTab} />
    </div>
  );
}
