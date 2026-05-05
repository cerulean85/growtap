"use client";

import { BarChart3, LineChart } from "lucide-react";
import { useState, useTransition } from "react";
import {
  fetchFailureMemos,
  fetchRoutineTrend,
  type FailureMemo,
  type FailureSlice,
  type TrendBucket,
} from "@/entities/routine";
import type { GoalDailyStats } from "@/entities/tap/server";
import { Button } from "@/shared/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/ui/tabs";
import {
  FailurePieCard,
  TrendChartCard,
  type ChartType,
} from "@/widgets/routine-stats";
import { GoalChartCard } from "@/widgets/stats-chart";

type Unit = "day" | "week" | "month" | "year";

type RoutineStats = {
  id: string;
  title: string;
  initialBuckets: TrendBucket[];
  failureSlices: FailureSlice[];
};

type Props = {
  week: GoalDailyStats[];
  month: GoalDailyStats[];
  routines: RoutineStats[];
};

export function StatsClient({ week, month, routines }: Props) {
  const defaultTab = week.length > 0 ? "goal" : "routine";
  const [tab, setTab] = useState(defaultTab);

  return (
    <Tabs value={tab} onValueChange={setTab} className="space-y-5">
      <TabsList className="w-full">
        <TabsTrigger value="goal" className="flex-1" disabled={week.length === 0}>
          실천 항목
        </TabsTrigger>
        <TabsTrigger
          value="routine"
          className="flex-1"
          disabled={routines.length === 0}
        >
          루틴
        </TabsTrigger>
      </TabsList>

      {tab === "goal" ? (
        <TabsContent value="goal" className="space-y-5">
          <GoalSection week={week} month={month} />
        </TabsContent>
      ) : null}

      {tab === "routine" ? (
        <TabsContent value="routine" className="space-y-4">
          {routines.length > 0 ? <RoutineSection routines={routines} /> : null}
        </TabsContent>
      ) : null}
    </Tabs>
  );
}

function GoalSection({
  week,
  month,
}: {
  week: GoalDailyStats[];
  month: GoalDailyStats[];
}) {
  const [period, setPeriod] = useState<"week" | "month">("week");
  return (
    <Tabs
      value={period}
      onValueChange={(v) => setPeriod(v as "week" | "month")}
      className="space-y-4"
    >
      <TabsList className="w-full">
        <TabsTrigger value="week" className="flex-1">
          주간 (7일)
        </TabsTrigger>
        <TabsTrigger value="month" className="flex-1">
          월간 (30일)
        </TabsTrigger>
      </TabsList>
      <TabsContent value={period} className="space-y-3">
        {(period === "week" ? week : month).map((g) => (
          <GoalChartCard key={g.goalId} goal={g} period={period} />
        ))}
      </TabsContent>
    </Tabs>
  );
}

function RoutineSection({ routines }: { routines: RoutineStats[] }) {
  const [routineId, setRoutineId] = useState(routines[0]?.id ?? "");
  const [unit, setUnit] = useState<Unit>("day");
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [buckets, setBuckets] = useState(routines[0]?.initialBuckets ?? []);
  const [, startTransition] = useTransition();
  const routine = routines.find((r) => r.id === routineId) ?? routines[0];

  const handleRoutineChange = (nextId: string) => {
    if (nextId === routine.id) return;
    const next = routines.find((r) => r.id === nextId);
    if (!next) return;
    setRoutineId(next.id);
    setUnit("day");
    setBuckets(next.initialBuckets);
  };

  const handleUnitChange = (next: Unit) => {
    if (next === unit) return;
    setUnit(next);
    startTransition(async () => {
      const data = await fetchRoutineTrend({
        routineId: routine.id,
        unit: next,
      });
      setBuckets(data);
    });
  };

  const handleFetchMemos = (taskId: string): Promise<FailureMemo[]> => {
    return fetchFailureMemos({ routineId: routine.id, taskId });
  };

  return (
    <div className="space-y-4">
      {routines.length > 1 ? (
        <Tabs
          value={routine.id}
          onValueChange={handleRoutineChange}
          className="space-y-2"
        >
          <p className="text-muted-foreground text-xs">분석 대상 루틴</p>
          <TabsList className="flex h-auto w-full justify-start overflow-x-auto">
            {routines.map((r) => (
              <TabsTrigger
                key={r.id}
                value={r.id}
                className="min-w-24 flex-none px-3"
              >
                <span className="max-w-32 truncate">{r.title}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      ) : (
        <div>
          <p className="text-muted-foreground text-xs">분석 대상 루틴</p>
          <p className="text-sm font-semibold">{routine.title}</p>
        </div>
      )}

      <Tabs
        value={unit}
        onValueChange={(v) => handleUnitChange(v as Unit)}
        className="space-y-3"
      >
        <div className="flex items-center justify-between gap-2">
          <TabsList className="flex-1">
            <TabsTrigger value="day" className="flex-1">
              일
            </TabsTrigger>
            <TabsTrigger value="week" className="flex-1">
              주
            </TabsTrigger>
            <TabsTrigger value="month" className="flex-1">
              월
            </TabsTrigger>
            <TabsTrigger value="year" className="flex-1">
              연
            </TabsTrigger>
          </TabsList>
          <div className="flex shrink-0 gap-1">
            <Button
              variant={chartType === "bar" ? "default" : "outline"}
              size="icon-sm"
              onClick={() => setChartType("bar")}
              aria-label="막대 차트"
            >
              <BarChart3 className="size-4" />
            </Button>
            <Button
              variant={chartType === "line" ? "default" : "outline"}
              size="icon-sm"
              onClick={() => setChartType("line")}
              aria-label="선 차트"
            >
              <LineChart className="size-4" />
            </Button>
          </div>
        </div>
        <TabsContent value={unit}>
          <TrendChartCard buckets={buckets} chartType={chartType} />
        </TabsContent>
      </Tabs>

      <FailurePieCard
        key={routine.id}
        slices={routine.failureSlices}
        fetchMemos={handleFetchMemos}
      />
    </div>
  );
}
