import { z } from "zod";

export const enquiryRequestSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().nullable().optional(),
  company_name: z.string().min(1, "Company name is required"),
  position: z.string().nullable().optional(),
  message: z.string().min(1, "Project details or enquiry message is required"),
  services_needed: z.string().nullable().optional(),
});
export type EnquiryRequest = z.infer<typeof enquiryRequestSchema>;
