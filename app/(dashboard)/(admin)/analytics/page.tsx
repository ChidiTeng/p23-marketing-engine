import { Metadata } from "next";
import { AnalyticsView } from "@/components/analytics/analytics-view";

export const metadata: Metadata = {
  title: "Email Automation Analytics & Reports | P23 Marketing Engine",
  description:
    "Dedicated email automation performance analytics, sequence conversion funnel, AI tone/vibe telemetry, and deliverability reports.",
};

export default function AnalyticsPage() {
  return <AnalyticsView />;
}
