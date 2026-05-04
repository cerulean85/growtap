import type { Metadata } from "next";
import { TermsView } from "@/views/terms";

export const metadata: Metadata = {
  title: "이용약관 · GrowTap",
};

export default function TermsPage() {
  return <TermsView />;
}
