import { z } from "zod";

export const interestItemSchema = z.object({
  id: z.number(),
  name: z.string(),
});
export type InterestItem = z.infer<typeof interestItemSchema>;

export const interestSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  keywords: z.array(z.string()),
});
export type Interest = z.infer<typeof interestSchema>;
