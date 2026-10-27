// components/account/types.ts

export const ACCOUNT_TABS = [
  'home',
  'orders',
  'personal',
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
  /** False for Google-only accounts, whose email can't be changed here. */
  has_password: boolean;
}

export type SecurityEventKind =
  | 'sign_in'
  | 'password_changed'
  | 'password_set'
  | 'password_check_failed'
  | 'signed_out_everywhere'
  | 'email_changed';

export interface SecurityEvent {
  id: string;
  kind: SecurityEventKind;
  user_agent: string | null;
  created_at: string;
}

export interface SecurityInfo {
  hasPassword: boolean;
  passwordChangedAt: string | null;
  events: SecurityEvent[];
}

export interface Address {
  id: string;
  full_name: string;
  line1: string;
  line2: string | null;
  city: string;
  region: string | null;
  postal_code: string | null;
  country_code: string;
  phone: string | null;
  is_default: boolean;
}

export type OrderStatus = 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';

// Finished orders live under the "Archived" view of My orders.
export function isArchivedOrder(status: OrderStatus): boolean {
  return status === 'delivered' || status === 'cancelled' || status === 'returned';
}

export interface OrderItem {
  product_id: string;
  name: string;
  slug: string;
  image: string | null;
  size: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  number: string;
  created_at: string;
  status: OrderStatus;
  total: number;
  tracking_url: string | null;
  items: OrderItem[];
}

export type QuestAction =
  | { kind: 'tab'; tab: AccountTab }
  | { kind: 'href'; href: string }
  | { kind: 'subscribe' }
  | { kind: 'stream' };

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
