import { describe, it, expect, beforeEach, beforeAll, afterAll, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setupServer } from "msw/node";
import { analyticsHandlers } from "@/mocks/handlers/analytics";
import { resetDb } from "@/mocks/db/store";
import { useLeadOverviewAnalytics, useSourceBreakdown } from "./use-analytics";

const server = setupServer(...analyticsHandlers);

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => server.resetHandlers());
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

describe("Analytics hooks", () => {
  beforeEach(() => {
    resetDb();
  });

  it("fetches lead overview analytics with active reps and conversion rate", async () => {
    const { result } = renderHook(() => useLeadOverviewAnalytics(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toBeDefined();
    expect(result.current.data?.total_leads).toBeGreaterThan(0);
    expect(result.current.data?.active_reps).toBeGreaterThan(0);
    expect(result.current.data?.conversion_rate).toBeGreaterThanOrEqual(0);
    expect(result.current.data?.pipeline_value).toBeGreaterThan(0);
  });

  it("fetches source breakdown with channels, capture methods, and interests", async () => {
    const { result } = renderHook(() => useSourceBreakdown({ touch: "first" }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const data = result.current.data;
    expect(data).toBeDefined();
    expect(data?.channels.length).toBeGreaterThan(0);
    expect(data?.capture_methods.length).toBeGreaterThan(0);
    expect(data?.interests.length).toBeGreaterThan(0);

    // Primary interest sectors should include categories like Technology or Construction
    const interestNames = data?.interests.map((i) => i.interest);
    expect(interestNames).toContain("Technology");
  });
});

