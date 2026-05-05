import { Archive, ChevronLeft } from "lucide-react";
import Link from "next/link";
import {
  getRoutineDetail,
  listArchivedRoutines,
} from "@/entities/routine/server";
import { Button } from "@/shared/ui/button";
import { BottomNav } from "@/widgets/bottom-nav";
import { Header } from "@/widgets/header";
import { RoutineListCard } from "@/widgets/routine-list";

export async function RoutineArchiveView() {
  const archived = await listArchivedRoutines();
  const detailById = new Map(
    await Promise.all(
      archived.map(async (r) => {
        const d = await getRoutineDetail(r.id);
        return [r.id, d] as const;
      }),
    ),
  );

  return (
    <div className="flex min-h-svh flex-col">
      <Header />
      <main
        className="mx-auto w-full max-w-3xl flex-1 space-y-5 px-4 py-5 sm:py-6"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 5rem)" }}
      >
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" size="icon-sm" aria-label="뒤로">
              <ChevronLeft className="size-4" aria-hidden />
            </Button>
          </Link>
          <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
            <Archive className="size-5" aria-hidden />
            아카이브
          </h1>
        </div>

        {archived.length === 0 ? (
          <div className="border-border/60 bg-card rounded-xl border border-dashed px-6 py-10 text-center">
            <p className="text-sm font-medium">보관된 루틴이 없어요</p>
            <p className="text-muted-foreground mt-1 text-xs">
              사용하지 않는 루틴은 아카이브로 옮겨 깔끔하게 관리할 수 있어요.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {archived.map((r) => {
              const detail = detailById.get(r.id);
              if (!detail) return null;
              return (
                <li key={r.id}>
                  <RoutineListCard
                    routine={r}
                    variant="archive"
                    detail={detail}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
