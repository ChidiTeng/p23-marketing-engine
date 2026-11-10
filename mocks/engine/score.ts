import type { CrmLead } from "@/lib/api/contracts/crm-lead";

export function calculateHeuristicScore(lead: Partial<CrmLead>): number {
  let score = 20;

  if (lead.email && lead.email.trim() !== "") score += 20;
  if (lead.phone && lead.phone.trim() !== "") score += 15;
  if (lead.company_name && lead.company_name.trim() !== "") score += 15;
  if (lead.position && lead.position.trim() !== "") score += 10;
  if (lead.summary && lead.summary.trim().length > 20) score += 10;
  if (lead.primary_interest) score += 10;

  return Math.min(100, score);
}
