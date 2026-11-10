import { z } from "zod";

export const metricSeriesPointSchema = z.object({
  date: z.string(),
  value: z.number(),
});

export const dashboardMetricsSchema = z.object({
  total_leads: z.number(),
  new_leads_this_week: z.number(),
  conversion_rate: z.number(),
  active_reps: z.number(),
  trend: z.array(metricSeriesPointSchema),
});
export type DashboardMetrics = z.infer<typeof dashboardMetricsSchema>;
