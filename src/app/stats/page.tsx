import type { Metadata } from "next";
import { StatsView } from "@/views/stats";

export const metadata: Metadata = {
  title: "통계 · GrowTap",
};

export default function StatsPage() {
  return <StatsView />;
}
