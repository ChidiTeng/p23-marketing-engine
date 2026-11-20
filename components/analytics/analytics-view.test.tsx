import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { resetEmailAutomationStore } from "@/lib/api/contracts/email-automation";
import { AnalyticsView } from "./analytics-view";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// ResponsiveContainer mock for jsdom environment
vi.mock("recharts", async (importOriginal) => {
  const original = await importOriginal<typeof import("recharts")>();
  return {
    ...original,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: 400, height: 300 }}>{children}</div>
    ),
  };
});

describe("AnalyticsView Component (Dedicated Email Automation Analytics & Reports)", () => {
  beforeEach(() => {
    mockPush.mockClear();
    resetEmailAutomationStore();
  });

  it("exclusively renders Email Automation Analytics & Reports with Sent, Delivered, Opened, and Link Performance (Clicks)", () => {
    render(<AnalyticsView />);

    expect(
      screen.getByText("Email Automation Analytics & Reports")
    ).toBeDefined();
    expect(screen.getByTestId("kpi-total-emails-sent").textContent).toContain(
      "13,720"
    );
    expect(screen.getByTestId("kpi-total-emails-sent").textContent).toContain(
      "13,585 deliv"
    );
    expect(screen.getByTestId("kpi-email-open-rate").textContent).toContain(
      "64.3%"
    );
    expect(screen.getByTestId("kpi-email-ctr-reply").textContent).toContain(
      "3,399 clicks"
    );
    expect(
      screen.getByTestId("kpi-email-attributed-revenue").textContent
    ).toContain("$199,000");
    expect(screen.getByTestId("email-sequence-funnel")).toBeDefined();
    expect(
      screen.getByTestId("analytics-link-performance-card")
    ).toBeDefined();
    expect(screen.getByTestId("email-automation-reports-table")).toBeDefined();
  });

  it("dynamically updates Sent, Delivered, Opened, and Link Click metrics when automated emails are dispatched", () => {
    render(<AnalyticsView />);

    fireEvent.click(screen.getByTestId("analytics-simulate-dispatch-btn"));
    expect(screen.getByTestId("kpi-total-emails-sent").textContent).toContain(
      "13,770"
    );
  });

  it("allows toggling between Open & Click Rate focus and Reply & Conversion focus", () => {
    render(<AnalyticsView />);

    const openBtn = screen.getByTestId("toggle-open-rate-focus");
    const replyBtn = screen.getByTestId("toggle-reply-rate-focus");

    expect(openBtn.classList.contains("is-active")).toBe(true);
    expect(replyBtn.classList.contains("is-active")).toBe(false);

    fireEvent.click(replyBtn);

    expect(openBtn.classList.contains("is-active")).toBe(false);
    expect(replyBtn.classList.contains("is-active")).toBe(true);
  });

  it("renders AI Tone legend and navigates to Email Automation Dashboard on click", () => {
    render(<AnalyticsView />);

    const founderToneItem = screen.getByTitle(
      "Inspect Founder-to-Founder Direct workflows"
    );
    fireEvent.click(founderToneItem);

    expect(mockPush).toHaveBeenCalledWith(
      "/email-automation?tone=founder_casual"
    );
  });
});
