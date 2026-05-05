"use client";

import { BarChart3, CalendarDays, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/utils";

const ITEMS = [
  { href: "/", label: "홈", Icon: Home, match: (p: string) => p === "/" },
  {
    href: "/calendar",
    label: "캘린더",
    Icon: CalendarDays,
    match: (p: string) => p === "/calendar",
  },
  {
    href: "/stats",
    label: "통계",
    Icon: BarChart3,
    match: (p: string) => p === "/stats",
  },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="주요 메뉴"
      className="border-border/60 bg-background/95 fixed inset-x-0 bottom-0 z-40 border-t backdrop-blur sm:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex h-14 max-w-3xl">
        {ITEMS.map(({ href, label, Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] transition-colors",
                active
                  ? "text-foreground"
                  : "text-muted-foreground active:text-foreground",
              )}
            >
              <Icon
                className={cn("size-5", active && "stroke-[2.5]")}
                aria-hidden
              />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
