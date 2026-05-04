import Link from "next/link";
import { ChevronLeft } from "lucide-react";

type Section = {
  heading: string;
  body: string;
};

type Props = {
  title: string;
  updatedAt: string;
  sections: Section[];
};

export function LegalLayout({ title, updatedAt, sections }: Props) {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-border/60 bg-background/80 sticky top-0 z-40 w-full border-b backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-2xl items-center px-4">
          <Link
            href="/login"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
          >
            <ChevronLeft className="size-4" />
            돌아가기
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-muted-foreground mt-2 text-xs">
          최종 업데이트: {updatedAt}
        </p>
        <div className="mt-8 space-y-7">
          {sections.map((s) => (
            <section key={s.heading} className="space-y-2">
              <h2 className="text-base font-semibold">{s.heading}</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {s.body}
              </p>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
