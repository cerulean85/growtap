import type { Metadata } from "next";
import { PrivacyView } from "@/views/privacy";

export const metadata: Metadata = {
  title: "개인정보처리방침 · GrowTap",
};

export default function PrivacyPage() {
  return <PrivacyView />;
}
