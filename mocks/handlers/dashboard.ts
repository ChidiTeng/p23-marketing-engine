import {
  buildExecutiveDashboardData,
  type DashboardTimeRange,
  type RevenueTimeframe,
} from "@/lib/api/contracts/executive-dashboard";
import { http, HttpResponse } from "msw";
import { getLeads } from "../db/store";
import { withLatency } from "../utils/latency";

export const dashboardHandlers = [
  http.get("*/dashboard/executive*", async ({ request }) => {
    await withLatency(40);
    const url = new URL(request.url);
    const rangeParam = (url.searchParams.get("range") || "30d") as DashboardTimeRange;
    const revPeriodParam = (url.searchParams.get("revPeriod") || "30D") as RevenueTimeframe;

    const leads = getLeads();
    const extraLeadsCount = Math.max(0, leads.length - 120);
    const latestLead = leads[0];

    const payload = buildExecutiveDashboardData({
      range: ["7d", "30d", "90d", "1y"].includes(rangeParam) ? rangeParam : "30d",
      revPeriod: ["7D", "30D", "90D", "1Y"].includes(revPeriodParam) ? revPeriodParam : "30D",
      extraLeadsCount,
      latestLeadCompany: latestLead?.company_name ?? undefined,
    });

    return HttpResponse.json({
      success: true,
      data: payload,
    });
  }),

  http.get("*/metrics/trend*", async () => {
    await withLatency(50);
    const points = Array.from({ length: 30 }, (_, i) => ({
      date: `2026-10-${String(i + 1).padStart(2, "0")}`,
      value: 10 + (i % 8) * 3,
    }));
    return HttpResponse.json({ success: true, data: points });
  }),

  http.get("*/metrics*", async () => {
    await withLatency(50);
    const leads = getLeads();
    return HttpResponse.json({
      success: true,
      data: {
        total_leads: leads.length,
        qualified_leads: Math.round(leads.length * 0.45),
        active_pipeline: 28,
        won_deals: Math.round(leads.length * 0.12),
      },
    });
  }),

  http.get("*/outreach/dashboard*", async () => {
    await withLatency(50);
    return HttpResponse.json({
      success: true,
      data: {
        total_delivered: 342,
        open_rate: 42.5,
        reply_rate: 18.2,
        bounced: 4,
      },
    });
  }),

  http.get("*/outreach/recent*", async () => {
    await withLatency(50);
    return HttpResponse.json({
      success: true,
      data: [],
    });
  }),
];
