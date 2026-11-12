import { ExecutiveDashboardView } from "@/components/dashboard/executive/executive-dashboard-view";
import { Navbar } from "@/components/layout/navbar";
import { P23ThemeProvider } from "@/components/providers/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <P23ThemeProvider>{ui}</P23ThemeProvider>
    </QueryClientProvider>
  );
}

describe("ExecutiveDashboardView & Dual-Theme Architecture", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-p23-theme");
  });

  it("renders the greeting header and all 5 KPI cards matching the reference design", async () => {
    renderWithProviders(<ExecutiveDashboardView />);

    expect(screen.getByTestId("dashboard-greeting-eyebrow").textContent).toContain(
      "WELCOME BACK, EMMANUEL"
    );
    expect(screen.getByRole("heading", { name: "Dashboard" })).toBeTruthy();

    // 5 KPI Cards
    expect(screen.getByTestId("kpi-total-revenue").textContent).toContain("$184,200");
    expect(screen.getByTestId("kpi-qualified-leads").textContent).toContain("24,850");
    expect(screen.getByTestId("kpi-conversion-rate").textContent).toContain("18.7%");
    expect(screen.getByTestId("kpi-active-opps").textContent).toContain("4,720");
    expect(screen.getByTestId("kpi-programmes").textContent).toContain("1,240");
  });

  it("renders Revenue Performance, Business Engines, and Hot Leads in Row 2", async () => {
    renderWithProviders(<ExecutiveDashboardView />);

    // Revenue Performance & active bar tooltip
    expect(screen.getByTestId("card-revenue-performance")).toBeTruthy();
    expect(screen.getByTestId("active-bar-tooltip").textContent).toContain("$184,200");
    expect(screen.getByTestId("active-bar-tooltip").textContent).toContain("+14%");

    // Switch Revenue Performance timeframe to 7D
    fireEvent.click(screen.getByTestId("rev-period-7D"));
    expect(screen.getByTestId("rev-period-7D").getAttribute("aria-selected")).toBe("true");

    // Business Engines
    const enginesText = screen.getByTestId("card-business-engines").textContent ?? "";
    expect(enginesText).toContain("B2B Market Entry");
    expect(enginesText).toContain("42%");
    expect(enginesText).toContain("Membership");
    expect(enginesText).toContain("33%");
    expect(enginesText).toContain("Paid Programmes");
    expect(enginesText).toContain("25%");

    // Hot Leads
    const hotLeadsText = screen.getByTestId("card-hot-leads").textContent ?? "";
    expect(hotLeadsText).toContain("TechGlobal Ltd");
    expect(hotLeadsText).toContain("Kora Systems");
    expect(hotLeadsText).toContain("Alpha Retail");
    expect(hotLeadsText).toContain("Nova Health");
    expect(hotLeadsText).toContain("Delta Finance");
  });

  it("renders Lead Source Donut, Conversion Funnel, and Real-Time Activity in Row 3", async () => {
    renderWithProviders(<ExecutiveDashboardView />);

    const leadSourceText = screen.getByTestId("card-lead-sources").textContent ?? "";
    expect(leadSourceText).toContain("Website");
    expect(leadSourceText).toContain("36.4%");
    expect(leadSourceText).toContain("Referrals");
    expect(leadSourceText).toContain("24.6%");

    const funnelText = screen.getByTestId("card-conversion-funnel").textContent ?? "";
    expect(funnelText).toContain("Leads");
    expect(funnelText).toContain("Engaged");
    expect(funnelText).toContain("Qualified");
    expect(funnelText).toContain("Converted");

    const activityText = screen.getByTestId("card-realtime-activity").textContent ?? "";
    expect(activityText).toContain("Live");
    expect(activityText).toContain("New opportunity created");
    expect(activityText).toContain("Deal moved to Negotiation");
    expect(activityText).toContain("New lead added");
    expect(activityText).toContain("Programme enrolment completed");
  });

  it("opens View breakdown and Forecast modals and triggers Export Report toast", async () => {
    renderWithProviders(<ExecutiveDashboardView />);

    // Open Breakdown Modal
    fireEvent.click(screen.getByTestId("btn-view-breakdown"));
    expect(screen.getByTestId("revenue-breakdown-modal")).toBeTruthy();
    expect(screen.getByText(/West Africa Hub/i)).toBeTruthy();

    // Close Breakdown Modal
    fireEvent.click(screen.getByRole("button", { name: /Done/i }));
    expect(screen.queryByTestId("revenue-breakdown-modal")).toBeNull();

    // Open Forecast Modal
    fireEvent.click(screen.getByTestId("btn-forecast"));
    expect(screen.getByTestId("revenue-forecast-modal")).toBeTruthy();
    expect(screen.getByText(/90-Day Growth Forecast/i)).toBeTruthy();

    // Close Forecast Modal
    fireEvent.click(screen.getByRole("button", { name: /Close Forecast/i }));
    expect(screen.queryByTestId("revenue-forecast-modal")).toBeNull();

    // Trigger CSV Export
    fireEvent.click(screen.getByTestId("export-report-btn"));
    expect(screen.getByTestId("export-toast").textContent).toContain(
      "Exported p23-executive-growth-report-30d.csv"
    );
  });

  it("defaults to dark theme and toggles cleanly to light theme via Navbar", async () => {
    renderWithProviders(
      <>
        <Navbar />
        <ExecutiveDashboardView />
      </>
    );

    await waitFor(() => {
      expect(document.documentElement.getAttribute("data-p23-theme")).toBe("dark");
    });

    const toggleBtn = screen.getByTestId("theme-toggle-btn");
    fireEvent.click(toggleBtn);

    await waitFor(() => {
      expect(document.documentElement.getAttribute("data-p23-theme")).toBe("light");
      expect(window.localStorage.getItem("p23-theme-mode")).toBe("light");
    });
  });
});
