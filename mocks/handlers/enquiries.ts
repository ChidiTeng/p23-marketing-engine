import { http, HttpResponse } from "msw";
import { enquiryRequestSchema } from "@/lib/api/contracts/enquiry";
import { getLeads, insertLead, getMembers, getCurrentUser, addDuplicateReview } from "../db/store";
import { matchInterests } from "../engine/tag-interests";
import { calculateHeuristicScore } from "../engine/score";
import { pickNextRep } from "../engine/round-robin";
import { checkDuplicate } from "../engine/dedupe";
import { withLatency } from "../utils/latency";

let lastAssignedRepId: number | null = null;

export const enquiryHandlers = [
  http.post("*/public/enquiries", async ({ request }) => {
    await withLatency();
    const raw = await request.json().catch(() => ({}));
    const parsed = enquiryRequestSchema.safeParse(raw);
    if (!parsed.success) {
      return HttpResponse.json(
        { message: "The given data was invalid.", errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const { name, email, phone, company_name, position, message, services_needed } = parsed.data;
    const leads = getLeads();

    // Deduplication check
    const dedupeResult = checkDuplicate({ email, phone }, leads);

    if (dedupeResult.type === "exact_match") {
      const existing = dedupeResult.existingLead;
      return HttpResponse.json(
        {
          success: true,
          matched: true,
          message: "Matched an existing lead. Updated contact history.",
          data: existing,
        },
        { status: 200 }
      );
    }

    // Match interest & score
    const { primary_interest, interests } = matchInterests([company_name, position, message, services_needed]);
    const score = calculateHeuristicScore({ name, email, phone, company_name, position, summary: message, primary_interest });

    // Round-robin assignment across active sales reps
    const reps = getMembers();
    const nextRepId = pickNextRep(reps, lastAssignedRepId) ?? reps[0].id;
    lastAssignedRepId = nextRepId;
    const assigneeMember = reps.find((r) => r.id === nextRepId)!;

    const newLead: any = {
      id: Math.floor(Math.random() * 900000) + 100000,
      organization_id: 1,
      name,
      email,
      phone: phone || null,
      company_name,
      position: position || "Enquiry Contact",
      summary: message,
      source: "website",
      capture_method: "website_form",
      channel: "website",
      status: "new",
      priority: "medium",
      budget_amount: null,
      budget_currency: "USD",
      location: "Online / Web",
      logo_url: null,
      contacts: [],
      profile_urls: [],
      assigned_to_user_id: assigneeMember.id,
      assignee: { id: assigneeMember.id, name: assigneeMember.name, email: assigneeMember.email },
      created_by_user_id: null,
      creator: null,
      primary_interest,
      interests,
      score,
      pipeline_id: 1,
      created_at: new Date().toISOString(),
    };

    if (dedupeResult.type === "phone_review") {
      addDuplicateReview({ candidate_lead: newLead, existing_lead_id: dedupeResult.existingLead.id });
    }

    insertLead(newLead);

    return HttpResponse.json(
      {
        success: true,
        matched: false,
        message: `Enquiry received. Lead assigned to ${assigneeMember.name}.`,
        data: newLead,
      },
      { status: 201 }
    );
  }),
];
