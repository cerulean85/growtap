import Link from "next/link";
import { auth } from "@/shared/api/auth/auth";
import { BottomNav } from "@/widgets/bottom-nav";
import { Header } from "@/widgets/header";
import { RoutineSection } from "./routine-section";

export async function RoutineView() {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <div className="flex min-h-svh flex-col">
        <Header />
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 text-center">
          <p className="text-muted-foreground text-sm">
            로그인 후 이용해주세요.
          </p>
          <Link
            href="/login"
            className="mt-3 inline-block text-sm font-medium underline"
          >
            로그인하기
          </Link>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="flex min-h-svh flex-col">
      <Header />
      <main
        className="mx-auto w-full max-w-3xl flex-1 px-4 py-5 sm:py-6"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 6rem)" }}
      >
        <RoutineSection />
      </main>

      <BottomNav />
    </div>
  );
}
