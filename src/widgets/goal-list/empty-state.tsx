import { Sparkles } from "lucide-react";
import { GoalCreateDialog } from "@/features/goal-create";

export function GoalListEmptyState() {
  return (
    <div className="border-border/60 bg-card flex flex-col items-center gap-4 rounded-xl border border-dashed px-6 py-12 text-center">
      <div className="bg-muted text-foreground flex size-12 items-center justify-center rounded-full">
        <Sparkles className="size-5" />
      </div>
      <div className="space-y-1">
        <h2 className="text-base font-semibold">첫 실천 항목을 만들어보세요</h2>
        <p className="text-muted-foreground text-sm">
          매일 한 번 탭하는 작은 습관부터 시작해요.
        </p>
      </div>
      <GoalCreateDialog />
    </div>
  );
}
