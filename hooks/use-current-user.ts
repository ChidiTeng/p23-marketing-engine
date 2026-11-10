"use client";

import { useQuery } from "@tanstack/react-query";
import { SALES_ENGINE_API_BASE_URL } from "@/lib/api/sales-engine";
import { getSalesEngineToken } from "@/lib/sales-engine/session";
import { getAuthTokenFromDocument } from "@/lib/auth/session";
import { useAuthStore } from "@/store/auth";
import type { MemberRole } from "@/lib/api/contracts/member";
import { useEffect } from "react";

export type CurrentUser = {
  id: number;
  name: string;
  email: string;
  role: MemberRole;
  avatar_url?: string | null;
};

export const CURRENT_USER_QUERY_KEY = ["auth", "me"] as const;

export function useCurrentUser() {
  const setUser = useAuthStore((s) => s.setUser);

  const query = useQuery({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: async (): Promise<CurrentUser> => {
      const token = getSalesEngineToken() || getAuthTokenFromDocument();
      const res = await fetch(`${SALES_ENGINE_API_BASE_URL}/auth/me`, {
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch user session");
      }

      const payload = await res.json();
      const data = payload?.data || payload?.user || payload;
      const role: MemberRole = (data?.role || data?.organization_role || "member") as MemberRole;

      return {
        id: data?.id,
        name: data?.name || "User",
        email: data?.email || "",
        role,
        avatar_url: data?.avatar_url || data?.avatar,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });

  // Sync to zustand store if available
  useEffect(() => {
    if (query.data) {
      setUser({
        id: query.data.id,
        name: query.data.name,
        email: query.data.email,
        avatar: query.data.avatar_url ?? null,
        access_role: query.data.role,
        active_company: null,
      });
    }
  }, [query.data, setUser]);

  const role = query.data?.role ?? (useAuthStore.getState().user?.access_role as MemberRole | undefined) ?? "member";
  const isOwner = role === "owner";
  const isAdmin = role === "admin";
  const isMember = role === "member";
  const isAdminOrOwner = isOwner || isAdmin;

  return {
    ...query,
    user: query.data,
    role,
    isOwner,
    isAdmin,
    isMember,
    isAdminOrOwner,
  };
}

