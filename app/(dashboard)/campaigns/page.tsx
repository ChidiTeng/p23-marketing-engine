import type { Metadata } from "next";
import { CampaignsView } from "@/components/campaigns/campaigns-view";

export const metadata: Metadata = {
  title: "Campaigns | P23 Marketing Engine",
  description:
    "Spend, leads and conversion for every campaign across the three engines.",
};

export default function CampaignsPage() {
  return <CampaignsView />;
}

