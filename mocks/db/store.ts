import { buildSeedDatabase, type SeedDatabase } from "./seed";
import type { CrmLead } from "@/lib/api/contracts/crm-lead";
import type { Member, SuspendPayload } from "@/lib/api/contracts/member";
import type { Invitation, CreateInvitationPayload } from "@/lib/api/contracts/invitation";

const STORAGE_KEY = "p23-demo-db:v1";

let memoryDb: SeedDatabase | null = null;

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

export function getDuplicateReviews() {
  return getDb().duplicateReviews;
}

export function addDuplicateReview(item: { candidate_lead: Partial<CrmLead>; existing_lead_id: number }) {
  const db = getDb();
  const id = (db.duplicateReviews.reduce((max, r) => Math.max(max, r.id), 0) || 0) + 1;
  const review = { id, candidate_lead: item.candidate_lead, existing_lead_id: item.existing_lead_id, created_at: new Date().toISOString() };
  db.duplicateReviews.unshift(review);
  saveDb(db);
  return review;
}

export function resolveDuplicateReview(id: number) {
  const db = getDb();
  db.duplicateReviews = db.duplicateReviews.filter((r) => r.id !== id);
  saveDb(db);
}
