import { describe, expect, it } from "vitest";
import { pickNextRep } from "./round-robin";
import { matchInterests } from "./tag-interests";
import { calculateHeuristicScore } from "./score";
import { checkDuplicate } from "./dedupe";
import type { Member } from "@/lib/api/contracts/member";
import type { CrmLead } from "@/lib/api/contracts/crm-lead";

describe("round-robin assignment engine", () => {
  const reps: Member[] = [
    { id: 10, name: "David Kalu", email: "david@example.com", role: "member", status: "active", avatar_url: null, created_at: "", suspended_at: null, suspended_until: null, suspended_reason: null },
    { id: 20, name: "Elena Rostova", email: "elena@example.com", role: "member", status: "active", avatar_url: null, created_at: "", suspended_at: null, suspended_until: null, suspended_reason: null },
    { id: 30, name: "Marcus Brody", email: "marcus@example.com", role: "member", status: "active", avatar_url: null, created_at: "", suspended_at: null, suspended_until: null, suspended_reason: null },
  ];

  it("assigns first active rep when lastAssignedId is null", () => {
    expect(pickNextRep(reps, null)).toBe(10);
  });

  it("advances in round-robin order: 10 -> 20 -> 30 -> 10", () => {
    expect(pickNextRep(reps, 10)).toBe(20);
    expect(pickNextRep(reps, 20)).toBe(30);
    expect(pickNextRep(reps, 30)).toBe(10);
  });

  it("skips a suspended rep", () => {
    const withSuspended: Member[] = [
      reps[0],
      { ...reps[1], status: "suspended" },
      reps[2],
    ];
    // Next after 10 should skip 20 and pick 30
    expect(pickNextRep(withSuspended, 10)).toBe(30);
  });

  it("returns null if no active members exist", () => {
    expect(pickNextRep([], null)).toBeNull();
    const allSuspended: Member[] = reps.map((r) => ({ ...r, status: "suspended" }));
    expect(pickNextRep(allSuspended, null)).toBeNull();
  });
});

describe("keyword interest tagging engine", () => {
  it("tags construction from building/materials keywords", () => {
    const res = matchInterests(["Lekki Phase 2 Building Projects", "Civil Contractor"]);
    expect(res.primary_interest?.name).toBe("Construction");
    expect(res.interests.some((i) => i.name === "Construction")).toBe(true);
  });

  it("tags business consulting from strategy keywords", () => {
    const res = matchInterests(["Fintech Governance Advisory Ltd", "Managing Director"]);
    expect(res.primary_interest?.name).toBe("Business Consulting");
  });

  it("returns null for unrecognized text", () => {
    const res = matchInterests(["Random text without known industry terms"]);
    expect(res.primary_interest).toBeNull();
    expect(res.interests).toHaveLength(0);
  });
});

describe("lead heuristic scoring engine", () => {
  it("calculates high score for complete profile", () => {
    const score = calculateHeuristicScore({
      name: "Tunde Bakare",
      email: "tunde@domain.com",
      phone: "+2348012345678",
      company_name: "Apex Engineering",
      position: "VP Operations",
      summary: "Leading commercial concrete and foundation works across West Africa.",
      primary_interest: { id: 1, name: "Construction" },
    });
    expect(score).toBe(100);
  });

  it("calculates lower score for sparse profile", () => {
    const score = calculateHeuristicScore({
      name: "Anonymous Prospect",
      email: "anon@domain.com",
    });
    expect(score).toBe(40);
  });
});

describe("deduplication engine", () => {
  const existing: CrmLead[] = [
    {
      id: 101,
      organization_id: 1,
      name: "Chinedu Okeke",
      source: "website",
      capture_method: "website_form",
      channel: "website",
      status: "new",
      priority: "medium",
      email: "chinedu@apex.ng",
      phone: "+2348099887766",
      company_name: "Apex Ltd",
      position: "CEO",
      summary: "Inquiry about logistics",
      budget_amount: null,
      budget_currency: "USD",
      location: "Lagos",
      logo_url: null,
      contacts: [],
      profile_urls: ["https://linkedin.com/in/chinedu-okeke"],
      assigned_to_user_id: 10,
      assignee: null,
      created_by_user_id: null,
      creator: null,
      primary_interest: null,
      interests: [],
      score: 70,
      pipeline_id: 1,
      created_at: "2026-10-01T10:00:00Z",
    },
  ];

  it("detects exact match on identical email", () => {
    const result = checkDuplicate({ email: "CHINEDU@APEX.NG" }, existing);
    expect(result.type).toBe("exact_match");
    if (result.type === "exact_match") {
      expect(result.existingLead.id).toBe(101);
    }
  });

  it("detects exact match on matching profile URL", () => {
    const result = checkDuplicate({ profile_urls: ["https://linkedin.com/in/chinedu-okeke"] }, existing);
    expect(result.type).toBe("exact_match");
  });

  it("routes to phone review when phone matches but email is absent or different", () => {
    const result = checkDuplicate({ email: "other@apex.ng", phone: "+234-809-988-7766" }, existing);
    expect(result.type).toBe("phone_review");
    if (result.type === "phone_review") {
      expect(result.existingLead.id).toBe(101);
    }
  });

  it("marks unique when no identifiers match", () => {
    const result = checkDuplicate({ email: "fresh@other.com", phone: "+2348011223344" }, existing);
    expect(result.type).toBe("unique");
  });
});
