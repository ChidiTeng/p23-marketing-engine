import { describe, it, expect, beforeEach, beforeAll, afterAll, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setupServer } from "msw/node";
import { crmHandlers } from "@/mocks/handlers/crm";
import { resetDb, getLeads } from "@/mocks/db/store";
import { useDuplicateReviews } from "./use-duplicates";

const server = setupServer(...crmHandlers);

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("useDuplicateReviews hook", () => {
  beforeEach(() => {
    resetDb();
  });

  it("loads duplicate collision review queue", async () => {
    const { result } = renderHook(() => useDuplicateReviews(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.reviews.length).toBeGreaterThan(0);

    const first = result.current.reviews[0];
    expect(first.match_reason).toBeDefined();
    expect(first.candidate_lead.name).toBeDefined();
    expect(first.existing_lead).toBeDefined();
  });

  it("merges candidate details into existing lead", async () => {
    const { result } = renderHook(() => useDuplicateReviews(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const target = result.current.reviews[0];
    const initialCount = result.current.reviews.length;
    const existingId = target.existing_lead_id;

    await act(async () => {
      await result.current.mergeDuplicate(target.id);
    });

    await waitFor(() => {
      expect(result.current.reviews.length).toBe(initialCount - 1);
    });

    const existingLeads = getLeads();
    const updatedLead = existingLeads.find((l) => l.id === existingId);
    expect(updatedLead).toBeDefined();
    if (target.candidate_lead.summary) {
      expect(updatedLead?.summary).toContain(target.candidate_lead.summary);
    }
  });

  it("creates a separate lead and assigns via round-robin when keepBoth is selected", async () => {
    const { result } = renderHook(() => useDuplicateReviews(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const target = result.current.reviews[0];
    const initialLeadsCount = getLeads().length;

    await act(async () => {
      await result.current.keepBothDuplicate(target.id);
    });

    await waitFor(() => {
      const allLeads = getLeads();
      expect(allLeads.length).toBe(initialLeadsCount + 1);
      const newLead = allLeads.find((l) => l.name === target.candidate_lead.name);
      expect(newLead).toBeDefined();
      expect(newLead?.assigned_to_user_id).not.toBeNull();
      expect(newLead?.assignee).toBeDefined();
    });
  });

  it("dismisses duplicate review item", async () => {
    const { result } = renderHook(() => useDuplicateReviews(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const target = result.current.reviews[0];
    const initialCount = result.current.reviews.length;

    await act(async () => {
      await result.current.dismissDuplicate(target.id);
    });

    await waitFor(() => {
      expect(result.current.reviews.length).toBe(initialCount - 1);
      const exists = result.current.reviews.some((r) => r.id === target.id);
      expect(exists).toBe(false);
    });
  });
});
