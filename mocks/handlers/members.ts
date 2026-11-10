import { http, HttpResponse } from "msw";
import {
  getMembers,
  suspendMember,
  reactivateMember,
  updateMemberRole,
  removeMember,
  getInvitations,
  createInvitation,
  revokeInvitation,
  resendInvitation,
} from "../db/store";
import { suspendPayloadSchema } from "@/lib/api/contracts/member";
import { createInvitationSchema } from "@/lib/api/contracts/invitation";
import { withLatency } from "../utils/latency";

export const memberHandlers = [
  http.get("*/organizations/current/members", async () => {
    await withLatency();
    return HttpResponse.json({ success: true, data: getMembers() });
  }),

  http.get("*/admin/crm/members", async () => {
    await withLatency();
    return HttpResponse.json({ success: true, data: getMembers() });
  }),

  http.post("*/organizations/current/members/:id/suspend", async ({ params, request }) => {
    await withLatency();
    const id = Number(params.id);
    const body = await request.json();
    const parsed = suspendPayloadSchema.safeParse(body);
    if (!parsed.success) {
      return HttpResponse.json({ message: "Invalid payload", errors: parsed.error.flatten().fieldErrors }, { status: 422 });
    }
    const updated = suspendMember(id, parsed.data);
    return HttpResponse.json({ success: true, message: "Member suspended.", data: updated });
  }),

  http.post("*/organizations/current/members/:id/reactivate", async ({ params }) => {
    await withLatency();
    const id = Number(params.id);
    const updated = reactivateMember(id);
    return HttpResponse.json({ success: true, message: "Member reactivated.", data: updated });
  }),

  http.patch("*/organizations/current/members/:id", async ({ params, request }) => {
    await withLatency();
    const id = Number(params.id);
    const body = (await request.json()) as { role: "owner" | "admin" | "member" };
    const updated = updateMemberRole(id, body.role);
    return HttpResponse.json({ success: true, message: "Role updated.", data: updated });
  }),

  http.delete("*/organizations/current/members/:id", async ({ params }) => {
    await withLatency();
    const id = Number(params.id);
    removeMember(id);
    return HttpResponse.json({ success: true, message: "Member removed." });
  }),

  http.get("*/organizations/current/invitations", async () => {
    await withLatency();
    return HttpResponse.json({ success: true, data: getInvitations() });
  }),

  http.get("*/invitations", async () => {
    await withLatency();
    return HttpResponse.json({ success: true, data: getInvitations() });
  }),

  http.post("*/invitations", async ({ request }) => {
    await withLatency();
    const body = await request.json();
    const parsed = createInvitationSchema.safeParse(body);
    if (!parsed.success) {
      return HttpResponse.json({ message: "Invalid payload", errors: parsed.error.flatten().fieldErrors }, { status: 422 });
    }
    const created = createInvitation(parsed.data);
    return HttpResponse.json({ success: true, message: "Invitation sent.", data: created }, { status: 201 });
  }),

  http.post("*/invitations/:id/resend", async ({ params }) => {
    await withLatency();
    const id = Number(params.id);
    const resent = resendInvitation(id);
    return HttpResponse.json({ success: true, message: "Invitation resent.", data: resent });
  }),

  http.delete("*/invitations/:id", async ({ params }) => {
    await withLatency();
    const id = Number(params.id);
    revokeInvitation(id);
    return HttpResponse.json({ success: true, message: "Invitation revoked." });
  }),
];
