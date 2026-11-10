import { z } from "zod";

export const dateRangeSchema = z.object({
  from: z.string(),
  to: z.string(),
});
export type DateRange = z.infer<typeof dateRangeSchema>;

export const channelCountSchema = z.object({
  channel: z.string(),
  count: z.number(),
  percentage: z.number(),
});
export type ChannelCount = z.infer<typeof channelCountSchema>;

export const captureMethodCountSchema = z.object({
  capture_method: z.string(),
  count: z.number(),
  percentage: z.number(),
});
export type CaptureMethodCount = z.infer<typeof captureMethodCountSchema>;

export const interestCountSchema = z.object({
  interest: z.string(),
  count: z.number(),
  percentage: z.number(),
});
export type InterestCount = z.infer<typeof interestCountSchema>;

export const sourceBreakdownSchema = z.object({
  total_leads: z.number(),
  channels: z.array(channelCountSchema),
  capture_methods: z.array(captureMethodCountSchema),
  interests: z.array(interestCountSchema),
});
export type SourceBreakdown = z.infer<typeof sourceBreakdownSchema>;
