"use client";

import { LogOut, UserMinus, UserRound } from "lucide-react";
import { useState } from "react";
import { SignOutDialog } from "@/features/auth-signout";
import { WithdrawDialog } from "@/features/auth-withdraw";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

type Props = {
  name: string | null;
  email: string;
  image: string | null;
};

export function AccountMenu({ name, email, image }: Props) {
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const initials = (name ?? email).slice(0, 1).toUpperCase();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon" aria-label="계정 메뉴">
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={image}
                  alt=""
                  className="size-7 rounded-full object-cover"
                />
              ) : (
                <span className="bg-muted text-muted-foreground inline-flex size-7 items-center justify-center rounded-full text-xs font-medium">
                  {initials}
                </span>
              )}
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="space-y-0.5">
              <div className="text-sm font-medium leading-none">
                {name ?? "사용자"}
              </div>
              <div className="text-muted-foreground truncate text-xs">
                {email}
              </div>
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled>
            <UserRound className="size-4" />
            프로필 (준비 중)
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setSignOutOpen(true)}>
            <LogOut className="size-4" />
            로그아웃
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setWithdrawOpen(true)}
          >
            <UserMinus className="size-4" />
            회원 탈퇴
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SignOutDialog open={signOutOpen} onOpenChange={setSignOutOpen} />
      <WithdrawDialog
        email={email}
        open={withdrawOpen}
        onOpenChange={setWithdrawOpen}
      />
    </>
  );
}
