import Link from "next/link";
import { auth } from "@/shared/api/auth/auth";
import { ThemeToggle } from "@/features/theme-toggle";
import { AccountMenu } from "./account-menu";
import { NavLinks } from "./nav-links";

export async function Header() {
  const session = await auth();
  const user = session?.user;

  return (
    <header
      className="border-border/60 bg-background/80 sticky top-0 z-40 w-full border-b backdrop-blur"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-4 min-w-0">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            GrowTap
          </Link>
          {user?.email ? <NavLinks /> : null}
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          {user?.email ? (
            <AccountMenu
              name={user.name ?? null}
              email={user.email}
              image={user.image ?? null}
            />
          ) : null}
        </div>
      </div>
    </header>
  );
}
