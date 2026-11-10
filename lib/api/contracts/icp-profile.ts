import { z } from "zod";

export const icpProfileSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable().default(null),
  is_active: z.boolean().default(false),
  target_industries: z.array(z.string()).default([]),
  target_locations: z.array(z.string()).default([]),
  company_size_min: z.number().default(1),
  company_size_max: z.number().default(500),
  created_at: z.string(),
});
export type IcpProfile = z.infer<typeof icpProfileSchema>;
