import { z } from "zod";

export const captureMethodSchema = z.enum([
  "manual",
  "import",
  "smart_lead",
  "social_listening",
  "website_form",
]);
export type CaptureMethod = z.infer<typeof captureMethodSchema>;

export const channelSchema = z.enum([
  "google",
  "instagram",
  "linkedin",
  "tiktok",
  "youtube",
  "facebook",
  "x",
  "website",
  "referral",
  "other",
  "unknown",
]);
export type Channel = z.infer<typeof channelSchema>;

export const interestItemSchema = z.object({
  id: z.number(),
  name: z.string(),
});
export type InterestItem = z.infer<typeof interestItemSchema>;

export const crmLeadSchema = z.object({
  id: z.number(),
  organization_id: z.number().default(1),
  name: z.string(),
  source: z.string().nullable().default("manual"),
  capture_method: captureMethodSchema.default("manual"),
  channel: channelSchema.default("unknown"),
  status: z.string().default("new"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  email: z.string().nullable().default(null),
  phone: z.string().nullable().default(null),
  company_name: z.string().nullable().default(null),
  position: z.string().nullable().default(null),
  summary: z.string().nullable().default(null),
  budget_amount: z.number().nullable().default(null),
  budget_currency: z.string().default("USD"),
  location: z.string().nullable().default(null),
  logo_url: z.string().nullable().default(null),
  contacts: z.array(z.any()).default([]),
  profile_urls: z.array(z.string()).default([]),
  assigned_to_user_id: z.number().nullable().default(null),
  assignee: z.object({
    id: z.number(),
    name: z.string(),
    email: z.string(),
  }).nullable().default(null),
  created_by_user_id: z.number().nullable().default(null),
  creator: z.object({
    id: z.number(),
    name: z.string(),
    email: z.string(),
  }).nullable().default(null),
  primary_interest: interestItemSchema.nullable().default(null),
  interests: z.array(interestItemSchema).default([]),
  score: z.number().nullable().default(null),
  pipeline_id: z.number().default(1),
  created_at: z.string(),
  updated_at: z.string().optional(),
});
export type CrmLead = z.infer<typeof crmLeadSchema>;
