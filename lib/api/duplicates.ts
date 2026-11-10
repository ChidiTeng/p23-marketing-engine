import { SALES_ENGINE_API_BASE_URL, SalesEngineApiError } from "./sales-engine";
import { getSalesEngineToken } from "@/lib/sales-engine/session";
import { getAuthTokenFromDocument } from "@/lib/auth/session";
import type { DuplicateReview } from "./contracts/duplicate";
import type { CrmLead } from "./contracts/crm-lead";
import type { ApiEnvelope } from "./contracts/envelope";

async function duplicateApiRequest<T>(
  path: string,
  options: {
    method?: "GET" | "POST" | "DELETE";
    body?: unknown;
  } = {}
): Promise<T> {
  const token = getSalesEngineToken() || getAuthTokenFromDocument();
  const url = `${SALES_ENGINE_API_BASE_URL}${path}`;

  const res = await fetch(url, {
    method: options.method ?? "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
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

export async function fetchDuplicateReviews(): Promise<DuplicateReview[]> {
  return duplicateApiRequest<DuplicateReview[]>("/admin/crm/duplicates");
}

export async function mergeDuplicateReview(id: number): Promise<CrmLead> {
  return duplicateApiRequest<CrmLead>(`/admin/crm/duplicates/${id}/merge`, {
    method: "POST",
  });
}

export async function keepBothDuplicateReview(id: number): Promise<CrmLead> {
  return duplicateApiRequest<CrmLead>(`/admin/crm/duplicates/${id}/keep-both`, {
    method: "POST",
  });
}

export async function dismissDuplicateReview(id: number): Promise<void> {
  await duplicateApiRequest<void>(`/admin/crm/duplicates/${id}`, {
    method: "DELETE",
  });
}

