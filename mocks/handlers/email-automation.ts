import { http, HttpResponse } from "msw";
import { withLatency } from "../utils/latency";
import {
  getEmailAutomationStore,
  saveEmailAutomationStore,
  recordEmailDispatchAndTrackingEvent,
  computeDynamicEmailPerformance,
  type EmailAutomationWorkflow,
} from "@/lib/api/contracts/email-automation";

export const emailAutomationHandlers = [
  http.get("*/api/v1/email-automation/workflows*", async () => {
    await withLatency(80);
    const store = getEmailAutomationStore();
    return HttpResponse.json({
      success: true,
      data: {
        workflows: store.workflows,
        trackingEvents: store.trackingEvents,
        performance: computeDynamicEmailPerformance(store),
      },
    });
  }),

  http.post("*/api/v1/email-automation/workflows*", async ({ request }) => {
    await withLatency(100);
    const body = (await request.json()) as EmailAutomationWorkflow;
    const store = getEmailAutomationStore();
    const next = {
      ...store,
      workflows: [body, ...store.workflows],
    };
    saveEmailAutomationStore(next);
    return HttpResponse.json({
      success: true,
      data: body,
    });
  }),

  http.post("*/api/v1/email-automation/track*", async ({ request }) => {
    await withLatency(80);
    const payload = (await request.json().catch(() => ({}))) as {
      workflowId?: string;
      batchSize?: number;
      sourceModule?: "Smart Lead" | "Email Automation" | "CRM";
      recipientName?: string;
      recipientEmail?: string;
      companyName?: string;
    };
    const next = recordEmailDispatchAndTrackingEvent(payload);
    return HttpResponse.json({
      success: true,
      data: {
        store: next,
        performance: computeDynamicEmailPerformance(next),
      },
    });
  }),
];
