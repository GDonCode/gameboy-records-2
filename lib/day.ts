// lib/day.ts
// Daily limits and daily quests reset at local midnight. Jamaica doesn't observe DST,
// so the offset is fixed.

export const DAY_OFFSET_HOURS = -5;

export function startOfLocalDay(): Date {
  const offsetMs = DAY_OFFSET_HOURS * 3600_000;
  const local = new Date(Date.now() + offsetMs);
  local.setUTCHours(0, 0, 0, 0);
  return new Date(local.getTime() - offsetMs);
}

/** 'YYYY-MM-DD' for the current local day. Used inside daily points ref_ids. */
export function localDayKey(): string {
  const local = new Date(Date.now() + DAY_OFFSET_HOURS * 3600_000);
  return local.toISOString().slice(0, 10);
}