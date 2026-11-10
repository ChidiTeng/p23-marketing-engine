import { z } from "zod";

export const memberRoleSchema = z.enum(["owner", "admin", "member"]);
export type MemberRole = z.infer<typeof memberRoleSchema>;

export const memberStatusSchema = z.enum(["active", "suspended"]);
export type MemberStatus = z.infer<typeof memberStatusSchema>;

export const suspendTypeSchema = z.enum(["duration", "date", "permanent"]);
export type SuspendType = z.infer<typeof suspendTypeSchema>;

export const suspendPayloadSchema = z.object({
  suspend_type: suspendTypeSchema,
  duration_days: z.number().optional(),
  suspended_until: z.string().optional(),
  reason: z.string().min(1, "Reason is required"),
});
export type SuspendPayload = z.infer<typeof suspendPayloadSchema>;

export const memberSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  role: memberRoleSchema,
  status: memberStatusSchema.default("active"),
  avatar_url: z.string().nullable().default(null),
  created_at: z.string(),
  suspended_at: z.string().nullable().default(null),
  suspended_until: z.string().nullable().default(null),
  suspended_reason: z.string().nullable().default(null),
});
export type Member = z.infer<typeof memberSchema>;
