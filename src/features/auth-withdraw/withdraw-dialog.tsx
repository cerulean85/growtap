"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { withdrawAction } from "./withdraw-action";

type Props = {
  email: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function WithdrawDialog({ email, open, onOpenChange }: Props) {
  const [confirm, setConfirm] = useState("");
  const [pending, startTransition] = useTransition();
  const matched = confirm.trim().toLowerCase() === email.toLowerCase();

  const onSubmit = () => {
    startTransition(async () => {
      try {
        await withdrawAction(confirm);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "탈퇴 처리에 실패했습니다.";
        if (!message.toLowerCase().includes("next_redirect")) {
          toast.error(message);
        }
      }
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) setConfirm("");
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>회원 탈퇴</DialogTitle>
          <DialogDescription className="leading-relaxed">
            계정을 삭제하면 모든 기록이 영구적으로 사라지며 복구할 수 없습니다.
            계속하시려면 본인 이메일을 입력해 주세요.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="confirm-email">
            이메일 확인 (<span className="font-mono text-xs">{email}</span>)
          </Label>
          <Input
            id="confirm-email"
            type="email"
            autoComplete="off"
            placeholder={email}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            취소
          </Button>
          <Button
            variant="destructive"
            onClick={onSubmit}
            disabled={!matched || pending}
          >
            {pending ? "처리 중..." : "탈퇴하기"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
