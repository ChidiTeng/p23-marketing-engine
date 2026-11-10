import type { CrmLead } from "@/lib/api/contracts/crm-lead";

export type DedupeCheckResult =
  | { type: "exact_match"; existingLead: CrmLead }
  | { type: "phone_review"; existingLead: CrmLead }
  | { type: "unique" };

export function checkDuplicate(
  candidate: {
    email?: string | null;
    phone?: string | null;
    profile_urls?: string[];
  },
  existingLeads: CrmLead[]
): DedupeCheckResult {
  const candEmail = candidate.email?.trim().toLowerCase();
  const candPhone = candidate.phone ? candidate.phone.replace(/[^0-9+]/g, "") : null;
  const candUrls = (candidate.profile_urls || []).map((u) => u.trim().toLowerCase());

  if (candEmail) {
    const match = existingLeads.find((l) => l.email?.trim().toLowerCase() === candEmail);
    if (match) return { type: "exact_match", existingLead: match };
  }

  if (candUrls.length > 0) {
    const match = existingLeads.find((l) =>
      l.profile_urls?.some((url) => candUrls.includes(url.trim().toLowerCase()))
    );
    if (match) return { type: "exact_match", existingLead: match };
  }

  if (candPhone && candPhone.length >= 7) {
    const match = existingLeads.find((l) => {
      const cleanExisting = l.phone ? l.phone.replace(/[^0-9+]/g, "") : null;
      return cleanExisting && cleanExisting === candPhone;
    });
    if (match) return { type: "phone_review", existingLead: match };
  }

  return { type: "unique" };
}
