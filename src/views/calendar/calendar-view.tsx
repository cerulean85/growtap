import { CalendarDays } from "lucide-react";
import { listMonthlyTapEntries } from "@/entities/tap/server";
import { formatKstDayKey, getTodayKstParts } from "@/shared/lib/today";
import { BottomNav } from "@/widgets/bottom-nav";
import { Calendar } from "@/widgets/calendar";
import { Header } from "@/widgets/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

type Props = {
  year?: number;
  month?: number;
};

function isValidMonth(m: unknown): m is number {
  return typeof m === "number" && Number.isInteger(m) && m >= 1 && m <= 12;
}

function isValidYear(y: unknown): y is number {
  return typeof y === "number" && Number.isInteger(y) && y >= 1970 && y <= 9999;
}

export async function CalendarView({ year, month }: Props) {
  const today = getTodayKstParts();
  const safeYear = isValidYear(year) ? year : today.year;
  const safeMonth = isValidMonth(month) ? month : today.month;

  const entries = await listMonthlyTapEntries(safeYear, safeMonth);
  const todayKey = formatKstDayKey(today.year, today.month, today.day);

  return (
    <div className="flex min-h-svh flex-col">
      <Header />
      <main
        className="mx-auto w-full max-w-3xl flex-1 space-y-5 px-4 py-5 sm:py-6"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 5rem)" }}
      >
        <h1 className="text-xl font-semibold tracking-tight">캘린더</h1>

        {entries.length === 0 ? (
          <>
            <Calendar
              key={`${safeYear}-${safeMonth}`}
              year={safeYear}
              month={safeMonth}
              todayKey={todayKey}
              entries={[]}
            />
            <Card>
              <CardHeader className="space-y-3">
                <div className="bg-muted text-foreground inline-flex size-10 items-center justify-center rounded-full">
                  <CalendarDays className="size-5" />
                </div>
                <CardTitle className="text-base">
                  이번 달에는 아직 기록이 없어요
                </CardTitle>
                <CardDescription>
                  실천 항목을 탭해 기록을 쌓으면 캘린더에서 한눈에 확인할 수
                  있어요.
                </CardDescription>
              </CardHeader>
              <CardContent />
            </Card>
          </>
        ) : (
          <Calendar
            key={`${safeYear}-${safeMonth}`}
            year={safeYear}
            month={safeMonth}
            todayKey={todayKey}
            entries={entries}
          />
        )}
      </main>

      <BottomNav />
    </div>
  );
}
