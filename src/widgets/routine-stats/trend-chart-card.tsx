"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TrendBucket } from "@/entities/routine";
import { Card } from "@/shared/ui/card";

export type ChartType = "bar" | "line";

export function TrendChartCard({
  buckets,
  chartType,
}: {
  buckets: TrendBucket[];
  chartType: ChartType;
}) {
  const data = buckets.map((b) => ({
    label: b.label,
    success: b.successCount,
    total: b.totalDays,
  }));

  return (
    <Card className="space-y-3 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">루틴 성공 추이</h3>
        <p className="text-muted-foreground text-xs">100% 완료 일수</p>
      </div>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "bar" ? (
            <BarChart
              data={data}
              margin={{ top: 4, right: 4, bottom: 0, left: -24 }}
            >
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                className="stroke-muted-foreground/20"
              />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                fontSize={10}
                interval="preserveStartEnd"
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
                formatter={(value) => [`${value}일`, "성공"]}
              />
              <Bar
                dataKey="success"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              />
            </BarChart>
          ) : (
            <LineChart
              data={data}
              margin={{ top: 4, right: 4, bottom: 0, left: -24 }}
            >
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                className="stroke-muted-foreground/20"
              />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                fontSize={10}
                interval="preserveStartEnd"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                fontSize={10}
                allowDecimals={false}
                width={28}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(value) => [`${value}일`, "성공"]}
              />
              <Line
                type="monotone"
                dataKey="success"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
