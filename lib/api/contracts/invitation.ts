import { z } from "zod";
import { memberRoleSchema } from "./member";

export const invitationSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  role: memberRoleSchema,
  status: z.enum(["pending", "accepted", "revoked"]).default("pending"),
  created_at: z.string(),
});
export type Invitation = z.infer<typeof invitationSchema>;

export const createInvitationSchema = z.object({
  email: z.string().email(),
  role: z.enum(["admin", "member"]).default("member"),
});
export type CreateInvitationPayload = z.infer<typeof createInvitationSchema>;
