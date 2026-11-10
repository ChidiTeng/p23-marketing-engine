import { z } from "zod";

export const socialSignalSchema = z.object({
  id: z.number(),
  platform: z.enum(["linkedin", "x", "facebook", "reddit", "youtube"]),
  author_name: z.string(),
  author_handle: z.string(),
  author_avatar_url: z.string().nullable().default(null),
  content: z.string(),
  signal_type: z.string(),
  intent_score: z.number().min(0).max(100),
  url: z.string().url(),
  published_at: z.string(),
  starred: z.boolean().default(false),
  converted_to_lead_id: z.number().nullable().default(null),
});
export type SocialSignal = z.infer<typeof socialSignalSchema>;
