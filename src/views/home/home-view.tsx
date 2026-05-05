import { Plus } from "lucide-react";
import { GoalCreateDialog } from "@/features/goal-create";
import { BottomNav } from "@/widgets/bottom-nav";
import { Header } from "@/widgets/header";
import { GoalList } from "@/widgets/goal-list";
import { RoutineSection } from "@/views/routine/routine-section";

export function HomeView() {
  return (
    <div className="flex min-h-svh flex-col">
      <Header />
      <main
        className="mx-auto w-full max-w-3xl flex-1 space-y-8 px-4 py-5 pb-24 sm:py-6 sm:pb-8"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 6rem)" }}
      >
        <GoalList />
        <RoutineSection />
      </main>

      <div
        className="fixed right-4 z-30 sm:hidden"
        style={{ bottom: "calc(env(safe-area-inset-bottom) + 4.5rem)" }}
      >
        <GoalCreateDialog
          trigger={
            <button
              type="button"
              aria-label="새 실천 항목"
              className="bg-primary text-primary-foreground flex size-14 items-center justify-center rounded-full shadow-lg transition-all active:scale-95"
            >
              <Plus className="size-6" />
            </button>
          }
        />
      </div>

      <BottomNav />
    </div>
  );
}
