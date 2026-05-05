"use client";

import { useState, useTransition } from "react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { FailureMemo, FailureSlice } from "@/entities/routine";
import { Card } from "@/shared/ui/card";
import { cn } from "@/shared/lib/utils";

const PIE_COLORS = [
  "#ef4444",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#10b981",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

export function FailurePieCard({
  slices,
  fetchMemos,
}: {
  slices: FailureSlice[];
  fetchMemos: (taskId: string) => Promise<FailureMemo[]>;
}) {
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [memos, setMemos] = useState<FailureMemo[]>([]);
  const [pending, startTransition] = useTransition();

  const total = slices.reduce((acc, s) => acc + s.failureCount, 0);

  const handleSelect = (taskId: string) => {
    setActiveTaskId(taskId);
    startTransition(async () => {
      const m = await fetchMemos(taskId);
      setMemos(m);
    });
  };

  if (total === 0) {
    return (
      <Card className="space-y-2 p-4">
        <h3 className="text-sm font-semibold">실패 비중</h3>
        <p className="text-muted-foreground text-xs">
          아직 실패 데이터가 없어요. 꾸준히 기록해보세요.
        </p>
      </Card>
    );
  }

  const activeSlice = slices.find((s) => s.taskId === activeTaskId);

  return (
    <Card className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">실패 비중 분석</h3>
        <p className="text-muted-foreground text-xs">
          총 실패 {total}회 · 항목을 클릭해 메모 보기
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={slices}
                dataKey="failureCount"
                nameKey="taskTitle"
                innerRadius={36}
                outerRadius={70}
                paddingAngle={2}
                onClick={(entry) => {
                  const taskId = (entry as unknown as { taskId?: string })
                    ?.taskId;
                  if (taskId) handleSelect(taskId);
                }}
              >
                {slices.map((s, i) => (
                  <Cell
                    key={s.taskId}
                    fill={PIE_COLORS[i % PIE_COLORS.length]}
                    stroke={activeTaskId === s.taskId ? "var(--foreground)" : "transparent"}
                    strokeWidth={activeTaskId === s.taskId ? 2 : 0}
                    cursor="pointer"
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(value, _name, item) => {
                  const v = Number(value ?? 0);
                  const pct = total > 0 ? Math.round((v / total) * 100) : 0;
                  return [
                    `${v}회 (${pct}%)`,
                    (item as { name?: string })?.name ?? "",
                  ];
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <ul className="space-y-1">
          {slices.map((s, i) => {
            const pct = Math.round((s.failureCount / total) * 100);
            const active = activeTaskId === s.taskId;
            return (
              <li key={s.taskId}>
                <button
                  type="button"
                  onClick={() => handleSelect(s.taskId)}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors",
                    active ? "bg-muted" : "hover:bg-muted/60",
                  )}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor: PIE_COLORS[i % PIE_COLORS.length],
                      }}
                      aria-hidden
                    />
                    <span className="truncate">{s.taskTitle}</span>
                  </div>
                  <span className="text-muted-foreground tabular-nums">
                    {s.failureCount}회 · {pct}%
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {activeSlice ? (
        <div className="border-t pt-3">
          <p className="text-xs font-medium">
            {activeSlice.taskTitle} — 메모 모아보기
          </p>
          {pending ? (
            <p className="text-muted-foreground mt-2 text-xs">불러오는 중...</p>
          ) : memos.length === 0 ? (
            <p className="text-muted-foreground mt-2 text-xs">
              이 과업에 대한 특이사항 메모가 아직 없어요.
            </p>
          ) : (
            <ul className="mt-2 space-y-2">
              {memos.map((m, i) => (
                <li
                  key={`${m.dayKey}-${i}`}
                  className="border-border/60 rounded-md border bg-muted/30 p-2"
                >
                  <p className="text-muted-foreground text-[11px] tabular-nums">
                    {m.dayKey}
                  </p>
                  <p className="mt-0.5 text-xs whitespace-pre-wrap">{m.memo}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </Card>
  );
}
