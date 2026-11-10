import { http, HttpResponse } from "msw";
import { getSocialSignals } from "../db/store";
import { withLatency } from "../utils/latency";

export const socialListeningHandlers = [
  http.get("*/social-listening/signals*", async () => {
    await withLatency(50);
    return HttpResponse.json({
      success: true,
      data: getSocialSignals(),
    });
  }),

  http.get("*/social-listening/filters*", async () => {
    await withLatency(50);
    return HttpResponse.json({
      success: true,
      data: {
        platforms: ["linkedin", "x", "facebook", "reddit", "youtube"],
        signal_types: ["hiring_expansion", "vendor_switch", "funding_growth"],
      },
    });
  }),

  http.get("*/social-listening/metrics*", async () => {
    await withLatency(50);
    return HttpResponse.json({
      success: true,
      data: {
        total_signals: 25,
        actionable_signals: 18,
        converted_leads: 4,
      },
    });
  }),

  http.get("*/social-listening/settings*", async () => {
    await withLatency(50);
    return HttpResponse.json({
      success: true,
      data: {
        keywords: ["need B2B marketing", "looking for CRM", "hiring sales reps"],
        frequency: "realtime",
      },
    });
  }),

  http.post("*/social-listening/runs*", async () => {
    await withLatency(200);
    return HttpResponse.json({
      success: true,
      message: "Social listening scan complete.",
      data: { new_signals_count: 3 },
    });
  }),
];
