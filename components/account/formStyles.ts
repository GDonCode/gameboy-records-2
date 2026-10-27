// components/account/formStyles.ts
// Shared look for the editable account forms (dark panels, green accents).

export const BODY = { fontFamily: "'Poppins', sans-serif" } as const;
export const SEMI = { fontFamily: "'Poppins_semibold', sans-serif" } as const;

export const INPUT_CLASS =
  'w-full rounded-[8px] border border-white/15 bg-white/[0.04] px-3.5 py-2.5 text-white placeholder:text-white/35 outline-none transition-colors focus:border-[#4dff91] focus:bg-white/[0.07] aria-[invalid=true]:border-[#ff6b6b] disabled:opacity-60';

export const LABEL_CLASS = 'block mb-1.5 text-[0.8em] text-white/60';

export const PRIMARY_BUTTON =
  'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-[6px] bg-[#1a9e4a] text-white text-[0.8em] tracking-[0.1em] hover:bg-[#149262] transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer';

export const SECONDARY_BUTTON =
  'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-[6px] border border-white/20 text-white/85 text-[0.8em] tracking-[0.1em] hover:border-[#4dff91] hover:text-[#4dff91] transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer';

export const TEXT_BUTTON =
  'text-[0.85em] text-[#4dff91] hover:underline underline-offset-4 disabled:opacity-60 disabled:no-underline cursor-pointer';

export const DANGER_TEXT_BUTTON =
  'text-[0.85em] text-[#ff6b6b] hover:underline underline-offset-4 disabled:opacity-60 disabled:no-underline cursor-pointer';

export const ERROR_TEXT = 'text-[#ff6b6b] text-[0.8em]';
export const SUCCESS_TEXT = 'text-[#4dff91] text-[0.8em]';

/** Reads `{ error }` from a failed API response, falling back to a generic message. */
export async function readError(res: Response, fallback = 'Something went wrong. Please try again.'): Promise<string> {
  const data = await res.json().catch(() => null);
  return typeof data?.error === 'string' ? data.error : fallback;
}
