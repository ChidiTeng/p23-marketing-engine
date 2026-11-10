import { SALES_ENGINE_API_BASE_URL, SalesEngineApiError } from "./sales-engine";
import { getSalesEngineToken } from "@/lib/sales-engine/session";
import { getAuthTokenFromDocument } from "@/lib/auth/session";
import type { SourceBreakdown } from "./contracts/analytics";
import type { ApiEnvelope } from "./contracts/envelope";

export type LeadOverviewMetrics = {
  total_leads: number;
  new_leads_this_week: number;
  conversion_rate: number;
  active_reps: number;
  pipeline_value: number;
};

async function analyticsApiRequest<T>(path: string): Promise<T> {
  const token = getSalesEngineToken() || getAuthTokenFromDocument();
  const url = `${SALES_ENGINE_API_BASE_URL}${path}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const payload: ApiEnvelope<T> = await res.json().catch(() => ({
    success: false,
    message: "Failed to parse response",
    data: null as unknown as T,
  }));

  if (!res.ok || payload.success === false) {
    throw new SalesEngineApiError(payload.message || `Request failed with status ${res.status}`, res.status);
  }

  return payload.data;
}

export async function fetchSourceBreakdown(
  params?: { from?: string; to?: string; touch?: "first" | "last" }
): Promise<SourceBreakdown> {
  const query = new URLSearchParams();
  if (params?.from) query.set("from", params.from);
  if (params?.to) query.set("to", params.to);
  if (params?.touch) query.set("touch", params.touch);
  const qStr = query.toString() ? `?${query.toString()}` : "";
  return analyticsApiRequest<SourceBreakdown>(`/crm/analytics/sources${qStr}`);
}

export async function fetchLeadOverviewAnalytics(): Promise<LeadOverviewMetrics> {
  return analyticsApiRequest<LeadOverviewMetrics>("/crm/leads/analytics");
}

