"use client";

import {
  RevenueBreakdownModal,
  RevenueForecastModal,
} from "@/components/dashboard/executive/revenue-modals";
import { useP23Theme } from "@/components/providers/theme-provider";
import { useExecutiveDashboard } from "@/hooks/use-executive-dashboard";
import { useAuthStore } from "@/store/auth";
import type {
  DashboardTimeRange,
  HotLeadItem,
  RealtimeActivityItem,
  RevenueTimeframe,
} from "@/lib/api/contracts/executive-dashboard";
import {
  ArrowUpRight,
  Award,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Download,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

const RANGE_OPTIONS: { value: DashboardTimeRange; label: string }[] = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "1y", label: "Last 12 months" },
];

const REV_PERIODS: RevenueTimeframe[] = ["7D", "30D", "90D", "1Y"];

/**
 * Generates a smooth SVG path and area fill from an array of numbers
 */
function buildSparklinePaths(values: number[], width = 94, height = 32) {
  if (!values.length) return { linePath: "", areaPath: "" };
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(1, max - min);
  const padY = 4;
  const usableH = height - padY * 2;

  const coords = values.map((val, idx) => {
    const x = (idx / Math.max(1, values.length - 1)) * width;
    const y = height - padY - ((val - min) / span) * usableH;
    return { x, y };
  });

  let linePath = `M ${coords[0].x.toFixed(1)} ${coords[0].y.toFixed(1)}`;
  for (let i = 1; i < coords.length; i++) {
    const prev = coords[i - 1];
    const curr = coords[i];
    const cx = ((prev.x + curr.x) / 2).toFixed(1);
    linePath += ` C ${cx} ${prev.y.toFixed(1)}, ${cx} ${curr.y.toFixed(1)}, ${curr.x.toFixed(1)} ${curr.y.toFixed(1)}`;
  }

  const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;
  return { linePath, areaPath };
}

function TemperatureBadge({ temp }: { temp: HotLeadItem["temperature"] }) {
  const styles: Record<
    HotLeadItem["temperature"],
    { bg: string; text: string; dot: string; border: string }
  > = {
    Hot: {
      bg: "rgba(244, 63, 94, 0.14)",
      text: "#fb7185",
      dot: "#f43f5e",
      border: "rgba(244, 63, 94, 0.28)",
    },
    Warm: {
      bg: "rgba(245, 158, 11, 0.14)",
      text: "#fbbf24",
      dot: "#f59e0b",
      border: "rgba(245, 158, 11, 0.28)",
    },
    Moderate: {
      bg: "rgba(168, 85, 247, 0.16)",
      text: "#c084fc",
      dot: "#a855f7",
      border: "rgba(168, 85, 247, 0.3)",
    },
    Cold: {
      bg: "rgba(56, 189, 248, 0.14)",
      text: "#38bdf8",
      dot: "#0ea5e9",
      border: "rgba(56, 189, 248, 0.28)",
    },
  };

  const s = styles[temp];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold shrink-0"
      style={{
        backgroundColor: s.bg,
        color: s.text,
        border: `1px solid ${s.border}`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: s.dot }}
      />
      {temp}
    </span>
  );
}

function ActivityCategoryBadge({
  category,
}: {
  category: RealtimeActivityItem["category"];
}) {
  const styles: Record<
    RealtimeActivityItem["category"],
    { bg: string; text: string; border: string }
  > = {
    Opportunity: {
      bg: "rgba(139, 92, 246, 0.16)",
      text: "#c4b5fd",
      border: "rgba(139, 92, 246, 0.3)",
    },
    Deal: {
      bg: "rgba(45, 212, 191, 0.15)",
      text: "#5eead4",
      border: "rgba(45, 212, 191, 0.3)",
    },
    Lead: {
      bg: "rgba(56, 189, 248, 0.15)",
      text: "#7dd3fc",
      border: "rgba(56, 189, 248, 0.3)",
    },
    Programme: {
      bg: "rgba(163, 230, 53, 0.16)",
      text: "#bef264",
      border: "rgba(163, 230, 53, 0.3)",
    },
  };

  const s = styles[category];
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium shrink-0"
      style={{
        backgroundColor: s.bg,
        color: s.text,
        border: `1px solid ${s.border}`,
      }}
    >
      {category}
    </span>
  );
}

export function ExecutiveDashboardView() {
  const user = useAuthStore((s) => s.user);
  const { theme } = useP23Theme();
  const [range, setRange] = useState<DashboardTimeRange>("30d");
  const [rangeDropdownOpen, setRangeDropdownOpen] = useState(false);
  const [revPeriod, setRevPeriod] = useState<RevenueTimeframe>("30D");
  const [selectedBarId, setSelectedBarId] = useState<string | null>(null);
  const [breakdownModalOpen, setBreakdownModalOpen] = useState(false);
  const [forecastModalOpen, setForecastModalOpen] = useState(false);
  const [exportToastMessage, setExportToastMessage] = useState<string | null>(null);

  const { data } = useExecutiveDashboard(range, revPeriod);

  // Extract user first name for eyebrow greeting (default EMMANUEL matching screenshot)
  const firstName = useMemo(() => {
    const rawName = user?.name?.trim();
    if (!rawName) return "EMMANUEL";
    const first = rawName.split(/\s+/)[0];
    if (!first || first.toLowerCase() === "admin" || first.toLowerCase() === "sales") {
      return "EMMANUEL";
    }
    return first.toUpperCase();
  }, [user]);

  const currentRangeLabel =
    RANGE_OPTIONS.find((r) => r.value === range)?.label ?? "Last 30 days";

  const bars = useMemo(() => {
    if (!data) return [];
    return data.revenuePerformance.barsByPeriod[revPeriod] ?? [];
  }, [data, revPeriod]);

  const activeBarId = useMemo(() => {
    if (selectedBarId && bars.some((b) => b.id === selectedBarId)) {
      return selectedBarId;
    }
    const defaultHighlighted = bars.find((b) => b.isHighlighted);
    return defaultHighlighted?.id ?? bars[bars.length - 1]?.id ?? null;
  }, [bars, selectedBarId]);

  const handleExportCsv = () => {
    if (!data) return;
    const rows = [
      ["Section", "Metric / Item", "Value", "Delta / Context"],
      [
        "KPI",
        "Total Revenue (USD)",
        data.kpis.totalRevenue.formatted,
        `+${data.kpis.totalRevenue.deltaPercent}% (${data.kpis.totalRevenue.subtext})`,
      ],
      [
        "KPI",
        "Qualified Leads",
        data.kpis.qualifiedLeads.formatted,
        `+${data.kpis.qualifiedLeads.deltaPercent}%`,
      ],
      [
        "KPI",
        "Conversion Rate",
        data.kpis.conversionRate.formatted,
        `+${data.kpis.conversionRate.deltaPercent}%`,
      ],
      [
        "KPI",
        "Active Opps",
        data.kpis.activeOpps.formatted,
        `+${data.kpis.activeOpps.deltaPercent}%`,
      ],
      [
        "KPI",
        "Programmes",
        data.kpis.programmes.formatted,
        `+${data.kpis.programmes.deltaPercent}%`,
      ],
      ...data.businessEngines.items.map((e) => [
        "Business Engine",
        e.name,
        `${e.percentage}%`,
        e.description,
      ]),
      ...data.hotLeads.items.map((l) => [
        "Hot Lead",
        l.company,
        l.temperature,
        l.intentLabel,
      ]),
      ...data.conversionFunnel.stages.map((s) => [
        "Conversion Funnel",
        s.stage,
        String(s.count),
        `${s.percentage}%`,
      ]),
    ];

    const csvContent = rows
      .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    try {
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `p23-executive-growth-report-${range}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Fallback for test environments without full Blob URL support
    }

    setExportToastMessage(`Exported p23-executive-growth-report-${range}.csv`);
    setTimeout(() => {
      setExportToastMessage(null);
    }, 3500);
  };

  if (!data) return null;

  // Sparkline SVG geometries
  const leadsSpark = buildSparklinePaths(data.kpis.qualifiedLeads.sparkline);
  const convSpark = buildSparklinePaths(data.kpis.conversionRate.sparkline);
  const oppsSpark = buildSparklinePaths(data.kpis.activeOpps.sparkline);
  const progSpark = buildSparklinePaths(data.kpis.programmes.sparkline);

  // Donut chart geometry (r = 56, circumference = 2 * PI * 56 = 351.858)
  const donutRadius = 56;
  const donutCircumference = 2 * Math.PI * donutRadius;
  let cumulativePercent = 0;

  return (
    <div
      className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12 select-none"
      data-testid="executive-dashboard-view"
      data-theme-active={theme}
    >
      {/* Export Toast Notification */}
      {exportToastMessage && (
        <div
          role="status"
          data-testid="export-toast"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl text-xs font-semibold transition-all"
          style={{
            background: "var(--p23-card-bg)",
            border: "1px solid var(--p23-card-border-hover)",
            color: "var(--p23-text-primary)",
          }}
        >
          <CheckCircle2 className="w-4 h-4 text-[#4ade80]" />
          <span>{exportToastMessage}</span>
        </div>
      )}

      {/* =====================================================================
          GREETING HEADER & GLOBAL CONTROLS
          ===================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.14em] mb-1"
            style={{ color: "var(--p23-text-eyebrow)" }}
            data-testid="dashboard-greeting-eyebrow"
          >
            WELCOME BACK, {firstName}
          </p>
          <h1
            className="text-3xl sm:text-[34px] font-bold tracking-[-0.025em] leading-tight"
            style={{ color: "var(--p23-text-primary)" }}
          >
            Dashboard
          </h1>
          <p
            className="text-[13.5px] mt-1"
            style={{ color: "var(--p23-text-secondary)" }}
          >
            Here&apos;s an overview of your business growth across Africa.
          </p>
        </div>

        {/* Right Controls: Date Range Selector + Export Report */}
        <div className="flex items-center gap-2.5 self-start sm:self-end">
          <div className="relative">
            <button
              type="button"
              onClick={() => setRangeDropdownOpen((prev) => !prev)}
              data-testid="date-range-selector"
              className="p23-pill-control inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 opacity-75" />
              <span>{currentRangeLabel}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>

            {rangeDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-44 rounded-xl py-1.5 shadow-xl z-40"
                style={{
                  background: "var(--p23-card-bg)",
                  border: "1px solid var(--p23-card-border)",
                }}
              >
                {RANGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setRange(opt.value);
                      setRangeDropdownOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs font-medium flex items-center justify-between hover:bg-white/5 transition-colors"
                    style={{
                      color:
                        range === opt.value
                          ? "var(--p23-text-primary)"
                          : "var(--p23-text-secondary)",
                    }}
                  >
                    <span>{opt.label}</span>
                    {range === opt.value && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#a855f7]" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            data-testid="export-report-btn"
            className="p23-export-btn inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* =====================================================================
          ROW 1: 5 KPI CARDS (1 HERO REVENUE + 4 SPARKLINE CARDS)
          ===================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-12 gap-4 mb-4">
        {/* 1. HERO TOTAL REVENUE CARD (3.2 cols -> xl:col-span-3) */}
        <div
          className="p23-hero-revenue-card xl:col-span-3 p-5 flex flex-col justify-between min-h-[168px]"
          data-testid="kpi-total-revenue"
        >
          <div className="flex items-center justify-between gap-2">
            <span
              className="text-[13px] font-semibold"
              style={{ color: "var(--p23-hero-text)" }}
            >
              Total Revenue
            </span>
            <span
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold"
              style={{
                background: "var(--p23-hero-badge-bg)",
                color: "var(--p23-hero-badge-text)",
              }}
            >
              ↑ {data.kpis.totalRevenue.deltaPercent}%
            </span>
          </div>

          <div className="my-2">
            <div className="flex items-baseline gap-1.5">
              <span
                className="text-3xl sm:text-[32px] font-extrabold tracking-tight leading-none"
                style={{ color: "var(--p23-hero-text)" }}
              >
                {data.kpis.totalRevenue.formatted}
              </span>
              <span
                className="text-xs font-bold uppercase tracking-wider opacity-75"
                style={{ color: "var(--p23-hero-text)" }}
              >
                {data.kpis.totalRevenue.currency}
              </span>
            </div>
            <p
              className="text-[11.5px] font-medium mt-1.5"
              style={{ color: "var(--p23-hero-subtext)" }}
            >
              {data.kpis.totalRevenue.subtext}
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setBreakdownModalOpen(true)}
              data-testid="btn-view-breakdown"
              className="px-3.5 py-1.5 rounded-full text-[11.5px] font-semibold transition-transform active:scale-95 cursor-pointer"
              style={{
                backgroundColor: "#0c1116",
                color: "#ffffff",
              }}
            >
              View breakdown
            </button>
            <button
              type="button"
              onClick={() => setForecastModalOpen(true)}
              data-testid="btn-forecast"
              className="px-3.5 py-1.5 rounded-full text-[11.5px] font-semibold transition-transform active:scale-95 cursor-pointer"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.42)",
                color: "#0c1116",
                border: "1px solid rgba(12, 17, 22, 0.14)",
              }}
            >
              Forecast
            </button>
          </div>
        </div>

        {/* 2–5. SECONDARY SPARKLINE KPI CARDS (xl:col-span-9 split into 4 equal cols) */}
        <div className="sm:col-span-2 xl:col-span-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 2: Qualified Leads */}
          <div
            className="p23-bento-card p23-kpi-card-leads p-4.5 flex flex-col justify-between min-h-[168px]"
            data-testid="kpi-qualified-leads"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: "rgba(109, 40, 217, 0.16)",
                    color: "#5b21b6",
                  }}
                >
                  <Users className="w-3.5 h-3.5" />
                </span>
                <span
                  className="text-[12.5px] font-semibold truncate"
                  style={{ color: "#2e1065" }}
                >
                  Qualified Leads
                </span>
              </div>
              <span
                className="px-2 py-0.5 rounded-full text-[11px] font-bold shrink-0"
                style={{
                  background: "rgba(109, 40, 217, 0.14)",
                  color: "#4c1d95",
                }}
              >
                ↑ {data.kpis.qualifiedLeads.deltaPercent}%
              </span>
            </div>

            <div
              className="text-[28px] font-extrabold tracking-tight my-1"
              style={{ color: "#1e1b4b" }}
            >
              {data.kpis.qualifiedLeads.formatted}
            </div>

            <div className="flex items-end justify-between gap-2">
              <span
                className="text-[11px] font-medium"
                style={{ color: "#4c1d95" }}
              >
                {data.kpis.qualifiedLeads.subtext}
              </span>
              <svg
                width="94"
                height="32"
                viewBox="0 0 94 32"
                className="overflow-visible shrink-0"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="spark-purple" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.38" />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d={leadsSpark.areaPath} fill="url(#spark-purple)" />
                <path
                  d={leadsSpark.linePath}
                  fill="none"
                  stroke="#6d28d9"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* Card 3: Conversion Rate */}
          <div
            className="p23-bento-card p23-kpi-card-conversion p-4.5 flex flex-col justify-between min-h-[168px]"
            data-testid="kpi-conversion-rate"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: "rgba(13, 148, 136, 0.18)",
                    color: "#0f766e",
                  }}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                </span>
                <span
                  className="text-[12.5px] font-semibold truncate"
                  style={{ color: "#042f2e" }}
                >
                  Conversion Rate
                </span>
              </div>
              <span
                className="px-2 py-0.5 rounded-full text-[11px] font-bold shrink-0"
                style={{
                  background: "rgba(13, 148, 136, 0.16)",
                  color: "#115e59",
                }}
              >
                ↑ {data.kpis.conversionRate.deltaPercent}%
              </span>
            </div>

            <div
              className="text-[28px] font-extrabold tracking-tight my-1"
              style={{ color: "#022228" }}
            >
              {data.kpis.conversionRate.formatted}
            </div>

            <div className="flex items-end justify-between gap-2">
              <span
                className="text-[11px] font-medium"
                style={{ color: "#115e59" }}
              >
                {data.kpis.conversionRate.subtext}
              </span>
              <svg
                width="94"
                height="32"
                viewBox="0 0 94 32"
                className="overflow-visible shrink-0"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="spark-teal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0d9488" stopOpacity="0.38" />
                    <stop offset="100%" stopColor="#0d9488" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d={convSpark.areaPath} fill="url(#spark-teal)" />
                <path
                  d={convSpark.linePath}
                  fill="none"
                  stroke="#0f766e"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* Card 4: Active Opps */}
          <div
            className="p23-bento-card p23-kpi-card-opps p-4.5 flex flex-col justify-between min-h-[168px]"
            data-testid="kpi-active-opps"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: "rgba(217, 119, 6, 0.18)",
                    color: "#b45309",
                  }}
                >
                  <Target className="w-3.5 h-3.5" />
                </span>
                <span
                  className="text-[12.5px] font-semibold truncate"
                  style={{ color: "#451a03" }}
                >
                  Active Opps
                </span>
              </div>
              <span
                className="px-2 py-0.5 rounded-full text-[11px] font-bold shrink-0"
                style={{
                  background: "rgba(217, 119, 6, 0.16)",
                  color: "#92400e",
                }}
              >
                ↑ {data.kpis.activeOpps.deltaPercent}%
              </span>
            </div>

            <div
              className="text-[28px] font-extrabold tracking-tight my-1"
              style={{ color: "#451a03" }}
            >
              {data.kpis.activeOpps.formatted}
            </div>

            <div className="flex items-end justify-between gap-2">
              <span
                className="text-[11px] font-medium"
                style={{ color: "#78350f" }}
              >
                {data.kpis.activeOpps.subtext}
              </span>
              <svg
                width="94"
                height="32"
                viewBox="0 0 94 32"
                className="overflow-visible shrink-0"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="spark-amber" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d97706" stopOpacity="0.38" />
                    <stop offset="100%" stopColor="#d97706" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d={oppsSpark.areaPath} fill="url(#spark-amber)" />
                <path
                  d={oppsSpark.linePath}
                  fill="none"
                  stroke="#b45309"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* Card 5: Programmes */}
          <div
            className="p23-bento-card p23-kpi-card-programmes p-4.5 flex flex-col justify-between min-h-[168px]"
            data-testid="kpi-programmes"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: "rgba(192, 38, 211, 0.16)",
                    color: "#86198f",
                  }}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                </span>
                <span
                  className="text-[12.5px] font-semibold truncate"
                  style={{ color: "#4a044e" }}
                >
                  Programmes
                </span>
              </div>
              <span
                className="px-2 py-0.5 rounded-full text-[11px] font-bold shrink-0"
                style={{
                  background: "rgba(192, 38, 211, 0.14)",
                  color: "#701a75",
                }}
              >
                ↑ {data.kpis.programmes.deltaPercent.toFixed(1)}%
              </span>
            </div>

            <div
              className="text-[28px] font-extrabold tracking-tight my-1"
              style={{ color: "#3b0764" }}
            >
              {data.kpis.programmes.formatted}
            </div>

            <div className="flex items-end justify-between gap-2">
              <span
                className="text-[11px] font-medium"
                style={{ color: "#701a75" }}
              >
                {data.kpis.programmes.subtext}
              </span>
              <svg
                width="94"
                height="32"
                viewBox="0 0 94 32"
                className="overflow-visible shrink-0"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="spark-violet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c026d3" stopOpacity="0.38" />
                    <stop offset="100%" stopColor="#c026d3" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d={progSpark.areaPath} fill="url(#spark-violet)" />
                <path
                  d={progSpark.linePath}
                  fill="none"
                  stroke="#a21caf"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          ROW 2: 3-COLUMN BENTO GRID
          - Revenue Performance (5 cols)
          - Business Engines (3.5 cols)
          - Hot Leads (3.5 cols)
          ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
        {/* 1. REVENUE PERFORMANCE (lg:col-span-5) */}
        <div
          className="p23-bento-card lg:col-span-5 p-5 flex flex-col justify-between"
          data-testid="card-revenue-performance"
        >
          <div>
            {/* Card Header + 7D / 30D / 90D / 1Y switcher */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2
                className="text-[15.5px] font-semibold tracking-tight"
                style={{ color: "var(--p23-text-primary)" }}
              >
                Revenue Performance
              </h2>

              <div className="flex items-center gap-2">
                <div
                  className="inline-flex items-center p-0.5 rounded-full"
                  style={{
                    background: "var(--p23-inner-row-bg)",
                    border: "1px solid var(--p23-inner-row-border)",
                  }}
                  role="tablist"
                  aria-label="Revenue timeframe"
                >
                  {REV_PERIODS.map((period) => {
                    const isActive = revPeriod === period;
                    return (
                      <button
                        key={period}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        data-testid={`rev-period-${period}`}
                        onClick={() => {
                          setRevPeriod(period);
                          setSelectedBarId(null);
                        }}
                        className="px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer"
                        style={{
                          background: isActive
                            ? "rgba(255, 255, 255, 0.14)"
                            : "transparent",
                          color: isActive
                            ? "var(--p23-text-primary)"
                            : "var(--p23-text-muted)",
                        }}
                      >
                        {period}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setForecastModalOpen(true)}
                  aria-label="Expand revenue performance forecast"
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-105 cursor-pointer"
                  style={{
                    backgroundColor: "#ffffff",
                    color: "#0b0914",
                  }}
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Headline Value */}
            <div className="flex items-center gap-2.5 mt-3">
              <span
                className="text-[26px] font-bold tracking-tight"
                style={{ color: "var(--p23-text-primary)" }}
              >
                {data.revenuePerformance.headlineValue}
              </span>
              <span
                className="px-2 py-0.5 rounded-full text-[11px] font-semibold"
                style={{
                  background: "var(--p23-delta-up-bg)",
                  color: "var(--p23-delta-up-text)",
                }}
              >
                ↑ {data.revenuePerformance.deltaPercent}%
              </span>
              <span
                className="text-xs"
                style={{ color: "var(--p23-text-muted)" }}
              >
                {data.revenuePerformance.subtext}
              </span>
            </div>
          </div>

          {/* Bar Chart Canvas */}
          <div className="mt-6 pt-2">
            <div className="flex gap-3">
              {/* Y-Axis Labels */}
              <div
                className="flex flex-col justify-between text-[10.5px] font-medium h-[185px] pb-6 select-none shrink-0"
                style={{ color: "var(--p23-text-muted)" }}
              >
                <span>200k</span>
                <span>150k</span>
                <span>100k</span>
                <span>50k</span>
                <span>0</span>
              </div>

              {/* Bars Area */}
              <div className="relative flex-1 h-[185px] flex flex-col justify-end">
                {/* Horizontal Subtle Grid Lines */}
                <div className="absolute inset-x-0 top-0 bottom-6 flex flex-col justify-between pointer-events-none">
                  {[0, 1, 2, 3, 4].map((lineIdx) => (
                    <div
                      key={lineIdx}
                      className="w-full border-b border-dashed"
                      style={{
                        borderColor: "rgba(2, 34, 40, 0.06)",
                      }}
                    />
                  ))}
                </div>

                {/* Bars Row */}
                <div className="relative z-10 flex items-end justify-between gap-1.5 sm:gap-2 h-[160px] px-1">
                  {bars.map((bar) => {
                    const isSelected = bar.id === activeBarId;
                    const heightPct = Math.min(
                      100,
                      Math.max(14, Math.round((bar.value / 200000) * 100))
                    );

                    return (
                      <div
                        key={bar.id}
                        className="relative flex-1 h-full flex flex-col justify-end items-center group"
                      >
                        {/* Floating Tooltip Pill on Active Bar */}
                        {isSelected && (
                          <div
                            data-testid="active-bar-tooltip"
                            className="absolute -top-8 right-0 z-20 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap shadow-xl pointer-events-none"
                            style={{
                              backgroundColor: "#141122",
                              border: "1px solid rgba(168, 85, 247, 0.45)",
                              color: "#ffffff",
                              boxShadow: "0 8px 20px rgba(0,0,0,0.5)",
                            }}
                          >
                            <span className="w-4 h-4 rounded-full bg-white text-[#0b0914] inline-flex items-center justify-center text-[9px]">
                              ↗
                            </span>
                            <span>{bar.formattedValue}</span>
                            <span className="text-[#4ade80] font-semibold">
                              {bar.deltaLabel}
                            </span>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => setSelectedBarId(bar.id)}
                          aria-label={`${bar.label}: ${bar.formattedValue}`}
                          className="w-full max-w-[22px] rounded-t-[8px] rounded-b-[3px] transition-all duration-300 relative cursor-pointer focus:outline-none"
                          style={{
                            height: `${heightPct}%`,
                            background: isSelected
                              ? "var(--p23-bar-active)"
                              : "var(--p23-bar-inactive)",
                            boxShadow: isSelected
                              ? "var(--p23-bar-active-glow)"
                              : "none",
                          }}
                        >
                          {isSelected && (
                            <span
                              className="absolute top-1.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white shadow"
                              aria-hidden="true"
                            />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* X-Axis Labels */}
                <div
                  className="flex items-center justify-between text-[10.5px] font-medium pt-2 px-1"
                  style={{ color: "var(--p23-text-muted)" }}
                >
                  {bars
                    .filter((b) => Boolean(b.axisLabel))
                    .map((b) => (
                      <span
                        key={b.id}
                        style={{
                          color:
                            b.id === activeBarId
                              ? "var(--p23-text-primary)"
                              : "var(--p23-text-muted)",
                          fontWeight: b.id === activeBarId ? 600 : 400,
                        }}
                      >
                        {b.axisLabel}
                      </span>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. BUSINESS ENGINES (lg:col-span-3 or custom 7-col nested grid) */}
        <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* BUSINESS ENGINES CARD */}
          <div
            className="p23-bento-card p-5 flex flex-col justify-between"
            data-testid="card-business-engines"
          >
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <h2
                  className="text-[15.5px] font-semibold tracking-tight"
                  style={{ color: "var(--p23-text-primary)" }}
                >
                  Business Engines
                </h2>
                <span
                  className="text-xs font-semibold"
                  style={{ color: "var(--p23-text-muted)" }}
                >
                  {data.businessEngines.totalCount}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setBreakdownModalOpen(true)}
                className="inline-flex items-center gap-0.5 text-xs font-medium hover:underline cursor-pointer"
                style={{ color: "var(--p23-text-secondary)" }}
              >
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3 flex-1 flex flex-col justify-center">
              {data.businessEngines.items.map((engine) => (
                <div
                  key={engine.id}
                  onClick={() => setBreakdownModalOpen(true)}
                  className="p23-inner-row p-3.5 flex items-center gap-3.5 cursor-pointer"
                >
                  {/* Left Icon Box */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white shadow-md"
                    style={{ background: engine.iconBg }}
                  >
                    {engine.iconType === "b2b" && (
                      <Building2 className="w-4.5 h-4.5" />
                    )}
                    {engine.iconType === "membership" && (
                      <Users className="w-4.5 h-4.5" />
                    )}
                    {engine.iconType === "programmes" && (
                      <Briefcase className="w-4.5 h-4.5" />
                    )}
                  </div>

                  {/* Center Info & Progress Bar */}
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-[13.5px] font-semibold truncate"
                      style={{ color: "var(--p23-text-primary)" }}
                    >
                      {engine.name}
                    </div>
                    <p
                      className="text-[11.5px] truncate mt-0.5"
                      style={{ color: "var(--p23-text-muted)" }}
                    >
                      {engine.description}
                    </p>
                    {/* Progress Bar */}
                    <div
                      className="mt-2.5 h-1.5 w-full rounded-full overflow-hidden"
                      style={{
                        backgroundColor: "rgba(2, 34, 40, 0.08)",
                      }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${engine.percentage}%`,
                          backgroundColor: engine.accentColor,
                        }}
                      />
                    </div>
                  </div>

                  {/* Right Percentage + Up Arrow */}
                  <div className="text-right shrink-0 pl-1">
                    <div
                      className="text-[15px] font-bold leading-none"
                      style={{ color: "var(--p23-text-primary)" }}
                    >
                      {engine.percentage}%
                    </div>
                    <div
                      className="text-[11px] font-bold mt-1"
                      style={{ color: "var(--p23-delta-up-text)" }}
                    >
                      ↑
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. HOT LEADS CARD */}
          <div
            className="p23-bento-card p-5 flex flex-col justify-between"
            data-testid="card-hot-leads"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h2
                  className="text-[15.5px] font-semibold tracking-tight"
                  style={{ color: "var(--p23-text-primary)" }}
                >
                  Hot Leads
                </h2>
                <span
                  className="text-xs font-semibold"
                  style={{ color: "var(--p23-text-muted)" }}
                >
                  {data.hotLeads.totalCount}
                </span>
              </div>

              <Link
                href="/crm"
                className="inline-flex items-center gap-0.5 text-xs font-medium hover:underline"
                style={{ color: "var(--p23-text-secondary)" }}
              >
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2 flex-1 flex flex-col justify-between">
              {data.hotLeads.items.map((lead) => (
                <Link
                  key={lead.id}
                  href="/crm"
                  className="p23-inner-row px-3 py-2.5 flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                      style={{
                        backgroundColor: lead.avatarBg,
                        color: lead.avatarText,
                      }}
                    >
                      {lead.initials}
                    </div>
                    <div className="min-w-0">
                      <div
                        className="text-[13px] font-semibold truncate group-hover:underline"
                        style={{ color: "var(--p23-text-primary)" }}
                      >
                        {lead.company}
                      </div>
                      <div
                        className="text-[11px] truncate"
                        style={{ color: "var(--p23-text-muted)" }}
                      >
                        {lead.intentLabel}
                      </div>
                    </div>
                  </div>

                  <TemperatureBadge temp={lead.temperature} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          ROW 3: 3-COLUMN BENTO GRID
          - Lead Source & Conversion (3.5 cols)
          - Conversion Funnel (4.5 cols)
          - Real-Time Activity (4 cols)
          ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* 1. LEAD SOURCE & CONVERSION (lg:col-span-4) */}
        <div
          className="p23-bento-card lg:col-span-4 p-5 flex flex-col justify-between"
          data-testid="card-lead-sources"
        >
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-[15.5px] font-semibold tracking-tight"
              style={{ color: "var(--p23-text-primary)" }}
            >
              Lead Source &amp; Conversion
            </h2>

            <span
              className="px-3 py-1 rounded-full text-[11px] font-semibold"
              style={{
                background: "var(--p23-inner-row-bg)",
                border: "1px solid var(--p23-inner-row-border)",
                color: "var(--p23-text-secondary)",
              }}
            >
              {data.leadSources.monthLabel}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 my-auto py-2">
            {/* Multi-Segment SVG Donut Chart */}
            <div className="relative w-[144px] h-[144px] flex items-center justify-center shrink-0">
              <svg
                width="144"
                height="144"
                viewBox="0 0 144 144"
                className="-rotate-90"
              >
                {data.leadSources.segments.map((seg) => {
                  const strokeDasharray = `${
                    (seg.percentage / 100) * donutCircumference
                  } ${donutCircumference}`;
                  const strokeDashoffset = -(
                    (cumulativePercent / 100) *
                    donutCircumference
                  );
                  cumulativePercent += seg.percentage;

                  return (
                    <circle
                      key={seg.id}
                      cx="72"
                      cy="72"
                      r={donutRadius}
                      fill="transparent"
                      stroke={seg.color}
                      strokeWidth="15"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="butt"
                      className="transition-all duration-500"
                    />
                  );
                })}
              </svg>

              {/* Center Metric Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span
                  className="text-[9px] font-semibold uppercase tracking-widest"
                  style={{ color: "var(--p23-text-muted)" }}
                >
                  TOTAL LEADS
                </span>
                <span
                  className="text-[20px] font-bold tracking-tight mt-0.5"
                  style={{ color: "var(--p23-text-primary)" }}
                >
                  {data.leadSources.totalLeadsFormatted}
                </span>
              </div>
            </div>

            {/* 2-Column Legend with Vertical Color Bars */}
            <div className="grid grid-cols-2 gap-x-5 gap-y-3.5 flex-1 w-full">
              {data.leadSources.segments.map((seg) => (
                <div key={seg.id} className="flex flex-col">
                  <span
                    className="text-[11px] font-medium"
                    style={{ color: "var(--p23-text-muted)" }}
                  >
                    {seg.name}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className="w-1 h-3.5 rounded-full shrink-0"
                      style={{ backgroundColor: seg.color }}
                    />
                    <span
                      className="text-[14px] font-bold"
                      style={{ color: "var(--p23-text-primary)" }}
                    >
                      {seg.percentage}%
                    </span>
                  </div>
                </div>
              ))}

              <div className="flex items-end">
                <Link
                  href="/analytics"
                  className="inline-flex items-center gap-0.5 text-xs font-medium hover:underline"
                  style={{ color: "var(--p23-text-secondary)" }}
                >
                  <span>View details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 2. CONVERSION FUNNEL (lg:col-span-4) */}
        <div
          className="p23-bento-card lg:col-span-4 p-5 flex flex-col justify-between"
          data-testid="card-conversion-funnel"
        >
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-[15.5px] font-semibold tracking-tight"
              style={{ color: "var(--p23-text-primary)" }}
            >
              Conversion Funnel
            </h2>

            <Link
              href="/analytics"
              className="inline-flex items-center gap-0.5 text-xs font-medium hover:underline"
              style={{ color: "var(--p23-text-secondary)" }}
            >
              <span>View details</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3 my-auto">
            {data.conversionFunnel.stages.map((stage) => {
              // Ensure visual bar width matches screenshot proportions while keeping text inside readable
              const visualWidthPct = Math.max(34, stage.percentage);
              return (
                <div
                  key={stage.id}
                  className="flex items-center gap-3"
                  data-testid={`funnel-stage-${stage.stage.toLowerCase()}`}
                >
                  <span
                    className="w-16 text-xs font-medium shrink-0"
                    style={{ color: "var(--p23-text-secondary)" }}
                  >
                    {stage.stage}
                  </span>

                  <div className="flex-1">
                    <div
                      className="h-9 rounded-xl px-3.5 flex items-center justify-between transition-all duration-500 shadow-sm"
                      style={{
                        width: `${visualWidthPct}%`,
                        backgroundColor: stage.color,
                        color: "#0f0d1d",
                      }}
                    >
                      <span className="text-xs font-bold">
                        {stage.count.toLocaleString("en-US")}
                      </span>
                      <span className="text-[11px] font-semibold opacity-80">
                        {stage.percentage}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. REAL-TIME ACTIVITY (lg:col-span-4) */}
        <div
          className="p23-bento-card lg:col-span-4 p-5 flex flex-col justify-between"
          data-testid="card-realtime-activity"
        >
          <div className="flex items-center justify-between mb-3.5">
            <h2
              className="text-[15.5px] font-semibold tracking-tight"
              style={{ color: "var(--p23-text-primary)" }}
            >
              Real-Time Activity
            </h2>

            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
              style={{
                backgroundColor: "rgba(163, 230, 53, 0.14)",
                color: "#bef264",
                border: "1px solid rgba(163, 230, 53, 0.3)",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#a3e635] animate-pulse" />
              Live
            </span>
          </div>

          <div className="space-y-2.5 my-auto">
            {data.realtimeActivity.items.map((act) => (
              <div
                key={act.id}
                className="p23-inner-row px-3.5 py-2.5 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor:
                        act.category === "Opportunity"
                          ? "rgba(139, 92, 246, 0.16)"
                          : act.category === "Deal"
                          ? "rgba(45, 212, 191, 0.16)"
                          : act.category === "Lead"
                          ? "rgba(56, 189, 248, 0.16)"
                          : "rgba(163, 230, 53, 0.16)",
                      color:
                        act.category === "Opportunity"
                          ? "#c4b5fd"
                          : act.category === "Deal"
                          ? "#5eead4"
                          : act.category === "Lead"
                          ? "#7dd3fc"
                          : "#bef264",
                    }}
                  >
                    {act.category === "Opportunity" && (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    {act.category === "Deal" && (
                      <TrendingUp className="w-3.5 h-3.5" />
                    )}
                    {act.category === "Lead" && (
                      <UserPlus className="w-3.5 h-3.5" />
                    )}
                    {act.category === "Programme" && (
                      <ShieldCheck className="w-3.5 h-3.5" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div
                      className="text-[13px] font-semibold truncate"
                      style={{ color: "var(--p23-text-primary)" }}
                    >
                      {act.title}
                    </div>
                    <div
                      className="text-[11px] truncate"
                      style={{ color: "var(--p23-text-muted)" }}
                    >
                      {act.actor}
                    </div>
                  </div>
                </div>

                <ActivityCategoryBadge category={act.category} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* =====================================================================
          INTERACTIVE MODALS (BREAKDOWN & FORECAST)
          ===================================================================== */}
      <RevenueBreakdownModal
        open={breakdownModalOpen}
        onClose={() => setBreakdownModalOpen(false)}
        totalRevenueFormatted={data.kpis.totalRevenue.formatted}
        regions={data.breakdownModal.regions}
        engines={data.businessEngines.items}
      />

      <RevenueForecastModal
        open={forecastModalOpen}
        onClose={() => setForecastModalOpen(false)}
        projectedNext90DaysUsd={data.forecastModal.projectedNext90DaysUsd}
        growthRateAssumedPercent={data.forecastModal.growthRateAssumedPercent}
        pipelineCoverageRatio={data.forecastModal.pipelineCoverageRatio}
        quarters={data.forecastModal.quarters}
      />
    </div>
  );
}

