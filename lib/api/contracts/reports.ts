export type SavedReportCategory =
  | "REVENUE"
  | "PIPELINE"
  | "CAMPAIGNS"
  | "PROGRAMMES";

export interface SavedReportItem {
  id: string;
  title: string;
  category: SavedReportCategory;
  diamondColor: string;
  heroTitle: string;
  heroValue: string;
  heroDelta: string;
  heroSubtext: string;
  stats: [
    { label: string; value: string },
    { label: string; value: string },
    { label: string; value: string },
    { label: string; value: string }
  ];
}

export interface EngineRevenueBar {
  id: string;
  periodLabel: string;
  totalFormatted: string;
  b2bUsd: number;
  membershipUsd: number;
  programmesUsd: number;
  isHighlighted?: boolean;
}

export interface TopMarketItem {
  id: string;
  country: string;
  revenueFormatted: string;
  sharePercent: number;
  barWidthPercent: number;
  color: string;
}

export interface RetentionCohortRow {
  id: string;
  cohort: string;
  size: number;
  months: Array<number | null>; // M0..M5 retention percentages
  revenueMonths: Array<string | null>; // M0..M5 revenue strings when toggled to Revenue
}

export interface ScheduledReportItem {
  id: string;
  title: string;
  cadenceLabel: string;
  enabled: boolean;
  accentColor: string;
}

export interface RecentExportItem {
  id: string;
  format: "PDF" | "CSV";
  title: string;
  subtitle: string;
}

export const SAVED_REPORTS: SavedReportItem[] = [
  {
    id: "rep-monthly-growth",
    title: "Monthly growth report",
    category: "REVENUE",
    diamondColor: "#84cc16",
    heroTitle: "October growth report",
    heroValue: "$184,200",
    heroDelta: "↑ 14.3%",
    heroSubtext: "Total revenue · +$23,040 vs. September",
    stats: [
      { label: "NEW CUSTOMERS", value: "414" },
      { label: "CONVERSION", value: "18.7%" },
      { label: "QUALIFIED LEADS", value: "24,850" },
      { label: "CHURN", value: "2.4%" },
    ],
  },
  {
    id: "rep-revenue-engine",
    title: "Revenue by engine",
    category: "REVENUE",
    diamondColor: "#14b8a6",
    heroTitle: "Engine revenue mix",
    heroValue: "$184,200",
    heroDelta: "↑ 16.8%",
    heroSubtext: "B2B Market Entry leads at 42% share",
    stats: [
      { label: "B2B ENTRY", value: "$77.4k" },
      { label: "MEMBERSHIP", value: "$60.8k" },
      { label: "PROGRAMMES", value: "$46.0k" },
      { label: "ACTIVE DEALS", value: "128" },
    ],
  },
  {
    id: "rep-revenue-market",
    title: "Revenue by market",
    category: "REVENUE",
    diamondColor: "#14b8a6",
    heroTitle: "Regional market report",
    heroValue: "$184,200",
    heroDelta: "↑ 22.0%",
    heroSubtext: "Nigeria + Kenya account for 60% of revenue",
    stats: [
      { label: "NIGERIA", value: "$71.8k" },
      { label: "KENYA", value: "$38.7k" },
      { label: "SOUTH AFRICA", value: "$27.6k" },
      { label: "GHANA", value: "$22.1k" },
    ],
  },
  {
    id: "rep-lead-source",
    title: "Lead source & conversion",
    category: "PIPELINE",
    diamondColor: "#8b5cf6",
    heroTitle: "Lead attribution report",
    heroValue: "24,850",
    heroDelta: "↑ 12.4%",
    heroSubtext: "Qualified leads · 18.7% blended conversion",
    stats: [
      { label: "WEBSITE", value: "36.4%" },
      { label: "REFERRALS", value: "24.6%" },
      { label: "EVENTS", value: "21.8%" },
      { label: "SOCIAL", value: "17.2%" },
    ],
  },
  {
    id: "rep-funnel-velocity",
    title: "Funnel velocity",
    category: "PIPELINE",
    diamondColor: "#8b5cf6",
    heroTitle: "Pipeline velocity report",
    heroValue: "14.2d",
    heroDelta: "↓ 2.4d",
    heroSubtext: "Median lead-to-close cycle across engines",
    stats: [
      { label: "STAGE 1 → 2", value: "3.1d" },
      { label: "STAGE 2 → 3", value: "5.4d" },
      { label: "PROPOSAL", value: "5.7d" },
      { label: "WIN RATE", value: "28.4%" },
    ],
  },
  {
    id: "rep-owner-leaderboard",
    title: "Owner leaderboard",
    category: "PIPELINE",
    diamondColor: "#8b5cf6",
    heroTitle: "Account owner leaderboard",
    heroValue: "$184,200",
    heroDelta: "↑ 14.3%",
    heroSubtext: "Top rep: Adeze Okafor ($78,400 closed)",
    stats: [
      { label: "ADEZE O.", value: "$78.4k" },
      { label: "TUNDE B.", value: "$61.2k" },
      { label: "CHIDI E.", value: "$44.6k" },
      { label: "QUOTA ATTAIN.", value: "112%" },
    ],
  },
  {
    id: "rep-campaign-roi",
    title: "Campaign ROI",
    category: "CAMPAIGNS",
    diamondColor: "#d97706",
    heroTitle: "Campaign ROI summary",
    heroValue: "4.8x",
    heroDelta: "↑ 0.6x",
    heroSubtext: "Blended ROAS on $38,400 total spend",
    stats: [
      { label: "LEADS GEN", value: "6,215" },
      { label: "BLENDED CPL", value: "$6.18" },
      { label: "TOP CONV.", value: "31.0%" },
      { label: "ACTIVE CAMPS", value: "6" },
    ],
  },
  {
    id: "rep-channel-perf",
    title: "Channel performance",
    category: "CAMPAIGNS",
    diamondColor: "#d97706",
    heroTitle: "Channel efficiency report",
    heroValue: "$6.18",
    heroDelta: "↓ 9.4%",
    heroSubtext: "Events & LinkedIn drive highest B2B volume",
    stats: [
      { label: "EVENTS", value: "1,420" },
      { label: "PAID ADS", value: "1,220" },
      { label: "LINKEDIN", value: "1,180" },
      { label: "EMAIL & WA", value: "1,160" },
    ],
  },
  {
    id: "rep-enrolment",
    title: "Enrolment & completion",
    category: "PROGRAMMES",
    diamondColor: "#d946ef",
    heroTitle: "Programme cohorts report",
    heroValue: "1,240",
    heroDelta: "↑ 11.2%",
    heroSubtext: "Active cohort participants · 91% completion",
    stats: [
      { label: "COHORTS LIVE", value: "5" },
      { label: "COMPLETION", value: "91.4%" },
      { label: "NPS SCORE", value: "74" },
      { label: "UPSELL RATE", value: "34%" },
    ],
  },
  {
    id: "rep-retention-cohorts",
    title: "Customer retention cohorts",
    category: "PROGRAMMES",
    diamondColor: "#d946ef",
    heroTitle: "Cohort retention analysis",
    heroValue: "84.4%",
    heroDelta: "↑ 3.8%",
    heroSubtext: "Month-1 average retention across 2026 cohorts",
    stats: [
      { label: "M1 AVG", value: "85.6%" },
      { label: "M3 AVG", value: "71.7%" },
      { label: "M5 AVG", value: "64.0%" },
      { label: "NET NRR", value: "114%" },
    ],
  },
];

export const ENGINE_REVENUE_MONTHLY: EngineRevenueBar[] = [
  {
    id: "m-jun",
    periodLabel: "Jun",
    totalFormatted: "$112k",
    b2bUsd: 46000,
    membershipUsd: 38000,
    programmesUsd: 28000,
  },
  {
    id: "m-jul",
    periodLabel: "Jul",
    totalFormatted: "$128k",
    b2bUsd: 53000,
    membershipUsd: 43000,
    programmesUsd: 32000,
  },
  {
    id: "m-aug",
    periodLabel: "Aug",
    totalFormatted: "$141k",
    b2bUsd: 59000,
    membershipUsd: 47000,
    programmesUsd: 35000,
  },
  {
    id: "m-sep",
    periodLabel: "Sep",
    totalFormatted: "$161k",
    b2bUsd: 68000,
    membershipUsd: 53000,
    programmesUsd: 40000,
  },
  {
    id: "m-oct",
    periodLabel: "Oct",
    totalFormatted: "$184k",
    b2bUsd: 78000,
    membershipUsd: 60000,
    programmesUsd: 46200,
    isHighlighted: true,
  },
];

export const ENGINE_REVENUE_QUARTERLY: EngineRevenueBar[] = [
  {
    id: "q-1",
    periodLabel: "Q1",
    totalFormatted: "$98k",
    b2bUsd: 41000,
    membershipUsd: 33000,
    programmesUsd: 24000,
  },
  {
    id: "q-2",
    periodLabel: "Q2",
    totalFormatted: "$124k",
    b2bUsd: 52000,
    membershipUsd: 41000,
    programmesUsd: 31000,
  },
  {
    id: "q-3",
    periodLabel: "Q3",
    totalFormatted: "$156k",
    b2bUsd: 66000,
    membershipUsd: 51000,
    programmesUsd: 39000,
  },
  {
    id: "q-4",
    periodLabel: "Q4 (Proj)",
    totalFormatted: "$184k",
    b2bUsd: 78000,
    membershipUsd: 60000,
    programmesUsd: 46200,
    isHighlighted: true,
  },
];

export const TOP_MARKETS: TopMarketItem[] = [
  {
    id: "mkt-ng",
    country: "Nigeria",
    revenueFormatted: "$71.8k",
    sharePercent: 39,
    barWidthPercent: 86,
    color: "#a3e635",
  },
  {
    id: "mkt-ke",
    country: "Kenya",
    revenueFormatted: "$38.7k",
    sharePercent: 21,
    barWidthPercent: 48,
    color: "#2dd4bf",
  },
  {
    id: "mkt-za",
    country: "South Africa",
    revenueFormatted: "$27.6k",
    sharePercent: 15,
    barWidthPercent: 35,
    color: "#a855f7",
  },
  {
    id: "mkt-gh",
    country: "Ghana",
    revenueFormatted: "$22.1k",
    sharePercent: 12,
    barWidthPercent: 28,
    color: "#f59e0b",
  },
  {
    id: "mkt-eg",
    country: "Egypt",
    revenueFormatted: "$14.7k",
    sharePercent: 8,
    barWidthPercent: 19,
    color: "#ec4899",
  },
  {
    id: "mkt-others",
    country: "Others",
    revenueFormatted: "$9.2k",
    sharePercent: 5,
    barWidthPercent: 10,
    color: "#94a3b8",
  },
];

export const RETENTION_COHORTS: RetentionCohortRow[] = [
  {
    id: "coh-may",
    cohort: "May 2026",
    size: 612,
    months: [100, 82, 74, 69, 66, 64],
    revenueMonths: ["$68k", "$56k", "$50k", "$47k", "$45k", "$43k"],
  },
  {
    id: "coh-jun",
    cohort: "Jun 2026",
    size: 688,
    months: [100, 85, 77, 72, 70, null],
    revenueMonths: ["$74k", "$63k", "$57k", "$53k", "$52k", null],
  },
  {
    id: "coh-jul",
    cohort: "Jul 2026",
    size: 705,
    months: [100, 84, 78, 74, null, null],
    revenueMonths: ["$79k", "$66k", "$62k", "$58k", null, null],
  },
  {
    id: "coh-aug",
    cohort: "Aug 2026",
    size: 742,
    months: [100, 88, 81, null, null, null],
    revenueMonths: ["$84k", "$74k", "$68k", null, null, null],
  },
  {
    id: "coh-sep",
    cohort: "Sep 2026",
    size: 781,
    months: [100, 89, null, null, null, null],
    revenueMonths: ["$92k", "$82k", null, null, null, null],
  },
  {
    id: "coh-oct",
    cohort: "Oct 2026",
    size: 414,
    months: [100, null, null, null, null, null],
    revenueMonths: ["$54k", null, null, null, null, null],
  },
];

export const INITIAL_SCHEDULED_REPORTS: ScheduledReportItem[] = [
  {
    id: "sched-1",
    title: "Weekly pipeline summary",
    cadenceLabel: "Mondays · 08:00 · Sales team, Ota",
    enabled: true,
    accentColor: "#8b5cf6",
  },
  {
    id: "sched-2",
    title: "Monthly growth report",
    cadenceLabel: "1st of month · 09:00 · Leadership",
    enabled: true,
    accentColor: "#84cc16",
  },
  {
    id: "sched-3",
    title: "Campaign ROI",
    cadenceLabel: "Fridays · 16:00 · Marketing",
    enabled: true,
    accentColor: "#f59e0b",
  },
  {
    id: "sched-4",
    title: "Programme enrolments",
    cadenceLabel: "Weekly · Wed 10:00 · Programmes team",
    enabled: true,
    accentColor: "#ec4899",
  },
];

export const INITIAL_RECENT_EXPORTS: RecentExportItem[] = [
  {
    id: "exp-1",
    format: "PDF",
    title: "September growth report",
    subtitle: "Emmanuel N. · Oct 1",
  },
  {
    id: "exp-2",
    format: "CSV",
    title: "Campaign ROI · Q3",
    subtitle: "Tunde Bello · Sep 30",
  },
];

