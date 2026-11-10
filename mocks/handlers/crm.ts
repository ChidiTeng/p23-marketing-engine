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
  getNextRoundRobinRep,
  getDuplicateReviews,
  addDuplicateReview,
  mergeDuplicateReview,
  keepBothDuplicateReview,
  resolveDuplicateReview,
} from "../db/store";
import { checkDuplicate } from "../engine/dedupe";
import { matchInterests } from "../engine/tag-interests";
import { calculateHeuristicScore } from "../engine/score";
import { withLatency } from "../utils/latency";
import { crmLeadSchema, type CrmLead } from "@/lib/api/contracts/crm-lead";

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
    const existingLeads = getLeads();

    // Deduplication check
    const dedupeResult = checkDuplicate(
      {
        email: body.email,
        phone: body.phone,
        profile_urls: body.profile_urls || [],
      },
      existingLeads
    );

    // Exact Match: Auto-merge into existing lead
    if (dedupeResult.type === "exact_match") {
      const existing = dedupeResult.existingLead;
      const updated = updateLead(existing.id, {
        phone: existing.phone || body.phone || null,
        company_name: existing.company_name || body.company_name || null,
        position: existing.position || body.position || null,
        summary: body.summary
          ? `${existing.summary || ""}\n[Merged Note]: ${body.summary}`.trim()
          : existing.summary,
      });

      return HttpResponse.json(
        {
          success: true,
          matched: true,
          merged: true,
          message: `Duplicate lead matched by email/URL. Details merged into existing lead "${existing.name}".`,
          data: { lead: updated, ...updated },
        },
        { status: 200 }
      );
    }

    // Phone Match Only: Queue in duplicate review
    if (dedupeResult.type === "phone_review") {
      const review = addDuplicateReview({
        candidate_lead: {
          name: body.name || "Unknown Lead",
          email: body.email || null,
          phone: body.phone || null,
          company_name: body.company_name || null,
          position: body.position || null,
          channel: body.channel || "website",
          capture_method: body.capture_method || "manual",
          summary: body.summary || null,
          profile_urls: body.profile_urls || [],
        },
        existing_lead_id: dedupeResult.existingLead.id,
        match_reason: `Phone number match (${body.phone}) with existing lead "${dedupeResult.existingLead.name}"`,
        match_field: "phone",
      });

      return HttpResponse.json(
        {
          success: true,
          queued_for_review: true,
          message: `Potential duplicate phone number detected. Lead routed to Admin Review Queue.`,
          data: { lead: dedupeResult.existingLead, ...dedupeResult.existingLead },
          review_id: review.id,
        },
        { status: 202 }
      );
    }

    // Unique Lead: Determine Rep assignment via round-robin if not chosen
    const members = getMembers();
    let assignedUserId: number | null = body.assigned_to_user_id ? Number(body.assigned_to_user_id) : null;
    let assignee: { id: number; name: string; email: string } | null = null;
    let wasRoundRobin = false;

    if (assignedUserId) {
      const chosen = members.find((m) => m.id === assignedUserId);
      if (chosen) {
        assignee = { id: chosen.id, name: chosen.name, email: chosen.email };
      }
    } else {
      const rep = getNextRoundRobinRep();
      if (rep) {
        assignedUserId = rep.id;
        assignee = { id: rep.id, name: rep.name, email: rep.email };
        wasRoundRobin = true;
      }
    }

    const interestMatch = matchInterests([body.name, body.company_name, body.summary]);
    const score = calculateHeuristicScore(body);

    const leadRaw = {
      id: Math.floor(Math.random() * 900000) + 100000,
      organization_id: 1,
      name: body.name || "Untitled Lead",
      company_name: body.company_name || null,
      position: body.position || null,
      email: body.email || null,
      phone: body.phone || null,
      summary: body.summary || null,
      source: body.channel || body.source || "manual",
      channel: body.channel || "website",
      capture_method: body.capture_method || "manual",
      status: body.status || "new",
      priority: body.priority || "medium",
      assigned_to_user_id: assignedUserId,
      assignee,
      contacts: body.contacts || [],
      profile_urls: body.profile_urls || [],
      interests: interestMatch.interests,
      primary_interest: interestMatch.primary_interest,
      score,
      created_at: new Date().toISOString(),
    };

    const parsed = crmLeadSchema.safeParse(leadRaw);
    if (!parsed.success) {
      return HttpResponse.json(
        { message: "Validation error", errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const created = insertLead(parsed.data);
    const assignMsg = assignee
      ? wasRoundRobin
        ? `Lead created and assigned to ${assignee.name} via Round-Robin.`
        : `Lead created and assigned to ${assignee.name}.`
      : "Lead created.";

    return HttpResponse.json(
      {
        success: true,
        message: assignMsg,
        data: { lead: created, ...created },
        assignee_name: assignee?.name,
        was_round_robin: wasRoundRobin,
      },
      { status: 201 }
    );
  }),

  // Duplicate Review Queue Endpoints
  http.get("*/admin/crm/duplicates", async () => {
    await withLatency();
    return HttpResponse.json({ success: true, data: getDuplicateReviews() });
  }),

  http.post("*/admin/crm/duplicates/:id/merge", async ({ params }) => {
    await withLatency();
    const id = Number(params.id);
    const updated = mergeDuplicateReview(id);
    return HttpResponse.json({
      success: true,
      message: "Lead details merged into existing record.",
      data: updated,
    });
  }),

  http.post("*/admin/crm/duplicates/:id/keep-both", async ({ params }) => {
    await withLatency();
    const id = Number(params.id);
    const created = keepBothDuplicateReview(id);
    return HttpResponse.json({
      success: true,
      message: `Lead saved as a new separate entity and assigned to ${created.assignee?.name || "sales team"} via Round-Robin.`,
      data: created,
    });
  }),

  http.delete("*/admin/crm/duplicates/:id", async ({ params }) => {
    await withLatency();
    const id = Number(params.id);
    resolveDuplicateReview(id);
    return HttpResponse.json({ success: true, message: "Duplicate review item dismissed." });
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

