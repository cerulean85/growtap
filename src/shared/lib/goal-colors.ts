export const GOAL_COLORS = [
  "zinc",
  "rose",
  "orange",
  "amber",
  "emerald",
  "teal",
  "sky",
  "indigo",
  "violet",
] as const;

export type GoalColor = (typeof GOAL_COLORS)[number];

export const DEFAULT_GOAL_COLOR: GoalColor = "zinc";

export function isGoalColor(value: string): value is GoalColor {
  return (GOAL_COLORS as readonly string[]).includes(value);
}

export const GOAL_COLOR_BG: Record<GoalColor, string> = {
  zinc: "bg-zinc-500",
  rose: "bg-rose-500",
  orange: "bg-orange-500",
  amber: "bg-amber-500",
  emerald: "bg-emerald-500",
  teal: "bg-teal-500",
  sky: "bg-sky-500",
  indigo: "bg-indigo-500",
  violet: "bg-violet-500",
};

export const GOAL_COLOR_RING: Record<GoalColor, string> = {
  zinc: "ring-zinc-500/40",
  rose: "ring-rose-500/40",
  orange: "ring-orange-500/40",
  amber: "ring-amber-500/40",
  emerald: "ring-emerald-500/40",
  teal: "ring-teal-500/40",
  sky: "ring-sky-500/40",
  indigo: "ring-indigo-500/40",
  violet: "ring-violet-500/40",
};

// Tailwind 500-level hex values (matches GOAL_COLOR_BG). Used for chart fills
// where Tailwind class names can't reach (e.g., recharts SVG fill prop).
export const GOAL_COLOR_HEX: Record<GoalColor, string> = {
  zinc: "#71717a",
  rose: "#f43f5e",
  orange: "#f97316",
  amber: "#f59e0b",
  emerald: "#10b981",
  teal: "#14b8a6",
  sky: "#0ea5e9",
  indigo: "#6366f1",
  violet: "#8b5cf6",
};

export const GOAL_COLOR_DOT: Record<GoalColor, string> = {
  zinc: "bg-zinc-500 dark:bg-zinc-300",
  rose: "bg-rose-500 dark:bg-rose-300",
  orange: "bg-orange-500 dark:bg-orange-300",
  amber: "bg-amber-500 dark:bg-amber-300",
  emerald: "bg-emerald-500 dark:bg-emerald-300",
  teal: "bg-teal-500 dark:bg-teal-300",
  sky: "bg-sky-500 dark:bg-sky-300",
  indigo: "bg-indigo-500 dark:bg-indigo-300",
  violet: "bg-violet-500 dark:bg-violet-300",
};
