import type { Metadata } from "next";
import { CalendarView } from "@/views/calendar";

export const metadata: Metadata = {
  title: "캘린더 · GrowTap",
};

type SearchParams = Promise<{ y?: string; m?: string }>;

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { y, m } = await searchParams;
  const year = y ? Number.parseInt(y, 10) : undefined;
  const month = m ? Number.parseInt(m, 10) : undefined;

  return (
    <CalendarView
      year={Number.isFinite(year) ? year : undefined}
      month={Number.isFinite(month) ? month : undefined}
    />
  );
}
