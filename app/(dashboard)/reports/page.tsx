import type { Metadata } from "next";
import { ReportsView } from "@/components/reports/reports-view";

export const metadata: Metadata = {
  title: "Reports | P23 Marketing Engine",
  description:
    "Saved views of revenue, pipeline, campaigns and programmes.",
};

export default function ReportsPage() {
  return <ReportsView />;
}

