// components/account/types.ts

export const ACCOUNT_TABS = [
  'home',
  'orders',
  'archived',
  'saved',
  'personal',
  'addresses',
  'security',
  'payments',
  'support',
] as const;

export type AccountTab = (typeof ACCOUNT_TABS)[number];

export function isAccountTab(value: unknown): value is AccountTab {
  return typeof value === 'string' && (ACCOUNT_TABS as readonly string[]).includes(value);
}

export interface AccountUser {
  id: string;
  email: string;
  display_name: string;
  points_balance: number | null;
  created_at: string;
  avatar_url: string | null;
}

export interface SavedItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  image: string | null;
  slug: string;
}

export type QuestAction =
  | { kind: 'tab'; tab: AccountTab }
  | { kind: 'href'; href: string }
  | { kind: 'subscribe' };

export interface QuestStatus {
  id: string;
  title: string;
  description: string;
  points: number;
  cadence: 'once' | 'daily';
  done: boolean;
  action: QuestAction;
  actionLabel: string;
}

export interface RewardClaim {
  level: number;
  status: 'claimed' | 'fulfilled';
}
