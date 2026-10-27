// lib/account-validation.ts
// Personal info validation shared by the account forms (instant feedback) and the API routes (the real check).

import { isCountryCode, type CountryCode } from '@/lib/countries';

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const DISPLAY_NAME_MAX = 50;
export const MAX_ADDRESSES = 5;

export function validateDisplayName(value: unknown): { value: string } | { error: string } {
  if (typeof value !== 'string' || !value.trim()) return { error: 'Enter your name.' };
  const name = value.trim().replace(/\s+/g, ' ');
  if (name.length > DISPLAY_NAME_MAX) return { error: `Name must be ${DISPLAY_NAME_MAX} characters or fewer.` };
  return { value: name };
}

export function validateEmail(value: unknown): { value: string } | { error: string } {
  if (typeof value !== 'string') return { error: 'Enter a valid email address.' };
  const email = value.trim().toLowerCase();
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) return { error: 'Enter a valid email address.' };
  return { value: email };
}

export interface AddressInput {
  full_name: string;
  line1: string;
  line2: string | null;
  city: string;
  region: string | null;
  postal_code: string | null;
  country_code: CountryCode;
  phone: string | null;
}

export type AddressErrors = Partial<Record<keyof AddressInput, string>>;

const FIELD_LIMITS: Record<Exclude<keyof AddressInput, 'country_code'>, { max: number; required: boolean; label: string }> = {
  full_name: { max: 100, required: true, label: 'Full name' },
  line1: { max: 120, required: true, label: 'Street address' },
  line2: { max: 120, required: false, label: 'Apartment, suite, etc.' },
  city: { max: 80, required: true, label: 'City / town' },
  region: { max: 80, required: false, label: 'Parish / state / province' },
  postal_code: { max: 20, required: false, label: 'Postal code' },
  phone: { max: 30, required: false, label: 'Phone' },
};

// Countries where carriers need a postal code to deliver. Jamaica and many others have none.
const POSTAL_CODE_REQUIRED = new Set(['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'NL', 'IT', 'ES', 'JP', 'IE']);
// US, Canada and Australia orders need a state / province.
const REGION_REQUIRED = new Set(['US', 'CA', 'AU']);

const PHONE_RE = /^\+?[0-9 ()\-.]{7,30}$/;

export function validateAddress(raw: unknown): { value: AddressInput } | { errors: AddressErrors } {
  const body = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const errors: AddressErrors = {};
  const clean: Record<string, string | null> = {};

  for (const [key, rule] of Object.entries(FIELD_LIMITS)) {
    const v = typeof body[key] === 'string' ? (body[key] as string).trim().replace(/\s+/g, ' ') : '';
    if (!v) {
      if (rule.required) errors[key as keyof AddressInput] = `${rule.label} is required.`;
      clean[key] = null;
    } else if (v.length > rule.max) {
      errors[key as keyof AddressInput] = `${rule.label} must be ${rule.max} characters or fewer.`;
    } else {
      clean[key] = v;
    }
  }

  const country = typeof body.country_code === 'string' ? body.country_code.toUpperCase() : '';
  if (!isCountryCode(country)) {
    errors.country_code = 'Choose a country.';
  } else {
    if (POSTAL_CODE_REQUIRED.has(country) && !clean.postal_code && !errors.postal_code) {
      errors.postal_code = 'Postal code is required for this country.';
    }
    if (REGION_REQUIRED.has(country) && !clean.region && !errors.region) {
      errors.region = 'State / province is required for this country.';
    }
  }

  if (clean.phone && !PHONE_RE.test(clean.phone)) errors.phone = 'Enter a valid phone number.';

  if (Object.keys(errors).length > 0) return { errors };

  return {
    value: {
      full_name: clean.full_name!,
      line1: clean.line1!,
      line2: clean.line2,
      city: clean.city!,
      region: clean.region,
      postal_code: clean.postal_code ? clean.postal_code.toUpperCase() : null,
      country_code: country as CountryCode,
      phone: clean.phone,
    },
  };
}

export const PASSWORD_MIN = 8;

// A short list of the passwords attackers try first. Not exhaustive; length does most of the work.
const COMMON_PASSWORDS = new Set([
  'password', 'password1', 'password123', '12345678', '123456789', '1234567890', 'qwerty123', 'qwertyuiop',
  '11111111', '00000000', 'iloveyou', 'abc12345', 'letmein1', 'welcome1', 'admin123', 'sunshine', 'football',
  'baseball', 'princess', 'gameboyrecords', 'gameboy123',
]);

/** Same rules for registering, changing and setting a password. bcrypt only reads the first 72 bytes. */
export function validateNewPassword(value: unknown, email?: string): string | null {
  if (typeof value !== 'string' || !value) return 'Enter a new password.';
  if (value.length < PASSWORD_MIN) return `Password must be at least ${PASSWORD_MIN} characters.`;
  if (new TextEncoder().encode(value).length > 72) return 'Password is too long. Try a shorter one.';
  if (COMMON_PASSWORDS.has(value.toLowerCase())) return 'That password is too common. Choose another.';
  if (email && value.toLowerCase() === email.toLowerCase()) return 'Don’t use your email as your password.';
  return null;
}
