import type { Interest, InterestItem } from "@/lib/api/contracts/interest";

export const DEFAULT_INTERESTS: Interest[] = [
  {
    id: 1,
    name: "Construction",
    slug: "construction",
    keywords: [
      "construction", "building", "contractor", "civil", "architecture",
      "renovation", "materials", "concrete", "engineering", "surveying",
      "roofing", "developer"
    ],
  },
  {
    id: 2,
    name: "Business Consulting",
    slug: "business-consulting",
    keywords: [
      "consulting", "consultant", "strategy", "advisory", "management",
      "operations", "audit", "compliance", "transformation", "governance"
    ],
  },
  {
    id: 3,
    name: "Technology",
    slug: "technology",
    keywords: [
      "tech", "software", "cloud", "saas", "developer", "fintech", "ai",
      "hardware", "cybersecurity", "telecom", "data", "platform", "app"
    ],
  },
  {
    id: 4,
    name: "Real Estate",
    slug: "real-estate",
    keywords: [
      "real estate", "property", "realtor", "housing", "mortgage", "broker",
      "commercial", "estate", "leasing", "landlord", "lands", "apartments"
    ],
  },
  {
    id: 5,
    name: "Agriculture",
    slug: "agriculture",
    keywords: [
      "agriculture", "farming", "crop", "livestock", "agritech", "irrigation",
      "poultry", "agro", "harvest", "fertilizer", "agribusiness"
    ],
  },
  {
    id: 6,
    name: "Other",
    slug: "other",
    keywords: [],
  },
];

export function matchInterests(
  textFields: (string | null | undefined)[],
  interestList: Interest[] = DEFAULT_INTERESTS
): { primary_interest: InterestItem | null; interests: InterestItem[] } {
  const combined = textFields.filter(Boolean).join(" ").toLowerCase();
  const matchedInterests: InterestItem[] = [];

  for (const interest of interestList) {
    if (interest.slug === "other") continue;
    for (const kw of interest.keywords) {
      const regex = new RegExp(`\\b${kw}\\b`, "i");
      if (regex.test(combined)) {
        matchedInterests.push({ id: interest.id, name: interest.name });
        break;
      }
    }
  }

  const primary = matchedInterests.length > 0 ? matchedInterests[0] : null;
  return {
    primary_interest: primary,
    interests: matchedInterests,
  };
}
