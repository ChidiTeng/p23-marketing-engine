import { z } from "zod";
import { crmLeadSchema, channelSchema, captureMethodSchema } from "./crm-lead";

export const candidateLeadSchema = z.object({
  name: z.string(),
  email: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  company_name: z.string().nullable().optional(),
  position: z.string().nullable().optional(),
  channel: channelSchema.default("website"),
  capture_method: captureMethodSchema.default("manual"),
  summary: z.string().nullable().optional(),
  profile_urls: z.array(z.string()).default([]),
});
export type CandidateLead = z.infer<typeof candidateLeadSchema>;

export const duplicateReviewSchema = z.object({
  id: z.number(),
  existing_lead_id: z.number(),
  existing_lead: crmLeadSchema.optional(),
  candidate_lead: candidateLeadSchema,
  match_reason: z.string(),
  match_field: z.enum(["phone", "email", "domain"]).default("phone"),
  status: z.enum(["pending", "merged", "dismissed"]).default("pending"),
  created_at: z.string(),
});
export type DuplicateReview = z.infer<typeof duplicateReviewSchema>;

