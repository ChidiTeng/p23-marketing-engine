import { SALES_ENGINE_API_BASE_URL, SalesEngineApiError } from "./sales-engine";
import { getSalesEngineToken } from "@/lib/sales-engine/session";
import { getAuthTokenFromDocument } from "@/lib/auth/session";
import type { Member, MemberRole, SuspendPayload } from "./contracts/member";
import type { Invitation, CreateInvitationPayload } from "./contracts/invitation";
import type { ApiEnvelope } from "./contracts/envelope";

async function memberApiRequest<T>(
  path: string,
  options: {
    method?: "GET" | "POST" | "PATCH" | "DELETE";
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
    message: "Failed to parse JSON response",
    data: null as unknown as T,
  }));

  if (!res.ok || payload.success === false) {
    const errorMsg =
      payload.message ||
      (typeof payload.errors === "string"
        ? payload.errors
        : `Request failed with status ${res.status}`);
    throw new SalesEngineApiError(errorMsg, res.status);
  }

  return payload.data;
}

export async function fetchOrganizationMembers(): Promise<Member[]> {
  return memberApiRequest<Member[]>("/organizations/current/members");
}

export async function suspendOrganizationMember(
  id: number,
  payload: SuspendPayload
): Promise<Member> {
  return memberApiRequest<Member>(`/organizations/current/members/${id}/suspend`, {
    method: "POST",
    body: payload,
  });
}

export async function reactivateOrganizationMember(id: number): Promise<Member> {
  return memberApiRequest<Member>(`/organizations/current/members/${id}/reactivate`, {
    method: "POST",
  });
}

export async function updateOrganizationMemberRole(
  id: number,
  role: MemberRole
): Promise<Member> {
  return memberApiRequest<Member>(`/organizations/current/members/${id}`, {
    method: "PATCH",
    body: { role },
  });
}

export async function removeOrganizationMember(id: number): Promise<void> {
  await memberApiRequest<void>(`/organizations/current/members/${id}`, {
    method: "DELETE",
  });
}

export async function fetchOrganizationInvitations(): Promise<Invitation[]> {
  return memberApiRequest<Invitation[]>("/organizations/current/invitations");
}

export async function createOrganizationInvitation(
  payload: CreateInvitationPayload
): Promise<Invitation> {
  return memberApiRequest<Invitation>("/invitations", {
    method: "POST",
    body: payload,
  });
}

export async function resendOrganizationInvitation(id: number): Promise<Invitation> {
  return memberApiRequest<Invitation>(`/invitations/${id}/resend`, {
    method: "POST",
  });
}

export async function revokeOrganizationInvitation(id: number): Promise<void> {
  await memberApiRequest<void>(`/invitations/${id}`, {
    method: "DELETE",
  });
}

