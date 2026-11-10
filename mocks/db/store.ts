import { buildSeedDatabase, type SeedDatabase } from "./seed";
import { crmLeadSchema, type CrmLead } from "@/lib/api/contracts/crm-lead";
import type { Member, SuspendPayload } from "@/lib/api/contracts/member";
import type { Invitation, CreateInvitationPayload } from "@/lib/api/contracts/invitation";
import type { DuplicateReview, CandidateLead } from "@/lib/api/contracts/duplicate";
import { pickNextRep } from "../engine/round-robin";
import { matchInterests } from "../engine/tag-interests";
import { calculateHeuristicScore } from "../engine/score";

const STORAGE_KEY = "p23-demo-db:v1";

let memoryDb: SeedDatabase | null = null;
let lastAssignedRepId: number | null = null;

export function getDb(): SeedDatabase {
  if (memoryDb) return memoryDb;

  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as SeedDatabase;
        if (parsed.version === STORAGE_KEY) {
          memoryDb = parsed;
          return memoryDb;
        }
      }
    } catch {
      // ignore storage parse errors and rebuild
    }
  }

  memoryDb = buildSeedDatabase();
  saveDb(memoryDb);
  return memoryDb;
}

export function saveDb(db: SeedDatabase) {
  memoryDb = db;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch {
      // quota or private mode fallback
    }
  }
}

export function resetDb(): SeedDatabase {
  const fresh = buildSeedDatabase();
  saveDb(fresh);
  return fresh;
}

export function getCurrentUser(): Member {
  const db = getDb();
  const user = db.users.find((u) => u.role === db.currentUserRole && u.status === "active")
    || db.users[0];
  return user;
}

export function setCurrentUserRole(role: "owner" | "admin" | "member") {
  const db = getDb();
  db.currentUserRole = role;
  saveDb(db);
}

export function getMembers(): Member[] {
  return getDb().users;
}

export function suspendMember(userId: number, payload: SuspendPayload): Member {
  const db = getDb();
  const index = db.users.findIndex((u) => u.id === userId);
  if (index === -1) throw new Error("Member not found");

  let suspendedUntil = payload.suspended_until ?? null;
  if (payload.suspend_type === "duration" && payload.duration_days && !suspendedUntil) {
    const d = new Date();
    d.setDate(d.getDate() + payload.duration_days);
    suspendedUntil = d.toISOString();
  }

  const now = new Date().toISOString();
  db.users[index] = {
    ...db.users[index],
    status: "suspended",
    suspended_at: now,
    suspended_reason: payload.reason,
    suspended_until: suspendedUntil,
  };
  saveDb(db);
  return db.users[index];
}

export function reactivateMember(userId: number): Member {
  const db = getDb();
  const index = db.users.findIndex((u) => u.id === userId);
  if (index === -1) throw new Error("Member not found");

  db.users[index] = {
    ...db.users[index],
    status: "active",
    suspended_at: null,
    suspended_until: null,
    suspended_reason: null,
  };
  saveDb(db);
  return db.users[index];
}

export function updateMemberRole(userId: number, role: "owner" | "admin" | "member"): Member {
  const db = getDb();
  const index = db.users.findIndex((u) => u.id === userId);
  if (index === -1) throw new Error("Member not found");

  db.users[index] = { ...db.users[index], role };
  saveDb(db);
  return db.users[index];
}

export function removeMember(userId: number) {
  const db = getDb();
  db.users = db.users.filter((u) => u.id !== userId);
  saveDb(db);
}

export function getInvitations(): Invitation[] {
  return getDb().invitations;
}

export function createInvitation(payload: CreateInvitationPayload): Invitation {
  const db = getDb();
  const newId = (db.invitations.reduce((max, i) => Math.max(max, i.id), 0) || 0) + 1;
  const inv: Invitation = {
    id: newId,
    email: payload.email,
    role: payload.role,
    status: "pending",
    created_at: new Date().toISOString(),
  };
  db.invitations.unshift(inv);
  saveDb(db);
  return inv;
}

export function revokeInvitation(invitationId: number) {
  const db = getDb();
  db.invitations = db.invitations.filter((i) => i.id !== invitationId);
  saveDb(db);
}

export function resendInvitation(invitationId: number): Invitation {
  const db = getDb();
  const index = db.invitations.findIndex((i) => i.id === invitationId);
  if (index === -1) throw new Error("Invitation not found");
  db.invitations[index].created_at = new Date().toISOString();
  saveDb(db);
  return db.invitations[index];
}

export function getLeads(): CrmLead[] {
  return getDb().leads;
}

export function getLeadById(id: number): CrmLead | undefined {
  return getDb().leads.find((l) => l.id === id);
}

export function insertLead(lead: CrmLead): CrmLead {
  const db = getDb();
  db.leads.unshift(lead);
  saveDb(db);
  return lead;
}

export function updateLead(id: number, patch: Partial<CrmLead>): CrmLead {
  const db = getDb();
  const index = db.leads.findIndex((l) => l.id === id);
  if (index === -1) throw new Error("Lead not found");

  db.leads[index] = {
    ...db.leads[index],
    ...patch,
    updated_at: new Date().toISOString(),
  };
  saveDb(db);
  return db.leads[index];
}

export function deleteLead(id: number) {
  const db = getDb();
  db.leads = db.leads.filter((l) => l.id !== id);
  saveDb(db);
}

export function getSocialSignals() {
  return getDb().socialSignals;
}

export function getIcpProfiles() {
  return getDb().icpProfiles;
}

export function getPipeline() {
  return getDb().pipeline;
}

export function getNextRoundRobinRep(): Member | null {
  const db = getDb();
  const nextId = pickNextRep(db.users, lastAssignedRepId);
  if (!nextId) {
    const owner = db.users.find((u) => u.role === "owner") || db.users[0];
    return owner || null;
  }
  lastAssignedRepId = nextId;
  return db.users.find((u) => u.id === nextId) || null;
}

export function getDuplicateReviews(): DuplicateReview[] {
  const db = getDb();
  return db.duplicateReviews.map((r) => ({
    ...r,
    existing_lead: db.leads.find((l) => l.id === r.existing_lead_id),
  }));
}

export function addDuplicateReview(item: {
  candidate_lead: Partial<CandidateLead> | any;
  existing_lead_id: number;
  match_reason?: string;
  match_field?: "phone" | "email" | "domain";
}): DuplicateReview {
  const db = getDb();
  const id = (db.duplicateReviews.reduce((max, r) => Math.max(max, r.id), 0) || 0) + 1;
  const review: DuplicateReview = {
    id,
    candidate_lead: {
      name: item.candidate_lead?.name || "Unknown Lead",
      email: item.candidate_lead?.email || null,
      phone: item.candidate_lead?.phone || null,
      company_name: item.candidate_lead?.company_name || null,
      position: item.candidate_lead?.position || null,
      channel: item.candidate_lead?.channel || "website",
      capture_method: item.candidate_lead?.capture_method || "manual",
      summary: item.candidate_lead?.summary || null,
      profile_urls: item.candidate_lead?.profile_urls || [],
    },
    existing_lead_id: item.existing_lead_id,
    match_reason: item.match_reason || `Duplicate phone number match`,
    match_field: item.match_field || "phone",
    status: "pending",
    created_at: new Date().toISOString(),
  };
  db.duplicateReviews.unshift(review);
  saveDb(db);
  return review;
}

export function resolveDuplicateReview(id: number) {
  const db = getDb();
  db.duplicateReviews = db.duplicateReviews.filter((r) => r.id !== id);
  saveDb(db);
}

export function mergeDuplicateReview(id: number): CrmLead {
  const db = getDb();
  const reviewIndex = db.duplicateReviews.findIndex((r) => r.id === id);
  if (reviewIndex === -1) throw new Error("Duplicate review item not found");

  const review = db.duplicateReviews[reviewIndex];
  const existingLeadIndex = db.leads.findIndex((l) => l.id === review.existing_lead_id);
  if (existingLeadIndex === -1) throw new Error("Existing lead not found");

  const existing = db.leads[existingLeadIndex];
  const cand = review.candidate_lead;

  // Merge non-empty candidate fields into existing lead
  const updated: CrmLead = {
    ...existing,
    email: existing.email || cand.email || null,
    phone: existing.phone || cand.phone || null,
    company_name: existing.company_name || cand.company_name || null,
    position: existing.position || cand.position || null,
    summary: cand.summary
      ? `${existing.summary || ""}\n[Merged Note]: ${cand.summary}`.trim()
      : existing.summary,
    profile_urls: Array.from(
      new Set([...(existing.profile_urls || []), ...(cand.profile_urls || [])])
    ),
  };

  db.leads[existingLeadIndex] = updated;

  // Append source event
  db.sourceEvents.unshift({
    id: Date.now(),
    lead_id: existing.id,
    channel: cand.channel || "website",
    capture_method: cand.capture_method || "manual",
    created_at: new Date().toISOString(),
  });

  // Remove from queue
  db.duplicateReviews.splice(reviewIndex, 1);
  saveDb(db);
  return updated;
}

export function keepBothDuplicateReview(id: number): CrmLead {
  const db = getDb();
  const reviewIndex = db.duplicateReviews.findIndex((r) => r.id === id);
  if (reviewIndex === -1) throw new Error("Duplicate review item not found");

  const review = db.duplicateReviews[reviewIndex];
  const cand = review.candidate_lead;

  const newId = Math.floor(Math.random() * 900000) + 100000;
  const rep = getNextRoundRobinRep();
  const interestMatch = matchInterests([cand.name, cand.company_name, cand.summary]);

  const newLead: CrmLead = crmLeadSchema.parse({
    id: newId,
    organization_id: 1,
    name: cand.name,
    email: cand.email || null,
    phone: cand.phone || null,
    company_name: cand.company_name || null,
    position: cand.position || null,
    summary: cand.summary || null,
    source: cand.channel || "manual",
    capture_method: cand.capture_method || "manual",
    channel: cand.channel || "website",
    status: "new",
    priority: "medium",
    assigned_to_user_id: rep ? rep.id : null,
    assignee: rep ? { id: rep.id, name: rep.name, email: rep.email } : null,
    interests: interestMatch.interests,
    primary_interest: interestMatch.primary_interest,
    score: calculateHeuristicScore(cand),
    contacts: [],
    profile_urls: cand.profile_urls || [],
    created_at: new Date().toISOString(),
  });

  db.leads.unshift(newLead);
  db.duplicateReviews.splice(reviewIndex, 1);
  saveDb(db);
  return newLead;
}
