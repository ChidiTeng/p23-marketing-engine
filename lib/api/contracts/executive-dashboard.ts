export type DashboardTimeRange = "7d" | "30d" | "90d" | "1y";
export type RevenueTimeframe = "7D" | "30D" | "90D" | "1Y";

export interface RevenueBarPoint {
  id: string;
  label: string;
  axisLabel?: string;
  value: number;
  formattedValue: string;
  deltaLabel: string;
  isHighlighted?: boolean;
}

export interface BusinessEngineItem {
  id: string;
  name: string;
  description: string;
  percentage: number;
  trend: "up" | "down";
  accentColor: string;
  iconBg: string;
  iconType: "b2b" | "membership" | "programmes";
  revenueContributionUsd: number;
  activeDeals: number;
}

export interface HotLeadItem {
  id: string;
  initials: string;
  company: string;
  intentLabel: string;
  matchScore: number;
  temperature: "Hot" | "Warm" | "Moderate" | "Cold";
  avatarBg: string;
  avatarText: string;
  leadId?: string;
}

export interface LeadSourceSegment {
  id: string;
  name: string;
  percentage: number;
  count: number;
  color: string;
}

export interface ConversionFunnelStage {
  id: string;
  stage: "Leads" | "Engaged" | "Qualified" | "Converted";
  count: number;
  percentage: number;
  color: string;
}

export interface RealtimeActivityItem {
  id: string;
  title: string;
  actor: string;
  relativeTime: string;
  category: "Opportunity" | "Deal" | "Lead" | "Programme";
}

export interface RegionalRevenueBreakdown {
  region: string;
  countries: string;
  revenueUsd: number;
  sharePercent: number;
  yoyGrowthPercent: number;
}

export interface RevenueForecastQuarter {
  period: string;
  projectedUsd: number;
  lowerBoundUsd: number;
  upperBoundUsd: number;
  confidencePercent: number;
}

export interface ExecutiveDashboardData {
  range: DashboardTimeRange;
  revPeriod: RevenueTimeframe;
  kpis: {
    totalRevenue: {
      valueUsd: number;
      formatted: string;
      currency: string;
      deltaPercent: number;
      deltaAmountFormatted: string;
      subtext: string;
    };
    qualifiedLeads: {
      value: number;
      formatted: string;
      deltaPercent: number;
      subtext: string;
      sparkline: number[];
    };
    conversionRate: {
      valuePercent: number;
      formatted: string;
      deltaPercent: number;
      subtext: string;
      sparkline: number[];
    };
    activeOpps: {
      value: number;
      formatted: string;
      deltaPercent: number;
      subtext: string;
      sparkline: number[];
    };
    programmes: {
      value: number;
      formatted: string;
      deltaPercent: number;
      subtext: string;
      sparkline: number[];
    };
  };
  revenuePerformance: {
    headlineValue: string;
    deltaPercent: number;
    subtext: string;
    barsByPeriod: Record<RevenueTimeframe, RevenueBarPoint[]>;
  };
  businessEngines: {
    totalCount: number;
    items: BusinessEngineItem[];
  };
  hotLeads: {
    totalCount: number;
    items: HotLeadItem[];
  };
  leadSources: {
    monthLabel: string;
    totalLeads: number;
    totalLeadsFormatted: string;
    segments: LeadSourceSegment[];
  };
  conversionFunnel: {
    stages: ConversionFunnelStage[];
  };
  realtimeActivity: {
    isLive: boolean;
    items: RealtimeActivityItem[];
  };
  breakdownModal: {
    regions: RegionalRevenueBreakdown[];
  };
  forecastModal: {
    projectedNext90DaysUsd: number;
    growthRateAssumedPercent: number;
    pipelineCoverageRatio: number;
    quarters: RevenueForecastQuarter[];
  };
}

const BARS_30D: RevenueBarPoint[] = [
  { id: "oct-1", label: "Oct 1", axisLabel: "Oct 1", value: 68000, formattedValue: "$68,000", deltaLabel: "+4%" },
  { id: "oct-3", label: "Oct 3", value: 62000, formattedValue: "$62,000", deltaLabel: "+2%" },
  { id: "oct-5", label: "Oct 5", value: 64000, formattedValue: "$64,000", deltaLabel: "+3%" },
  { id: "oct-7", label: "Oct 7", value: 71000, formattedValue: "$71,000", deltaLabel: "+5%" },
  { id: "oct-8", label: "Oct 8", axisLabel: "Oct 8", value: 84000, formattedValue: "$84,000", deltaLabel: "+7%" },
  { id: "oct-10", label: "Oct 10", value: 78000, formattedValue: "$78,000", deltaLabel: "+6%" },
  { id: "oct-12", label: "Oct 12", value: 96000, formattedValue: "$96,000", deltaLabel: "+8%" },
  { id: "oct-15", label: "Oct 15", axisLabel: "Oct 15", value: 112000, formattedValue: "$112,000", deltaLabel: "+9%" },
  { id: "oct-17", label: "Oct 17", value: 128000, formattedValue: "$128,000", deltaLabel: "+10%" },
  { id: "oct-19", label: "Oct 19", value: 118000, formattedValue: "$118,000", deltaLabel: "+9%" },
  { id: "oct-21", label: "Oct 21", value: 134000, formattedValue: "$134,000", deltaLabel: "+11%" },
  { id: "oct-22", label: "Oct 22", axisLabel: "Oct 22", value: 122000, formattedValue: "$122,000", deltaLabel: "+10%" },
  { id: "oct-25", label: "Oct 25", value: 146000, formattedValue: "$146,000", deltaLabel: "+12%" },
  { id: "oct-28", label: "Oct 28", value: 162000, formattedValue: "$162,000", deltaLabel: "+13%" },
  {
    id: "oct-30",
    label: "Oct 30",
    axisLabel: "Oct 30",
    value: 184200,
    formattedValue: "$184,200",
    deltaLabel: "+14%",
    isHighlighted: true,
  },
];

const BARS_7D: RevenueBarPoint[] = [
  { id: "d-1", label: "Mon", axisLabel: "Mon", value: 124000, formattedValue: "$124,000", deltaLabel: "+8%" },
  { id: "d-2", label: "Tue", axisLabel: "Tue", value: 136000, formattedValue: "$136,000", deltaLabel: "+9%" },
  { id: "d-3", label: "Wed", axisLabel: "Wed", value: 142000, formattedValue: "$142,000", deltaLabel: "+10%" },
  { id: "d-4", label: "Thu", axisLabel: "Thu", value: 151000, formattedValue: "$151,000", deltaLabel: "+11%" },
  { id: "d-5", label: "Fri", axisLabel: "Fri", value: 168000, formattedValue: "$168,000", deltaLabel: "+13%" },
  { id: "d-6", label: "Sat", axisLabel: "Sat", value: 175000, formattedValue: "$175,000", deltaLabel: "+13%" },
  {
    id: "d-7",
    label: "Sun",
    axisLabel: "Sun",
    value: 184200,
    formattedValue: "$184,200",
    deltaLabel: "+14%",
    isHighlighted: true,
  },
];

const BARS_90D: RevenueBarPoint[] = [
  { id: "w-1", label: "Aug W1", axisLabel: "Aug 1", value: 92000, formattedValue: "$92,000", deltaLabel: "+5%" },
  { id: "w-2", label: "Aug W2", value: 98000, formattedValue: "$98,000", deltaLabel: "+6%" },
  { id: "w-3", label: "Aug W3", value: 105000, formattedValue: "$105,000", deltaLabel: "+7%" },
  { id: "w-4", label: "Sep W1", axisLabel: "Sep 1", value: 118000, formattedValue: "$118,000", deltaLabel: "+8%" },
  { id: "w-5", label: "Sep W2", value: 129000, formattedValue: "$129,000", deltaLabel: "+9%" },
  { id: "w-6", label: "Sep W3", value: 141000, formattedValue: "$141,000", deltaLabel: "+11%" },
  { id: "w-7", label: "Oct W1", axisLabel: "Oct 1", value: 154000, formattedValue: "$154,000", deltaLabel: "+12%" },
  { id: "w-8", label: "Oct W2", value: 166000, formattedValue: "$166,000", deltaLabel: "+13%" },
  { id: "w-9", label: "Oct W3", value: 173000, formattedValue: "$173,000", deltaLabel: "+13%" },
  {
    id: "w-10",
    label: "Oct 30",
    axisLabel: "Oct 30",
    value: 184200,
    formattedValue: "$184,200",
    deltaLabel: "+14%",
    isHighlighted: true,
  },
];

const BARS_1Y: RevenueBarPoint[] = [
  { id: "m-1", label: "Nov", axisLabel: "Nov", value: 74000, formattedValue: "$74,000", deltaLabel: "+3%" },
  { id: "m-2", label: "Dec", value: 82000, formattedValue: "$82,000", deltaLabel: "+4%" },
  { id: "m-3", label: "Jan", axisLabel: "Jan", value: 88000, formattedValue: "$88,000", deltaLabel: "+5%" },
  { id: "m-4", label: "Feb", value: 94000, formattedValue: "$94,000", deltaLabel: "+6%" },
  { id: "m-5", label: "Mar", axisLabel: "Mar", value: 103000, formattedValue: "$103,000", deltaLabel: "+7%" },
  { id: "m-6", label: "Apr", value: 112000, formattedValue: "$112,000", deltaLabel: "+8%" },
  { id: "m-7", label: "May", axisLabel: "May", value: 121000, formattedValue: "$121,000", deltaLabel: "+9%" },
  { id: "m-8", label: "Jun", value: 134000, formattedValue: "$134,000", deltaLabel: "+10%" },
  { id: "m-9", label: "Jul", axisLabel: "Jul", value: 145000, formattedValue: "$145,000", deltaLabel: "+11%" },
  { id: "m-10", label: "Aug", value: 158000, formattedValue: "$158,000", deltaLabel: "+12%" },
  { id: "m-11", label: "Sep", value: 169000, formattedValue: "$169,000", deltaLabel: "+13%" },
  {
    id: "m-12",
    label: "Oct",
    axisLabel: "Oct",
    value: 184200,
    formattedValue: "$184,200",
    deltaLabel: "+14%",
    isHighlighted: true,
  },
];

export function buildExecutiveDashboardData(options?: {
  range?: DashboardTimeRange;
  revPeriod?: RevenueTimeframe;
  extraLeadsCount?: number;
  latestLeadCompany?: string;
}): ExecutiveDashboardData {
  const range = options?.range ?? "30d";
  const revPeriod = options?.revPeriod ?? "30D";
  const extraLeads = Math.max(0, options?.extraLeadsCount ?? 0);

  const rangeMultiplier =
    range === "7d" ? 0.28 : range === "90d" ? 2.65 : range === "1y" ? 8.4 : 1;

  const baseRevenue = Math.round(184200 * rangeMultiplier) + extraLeads * 1450;
  const baseDeltaUsd = Math.round(23040 * rangeMultiplier) + extraLeads * 1450;
  const baseQualifiedLeads = Math.round(24850 * rangeMultiplier) + extraLeads;
  const baseActiveOpps = Math.round(4720 * rangeMultiplier) + Math.ceil(extraLeads * 0.5);
  const baseProgrammes = Math.round(1240 * rangeMultiplier) + Math.floor(extraLeads * 0.25);

  const formatNum = (n: number) => n.toLocaleString("en-US");
  const formatUsd = (n: number) => `$${n.toLocaleString("en-US")}`;

  const activityCandidates: RealtimeActivityItem[] = [
    ...(extraLeads > 0 && options?.latestLeadCompany
      ? [
          {
            id: "act-live-new",
            title: `New enquiry from ${options.latestLeadCompany}`,
            actor: "from Smart Leads · Just now",
            relativeTime: "Just now",
            category: "Lead" as const,
          },
        ]
      : []),
    {
      id: "act-1",
      title: "New opportunity created",
      actor: "by Amara Okafor · 3m ago",
      relativeTime: "3m ago",
      category: "Opportunity",
    },
    {
      id: "act-2",
      title: "Deal moved to Negotiation",
      actor: "by Tunde Bello · 15m ago",
      relativeTime: "15m ago",
      category: "Deal",
    },
    {
      id: "act-3",
      title: "New lead added",
      actor: "from Website · 22m ago",
      relativeTime: "22m ago",
      category: "Lead",
    },
    {
      id: "act-4",
      title: "Programme enrolment completed",
      actor: "by Chinedu Eze · 1h ago",
      relativeTime: "1h ago",
      category: "Programme",
    },
  ];
  const activityItems: RealtimeActivityItem[] = activityCandidates.slice(0, 4);

  return {
    range,
    revPeriod,
    kpis: {
      totalRevenue: {
        valueUsd: baseRevenue,
        formatted: formatUsd(baseRevenue),
        currency: "USD",
        deltaPercent: 14.2,
        deltaAmountFormatted: `+${formatUsd(baseDeltaUsd)}`,
        subtext: `+${formatUsd(baseDeltaUsd)} vs. previous period`,
      },
      qualifiedLeads: {
        value: baseQualifiedLeads,
        formatted: formatNum(baseQualifiedLeads),
        deltaPercent: 12.5,
        subtext: "vs. previous period",
        sparkline: [28, 34, 31, 42, 39, 48, 52, 64, 61, 78],
      },
      conversionRate: {
        valuePercent: 18.7,
        formatted: "18.7%",
        deltaPercent: 2.1,
        subtext: "vs. previous period",
        sparkline: [30, 35, 33, 44, 48, 46, 58, 63, 68, 76],
      },
      activeOpps: {
        value: baseActiveOpps,
        formatted: formatNum(baseActiveOpps),
        deltaPercent: 8.3,
        subtext: "vs. previous period",
        sparkline: [25, 38, 30, 45, 36, 52, 44, 60, 54, 72],
      },
      programmes: {
        value: baseProgrammes,
        formatted: formatNum(baseProgrammes),
        deltaPercent: 18.0,
        subtext: "enrolled · vs. previous",
        sparkline: [20, 26, 32, 30, 41, 45, 53, 50, 66, 80],
      },
    },
    revenuePerformance: {
      headlineValue: formatUsd(baseRevenue),
      deltaPercent: 14.2,
      subtext: "vs. previous period",
      barsByPeriod: {
        "7D": BARS_7D,
        "30D": BARS_30D,
        "90D": BARS_90D,
        "1Y": BARS_1Y,
      },
    },
    businessEngines: {
      totalCount: 3,
      items: [
        {
          id: "engine-b2b",
          name: "B2B Market Entry",
          description: "Grow enterprise pipeline across Africa",
          percentage: 42,
          trend: "up",
          accentColor: "#6366f1",
          iconBg: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
          iconType: "b2b",
          revenueContributionUsd: 77364,
          activeDeals: 1982,
        },
        {
          id: "engine-membership",
          name: "Membership",
          description: "Expand our community footprint",
          percentage: 33,
          trend: "up",
          accentColor: "#c084fc",
          iconBg: "linear-gradient(135deg, #a855f7 0%, #e879f9 100%)",
          iconType: "membership",
          revenueContributionUsd: 60786,
          activeDeals: 1558,
        },
        {
          id: "engine-programmes",
          name: "Paid Programmes",
          description: "Revenue through structured programmes",
          percentage: 25,
          trend: "up",
          accentColor: "#34d399",
          iconBg: "linear-gradient(135deg, #10b981 0%, #4ade80 100%)",
          iconType: "programmes",
          revenueContributionUsd: 46050,
          activeDeals: 1180,
        },
      ],
    },
    hotLeads: {
      totalCount: 5,
      items: [
        {
          id: "hl-techglobal",
          initials: "TM",
          company: "TechGlobal Ltd",
          intentLabel: "High intent · 92% match",
          matchScore: 92,
          temperature: "Hot",
          avatarBg: "#818cf8",
          avatarText: "#0f0d1d",
          leadId: "lead-1",
        },
        {
          id: "hl-kora",
          initials: "KS",
          company: "Kora Systems",
          intentLabel: "Engaged · 81% match",
          matchScore: 81,
          temperature: "Warm",
          avatarBg: "#2dd4bf",
          avatarText: "#042f2e",
          leadId: "lead-2",
        },
        {
          id: "hl-alpha",
          initials: "AR",
          company: "Alpha Retail",
          intentLabel: "Interested · 74% match",
          matchScore: 74,
          temperature: "Moderate",
          avatarBg: "#e879f9",
          avatarText: "#2e1065",
          leadId: "lead-3",
        },
        {
          id: "hl-nova",
          initials: "NH",
          company: "Nova Health",
          intentLabel: "Engaged · 71% match",
          matchScore: 71,
          temperature: "Warm",
          avatarBg: "#a3e635",
          avatarText: "#1a2e05",
          leadId: "lead-4",
        },
        {
          id: "hl-delta",
          initials: "DF",
          company: "Delta Finance",
          intentLabel: "Interested · 65% match",
          matchScore: 65,
          temperature: "Cold",
          avatarBg: "#38bdf8",
          avatarText: "#082f49",
          leadId: "lead-5",
        },
      ],
    },
    leadSources: {
      monthLabel: "Oct",
      totalLeads: baseQualifiedLeads,
      totalLeadsFormatted: formatNum(baseQualifiedLeads),
      segments: [
        { id: "src-web", name: "Website", percentage: 36.4, count: 9045, color: "#a855f7" },
        { id: "src-ref", name: "Referrals", percentage: 24.6, count: 6113, color: "#2dd4bf" },
        { id: "src-evt", name: "Events", percentage: 18.7, count: 4647, color: "#a3e635" },
        { id: "src-prt", name: "Partnerships", percentage: 12.1, count: 3007, color: "#fbbf24" },
        { id: "src-oth", name: "Others", percentage: 8.2, count: 2038, color: "#f87171" },
      ],
    },
    conversionFunnel: {
      stages: [
        {
          id: "fn-leads",
          stage: "Leads",
          count: baseQualifiedLeads,
          percentage: 100,
          color: "#a78bfa",
        },
        {
          id: "fn-engaged",
          stage: "Engaged",
          count: Math.round(baseQualifiedLeads * 0.5022),
          percentage: 50.2,
          color: "#8b5cf6",
        },
        {
          id: "fn-qualified",
          stage: "Qualified",
          count: Math.round(baseQualifiedLeads * 0.2704),
          percentage: 27.1,
          color: "#2dd4bf",
        },
        {
          id: "fn-converted",
          stage: "Converted",
          count: baseActiveOpps,
          percentage: 19,
          color: "#bef264",
        },
      ],
    },
    realtimeActivity: {
      isLive: true,
      items: activityItems,
    },
    breakdownModal: {
      regions: [
        {
          region: "West Africa Hub",
          countries: "Nigeria, Ghana, Côte d'Ivoire, Senegal",
          revenueUsd: 82890,
          sharePercent: 45,
          yoyGrowthPercent: 18.4,
        },
        {
          region: "East Africa Hub",
          countries: "Kenya, Rwanda, Uganda, Tanzania",
          revenueUsd: 51576,
          sharePercent: 28,
          yoyGrowthPercent: 15.1,
        },
        {
          region: "Southern Africa Hub",
          countries: "South Africa, Zambia, Botswana, Namibia",
          revenueUsd: 33156,
          sharePercent: 18,
          yoyGrowthPercent: 11.2,
        },
        {
          region: "North & Diaspora",
          countries: "Egypt, Morocco, UK/US African Corridor",
          revenueUsd: 16578,
          sharePercent: 9,
          yoyGrowthPercent: 9.6,
        },
      ],
    },
    forecastModal: {
      projectedNext90DaysUsd: 248600,
      growthRateAssumedPercent: 16.8,
      pipelineCoverageRatio: 3.4,
      quarters: [
        {
          period: "Nov 2026 (Projected)",
          projectedUsd: 204500,
          lowerBoundUsd: 192000,
          upperBoundUsd: 218000,
          confidencePercent: 91,
        },
        {
          period: "Dec 2026 (Projected)",
          projectedUsd: 226800,
          lowerBoundUsd: 209000,
          upperBoundUsd: 244000,
          confidencePercent: 87,
        },
        {
          period: "Jan 2027 (Projected)",
          projectedUsd: 248600,
          lowerBoundUsd: 224000,
          upperBoundUsd: 271000,
          confidencePercent: 83,
        },
      ],
    },
  };
}

