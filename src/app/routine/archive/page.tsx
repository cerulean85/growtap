import type { Metadata } from "next";
import { RoutineArchiveView } from "@/views/routine-archive";

export const metadata: Metadata = {
  title: "루틴 아카이브 · GrowTap",
};

export default function RoutineArchivePage() {
  return <RoutineArchiveView />;
}
