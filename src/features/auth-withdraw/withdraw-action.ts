"use server";

import { auth, signOut } from "@/shared/api/auth/auth";
import { deleteUserById } from "@/entities/user";

export async function withdrawAction(confirmEmail: string) {
  const session = await auth();
  const userId = session?.user?.id;
  const userEmail = session?.user?.email;

  if (!userId || !userEmail) {
    throw new Error("로그인이 필요합니다.");
  }

  if (confirmEmail.trim().toLowerCase() !== userEmail.toLowerCase()) {
    throw new Error("이메일이 일치하지 않습니다.");
  }

  await deleteUserById(userId);
  await signOut({ redirectTo: "/login" });
}
