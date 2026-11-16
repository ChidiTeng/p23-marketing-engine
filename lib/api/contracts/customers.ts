export type CustomerEngine =
  | "B2B Market Entry"
  | "Membership"
  | "Paid Programmes";

export type CustomerStatus =
  | "Active"
  | "Renewal due"
  | "Onboarding"
  | "At risk";

export interface CustomerOwner {
  initials: string;
  name: string;
  bg: string;
  text: string;
}

export interface CustomerTimelineItem {
  id: string;
  title: string;
  subtitle: string;
  relativeTime: string;
  dotColor: string;
}

export interface CustomerContact {
  id: string;
  initials: string;
  name: string;
  role: string;
  email: string;
  avatarBg: string;
  avatarText: string;
}

export interface CustomerRecord {
  id: string;
  initials: string;
  avatarBg: string;
  avatarText: string;
  name: string;
  industry: string;
  city: string;
  country: string;
  sinceLabel: string;
  primaryEngine: CustomerEngine;
  engines: CustomerEngine[];
  lifetimeValueUsd: number;
  lifetimeValueFormatted: string;
  ltvDelta90dFormatted: string;
  healthScore: number;
  status: CustomerStatus;
  owner: CustomerOwner;
  lastActivity: string;
  dealsWon: number;
  openOpps: number;
  timeline: CustomerTimelineItem[];
  contacts: CustomerContact[];
}

export interface CustomersOverviewMetrics {
  totalCustomers: {
    value: number;
    formatted: string;
    deltaPercent: number;
    subtext: string;
  };
  activeAccounts: {
    value: number;
    formatted: string;
    deltaPercent: number;
    subtext: string;
  };
  avgLifetimeValue: {
    valueUsd: number;
    formatted: string;
    deltaPercent: number;
    subtext: string;
  };
  churnRate: {
    valuePercent: number;
    formatted: string;
    deltaPercent: number;
    subtext: string;
  };
  engineCounts: {
    all: number;
    "B2B Market Entry": number;
    Membership: number;
    "Paid Programmes": number;
  };
}

export const OWNERS: Record<"AO" | "TB" | "CE", CustomerOwner> = {
  AO: {
    initials: "AO",
    name: "Adeze Okafor",
    bg: "#ddd6fe",
    text: "#4c1d95",
  },
  TB: {
    initials: "TB",
    name: "Tunde Bello",
    bg: "#99f6e4",
    text: "#115e59",
  },
  CE: {
    initials: "CE",
    name: "Chidi Eze",
    bg: "#fde68a",
    text: "#78350f",
  },
};

export const INITIAL_CUSTOMERS_METRICS: CustomersOverviewMetrics = {
  totalCustomers: {
    value: 4720,
    formatted: "4,720",
    deltaPercent: 9.6,
    subtext: "+414 converted this period",
  },
  activeAccounts: {
    value: 3985,
    formatted: "3,985",
    deltaPercent: 6.1,
    subtext: "84.4% of all customers",
  },
  avgLifetimeValue: {
    valueUsd: 1240,
    formatted: "$1,240",
    deltaPercent: 4.3,
    subtext: "across all engines",
  },
  churnRate: {
    valuePercent: 2.4,
    formatted: "2.4%",
    deltaPercent: 0.8,
    subtext: "monthly · lower is better",
  },
  engineCounts: {
    all: 4720,
    "B2B Market Entry": 1982,
    Membership: 1558,
    "Paid Programmes": 1180,
  },
};

export const INITIAL_CUSTOMERS: CustomerRecord[] = [
  {
    id: "cust-techglobal",
    initials: "TM",
    avatarBg: "#ddd6fe",
    avatarText: "#3730a3",
    name: "TechGlobal Ltd",
    industry: "Fintech",
    city: "Lagos",
    country: "Nigeria",
    sinceLabel: "Mar 2025",
    primaryEngine: "B2B Market Entry",
    engines: ["B2B Market Entry", "Membership"],
    lifetimeValueUsd: 48600,
    lifetimeValueFormatted: "$48,600",
    ltvDelta90dFormatted: "+$12,400 in the last 90 days",
    healthScore: 92,
    status: "Active",
    owner: OWNERS.AO,
    lastActivity: "2h ago",
    dealsWon: 6,
    openOpps: 2,
    timeline: [
      {
        id: "tl-1",
        title: "Opportunity: Kenya expansion",
        subtitle: "$18,000 · Proposal sent by Adeze Okafor",
        relativeTime: "2d",
        dotColor: "#8b5cf6",
      },
      {
        id: "tl-2",
        title: "Membership renewed",
        subtitle: "Gold tier · 12 months",
        relativeTime: "1w",
        dotColor: "#14b8a6",
      },
      {
        id: "tl-3",
        title: "Attended CFO Roundtable",
        subtitle: "3 attendees · Event campaign",
        relativeTime: "3w",
        dotColor: "#f59e0b",
      },
    ],
    contacts: [
      {
        id: "ct-1",
        initials: "FA",
        name: "Folake Adeyemi",
        role: "CFO · Primary",
        email: "f.adeyemi@techglobal.ng",
        avatarBg: "#f5d0fe",
        avatarText: "#701a75",
      },
      {
        id: "ct-2",
        initials: "KO",
        name: "Kunle Ojo",
        role: "Head of Growth",
        email: "k.ojo@techglobal.ng",
        avatarBg: "#bae6fd",
        avatarText: "#0c4a6e",
      },
    ],
  },
  {
    id: "cust-kora",
    initials: "KS",
    avatarBg: "#99f6e4",
    avatarText: "#115e59",
    name: "Kora Systems",
    industry: "SaaS",
    city: "Nairobi",
    country: "Kenya",
    sinceLabel: "Jan 2025",
    primaryEngine: "B2B Market Entry",
    engines: ["B2B Market Entry", "Paid Programmes"],
    lifetimeValueUsd: 31200,
    lifetimeValueFormatted: "$31,200",
    ltvDelta90dFormatted: "+$8,200 in the last 90 days",
    healthScore: 84,
    status: "Active",
    owner: OWNERS.TB,
    lastActivity: "5h ago",
    dealsWon: 4,
    openOpps: 1,
    timeline: [
      {
        id: "tl-k1",
        title: "East Africa B2B Advisory Kickoff",
        subtitle: "$14,500 · Signed with Tunde Bello",
        relativeTime: "5h",
        dotColor: "#8b5cf6",
      },
      {
        id: "tl-k2",
        title: "Executive Leadership Cohort",
        subtitle: "4 seats enrolled · Paid Programmes",
        relativeTime: "2w",
        dotColor: "#14b8a6",
      },
    ],
    contacts: [
      {
        id: "ct-k1",
        initials: "WM",
        name: "Wanjiku Mwangi",
        role: "VP Operations · Primary",
        email: "wanjiku@korasystems.co.ke",
        avatarBg: "#99f6e4",
        avatarText: "#115e59",
      },
      {
        id: "ct-k2",
        initials: "DO",
        name: "David Ochieng",
        role: "Head of Partnerships",
        email: "d.ochieng@korasystems.co.ke",
        avatarBg: "#ddd6fe",
        avatarText: "#3730a3",
      },
    ],
  },
  {
    id: "cust-alpha",
    initials: "AR",
    avatarBg: "#f5d0fe",
    avatarText: "#701a75",
    name: "Alpha Retail",
    industry: "Retail",
    city: "Accra",
    country: "Ghana",
    sinceLabel: "Nov 2024",
    primaryEngine: "Membership",
    engines: ["Membership"],
    lifetimeValueUsd: 12800,
    lifetimeValueFormatted: "$12,800",
    ltvDelta90dFormatted: "+$2,400 in the last 90 days",
    healthScore: 58,
    status: "Renewal due",
    owner: OWNERS.CE,
    lastActivity: "1d ago",
    dealsWon: 2,
    openOpps: 1,
    timeline: [
      {
        id: "tl-a1",
        title: "Annual Membership Renewal Notice",
        subtitle: "$6,400 · Renewal review scheduled",
        relativeTime: "1d",
        dotColor: "#f59e0b",
      },
      {
        id: "tl-a2",
        title: "West Africa Retail Trade Forum",
        subtitle: "2 attendees · Accra Summit",
        relativeTime: "1m",
        dotColor: "#14b8a6",
      },
    ],
    contacts: [
      {
        id: "ct-a1",
        initials: "KM",
        name: "Kwame Mensah",
        role: "Managing Director · Primary",
        email: "k.mensah@alpharetail.com.gh",
        avatarBg: "#fde68a",
        avatarText: "#78350f",
      },
    ],
  },
  {
    id: "cust-nova",
    initials: "NH",
    avatarBg: "#d9f99d",
    avatarText: "#365314",
    name: "Nova Health",
    industry: "Healthtech",
    city: "Lagos",
    country: "Nigeria",
    sinceLabel: "Aug 2025",
    primaryEngine: "Paid Programmes",
    engines: ["Paid Programmes", "Membership"],
    lifetimeValueUsd: 9450,
    lifetimeValueFormatted: "$9,450",
    ltvDelta90dFormatted: "+$9,450 in the last 90 days",
    healthScore: 76,
    status: "Onboarding",
    owner: OWNERS.AO,
    lastActivity: "1d ago",
    dealsWon: 2,
    openOpps: 2,
    timeline: [
      {
        id: "tl-n1",
        title: "Programme onboarding workshop",
        subtitle: "Completed module 1 with Adeze Okafor",
        relativeTime: "1d",
        dotColor: "#14b8a6",
      },
      {
        id: "tl-n2",
        title: "Regulatory Market Entry Scoping",
        subtitle: "$11,000 · Discovery call booked",
        relativeTime: "5d",
        dotColor: "#8b5cf6",
      },
    ],
    contacts: [
      {
        id: "ct-n1",
        initials: "CB",
        name: "Dr. Chidinma Balogun",
        role: "CEO · Primary",
        email: "chidinma@novahealth.africa",
        avatarBg: "#d9f99d",
        avatarText: "#365314",
      },
    ],
  },
  {
    id: "cust-delta",
    initials: "DF",
    avatarBg: "#bae6fd",
    avatarText: "#0c4a6e",
    name: "Delta Finance",
    industry: "Banking",
    city: "Johannesburg",
    country: "South Africa",
    sinceLabel: "Jun 2024",
    primaryEngine: "B2B Market Entry",
    engines: ["B2B Market Entry"],
    lifetimeValueUsd: 27300,
    lifetimeValueFormatted: "$27,300",
    ltvDelta90dFormatted: "+$1,500 in the last 90 days",
    healthScore: 41,
    status: "At risk",
    owner: OWNERS.TB,
    lastActivity: "6d ago",
    dealsWon: 3,
    openOpps: 0,
    timeline: [
      {
        id: "tl-d1",
        title: "Executive check-in escalated",
        subtitle: "Sponsor transition flagged by Tunde Bello",
        relativeTime: "6d",
        dotColor: "#f43f5e",
      },
      {
        id: "tl-d2",
        title: "Q3 Cross-Border Advisory Delivery",
        subtitle: "Milestone 2 signed off",
        relativeTime: "1m",
        dotColor: "#8b5cf6",
      },
    ],
    contacts: [
      {
        id: "ct-d1",
        initials: "SN",
        name: "Sipho Ndlovu",
        role: "Head of Strategy · Primary",
        email: "s.ndlovu@deltafinance.co.za",
        avatarBg: "#bae6fd",
        avatarText: "#0c4a6e",
      },
    ],
  },
  {
    id: "cust-savanna",
    initials: "SA",
    avatarBg: "#fef08a",
    avatarText: "#713f12",
    name: "Savanna Agro",
    industry: "Agritech",
    city: "Nakuru",
    country: "Kenya",
    sinceLabel: "Apr 2025",
    primaryEngine: "Paid Programmes",
    engines: ["Paid Programmes"],
    lifetimeValueUsd: 6900,
    lifetimeValueFormatted: "$6,900",
    ltvDelta90dFormatted: "+$3,100 in the last 90 days",
    healthScore: 81,
    status: "Active",
    owner: OWNERS.CE,
    lastActivity: "2d ago",
    dealsWon: 2,
    openOpps: 1,
    timeline: [
      {
        id: "tl-s1",
        title: "Agri-Export Accelerator Cohort",
        subtitle: "Graduated with 94% completion score",
        relativeTime: "2d",
        dotColor: "#14b8a6",
      },
    ],
    contacts: [
      {
        id: "ct-s1",
        initials: "JK",
        name: "Jomo Kariuki",
        role: "Founder · Primary",
        email: "jomo@savannaagro.ke",
        avatarBg: "#fef08a",
        avatarText: "#713f12",
      },
    ],
  },
  {
    id: "cust-lumen",
    initials: "LL",
    avatarBg: "#fed7aa",
    avatarText: "#7c2d12",
    name: "Lumen Logistics",
    industry: "Logistics",
    city: "Cairo",
    country: "Egypt",
    sinceLabel: "Feb 2025",
    primaryEngine: "B2B Market Entry",
    engines: ["B2B Market Entry", "Membership"],
    lifetimeValueUsd: 22150,
    lifetimeValueFormatted: "$22,150",
    ltvDelta90dFormatted: "+$7,800 in the last 90 days",
    healthScore: 88,
    status: "Active",
    owner: OWNERS.AO,
    lastActivity: "3d ago",
    dealsWon: 4,
    openOpps: 2,
    timeline: [
      {
        id: "tl-l1",
        title: "North Africa Corridor Expansion",
        subtitle: "$14,000 · Contract active",
        relativeTime: "3d",
        dotColor: "#8b5cf6",
      },
    ],
    contacts: [
      {
        id: "ct-l1",
        initials: "TH",
        name: "Tarek Hassan",
        role: "COO · Primary",
        email: "t.hassan@lumenlogistics.eg",
        avatarBg: "#fed7aa",
        avatarText: "#7c2d12",
      },
    ],
  },
  {
    id: "cust-zuri",
    initials: "ZB",
    avatarBg: "#e9d5ff",
    avatarText: "#581c87",
    name: "Zuri Beauty Co",
    industry: "Consumer",
    city: "Dar es Salaam",
    country: "Tanzania",
    sinceLabel: "Dec 2024",
    primaryEngine: "Membership",
    engines: ["Membership"],
    lifetimeValueUsd: 4300,
    lifetimeValueFormatted: "$4,300",
    ltvDelta90dFormatted: "+$0 in the last 90 days",
    healthScore: 35,
    status: "At risk",
    owner: OWNERS.TB,
    lastActivity: "12d ago",
    dealsWon: 1,
    openOpps: 0,
    timeline: [
      {
        id: "tl-z1",
        title: "Re-engagement call scheduled",
        subtitle: "Low portal utilization alert",
        relativeTime: "12d",
        dotColor: "#f43f5e",
      },
    ],
    contacts: [
      {
        id: "ct-z1",
        initials: "NM",
        name: "Neema Mwakasege",
        role: "Brand Director · Primary",
        email: "neema@zuribeauty.co.tz",
        avatarBg: "#e9d5ff",
        avatarText: "#581c87",
      },
    ],
  },
  {
    id: "cust-baobab",
    initials: "BC",
    avatarBg: "#bbf7d0",
    avatarText: "#14532d",
    name: "Baobab Capital",
    industry: "Investment",
    city: "Accra",
    country: "Ghana",
    sinceLabel: "May 2025",
    primaryEngine: "Membership",
    engines: ["Membership", "B2B Market Entry"],
    lifetimeValueUsd: 15700,
    lifetimeValueFormatted: "$15,700",
    ltvDelta90dFormatted: "+$5,200 in the last 90 days",
    healthScore: 90,
    status: "Active",
    owner: OWNERS.CE,
    lastActivity: "4d ago",
    dealsWon: 3,
    openOpps: 1,
    timeline: [
      {
        id: "tl-b1",
        title: "Investor Deal Room Co-Hosting",
        subtitle: "West Africa LP Showcase",
        relativeTime: "4d",
        dotColor: "#14b8a6",
      },
    ],
    contacts: [
      {
        id: "ct-b1",
        initials: "KO",
        name: "Kofi Osei",
        role: "Managing Partner · Primary",
        email: "k.osei@baobabcapital.gh",
        avatarBg: "#bbf7d0",
        avatarText: "#14532d",
      },
    ],
  },
  {
    id: "cust-ife",
    initials: "IF",
    avatarBg: "#fed7aa",
    avatarText: "#9a3412",
    name: "Ife Foods",
    industry: "FMCG",
    city: "Ibadan",
    country: "Nigeria",
    sinceLabel: "Sep 2025",
    primaryEngine: "Paid Programmes",
    engines: ["Paid Programmes"],
    lifetimeValueUsd: 3850,
    lifetimeValueFormatted: "$3,850",
    ltvDelta90dFormatted: "+$3,850 in the last 90 days",
    healthScore: 67,
    status: "Onboarding",
    owner: OWNERS.AO,
    lastActivity: "1w ago",
    dealsWon: 1,
    openOpps: 1,
    timeline: [
      {
        id: "tl-i1",
        title: "Supply Chain Readiness Assessment",
        subtitle: "Onboarding step 2 of 3 completed",
        relativeTime: "1w",
        dotColor: "#f59e0b",
      },
    ],
    contacts: [
      {
        id: "ct-i1",
        initials: "AA",
        name: "Adebayo Adeyemi",
        role: "Operations Director · Primary",
        email: "a.adeyemi@ifefoods.ng",
        avatarBg: "#fed7aa",
        avatarText: "#9a3412",
      },
    ],
  },
];

