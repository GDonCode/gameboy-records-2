// app/account/AccountClient.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, MessageCircleMore } from 'lucide-react';
import AccountSidebar from '@/components/AccountSidebar';
import HomeTab from '@/components/account/HomeTab';
import OrdersTab from '@/components/account/OrdersTab';
import SecurityTab from '@/components/account/SecurityTab';
import PaymentsTab from '@/components/account/PaymentsTab';
import PersonalInfoTab from '@/components/account/PersonalInfoTab';
import ComingSoonTab from '@/components/account/ComingSoonTab';
import {
  isAccountTab,
  type AccountTab,
  type AccountUser,
  type Address,
  type SecurityInfo,
  type PaymentsInfo,
  type Order,
  type QuestStatus,
  type RewardClaim,
} from '@/components/account/types';

interface AccountClientProps {
  user: AccountUser;
  orders: Order[];
  addresses: Address[];
  security: SecurityInfo;
  payments: PaymentsInfo;
  quests: QuestStatus[];
  claims: RewardClaim[];
  initialTab: AccountTab | null;
  signOutAction: () => Promise<void>;
}

export default function AccountClient({ user, orders, addresses, security, payments, quests, claims, initialTab, signOutAction }: AccountClientProps) {
  const [tab, setTab] = useState<AccountTab>(initialTab ?? 'home');
  // Mobile only: show the menu first unless the URL already points at a tab.
  const [mobileView, setMobileView] = useState<'menu' | 'content'>(initialTab ? 'content' : 'menu');
  const mainRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const memberSince = new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Keep the tab in sync with the browser back/forward buttons.
  useEffect(() => {
    function handlePopState() {
      const param = new URLSearchParams(window.location.search).get('tab');
      setTab(isAccountTab(param) ? param : 'home');
      setMobileView(param ? 'content' : 'menu');
    }
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  function selectTab(next: AccountTab) {
    setTab(next);
    setMobileView('content');
    window.history.pushState(null, '', `${window.location.pathname}?tab=${next}`);
    mainRef.current?.scrollTo({ top: 0 });
    scrollRef.current?.scrollTo({ top: 0 });
  }

  function backToMenu() {
    setMobileView('menu');
    window.history.pushState(null, '', window.location.pathname);
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
      case 'payments':
        return <PaymentsTab payments={payments} />;
      case 'support':
        return (
          <ComingSoonTab
            icon={MessageCircleMore}
            title="Customer support"
            subtitle="Get help with orders and more."
            message="Support chat is on the way. Help with orders will be available here."
          />
        );
    }
  }

  return (
    <div
      ref={scrollRef}
            className="mobile-home-pad flex-1 min-h-0 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #1c2e20 0%, #181f1a 60%, #10160f 100%)' }}
    >
      <AccountSidebar
        displayName={user.display_name}
        avatarUrl={user.avatar_url}
        activeTab={tab}
        onSelectTab={selectTab}
        signOutAction={signOutAction}
        className={mobileView === 'content' ? 'hidden md:block' : 'block'}
      />

      <main
        ref={mainRef}
        className={`flex-1 md:min-h-0 md:overflow-y-auto px-5 md:px-10 pt-20 md:pb-16 md:pt-10 ${
          mobileView === 'menu' ? 'hidden md:block' : 'block'
        }`}
      >
        <div className="max-w-[960px] mx-auto flex flex-col gap-6">
          <button
            type="button"
            onClick={backToMenu}
            className="md:hidden inline-flex items-center gap-2 self-start text-[0.85em] tracking-[0.1em] text-[#4dff91]"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            <ArrowLeft className="w-4 h-4" />
            ACCOUNT MENU
          </button>

          {renderTab()}
        </div>
      </main>
    </div>
  );
}
