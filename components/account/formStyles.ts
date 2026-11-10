// components/account/formStyles.ts
// Shared look for the editable account forms (ink panels, gold accents, hard edges).

export const BODY = { fontFamily: "'Poppins', sans-serif" } as const;
export const SEMI = { fontFamily: "'Poppins_semibold', sans-serif" } as const;

export const INPUT_CLASS =
  'w-full rounded-none border-2 border-[#0B0A07]/15 bg-white px-3.5 py-2.5 text-[#0B0A07] placeholder:text-[#0B0A07]/50 outline-none transition-colors focus:border-[#067F3A] aria-[invalid=true]:border-[#A3322A] disabled:opacity-60';

export const LABEL_CLASS = 'block mb-1.5 text-[0.8em] text-[#0B0A07]/70';

export const PRIMARY_BUTTON =
  'btn-hard inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#E2BA0A] text-[#0B0A07] text-[0.8em] tracking-[0.1em] hover:bg-[#F0C928] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer';

export const SECONDARY_BUTTON =
  'btn-hard inline-flex items-center justify-center gap-2 px-4 py-2 text-[#0B0A07] text-[0.8em] tracking-[0.1em] hover:bg-[#0B0A07]/5 transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer';

export const TEXT_BUTTON =
  'text-[0.85em] text-[#05652E] hover:underline underline-offset-4 disabled:opacity-60 disabled:no-underline cursor-pointer';

export const DANGER_TEXT_BUTTON =
  'text-[0.85em] text-[#A3322A] hover:underline underline-offset-4 disabled:opacity-60 disabled:no-underline cursor-pointer';

export const ERROR_TEXT = 'text-[#A3322A] text-[0.8em]';
export const SUCCESS_TEXT = 'text-[#05652E] text-[0.8em]';

/** Reads `{ error }` from a failed API response, falling back to a generic message. */
export async function readError(res: Response, fallback = 'Something went wrong. Please try again.'): Promise<string> {
  const data = await res.json().catch(() => null);
  return typeof data?.error === 'string' ? data.error : fallback;
}
