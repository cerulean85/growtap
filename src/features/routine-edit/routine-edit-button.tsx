"use client";

import { Pencil } from "lucide-react";
import { useState } from "react";
import type { RoutineDetail } from "@/entities/routine";
import { Button } from "@/shared/ui/button";
import { RoutineEditDialog } from "./routine-edit-dialog";

export function RoutineEditButton({
  routine,
  label = "편집",
}: {
  routine: RoutineDetail;
  label?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-1"
      >
        <Pencil className="size-3.5" aria-hidden />
        {label}
      </Button>
      <RoutineEditDialog open={open} onOpenChange={setOpen} routine={routine} />
    </>
  );
}
