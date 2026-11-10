import { describe, it, expect, beforeEach, beforeAll, afterAll, afterEach } from "vitest";
import { setupServer } from "msw/node";
import { enquiryHandlers } from "@/mocks/handlers/enquiries";
import { resetDb, getLeads, getDuplicateReviews } from "@/mocks/db/store";
import { SALES_ENGINE_API_BASE_URL } from "@/lib/api/sales-engine";

const server = setupServer(...enquiryHandlers);

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("Website Enquiry Intake (/demo/enquiry)", () => {
  beforeEach(() => {
    resetDb();
  });

  it("processes a construction inquiry, tags interest, and assigns rep via round-robin", async () => {
    const initialLeads = getLeads().length;

    const res = await fetch(`${SALES_ENGINE_API_BASE_URL}/public/enquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Emeka Okafor",
        email: "emeka.civil@okaforstructures.ng",
        phone: "+234 802 334 1122",
        company_name: "Okafor Civil Engineering Ltd",
        position: "Chief Project Engineer",
        services_needed: "Commercial building construction and materials procurement",
        message: "We need concrete supplies, architectural compliance, and civil engineering advisory.",
      }),
    });

    expect(res.ok).toBe(true);
    const payload = await res.json();
    expect(payload.success).toBe(true);
    expect(payload.data.name).toBe("Emeka Okafor");
    expect(payload.data.primary_interest?.name).toBe("Construction");
    expect(payload.data.capture_method).toBe("website_form");
    expect(payload.data.channel).toBe("website");
    expect(payload.data.assignee).toBeDefined();
    expect(payload.data.score).toBeGreaterThanOrEqual(80);

    const updatedLeads = getLeads();
    expect(updatedLeads.length).toBe(initialLeads + 1);
  });

  it("processes a technology inquiry and tags Technology interest", async () => {
    const res = await fetch(`${SALES_ENGINE_API_BASE_URL}/public/enquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Amina Aliyu",
        email: "amina@paywave-fintech.io",
        phone: "+234 805 776 9900",
        company_name: "PayWave Africa Tech",
        position: "VP of Product",
        services_needed: "Cloud payments software and API integration",
        message: "We need fintech payment software, cloud platform scaling, cybersecurity, and SaaS data integrations.",
      }),
    });

    expect(res.ok).toBe(true);
    const payload = await res.json();
    expect(payload.success).toBe(true);
    expect(payload.data.primary_interest?.name).toBe("Technology");
  });

  it("routes duplicate phone submission to review queue", async () => {
    const initialReviews = getDuplicateReviews().length;
    const leads = getLeads();
    const existingLead = leads[0];

    const res = await fetch(`${SALES_ENGINE_API_BASE_URL}/public/enquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Tunde Duplicate",
        email: "tunde.alt@new-venture.com",
        phone: existingLead.phone, // Matching phone
        company_name: "Alternate Venture Entity",
        position: "Managing Director",
        services_needed: "Advisory",
        message: "Submitting inquiry with our company phone.",
      }),
    });

    expect(res.ok).toBe(true);
    const payload = await res.json();
    expect(payload.success).toBe(true);

    const updatedReviews = getDuplicateReviews();
    expect(updatedReviews.length).toBe(initialReviews + 1);
  });
});
