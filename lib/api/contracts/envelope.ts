import { z } from "zod";

export function apiEnvelopeSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    success: z.boolean().default(true),
    message: z.string().default(""),
    data: dataSchema,
    errors: z.record(z.string(), z.array(z.string())).nullable().optional(),
  });
}

export type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string[]> | null;
};
