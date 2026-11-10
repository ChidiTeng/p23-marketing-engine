import { describe, it, expect, beforeEach, beforeAll, afterAll, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setupServer } from "msw/node";
import { memberHandlers } from "@/mocks/handlers/members";
import { resetDb } from "@/mocks/db/store";
import {
  useOrganizationMembers,
  useOrganizationInvitations,
} from "./use-organization-members";

const server = setupServer(...memberHandlers);

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

describe("useOrganizationMembers hook", () => {
  beforeEach(() => {
    resetDb();
  });

  it("fetches members list successfully", async () => {
    const { result } = renderHook(() => useOrganizationMembers(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.members.length).toBeGreaterThan(0);

    const owner = result.current.members.find((m) => m.role === "owner");
    expect(owner).toBeDefined();
    expect(owner?.name).toBe("Alex Vance");
  });

  it("suspends a member and updates status", async () => {
    const { result } = renderHook(() => useOrganizationMembers(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const rep = result.current.members.find((m) => m.role === "member" && m.status === "active");
    expect(rep).toBeDefined();

    await act(async () => {
      await result.current.suspendMember({
        id: rep!.id,
        payload: {
          suspend_type: "duration",
          duration_days: 14,
          reason: "Annual vacation",
        },
      });
    });

    await waitFor(() => {
      const updated = result.current.members.find((m) => m.id === rep!.id);
      expect(updated?.status).toBe("suspended");
      expect(updated?.suspended_reason).toBe("Annual vacation");
    });
  });

  it("reactivates a suspended member", async () => {
    const { result } = renderHook(() => useOrganizationMembers(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const rep = result.current.members.find((m) => m.role === "member");
    expect(rep).toBeDefined();

    // First suspend
    await act(async () => {
      await result.current.suspendMember({
        id: rep!.id,
        payload: {
          suspend_type: "permanent",
          reason: "Leave",
        },
      });
    });

    // Then reactivate
    await act(async () => {
      await result.current.reactivateMember(rep!.id);
    });

    await waitFor(() => {
      const updated = result.current.members.find((m) => m.id === rep!.id);
      expect(updated?.status).toBe("active");
      expect(updated?.suspended_at).toBeNull();
    });
  });

  it("updates member role", async () => {
    const { result } = renderHook(() => useOrganizationMembers(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const rep = result.current.members.find((m) => m.role === "member");
    expect(rep).toBeDefined();

    await act(async () => {
      await result.current.updateRole({
        id: rep!.id,
        role: "admin",
      });
    });

    await waitFor(() => {
      const updated = result.current.members.find((m) => m.id === rep!.id);
      expect(updated?.role).toBe("admin");
    });
  });
});

describe("useOrganizationInvitations hook", () => {
  beforeEach(() => {
    resetDb();
  });

  it("fetches invitations and creates a new invite", async () => {
    const { result } = renderHook(() => useOrganizationInvitations(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const initialCount = result.current.invitations.length;

    await act(async () => {
      await result.current.inviteUser({
        email: "newcandidate@p23marketing.test",
        role: "member",
      });
    });

    await waitFor(() => {
      expect(result.current.invitations.length).toBe(initialCount + 1);
      const created = result.current.invitations.find(
        (i) => i.email === "newcandidate@p23marketing.test"
      );
      expect(created).toBeDefined();
      expect(created?.role).toBe("member");
    });
  });

  it("revokes an existing invitation", async () => {
    const { result } = renderHook(() => useOrganizationInvitations(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.invitations.length).toBeGreaterThan(0);
    const target = result.current.invitations[0];

    await act(async () => {
      await result.current.revokeInvitation(target.id);
    });

    await waitFor(() => {
      const found = result.current.invitations.find((i) => i.id === target.id);
      expect(found).toBeUndefined();
    });
  });
});

