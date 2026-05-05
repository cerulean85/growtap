"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/utils";

const LINKS = [
  { href: "/", label: "홈", match: (p: string) => p === "/" },
  { href: "/calendar", label: "캘린더", match: (p: string) => p === "/calendar" },
  { href: "/stats", label: "통계", match: (p: string) => p === "/stats" },
] as const;

export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav className="hidden items-center gap-1 sm:flex">
      {LINKS.map((l) => {
        const active = l.match(pathname);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "rounded-md px-2 py-1 text-sm transition-colors",
              active
                ? "bg-muted text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
