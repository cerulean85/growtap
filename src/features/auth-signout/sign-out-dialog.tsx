"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { signOutAction } from "./sign-out-action";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SignOutDialog({ open, onOpenChange }: Props) {
  const [pending, startTransition] = useTransition();

  const onConfirm = () => {
    startTransition(async () => {
      try {
        await signOutAction();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "로그아웃에 실패했습니다.";
        if (!message.toLowerCase().includes("next_redirect")) {
          toast.error(message);
        }
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>로그아웃</DialogTitle>
          <DialogDescription>정말 로그아웃하시겠어요?</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            취소
          </Button>
          <Button onClick={onConfirm} disabled={pending}>
            {pending ? "처리 중..." : "로그아웃"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
