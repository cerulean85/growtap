"use client";

import { useState } from "react";
import type { GoalDailyStats } from "@/entities/tap/server";
import { GoalChartCard } from "@/widgets/stats-chart";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/ui/tabs";

type Props = {
  week: GoalDailyStats[];
  month: GoalDailyStats[];
};

export function StatsClient({ week, month }: Props) {
  const [period, setPeriod] = useState<"week" | "month">("week");

  return (
    <Tabs
      value={period}
      onValueChange={(v) => setPeriod(v as "week" | "month")}
      className="space-y-5"
    >
      <TabsList className="w-full">
        <TabsTrigger value="week" className="flex-1">
          주간 (7일)
        </TabsTrigger>
        <TabsTrigger value="month" className="flex-1">
          월간 (30일)
        </TabsTrigger>
      </TabsList>

      <TabsContent value="week" className="space-y-3">
        {week.map((g) => (
          <GoalChartCard key={g.goalId} goal={g} period="week" />
        ))}
      </TabsContent>

      <TabsContent value="month" className="space-y-3">
        {month.map((g) => (
          <GoalChartCard key={g.goalId} goal={g} period="month" />
        ))}
      </TabsContent>
    </Tabs>
  );
}
