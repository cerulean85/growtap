import type { Metadata } from "next";
import { RoutineView } from "@/views/routine";

export const metadata: Metadata = {
  title: "루틴 · GrowTap",
};

export default function RoutinePage() {
  return <RoutineView />;
}
