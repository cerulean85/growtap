import { formatKstDayKey } from "@/shared/lib/today";

export type CalendarCell = {
  day: string;
  date: number;
  inMonth: boolean;
  isToday: boolean;
  weekday: number;
};

export const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"] as const;

export function buildCalendarCells(
  year: number,
  month: number,
  todayKey: string,
): CalendarCell[] {
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const daysInPrev = new Date(Date.UTC(year, month - 1, 0)).getUTCDate();

  const prevYear = month === 1 ? year - 1 : year;
  const prevMonth = month === 1 ? 12 : month - 1;
  const nextYear = month === 12 ? year + 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;

  const cells: CalendarCell[] = [];

  for (let i = firstWeekday - 1; i >= 0; i--) {
    const date = daysInPrev - i;
    const day = formatKstDayKey(prevYear, prevMonth, date);
    cells.push({
      day,
      date,
      inMonth: false,
      isToday: day === todayKey,
      weekday: cells.length % 7,
    });
  }

  for (let date = 1; date <= daysInMonth; date++) {
    const day = formatKstDayKey(year, month, date);
    cells.push({
      day,
      date,
      inMonth: true,
      isToday: day === todayKey,
      weekday: cells.length % 7,
    });
  }

  let trailing = 1;
  while (cells.length < 42) {
    const day = formatKstDayKey(nextYear, nextMonth, trailing);
    cells.push({
      day,
      date: trailing,
      inMonth: false,
      isToday: day === todayKey,
      weekday: cells.length % 7,
    });
    trailing++;
  }

  return cells;
}

export function shiftMonth(
  year: number,
  month: number,
  delta: number,
): { year: number; month: number } {
  const total = (year * 12 + (month - 1)) + delta;
  return { year: Math.floor(total / 12), month: (total % 12) + 1 };
}

export function formatDayLabel(dayKey: string): string {
  const [y, m, d] = dayKey.split("-").map(Number);
  const weekday = WEEKDAY_LABELS[
    new Date(Date.UTC(y, m - 1, d)).getUTCDay()
  ];
  return `${m}월 ${d}일 (${weekday})`;
}
