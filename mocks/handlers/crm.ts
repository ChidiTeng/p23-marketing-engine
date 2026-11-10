import { http, HttpResponse } from "msw";
import {
  getLeads,
  getLeadById,
  insertLead,
  updateLead,
  deleteLead,
  getPipeline,
  getMembers,
  getCurrentUser,
} from "../db/store";
import { withLatency } from "../utils/latency";
import { crmLeadSchema } from "@/lib/api/contracts/crm-lead";

export const crmHandlers = [
  http.get("*/crm/pipelines", async () => {
    await withLatency(50);
    const pipe = getPipeline();
    return HttpResponse.json({ success: true, data: [pipe] });
  }),

  http.get("*/crm/labels", async () => {
    await withLatency(50);
    const pipe = getPipeline();
    return HttpResponse.json({ success: true, data: pipe.stages });
  }),

  http.get("*/crm/assignees", async () => {
    await withLatency(50);
    const members = getMembers().filter((m) => m.status === "active");
    return HttpResponse.json({ success: true, data: members });
  }),

  http.get("*/crm/leads", async ({ request }) => {
    await withLatency();
    const url = new URL(request.url);
    const search = url.searchParams.get("search")?.toLowerCase();
    const status = url.searchParams.get("status");
    const channel = url.searchParams.get("channel");
    const captureMethod = url.searchParams.get("capture_method");
    const interest = url.searchParams.get("interest");
    const currentUser = getCurrentUser();

    let list = getLeads();

    // Reps see only their own leads (D5)
    if (currentUser.role === "member") {
      list = list.filter((l) => l.assigned_to_user_id === currentUser.id);
    }

    if (search) {
      list = list.filter(
        (l) =>
          l.name.toLowerCase().includes(search) ||
          l.company_name?.toLowerCase().includes(search) ||
          l.email?.toLowerCase().includes(search)
      );
    }
    if (status) {
      list = list.filter((l) => l.status === status);
    }
    if (channel) {
      list = list.filter((l) => l.channel === channel);
    }
    if (captureMethod) {
      list = list.filter((l) => l.capture_method === captureMethod);
    }
    if (interest) {
      list = list.filter(
        (l) =>
          l.primary_interest?.name.toLowerCase() === interest.toLowerCase() ||
          l.interests.some((i) => i.name.toLowerCase() === interest.toLowerCase())
      );
    }

    return HttpResponse.json({
      success: true,
      data: {
        data: list,
        total: list.length,
        current_page: 1,
        last_page: 1,
        per_page: list.length,
      },
    });
  }),

  http.get("*/crm/leads/:id", async ({ params }) => {
    await withLatency();
    const id = Number(params.id);
    const lead = getLeadById(id);
    if (!lead) return HttpResponse.json({ message: "Lead not found" }, { status: 404 });
    return HttpResponse.json({ success: true, data: lead });
  }),

  http.post("*/crm/leads", async ({ request }) => {
    await withLatency();
    const body = (await request.json().catch(() => ({}))) as Record<string, any>;
    const parsed = crmLeadSchema.safeParse({
      ...body,
      id: Math.floor(Math.random() * 900000) + 100000,
      created_at: new Date().toISOString(),
    });
    if (!parsed.success) {
      return HttpResponse.json({ message: "Validation error", errors: parsed.error.flatten().fieldErrors }, { status: 422 });
    }
    const created = insertLead(parsed.data);
    return HttpResponse.json({ success: true, message: "Lead created.", data: created }, { status: 201 });
  }),

  http.patch("*/crm/leads/:id", async ({ params, request }) => {
    await withLatency();
    const id = Number(params.id);
    const body = (await request.json().catch(() => ({}))) as Partial<any>;
    const updated = updateLead(id, body);
    return HttpResponse.json({ success: true, message: "Lead updated.", data: updated });
  }),

  http.delete("*/crm/leads/:id", async ({ params }) => {
    await withLatency();
    const id = Number(params.id);
    deleteLead(id);
    return HttpResponse.json({ success: true, message: "Lead deleted." });
  }),

  http.post("*/crm/leads/from-discovery", async ({ request }) => {
    await withLatency();
    const body = (await request.json().catch(() => ({}))) as Record<string, any>;
    const id = Math.floor(Math.random() * 900000) + 100000;
    const lead: any = {
      id,
      organization_id: 1,
      name: body.name || "Discovered Lead",
      company_name: body.company_name || body.company || "Discovery Prospect",
      position: body.title || "Director",
      email: body.email || `lead${id}@prospect.com`,
      phone: body.phone || null,
      source: "smart_lead",
      capture_method: "smart_lead",
      channel: "google",
      status: "new",
      priority: "high",
      summary: body.summary || "Discovered via Smart Leads ICP qualification scan.",
      created_at: new Date().toISOString(),
      score: 85,
      pipeline_id: 1,
      contacts: [],
      profile_urls: [],
      interests: [{ id: 3, name: "Technology" }],
      primary_interest: { id: 3, name: "Technology" },
    };
    insertLead(lead);
    return HttpResponse.json({ success: true, message: "Lead saved to CRM.", data: lead }, { status: 201 });
  }),

  http.post("*/crm/leads/from-social-signal", async ({ request }) => {
    await withLatency();
    const body = (await request.json().catch(() => ({}))) as Record<string, any>;
    const id = Math.floor(Math.random() * 900000) + 100000;
    const lead: any = {
      id,
      organization_id: 1,
      name: body.author_name || "Social Prospect",
      company_name: body.company_name || "Social Inquiry Org",
      position: "Lead Contact",
      email: body.email || `social${id}@prospect.com`,
      phone: null,
      source: "social_listening",
      capture_method: "social_listening",
      channel: body.platform || "linkedin",
      status: "new",
      priority: "high",
      summary: body.content || "Buying signal captured from social discussion.",
      created_at: new Date().toISOString(),
      score: 80,
      pipeline_id: 1,
      contacts: [],
      profile_urls: body.url ? [body.url] : [],
      interests: [{ id: 1, name: "Construction" }],
      primary_interest: { id: 1, name: "Construction" },
    };
    insertLead(lead);
    return HttpResponse.json({ success: true, message: "Lead saved to CRM.", data: lead }, { status: 201 });
  }),
];

