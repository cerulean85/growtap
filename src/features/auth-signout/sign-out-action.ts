"use server";

import { signOut } from "@/shared/api/auth/auth";

export async function signOutAction() {
  await signOut({ redirectTo: "/login" });
}
