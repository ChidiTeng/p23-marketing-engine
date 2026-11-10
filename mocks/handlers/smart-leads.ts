import { http, HttpResponse } from "msw";
import { getIcpProfiles } from "../db/store";
import { withLatency } from "../utils/latency";

let pollCount = 0;

export const smartLeadsHandlers = [
  http.get("*/icp-profiles*", async () => {
    await withLatency(50);
    return HttpResponse.json({ success: true, data: getIcpProfiles() });
  }),

  http.post("*/chat/sessions*", async ({ request }) => {
    await withLatency(300);
    const body = (await request.json().catch(() => ({}))) as Record<string, any>;
    const userPrompt = String(body.content || body.message || "").toLowerCase();

    let reply = "I have analyzed the market context and refined your ICP criteria based on target geography and industry parameters.";

    if (userPrompt.includes("solar") || userPrompt.includes("lagos") || userPrompt.includes("energy")) {
      reply = "Found 24 commercial solar installation and clean energy EPC companies in Lagos with active projects and verified procurement decision-makers.";
    } else if (userPrompt.includes("construction") || userPrompt.includes("builder") || userPrompt.includes("civil")) {
      reply = "Targeting mid-sized civil engineering and commercial construction contractors in Nigeria with active project pipelines.";
    } else if (userPrompt.includes("fintech") || userPrompt.includes("software") || userPrompt.includes("tech")) {
      reply = "Filtered for Series A+ B2B software and fintech enterprises across West Africa expanding sales and operations.";
    }

    return HttpResponse.json({
      success: true,
      data: {
        id: "chat-sess-" + Date.now(),
        reply,
        suggested_actions: ["Run Discovery Scan", "Filter Target Companies"],
      },
    });
  }),

  http.post("*/discovery/runs*", async () => {
    await withLatency(200);
    pollCount = 0;
    return HttpResponse.json({
      success: true,
      data: {
        id: "run-discovery-101",
        status: "running",
        found_count: 5,
        target_count: 25,
      },
    });
  }),

  http.get("*/discovery/runs/:id*", async () => {
    await withLatency(100);
    pollCount++;
    const isCompleted = pollCount >= 2;
    return HttpResponse.json({
      success: true,
      data: {
        id: "run-discovery-101",
        status: isCompleted ? "completed" : "running",
        found_count: isCompleted ? 24 : 12,
        target_count: 24,
      },
    });
  }),

  http.post("*/leads/feedback*", async () => {
    return HttpResponse.json({ success: true, message: "Feedback noted." });
  }),
];
