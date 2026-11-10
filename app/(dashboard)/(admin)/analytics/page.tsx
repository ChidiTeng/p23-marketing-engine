import { Metadata } from "next";
import { AnalyticsView } from "@/components/analytics/analytics-view";

export const metadata: Metadata = {
  title: "Attribution & Lead Analytics | P23 Marketing Engine",
  description: "Multi-channel attribution, sector taxonomy classification, and intake throughput metrics.",
};

export default function AnalyticsPage() {
  return <AnalyticsView />;
}

