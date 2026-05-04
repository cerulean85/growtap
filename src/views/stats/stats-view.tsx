import { BarChart3 } from "lucide-react";
import { listGoalDailyStats } from "@/entities/tap/server";
import { BottomNav } from "@/widgets/bottom-nav";
import { Header } from "@/widgets/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { StatsClient } from "./stats-client";

export async function StatsView() {
  const [week, month] = await Promise.all([
    listGoalDailyStats(7),
    listGoalDailyStats(30),
  ]);

  const hasGoals = week.goals.length > 0;

  return (
    <div className="flex min-h-svh flex-col">
      <Header />
      <main
        className="mx-auto w-full max-w-3xl flex-1 space-y-5 px-4 py-5 sm:py-6"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 5rem)" }}
      >
        <h1 className="text-xl font-semibold tracking-tight">통계</h1>

        {hasGoals ? (
          <StatsClient week={week.goals} month={month.goals} />
        ) : (
          <Card>
            <CardHeader className="space-y-3">
              <div className="bg-muted text-foreground inline-flex size-10 items-center justify-center rounded-full">
                <BarChart3 className="size-5" />
              </div>
              <CardTitle className="text-base">아직 데이터가 없어요</CardTitle>
              <CardDescription>
                실천 항목을 만들고 탭으로 기록을 쌓아보세요. 통계는 자동으로
                여기에 그려집니다.
              </CardDescription>
            </CardHeader>
            <CardContent />
          </Card>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
