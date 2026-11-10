import { describe, it, expect, beforeEach, beforeAll, afterAll, afterEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setupServer } from "msw/node";
import { analyticsHandlers } from "@/mocks/handlers/analytics";
import { resetDb } from "@/mocks/db/store";
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

const server = setupServer(...analyticsHandlers);

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => {
  server.resetHandlers();
  mockPush.mockClear();
});
afterAll(() => server.close());

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("AnalyticsView Component", () => {
  beforeEach(() => {
    resetDb();
  });

  it("renders attribution analytics title and KPI cards", async () => {
    render(<AnalyticsView />, { wrapper: createWrapper() });

    expect(screen.getByText("Attribution & Performance Analytics")).toBeDefined();
    expect(screen.getByText("Total Captured Leads")).toBeDefined();
    expect(screen.getByText("Total Pipeline Value")).toBeDefined();
    expect(screen.getByText("Active Round-Robin Reps")).toBeDefined();

    await waitFor(() => {
      expect(screen.getByTestId("kpi-total-leads")).toBeDefined();
    });
  });

  it("allows switching between First Touch and Last Touch attribution models", async () => {
    render(<AnalyticsView />, { wrapper: createWrapper() });

    const firstBtn = screen.getByTestId("toggle-first-touch");
    const lastBtn = screen.getByTestId("toggle-last-touch");

    expect(firstBtn.classList.contains("is-active")).toBe(true);
    expect(lastBtn.classList.contains("is-active")).toBe(false);

    fireEvent.click(lastBtn);

    expect(firstBtn.classList.contains("is-active")).toBe(false);
    expect(lastBtn.classList.contains("is-active")).toBe(true);
  });

  it("renders sector legend and clicking a sector triggers router push to CRM filter", async () => {
    render(<AnalyticsView />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("Construction")).toBeDefined();
    });

    const constructionItem = screen.getByTitle("Filter CRM by Construction");
    fireEvent.click(constructionItem);

    expect(mockPush).toHaveBeenCalledWith("/crm?interest=Construction");
  });
});

