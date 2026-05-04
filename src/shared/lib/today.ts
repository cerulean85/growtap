// Phase 2/3: assume KST (UTC+9). Future improvement: per-user TZ.
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export const KST_TIMEZONE = "Asia/Seoul";

function kstMidnightUtcMs(d: Date): number {
  const kst = new Date(d.getTime() + KST_OFFSET_MS);
  const startUtcMs =
    Date.UTC(kst.getUTCFullYear(), kst.getUTCMonth(), kst.getUTCDate(), 0, 0, 0) -
    KST_OFFSET_MS;
  return startUtcMs;
}

export function getTodayRangeKST(): { start: Date; end: Date } {
  const startMs = kstMidnightUtcMs(new Date());
  return { start: new Date(startMs), end: new Date(startMs + DAY_MS) };
}

export function getRangeKST(daysBack: number): { start: Date; end: Date } {
  const todayStartMs = kstMidnightUtcMs(new Date());
  const start = new Date(todayStartMs - (daysBack - 1) * DAY_MS);
  const end = new Date(todayStartMs + DAY_MS);
  return { start, end };
}

// Returns ISO date strings (YYYY-MM-DD) for each KST day in [start, end).
export function listKstDayKeys(start: Date, end: Date): string[] {
  const keys: string[] = [];
  let cursor = kstMidnightUtcMs(start);
  const endMs = end.getTime();
  while (cursor < endMs) {
    const kst = new Date(cursor + KST_OFFSET_MS);
    const y = kst.getUTCFullYear();
    const m = String(kst.getUTCMonth() + 1).padStart(2, "0");
    const d = String(kst.getUTCDate()).padStart(2, "0");
    keys.push(`${y}-${m}-${d}`);
    cursor += DAY_MS;
  }
  return keys;
}
