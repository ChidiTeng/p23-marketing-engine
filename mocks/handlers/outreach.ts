import { http, HttpResponse } from "msw";
import { withLatency } from "../utils/latency";

export const outreachHandlers = [
  http.post("*/outreach/send*", async () => {
    await withLatency(300);
    return HttpResponse.json({ success: true, message: "Outreach message queued." });
  }),

  http.post("*/outreach/draft*", async () => {
    await withLatency(200);
    return HttpResponse.json({ success: true, message: "Draft saved." });
  }),

  http.get("*/outreach/domain-auth*", async () => {
    return HttpResponse.json({ success: true, data: { status: "verified", dkim: true, spf: true } });
  }),
];
