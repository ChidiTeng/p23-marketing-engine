import { http, HttpResponse } from "msw";
import { getLeads, getMembers } from "../db/store";
import { withLatency } from "../utils/latency";

export const analyticsHandlers = [
  http.get("*/crm/leads/analytics", async () => {
    await withLatency();
    const leads = getLeads();
    const wonCount = leads.filter((l) => l.status === "won").length;
    const convRate = leads.length > 0 ? Math.round((wonCount / leads.length) * 100) : 0;
    const activeReps = getMembers().filter((m) => m.role === "member" && m.status === "active").length;

    return HttpResponse.json({
      success: true,
      data: {
        total_leads: leads.length,
        new_leads_this_week: Math.round(leads.length * 0.18),
        conversion_rate: convRate,
        active_reps: activeReps,
        pipeline_value: 485000,
      },
    });
  }),

  http.get("*/crm/analytics/sources", async () => {
    await withLatency();
    const leads = getLeads();
    const total = leads.length;

    // Channel breakdown
    const channelMap = new Map<string, number>();
    for (const l of leads) {
      const ch = l.channel || "unknown";
      channelMap.set(ch, (channelMap.get(ch) || 0) + 1);
    }
    const channels = Array.from(channelMap.entries()).map(([channel, count]) => ({
      channel,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }));

    // Capture methods breakdown
    const captureMap = new Map<string, number>();
    for (const l of leads) {
      const cm = l.capture_method || "manual";
      captureMap.set(cm, (captureMap.get(cm) || 0) + 1);
    }
    const captureMethods = Array.from(captureMap.entries()).map(([capture_method, count]) => ({
      capture_method,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }));

    // Primary interest breakdown (pie chart: exactly sums to 100%)
    const interestMap = new Map<string, number>();
    for (const l of leads) {
      const intName = l.primary_interest?.name || "Other";
      interestMap.set(intName, (interestMap.get(intName) || 0) + 1);
    }
    const interests = Array.from(interestMap.entries()).map(([interest, count]) => ({
      interest,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }));

    return HttpResponse.json({
      success: true,
      data: {
        total_leads: total,
        channels,
        capture_methods: captureMethods,
        interests,
      },
    });
  }),
];
