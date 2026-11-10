import { describe, expect, it } from "vitest";
import { buildSeedDatabase } from "./seed";
import { crmLeadSchema } from "@/lib/api/contracts/crm-lead";
import { memberSchema } from "@/lib/api/contracts/member";
import { invitationSchema } from "@/lib/api/contracts/invitation";
import { interestSchema } from "@/lib/api/contracts/interest";
import { socialSignalSchema } from "@/lib/api/contracts/social-signal";
import { icpProfileSchema } from "@/lib/api/contracts/icp-profile";

describe("seed database contract validation", () => {
  const db = buildSeedDatabase();

  it("seeds organisation correctly", () => {
    expect(db.organization.id).toBe(1);
    expect(db.organization.name).toBe("P23 Africa");
  });

  it("seeds 5 users matching member contract (1 owner, 1 admin, 3 reps)", () => {
    expect(db.users).toHaveLength(5);
    const owner = db.users.find((u) => u.role === "owner");
    const admin = db.users.find((u) => u.role === "admin");
    const reps = db.users.filter((u) => u.role === "member");

    expect(owner).toBeDefined();
    expect(admin).toBeDefined();
    expect(reps).toHaveLength(3);

    for (const u of db.users) {
      expect(() => memberSchema.parse(u)).not.toThrow();
    }
  });

  it("seeds 2 invitations matching invitation contract", () => {
    expect(db.invitations).toHaveLength(2);
    for (const inv of db.invitations) {
      expect(() => invitationSchema.parse(inv)).not.toThrow();
    }
  });

  it("seeds ~120 leads matching CRM lead contract", () => {
    expect(db.leads.length).toBeGreaterThanOrEqual(100);
    for (const lead of db.leads) {
      expect(() => crmLeadSchema.parse(lead)).not.toThrow();
      expect(lead.channel).toBeDefined();
      expect(lead.capture_method).toBeDefined();
      expect(lead.score).toBeGreaterThan(0);
    }
  });

  it("seeds 6 interests matching interest contract", () => {
    expect(db.interests).toHaveLength(6);
    for (const interest of db.interests) {
      expect(() => interestSchema.parse(interest)).not.toThrow();
    }
  });

  it("seeds 25 social signals matching contract", () => {
    expect(db.socialSignals).toHaveLength(25);
    for (const signal of db.socialSignals) {
      expect(() => socialSignalSchema.parse(signal)).not.toThrow();
    }
  });

  it("seeds 2 ICP profiles matching contract", () => {
    expect(db.icpProfiles).toHaveLength(2);
    for (const icp of db.icpProfiles) {
      expect(() => icpProfileSchema.parse(icp)).not.toThrow();
    }
  });
});
