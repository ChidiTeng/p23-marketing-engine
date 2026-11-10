import { http, HttpResponse } from "msw";
import { getLeads } from "../db/store";
import { withLatency } from "../utils/latency";

export const dashboardHandlers = [
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
