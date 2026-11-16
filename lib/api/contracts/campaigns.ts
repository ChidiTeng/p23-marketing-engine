export type CampaignEngine =
  | "B2B Market Entry"
  | "Membership"
  | "Paid Programmes";

export type CampaignStatus = "Live" | "Paused" | "Completed";

export interface CampaignChannelTag {
  name: string;
  dotColor: string;
}

export interface CampaignRecord {
  id: string;
  name: string;
  engine: CampaignEngine;
  iconBg: string;
  iconDotColor: string;
  channels: CampaignChannelTag[];
  status: CampaignStatus;
  spentUsd: number;
  budgetUsd: number;
  spentFormatted: string;
  budgetFormatted: string;
  budgetBarVariant: "purple" | "warning";
  leads: number;
  cplUsd: number;
  cplFormatted: string;
  isHighCpl?: boolean;
  conversionRate: number;
  conversionFormatted: string;
  isHighConversion?: boolean;
  endsLabel: string;
  convertedCount: number;
}

export interface ChannelLeadsBreakdown {
  id: string;
  channel: string;
  leads: number;
  percentageOfMax: number;
  color: string;
}

export interface UpcomingCampaignLaunch {
  id: string;
  monthShort: string;
  dayNumber: string;
  title: string;
  subtitle: string;
  dotColor: string;
}

export interface CampaignsOverviewMetrics {
  leadsGenerated: {
    value: number;
    formatted: string;
    deltaPercent: number;
    subtext: string;
  };
  activeCampaigns: {
    value: number;
    badgeText: string;
    subtext: string;
  };
  totalSpend: {
    valueUsd: number;
    formatted: string;
    badgeText: string;
    subtext: string;
  };
  costPerLead: {
    valueUsd: number;
    formatted: string;
    deltaPercent: number;
    subtext: string;
  };
  roas: {
    value: string;
    deltaText: string;
    subtext: string;
  };
}

export const INITIAL_CAMPAIGNS_METRICS: CampaignsOverviewMetrics = {
  leadsGenerated: {
    value: 6215,
    formatted: "6,215",
    deltaPercent: 18.2,
    subtext: "from 8 campaigns",
  },
  activeCampaigns: {
    value: 6,
    badgeText: "3 upcoming",
    subtext: "of 8 in this period",
  },
  totalSpend: {
    valueUsd: 38400,
    formatted: "$38,400",
    badgeText: "77% of budget",
    subtext: "budget $50,300",
  },
  costPerLead: {
    valueUsd: 6.18,
    formatted: "$6.18",
    deltaPercent: 9.4,
    subtext: "blended, all channels",
  },
  roas: {
    value: "4.8x",
    deltaText: "↑ 0.6x",
    subtext: "revenue ÷ spend",
  },
};

export const INITIAL_CAMPAIGNS: CampaignRecord[] = [
  {
    id: "camp-west-africa-summit",
    name: "West Africa Market Entry Summit",
    engine: "B2B Market Entry",
    iconBg: "#fef3c7",
    iconDotColor: "#f59e0b",
    channels: [{ name: "Events", dotColor: "#f59e0b" }],
    status: "Live",
    spentUsd: 7800,
    budgetUsd: 10000,
    spentFormatted: "$7.8k",
    budgetFormatted: "10.0k",
    budgetBarVariant: "purple",
    leads: 1420,
    cplUsd: 5.49,
    cplFormatted: "$5.49",
    conversionRate: 21.4,
    conversionFormatted: "21.4%",
    isHighConversion: true,
    endsLabel: "Nov 28",
    convertedCount: 304,
  },
  {
    id: "camp-linkedin-abm",
    name: "LinkedIn ABM: Enterprise CFOs",
    engine: "B2B Market Entry",
    iconBg: "#dbeafe",
    iconDotColor: "#3b82f6",
    channels: [{ name: "LinkedIn", dotColor: "#3b82f6" }],
    status: "Live",
    spentUsd: 6900,
    budgetUsd: 9000,
    spentFormatted: "$6.9k",
    budgetFormatted: "9.0k",
    budgetBarVariant: "purple",
    leads: 1180,
    cplUsd: 5.85,
    cplFormatted: "$5.85",
    conversionRate: 18.2,
    conversionFormatted: "18.2%",
    endsLabel: "Dec 15",
    convertedCount: 215,
  },
  {
    id: "camp-membership-q4",
    name: "Membership Drive Q4",
    engine: "Membership",
    iconBg: "#ede9fe",
    iconDotColor: "#8b5cf6",
    channels: [
      { name: "Email", dotColor: "#8b5cf6" },
      { name: "WhatsApp", dotColor: "#10b981" },
    ],
    status: "Live",
    spentUsd: 5200,
    budgetUsd: 6000,
    spentFormatted: "$5.2k",
    budgetFormatted: "6.0k",
    budgetBarVariant: "warning",
    leads: 960,
    cplUsd: 5.42,
    cplFormatted: "$5.42",
    conversionRate: 24.6,
    conversionFormatted: "24.6%",
    isHighConversion: true,
    endsLabel: "Dec 31",
    convertedCount: 236,
  },
  {
    id: "camp-founders-cohort-5",
    name: "Founders Accelerator Cohort 5",
    engine: "Paid Programmes",
    iconBg: "#fee2e2",
    iconDotColor: "#ef4444",
    channels: [{ name: "Google Ads", dotColor: "#ef4444" }],
    status: "Live",
    spentUsd: 4600,
    budgetUsd: 8000,
    spentFormatted: "$4.6k",
    budgetFormatted: "8.0k",
    budgetBarVariant: "purple",
    leads: 840,
    cplUsd: 5.48,
    cplFormatted: "$5.48",
    conversionRate: 15.1,
    conversionFormatted: "15.1%",
    endsLabel: "Dec 6",
    convertedCount: 127,
  },
  {
    id: "camp-referral-rewards",
    name: "Referral Rewards",
    engine: "Membership",
    iconBg: "#ecfccb",
    iconDotColor: "#84cc16",
    channels: [{ name: "Referrals", dotColor: "#84cc16" }],
    status: "Live",
    spentUsd: 4100,
    budgetUsd: 5000,
    spentFormatted: "$4.1k",
    budgetFormatted: "5.0k",
    budgetBarVariant: "purple",
    leads: 720,
    cplUsd: 5.69,
    cplFormatted: "$5.69",
    conversionRate: 31.0,
    conversionFormatted: "31.0%",
    isHighConversion: true,
    endsLabel: "Ongoing",
    convertedCount: 223,
  },
  {
    id: "camp-kenya-webinar",
    name: "Kenya Expansion Webinar Series",
    engine: "B2B Market Entry",
    iconBg: "#fce7f3",
    iconDotColor: "#ec4899",
    channels: [{ name: "Webinar", dotColor: "#ec4899" }],
    status: "Paused",
    spentUsd: 4300,
    budgetUsd: 6000,
    spentFormatted: "$4.3k",
    budgetFormatted: "6.0k",
    budgetBarVariant: "purple",
    leads: 515,
    cplUsd: 8.35,
    cplFormatted: "$8.35",
    isHighCpl: true,
    conversionRate: 12.8,
    conversionFormatted: "12.8%",
    endsLabel: "—",
    convertedCount: 66,
  },
  {
    id: "camp-sme-masterclass",
    name: "SME Growth Masterclass",
    engine: "Paid Programmes",
    iconBg: "#e0f2fe",
    iconDotColor: "#0ea5e9",
    channels: [{ name: "Meta Ads", dotColor: "#0ea5e9" }],
    status: "Live",
    spentUsd: 3200,
    budgetUsd: 4000,
    spentFormatted: "$3.2k",
    budgetFormatted: "4.0k",
    budgetBarVariant: "purple",
    leads: 380,
    cplUsd: 8.42,
    cplFormatted: "$8.42",
    isHighCpl: true,
    conversionRate: 14.2,
    conversionFormatted: "14.2%",
    endsLabel: "Dec 10",
    convertedCount: 54,
  },
  {
    id: "camp-nigeria-retail",
    name: "Nigeria Retail Outreach",
    engine: "B2B Market Entry",
    iconBg: "#dcfce7",
    iconDotColor: "#22c55e",
    channels: [{ name: "WhatsApp", dotColor: "#22c55e" }],
    status: "Completed",
    spentUsd: 2300,
    budgetUsd: 2300,
    spentFormatted: "$2.3k",
    budgetFormatted: "2.3k",
    budgetBarVariant: "warning",
    leads: 200,
    cplUsd: 11.5,
    cplFormatted: "$11.50",
    isHighCpl: true,
    conversionRate: 9.5,
    conversionFormatted: "9.5%",
    endsLabel: "Oct 31",
    convertedCount: 19,
  },
];

export const INITIAL_CHANNEL_LEADS: ChannelLeadsBreakdown[] = [
  {
    id: "ch-events",
    channel: "Events",
    leads: 1420,
    percentageOfMax: 88,
    color: "#f59e0b",
  },
  {
    id: "ch-paid-ads",
    channel: "Paid ads",
    leads: 1220,
    percentageOfMax: 76,
    color: "#ef4444",
  },
  {
    id: "ch-linkedin",
    channel: "LinkedIn",
    leads: 1180,
    percentageOfMax: 73,
    color: "#3b82f6",
  },
  {
    id: "ch-email-wa",
    channel: "Email & WhatsApp",
    leads: 1160,
    percentageOfMax: 72,
    color: "#8b5cf6",
  },
  {
    id: "ch-referrals",
    channel: "Referrals",
    leads: 720,
    percentageOfMax: 45,
    color: "#84cc16",
  },
  {
    id: "ch-webinars",
    channel: "Webinars",
    leads: 515,
    percentageOfMax: 32,
    color: "#ec4899",
  },
];

export const INITIAL_UPCOMING_LAUNCHES: UpcomingCampaignLaunch[] = [
  {
    id: "up-1",
    monthShort: "DEC",
    dayNumber: "2",
    title: "Lagos CFO Roundtable",
    subtitle: "Events · B2B Market Entry",
    dotColor: "#f59e0b",
  },
  {
    id: "up-2",
    monthShort: "DEC",
    dayNumber: "5",
    title: "Year-end Membership Renewal",
    subtitle: "Email · Membership",
    dotColor: "#8b5cf6",
  },
  {
    id: "up-3",
    monthShort: "DEC",
    dayNumber: "9",
    title: "Accelerator Cohort 6 Launch",
    subtitle: "Google Ads · Paid Programmes",
    dotColor: "#ef4444",
  },
];

