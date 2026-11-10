"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  fetchSourceBreakdown,
  fetchLeadOverviewAnalytics,
  type LeadOverviewMetrics,
} from "@/lib/api/analytics";
import type { SourceBreakdown } from "@/lib/api/contracts/analytics";

export function useSourceBreakdown(params?: { from?: string; to?: string; touch?: "first" | "last" }) {
  return useQuery<SourceBreakdown>({
    queryKey: queryKeys.analytics.sources(
      params?.from && params?.to ? { from: params.from, to: params.to } : undefined,
      params?.touch || "first"
    ),
    queryFn: () => fetchSourceBreakdown(params),
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useLeadOverviewAnalytics() {
  return useQuery<LeadOverviewMetrics>({
    queryKey: queryKeys.analytics.overview(),
    queryFn: fetchLeadOverviewAnalytics,
    staleTime: 1000 * 60,
  });
}

