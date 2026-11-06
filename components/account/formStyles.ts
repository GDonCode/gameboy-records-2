// components/account/formStyles.ts
// Shared look for the editable account forms (ink panels, gold accents, hard edges).

export const BODY = { fontFamily: "'Poppins', sans-serif" } as const;
export const SEMI = { fontFamily: "'Poppins_semibold', sans-serif" } as const;

export const INPUT_CLASS =
  'w-full rounded-none border-2 border-white/30 bg-ink px-3.5 py-2.5 text-white placeholder:text-white/40 outline-none transition-colors focus:border-[#E2BA0A] aria-[invalid=true]:border-[#F0A39C] disabled:opacity-60';

export const LABEL_CLASS = 'block mb-1.5 text-[0.8em] text-white/60';

export const PRIMARY_BUTTON =
  'btn-hard inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#E2BA0A] text-[#0B0A07] text-[0.8em] tracking-[0.1em] hover:bg-[#F0C928] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer';

export const SECONDARY_BUTTON =
  'btn-hard inline-flex items-center justify-center gap-2 px-4 py-2 text-white text-[0.8em] tracking-[0.1em] hover:bg-white/10 transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer';

export const TEXT_BUTTON =
  'text-[0.85em] text-[#E2BA0A] hover:underline underline-offset-4 disabled:opacity-60 disabled:no-underline cursor-pointer';

export const DANGER_TEXT_BUTTON =
  'text-[0.85em] text-[#F0A39C] hover:underline underline-offset-4 disabled:opacity-60 disabled:no-underline cursor-pointer';

export const ERROR_TEXT = 'text-[#F0A39C] text-[0.8em]';
export const SUCCESS_TEXT = 'text-[#38B26A] text-[0.8em]';

/** Reads `{ error }` from a failed API response, falling back to a generic message. */
export async function readError(res: Response, fallback = 'Something went wrong. Please try again.'): Promise<string> {
  const data = await res.json().catch(() => null);
  return typeof data?.error === 'string' ? data.error : fallback;
}
