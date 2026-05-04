"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { GoalDailyStats } from "@/entities/tap/server";
import {
  GOAL_COLOR_DOT,
  GOAL_COLOR_HEX,
} from "@/shared/lib/goal-colors";
import { cn } from "@/shared/lib/utils";
import { Card } from "@/shared/ui/card";

type Props = {
  goal: GoalDailyStats;
  period: "week" | "month";
};

function formatTickWeek(day: string): string {
  // "YYYY-MM-DD" -> 일/월/화/수/목/금/토 in KST
  const [y, m, d] = day.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const weekday = ["일", "월", "화", "수", "목", "금", "토"][date.getUTCDay()];
  return weekday;
}

function formatTickMonth(day: string): string {
  // Show day-of-month every few days
  const d = day.slice(8, 10);
  return Number(d).toString();
}

export function GoalChartCard({ goal, period }: Props) {
  const stroke = GOAL_COLOR_HEX[goal.color];

  return (
    <Card className="space-y-3 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={cn(
              "size-2.5 shrink-0 rounded-full",
              GOAL_COLOR_DOT[goal.color],
            )}
            aria-hidden
          />
          <span className="truncate text-sm font-medium">{goal.title}</span>
        </div>
        <div className="text-muted-foreground text-xs">
          총{" "}
          <span className="text-foreground font-semibold tabular-nums">
            {goal.total}
          </span>{" "}
          회
        </div>
      </div>
      <div className="h-32 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={goal.daily}
            margin={{ top: 4, right: 4, bottom: 0, left: -24 }}
          >
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              className="stroke-muted-foreground/20"
            />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              fontSize={10}
              interval={period === "month" ? 3 : 0}
              tickFormatter={
                period === "week" ? formatTickWeek : formatTickMonth
              }
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              fontSize={10}
              allowDecimals={false}
              width={28}
            />
            <Tooltip
              cursor={{ className: "fill-muted/50" }}
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
              }}
              labelFormatter={(v) => v}
              formatter={(value) => [`${value}회`, "기록"]}
            />
            <Bar
              dataKey="count"
              fill={stroke}
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
