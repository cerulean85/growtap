import { Flame } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export function StreakBadge({
  streak,
  className,
}: {
  streak: number;
  className?: string;
}) {
  const active = streak > 0;
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium",
        active
          ? "bg-orange-500/10 text-orange-600 dark:text-orange-400"
          : "bg-muted text-muted-foreground",
        className,
      )}
      aria-label={`연속 성공 ${streak}일`}
    >
      <Flame className={cn("size-4", active && "fill-current")} aria-hidden />
      <span className="tabular-nums">
        {streak}일 연속 성공
      </span>
    </div>
  );
}
