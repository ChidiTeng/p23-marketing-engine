import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import {
  AUTOMATION_TYPE_SPECS,
  AI_TONE_SPECS,
  TRIGGER_CONFIG_SPECS,
  TARGET_AUDIENCE_SEGMENTS,
  CRM_CONTACT_TARGETS,
  getAiRecommendationForAudience,
  applyAiToneToStep,
  resetEmailAutomationStore,
  computeDynamicEmailPerformance,
} from "@/lib/api/contracts/email-automation";
import { EmailAutomationView } from "./email-automation-view";
import { CampaignsView } from "@/components/campaigns/campaigns-view";
import { CustomersView } from "@/components/customers/customers-view";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => new URLSearchParams("source=crm"),
  usePathname: () => "/email-automation",
}));

describe("Epic: Email Marketing Automation Module & AI Integration (Tickets 1–7)", () => {
  beforeEach(() => {
    mockPush.mockClear();
    resetEmailAutomationStore();
  });

  describe("Ticket 1: AI Automation Types, Tone/Vibe Rules & Trigger Specs", () => {
    it("defines the core supported automation types, AI tones, and trigger setups", () => {
      expect(Object.keys(AUTOMATION_TYPE_SPECS)).toEqual([
        "sequential_nurture",
        "onboarding_welcome",
        "behavioral_trigger",
        "re_engagement_winback",
        "event_programme_countdown",
        "milestone_renewal",
      ]);

      expect(Object.keys(AI_TONE_SPECS)).toEqual([
        "executive_corporate",
        "warm_consultative",
        "founder_casual",
        "urgent_action",
      ]);

      expect(Object.keys(TRIGGER_CONFIG_SPECS)).toEqual([
        "lead_created_crm",
        "smart_lead_synced",
        "stage_moved_qualified",
        "customer_health_drop",
        "intent_link_clicked",
        "inactivity_21d",
      ]);
    });

    it("dynamically recommends flow type, tone, trigger, and sequence steps based on selected target audience or CRM contact", () => {
      const enterpriseRec = getAiRecommendationForAudience(
        "aud-b2b-cfo-enterprise"
      );
      expect(enterpriseRec.automationType.id).toBe("sequential_nurture");
      expect(enterpriseRec.tone.id).toBe("executive_corporate");
      expect(enterpriseRec.trigger.id).toBe("lead_created_crm");
      expect(enterpriseRec.suggestedSteps.length).toBe(4);

      const contactRec = getAiRecommendationForAudience(
        "aud-smart-lead-icp",
        [CRM_CONTACT_TARGETS[1].id]
      );
      expect(contactRec.primaryContact?.name).toBe("Wanjiku Mwangi");
      expect(contactRec.suggestedSteps[0].body).toContain("Wanjiku Mwangi");

      const rewritten = applyAiToneToStep(
        contactRec.suggestedSteps[0],
        "urgent_action",
        "Paid Programmes"
      );
      expect(rewritten.subject).toContain("[Final 48h]");
      expect(rewritten.body).toContain("Paid Programmes");
    });
  });

  describe("Ticket 4: Email Automation Dashboard & Active Workflow List (Social Listening UI Pattern)", () => {
    it("renders the Social Listening style automation list and primary 'Create Automation' CTA", () => {
      render(<EmailAutomationView />);

      expect(screen.getByTestId("email-automation-dashboard")).toBeDefined();
      expect(
        screen.getByTestId("social-listening-pattern-automation-list")
      ).toBeDefined();
      expect(
        screen.getByTestId("new-ai-automation-btn").textContent
      ).toContain("Create Automation");
      expect(screen.getByTestId("kpi-emails-sent").textContent).toContain(
        "13,720"
      );
      expect(screen.getByTestId("kpi-emails-delivered").textContent).toContain(
        "13,585"
      );
      expect(screen.getByTestId("kpi-email-open-rate").textContent).toContain(
        "8,825"
      );
      expect(screen.getByTestId("kpi-email-link-clicks").textContent).toContain(
        "3,399"
      );
    });

    it("supports row-level controls to pause/resume, add steps, edit prospect/workflow settings, and delete automations", () => {
      render(<EmailAutomationView />);

      const wfId = "wf-b2b-west-africa-cfo";

      // 1. Pause active automation
      fireEvent.click(screen.getByTestId(`pause-resume-btn-${wfId}`));
      expect(
        screen.getByTestId("email-automation-toast").textContent
      ).toContain("Paused");

      // 2. Add step directly from row action button
      fireEvent.click(screen.getByTestId(`add-step-row-btn-${wfId}`));
      expect(
        screen.getByTestId("email-automation-toast").textContent
      ).toContain("Added Step 4");

      // 3. Open Edit Prospect & Workflow Settings modal from row
      fireEvent.click(screen.getByTestId(`edit-settings-btn-${wfId}`));
      expect(
        screen.getByTestId("edit-workflow-settings-modal")
      ).toBeDefined();

      const prospectInput = screen.getByTestId("edit-prospect-name-input");
      fireEvent.change(prospectInput, { target: { value: "Amaka Okafor" } });
      fireEvent.click(screen.getByTestId("save-workflow-settings-btn"));
      expect(
        screen.queryByTestId("edit-workflow-settings-modal")
      ).toBeNull();
      expect(
        screen.getByTestId("email-automation-toast").textContent
      ).toContain("Updated prospect & workflow settings");

      // 4. Delete automation
      fireEvent.click(screen.getByTestId(`delete-workflow-btn-${wfId}`));
      expect(screen.queryByTestId(`workflow-row-${wfId}`)).toBeNull();
    });
  });

  describe("Ticket 5 & Ticket 6: 'Create Automation' Flow, Sequence Builder, Audience Selector & Embedded Template Editor", () => {
    it("creates a multi-step sequence with CRM contact selection, custom waiting periods, and embedded template editing, and saves immediately to the Automation List", () => {
      render(<EmailAutomationView />);

      fireEvent.click(screen.getByTestId("new-ai-automation-btn"));
      expect(screen.getByTestId("ai-automation-create-modal")).toBeDefined();
      expect(
        screen.getByTestId("modal-workflow-sequence-builder")
      ).toBeDefined();
      expect(
        screen.getByTestId("modal-embedded-template-editor")
      ).toBeDefined();

      // Input custom Automation Name
      fireEvent.change(screen.getByTestId("create-automation-name-input"), {
        target: { value: "East Africa CFO Expansion Sequence" },
      });

      // Ticket 6: Switch Audience Selector to Specific CRM Contacts and attach Wanjiku Mwangi
      fireEvent.click(screen.getByTestId("audience-mode-contacts-btn"));
      expect(screen.getByTestId("modal-crm-contacts-list")).toBeDefined();
      fireEvent.click(screen.getByTestId("modal-contact-option-crm-contact-2"));

      // Add a step in the Workflow Sequence Builder and adjust waiting period
      fireEvent.click(screen.getByTestId("builder-add-step-btn"));
      fireEvent.change(screen.getByTestId("builder-step-wait-days-input"), {
        target: { value: "5" },
      });

      // Edit subject line in the embedded template editor inside creation modal
      fireEvent.change(screen.getByTestId("builder-step-subject-input"), {
        target: { value: "Custom AI Subject for East Africa CFOs" },
      });

      // Save & Launch Automation
      fireEvent.click(screen.getByTestId("launch-ai-automation-submit"));
      expect(screen.queryByTestId("ai-automation-create-modal")).toBeNull();

      // Verify newly created automation appears immediately in the Automation List
      expect(
        screen.getByTestId("email-workflows-table-card").textContent
      ).toContain("East Africa CFO Expansion Sequence");
    });

    it("opens the Email Template Editor from the row Edit Copy button and rewrites copy with AI tone", () => {
      render(<EmailAutomationView />);

      fireEvent.click(
        screen.getByTestId("edit-template-btn-wf-b2b-west-africa-cfo")
      );
      expect(screen.getByTestId("email-template-studio")).toBeDefined();

      fireEvent.click(screen.getByTestId("apply-tone-founder_casual"));
      expect(
        screen.getByTestId("email-automation-toast").textContent
      ).toContain("Founder-to-Founder Direct & Casual");
    });
  });

  describe("Ticket 3 & Ticket 7: Cross-Module Entry Points & Dynamic Sent/Delivered/Opened/Link Click Metrics", () => {
    it("dynamically updates Sent, Delivered, Opened, and Link Clicks when automated emails are dispatched", () => {
      render(<EmailAutomationView />);

      const beforePerf = computeDynamicEmailPerformance();
      expect(beforePerf.totalSent).toBe(13720);

      // Dispatch +50 automated emails
      fireEvent.click(screen.getByTestId("dispatch-automated-emails-btn"));

      const afterPerf = computeDynamicEmailPerformance();
      expect(afterPerf.totalSent).toBe(13770);
      expect(screen.getByTestId("kpi-emails-sent").textContent).toContain(
        "13,770"
      );
    });

    it("renders Sent, Delivered, Opened, and Link Performance (Clicks) on the Campaigns screen and syncs dynamically", () => {
      render(<CampaignsView />);

      expect(
        screen.getByTestId("campaigns-email-performance-card")
      ).toBeDefined();
      expect(
        screen.getByTestId("campaigns-email-sent-metric").textContent
      ).toBe("13,720");
      expect(
        screen.getByTestId("campaigns-email-delivered-metric").textContent
      ).toBe("13,585");
      expect(
        screen.getByTestId("campaigns-email-opened-metric").textContent
      ).toBe("8,825");
      expect(
        screen.getByTestId("campaigns-email-clicks-metric").textContent
      ).toBe("3,399");

      // Dispatch +50 directly from Campaigns Email Performance Card
      fireEvent.click(
        screen.getByTestId("campaigns-simulate-email-dispatch-btn")
      );
      expect(
        screen.getByTestId("campaigns-email-sent-metric").textContent
      ).toBe("13,770");
    });

    it("exposes 'View Email Automation' entry point in Customers", () => {
      render(<CustomersView />);

      const entryBtn = screen.getByTestId(
        "customers-view-email-automation-btn"
      );
      expect(entryBtn.textContent).toContain("View Email Automation");
      expect(entryBtn.getAttribute("href")).toBe(
        "/email-automation?source=customers"
      );
    });
  });
});
