import { crmLeadSchema, type CrmLead } from "@/lib/api/contracts/crm-lead";
import { memberSchema, type Member } from "@/lib/api/contracts/member";
import { invitationSchema, type Invitation } from "@/lib/api/contracts/invitation";
import { interestSchema, type Interest } from "@/lib/api/contracts/interest";
import { socialSignalSchema, type SocialSignal } from "@/lib/api/contracts/social-signal";
import { icpProfileSchema, type IcpProfile } from "@/lib/api/contracts/icp-profile";
import { duplicateReviewSchema, type DuplicateReview } from "@/lib/api/contracts/duplicate";
import { DEFAULT_INTERESTS } from "../engine/tag-interests";

export type SeedDatabase = {
  version: string;
  currentUserRole: "owner" | "admin" | "member";
  organization: {
    id: number;
    name: string;
    slug: string;
    plan: string;
  };
  users: Member[];
  invitations: Invitation[];
  pipeline: {
    id: number;
    name: string;
    stages: Array<{ id: number; slug: string; name: string; color: string; sort_order: number }>;
  };
  leads: CrmLead[];
  interests: Interest[];
  socialSignals: SocialSignal[];
  icpProfiles: IcpProfile[];
  sourceEvents: Array<{ id: number; lead_id: number; channel: string; capture_method: string; created_at: string }>;
  duplicateReviews: DuplicateReview[];
};

const CHANNELS = [
  "google", "instagram", "linkedin", "tiktok", "youtube", "facebook",
  "x", "website", "referral", "other"
] as const;

const CAPTURE_METHODS = [
  "manual", "import", "smart_lead", "social_listening", "website_form"
] as const;

const FIRST_NAMES = [
  "Tunde", "Amaka", "Chinedu", "Amina", "Emeka", "Fatima", "Oluwaseun", "Ngozi", "Kwame",
  "Zainab", "Babatunde", "Folake", "Ibrahim", "Yetunde", "Kelechi", "Simisola", "Ade", "Chioma"
];

const LAST_NAMES = [
  "Bakare", "Okafor", "Adeyemi", "Bello", "Eze", "Danjuma", "Nwosu", "Suleiman", "Mensah",
  "Ojo", "Aliyu", "Balogun", "Onyekwere", "Lawal", "Igwe", "Kuti", "Okoro", "Abubakar"
];

const COMPANIES = [
  { name: "Apex Infrastructure Ltd", interest: "Construction", domain: "apexinfrastructure.ng" },
  { name: "Lekki Civil Contractors", interest: "Construction", domain: "lekkicivil.com" },
  { name: "BluePeak Strategy Partners", interest: "Business Consulting", domain: "bluepeak.africa" },
  { name: "Vanguard Management Advisory", interest: "Business Consulting", domain: "vanguardadvisory.ng" },
  { name: "Paystack Scale Tech", interest: "Technology", domain: "paystackscale.io" },
  { name: "Konga Cloud Systems", interest: "Technology", domain: "kongacloud.com" },
  { name: "Eko Atlantic Prime Properties", interest: "Real Estate", domain: "ekoatlanticprime.ng" },
  { name: "Victoria Island Realty Group", interest: "Real Estate", domain: "virealty.com" },
  { name: "GreenHarvest Agro Allied", interest: "Agriculture", domain: "greenharvest.africa" },
  { name: "Savannah Livestock Farms", interest: "Agriculture", domain: "savannahfarms.ng" },
  { name: "Zenith Commercial Supply", interest: "Other", domain: "zenithsupply.com" },
  { name: "Frontline Logistics Hub", interest: "Other", domain: "frontlinehub.ng" }
];

export function buildSeedDatabase(): SeedDatabase {
  const now = new Date("2026-11-10T00:00:00Z");

  // Users: 1 owner, 1 admin, 3 reps
  const rawUsers = [
    { id: 1, name: "Alex Vance", email: "alex@p23africa.com", role: "owner", status: "active", avatar_url: "https://i.pravatar.cc/150?u=alex", created_at: "2026-08-01T00:00:00Z", suspended_at: null, suspended_until: null, suspended_reason: null },
    { id: 2, name: "Sarah Connor", email: "sarah@p23africa.com", role: "admin", status: "active", avatar_url: "https://i.pravatar.cc/150?u=sarah", created_at: "2026-08-15T00:00:00Z", suspended_at: null, suspended_until: null, suspended_reason: null },
    { id: 10, name: "David Kalu", email: "david@p23africa.com", role: "member", status: "active", avatar_url: "https://i.pravatar.cc/150?u=david", created_at: "2026-09-01T00:00:00Z", suspended_at: null, suspended_until: null, suspended_reason: null },
    { id: 20, name: "Elena Rostova", email: "elena@p23africa.com", role: "member", status: "active", avatar_url: "https://i.pravatar.cc/150?u=elena", created_at: "2026-09-05T00:00:00Z", suspended_at: null, suspended_until: null, suspended_reason: null },
    { id: 30, name: "Marcus Brody", email: "marcus@p23africa.com", role: "member", status: "active", avatar_url: "https://i.pravatar.cc/150?u=marcus", created_at: "2026-09-10T00:00:00Z", suspended_at: null, suspended_until: null, suspended_reason: null },
  ];
  const users = rawUsers.map((u) => memberSchema.parse(u));

  // Invitations
  const rawInvitations = [
    { id: 1, email: "tariq.mansoor@partners.ng", role: "member", status: "pending", created_at: "2026-11-05T09:30:00Z" },
    { id: 2, email: "chidinma.okafor@p23africa.com", role: "admin", status: "pending", created_at: "2026-11-07T14:15:00Z" },
  ];
  const invitations = rawInvitations.map((i) => invitationSchema.parse(i));

  // Pipeline stages
  const pipeline = {
    id: 1,
    name: "Default Pipeline",
    stages: [
      { id: 1, slug: "new", name: "New Lead", color: "#2563EB", sort_order: 0 },
      { id: 2, slug: "contacted", name: "Contacted", color: "#E879A0", sort_order: 1 },
      { id: 3, slug: "engaged", name: "Engaged", color: "#F59E0B", sort_order: 2 },
      { id: 4, slug: "qualified", name: "Qualified", color: "#10B981", sort_order: 3 },
      { id: 5, slug: "won", name: "Won", color: "#059669", sort_order: 4 },
      { id: 6, slug: "lost", name: "Lost", color: "#EF4444", sort_order: 5 },
    ],
  };

  // Interests
  const interests = DEFAULT_INTERESTS.map((i) => interestSchema.parse(i));

  // Generate ~120 leads over past 60 days
  const leads: CrmLead[] = [];
  const repIds = [10, 20, 30];
  const stageSlugs = ["new", "contacted", "engaged", "qualified", "won", "lost"];
  const priorities: Array<"low" | "medium" | "high" | "urgent"> = ["low", "medium", "high", "urgent"];

  for (let i = 1; i <= 120; i++) {
    const fName = FIRST_NAMES[(i * 3) % FIRST_NAMES.length];
    const lName = LAST_NAMES[(i * 7) % LAST_NAMES.length];
    const comp = COMPANIES[i % COMPANIES.length];
    const interestObj = interests.find((int) => int.name === comp.interest) || interests[5];
    const repId = repIds[i % repIds.length];
    const rep = users.find((u) => u.id === repId)!;
    const daysAgo = Math.floor((i * 60) / 120);
    const createdDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000 + (i % 24) * 3600000);

    const leadRaw = {
      id: 1000 + i,
      organization_id: 1,
      name: `${fName} ${lName}`,
      source: i % 2 === 0 ? "website" : "manual",
      capture_method: CAPTURE_METHODS[i % CAPTURE_METHODS.length],
      channel: CHANNELS[i % CHANNELS.length],
      status: stageSlugs[i % stageSlugs.length],
      priority: priorities[i % priorities.length],
      email: `${fName.toLowerCase()}.${lName.toLowerCase()}@${comp.domain}`,
      phone: `+23480${String(10000000 + i).slice(0, 8)}`,
      company_name: comp.name,
      position: i % 3 === 0 ? "Managing Director" : i % 3 === 1 ? "Head of Procurement" : "VP Business Development",
      summary: `Inquiry regarding ${comp.interest.toLowerCase()} solutions and regional operations across West Africa.`,
      budget_amount: 15000 + (i % 10) * 5000,
      budget_currency: "USD",
      location: i % 2 === 0 ? "Lagos, Nigeria" : "Abuja, Nigeria",
      logo_url: null,
      contacts: [],
      profile_urls: [`https://linkedin.com/in/${fName.toLowerCase()}-${lName.toLowerCase()}`],
      assigned_to_user_id: rep.id,
      assignee: { id: rep.id, name: rep.name, email: rep.email },
      created_by_user_id: 1,
      creator: { id: 1, name: "Alex Vance", email: "alex@p23africa.com" },
      primary_interest: { id: interestObj.id, name: interestObj.name },
      interests: [{ id: interestObj.id, name: interestObj.name }],
      score: 65 + (i % 35),
      pipeline_id: 1,
      created_at: createdDate.toISOString(),
      updated_at: createdDate.toISOString(),
    };

    leads.push(crmLeadSchema.parse(leadRaw));
  }

  // Social Signals (25 items)
  const platforms: Array<"linkedin" | "x" | "facebook" | "reddit" | "youtube"> = [
    "linkedin", "x", "facebook", "reddit", "youtube"
  ];
  const socialSignals: SocialSignal[] = [];
  for (let s = 1; s <= 25; s++) {
    const plat = platforms[s % platforms.length];
    const sDate = new Date(now.getTime() - (s * 2) * 24 * 3600 * 1000);
    const signalRaw = {
      id: 500 + s,
      platform: plat,
      author_name: `${FIRST_NAMES[s % FIRST_NAMES.length]} ${LAST_NAMES[s % LAST_NAMES.length]}`,
      author_handle: `@${FIRST_NAMES[s % FIRST_NAMES.length].toLowerCase()}_lead`,
      author_avatar_url: `https://i.pravatar.cc/150?u=sig_${s}`,
      content: `Looking for top-tier B2B marketing & sales intelligence services across African markets. Any recommendations?`,
      signal_type: "hiring_expansion",
      intent_score: 75 + (s % 25),
      url: `https://${plat}.com/post/${s * 10423}`,
      published_at: sDate.toISOString(),
      starred: s % 4 === 0,
      converted_to_lead_id: s % 6 === 0 ? leads[s].id : null,
    };
    socialSignals.push(socialSignalSchema.parse(signalRaw));
  }

  // ICP Profiles
  const icpProfiles: IcpProfile[] = [
    icpProfileSchema.parse({
      id: 1,
      name: "Mid-Market Construction & Infrastructure",
      description: "Civil engineering, commercial builders and materials suppliers with 50+ staff",
      is_active: true,
      target_industries: ["Construction", "Engineering", "Real Estate"],
      target_locations: ["Nigeria", "Ghana", "Kenya"],
      company_size_min: 50,
      company_size_max: 1000,
      created_at: "2026-09-01T00:00:00Z",
    }),
    icpProfileSchema.parse({
      id: 2,
      name: "Enterprise B2B Technology & Fintech",
      description: "Cloud, payments, and enterprise software startups series A+",
      is_active: false,
      target_industries: ["Technology", "Fintech", "Telecommunications"],
      target_locations: ["Nigeria", "South Africa", "Egypt"],
      company_size_min: 20,
      company_size_max: 500,
      created_at: "2026-09-15T00:00:00Z",
    }),
  ];

  // Duplicate Review Queue Seed Items
  const duplicateReviews: DuplicateReview[] = [];
  if (leads.length >= 6) {
    const lead1 = leads[2];
    const lead2 = leads[5];

    duplicateReviews.push(
      duplicateReviewSchema.parse({
        id: 1,
        existing_lead_id: lead1.id,
        candidate_lead: {
          name: `${lead1.name} (Regional)`,
          email: `regional-desk@${lead1.company_name?.toLowerCase().replace(/[^a-z]/g, "") || "lagosgroup"}.ng`,
          phone: lead1.phone,
          company_name: `${lead1.company_name} West Africa`,
          position: "Managing Director",
          channel: "website",
          capture_method: "website_form",
          summary: "Submitted via contact form with the same primary office telephone number.",
          profile_urls: [],
        },
        match_reason: `Colliding contact telephone number (${lead1.phone})`,
        match_field: "phone",
        status: "pending",
        created_at: new Date(now.getTime() - 2 * 3600 * 1000).toISOString(),
      })
    );

    duplicateReviews.push(
      duplicateReviewSchema.parse({
        id: 2,
        existing_lead_id: lead2.id,
        candidate_lead: {
          name: lead2.name,
          email: "operations@pan-african-ventures.com",
          phone: lead2.phone,
          company_name: "Pan-African Ventures Holding",
          position: "Chief Operating Officer",
          channel: "linkedin",
          capture_method: "manual",
          summary: "Captured from partner referral with direct mobile matching an existing pipeline deal.",
          profile_urls: [`https://linkedin.com/in/${lead2.name.toLowerCase().replace(/\s+/g, "")}`],
        },
        match_reason: `Identical phone number (${lead2.phone}) with different corporate entity`,
        match_field: "phone",
        status: "pending",
        created_at: new Date(now.getTime() - 6 * 3600 * 1000).toISOString(),
      })
    );
  }

  return {
    version: "p23-demo-db:v1",
    currentUserRole: "owner",
    organization: {
      id: 1,
      name: "P23 Africa",
      slug: "p23-africa",
      plan: "Enterprise",
    },
    users,
    invitations,
    pipeline,
    leads,
    interests,
    socialSignals,
    icpProfiles,
    sourceEvents: [],
    duplicateReviews,
  };
}
