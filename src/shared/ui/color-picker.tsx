"use client";

import { Check } from "lucide-react";
import {
  GOAL_COLORS,
  GOAL_COLOR_BG,
  type GoalColor,
} from "@/shared/lib/goal-colors";
import { cn } from "@/shared/lib/utils";

type Props = {
  value: GoalColor;
  onChange: (color: GoalColor) => void;
};

export function ColorPicker({ value, onChange }: Props) {
  return (
    <div
      className="flex flex-wrap gap-2"
      role="radiogroup"
      aria-label="색상 선택"
    >
      {GOAL_COLORS.map((c) => {
        const selected = value === c;
        return (
          <button
            key={c}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={c}
            onClick={() => onChange(c)}
            className={cn(
              "size-8 rounded-full ring-offset-2 ring-offset-background transition-all flex items-center justify-center",
              GOAL_COLOR_BG[c],
              selected
                ? "ring-2 ring-foreground"
                : "hover:scale-105 ring-0",
            )}
          >
            {selected ? (
              <Check className="size-4 text-white drop-shadow" />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
