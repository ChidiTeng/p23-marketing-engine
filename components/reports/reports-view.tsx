"use client";

import React, { useMemo, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Download,
  Plus,
  X,
} from "lucide-react";
import {
  ENGINE_REVENUE_MONTHLY,
  ENGINE_REVENUE_QUARTERLY,
  INITIAL_RECENT_EXPORTS,
  INITIAL_SCHEDULED_REPORTS,
  RETENTION_COHORTS,
  SAVED_REPORTS,
  TOP_MARKETS,
  type RecentExportItem,
  type SavedReportCategory,
  type SavedReportItem,
  type ScheduledReportItem,
} from "@/lib/api/contracts/reports";

const DATE_RANGES = [
  "Oct 1 – Oct 31",
  "Sep 1 – Sep 30",
  "Q3 2026 (Jul – Sep)",
  "Year to date (2026)",
] as const;

const REPORT_CATEGORIES: SavedReportCategory[] = [
  "REVENUE",
  "PIPELINE",
  "CAMPAIGNS",
  "PROGRAMMES",
];

function getCohortCellStyle(pct: number | null): {
  bg: string;
  text: string;
} {
  if (pct === null) {
    return { bg: "#f8fafc", text: "transparent" };
  }
  if (pct >= 95) {
    return { bg: "#8b5cf6", text: "#ffffff" };
  }
  if (pct >= 84) {
    return { bg: "#a78bfa", text: "#ffffff" };
  }
  if (pct >= 76) {
    return { bg: "#c4b5fd", text: "#2e1065" };
  }
  if (pct >= 68) {
    return { bg: "#ddd6fe", text: "#3b0764" };
  }
  return { bg: "#ede9fe", text: "#4c1d95" };
}

export function ReportsView() {
  const [savedReports, setSavedReports] =
    useState<SavedReportItem[]>(SAVED_REPORTS);
  const [selectedReportId, setSelectedReportId] = useState<string>(
    SAVED_REPORTS[0].id
  );
  const [dateRange, setDateRange] = useState<string>("Oct 1 – Oct 31");
  const [dateRangeOpen, setDateRangeOpen] = useState(false);

  const [engineChartMode, setEngineChartMode] = useState<
    "Monthly" | "Quarterly"
  >("Monthly");
  const [cohortMode, setCohortMode] = useState<"% retained" | "Revenue">(
    "% retained"
  );

  const [scheduledReports, setScheduledReports] = useState<
    ScheduledReportItem[]
  >(INITIAL_SCHEDULED_REPORTS);
  const [recentExports, setRecentExports] = useState<RecentExportItem[]>(
    INITIAL_RECENT_EXPORTS
  );

  // Interactive modals & toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [newReportOpen, setNewReportOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [compareModalOpen, setCompareModalOpen] = useState(false);

  // New Report form state
  const [newReportTitle, setNewReportTitle] = useState("");
  const [newReportCategory, setNewReportCategory] =
    useState<SavedReportCategory>("REVENUE");

  // Schedule form state
  const [schedTitle, setSchedTitle] = useState("");
  const [schedCadence, setSchedCadence] = useState(
    "Mondays · 09:00 · Executive team"
  );

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3400);
  }

  const activeReport = useMemo(() => {
    return (
      savedReports.find((r) => r.id === selectedReportId) ?? savedReports[0]
    );
  }, [savedReports, selectedReportId]);

  const engineBars =
    engineChartMode === "Monthly"
      ? ENGINE_REVENUE_MONTHLY
      : ENGINE_REVENUE_QUARTERLY;

  function toggleScheduledReport(id: string) {
    setScheduledReports((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item
      )
    );
  }

  function handleExportPdf() {
    const newExport: RecentExportItem = {
      id: `exp-${Date.now()}`,
      format: "PDF",
      title: activeReport.heroTitle,
      subtitle: "Emmanuel N. · Just now",
    };
    setRecentExports((prev) => [newExport, ...prev.slice(0, 3)]);
    showToast(`Exported "${activeReport.heroTitle}.pdf"`);
  }

  function handleCreateReport(e: React.FormEvent) {
    e.preventDefault();
    if (!newReportTitle.trim()) return;

    const diamondColors: Record<SavedReportCategory, string> = {
      REVENUE: "#14b8a6",
      PIPELINE: "#8b5cf6",
      CAMPAIGNS: "#d97706",
      PROGRAMMES: "#d946ef",
    };

    const created: SavedReportItem = {
      id: `rep-${Date.now()}`,
      title: newReportTitle.trim(),
      category: newReportCategory,
      diamondColor: diamondColors[newReportCategory],
      heroTitle: newReportTitle.trim(),
      heroValue: "$184,200",
      heroDelta: "↑ 14.3%",
      heroSubtext: `Custom ${newReportCategory.toLowerCase()} saved view · ${dateRange}`,
      stats: [
        { label: "NEW CUSTOMERS", value: "414" },
        { label: "CONVERSION", value: "18.7%" },
        { label: "QUALIFIED LEADS", value: "24,850" },
        { label: "CHURN", value: "2.4%" },
      ],
    };

    setSavedReports((prev) => [...prev, created]);
    setSelectedReportId(created.id);
    setNewReportTitle("");
    setNewReportOpen(false);
    showToast(`Saved report "${created.title}"`);
  }

  function handleCreateSchedule(e: React.FormEvent) {
    e.preventDefault();
    if (!schedTitle.trim()) return;

    const created: ScheduledReportItem = {
      id: `sched-${Date.now()}`,
      title: schedTitle.trim(),
      cadenceLabel: schedCadence.trim() || "Mondays · 09:00 · Leadership",
      enabled: true,
      accentColor: "#8b5cf6",
    };

    setScheduledReports((prev) => [created, ...prev]);
    setSchedTitle("");
    setScheduleModalOpen(false);
    showToast(`Scheduled "${created.title}"`);
  }

  return (
    <div
      className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12 select-none"
      data-testid="reports-view"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          data-testid="reports-toast"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl text-xs font-semibold bg-[#0b0d14] text-white border border-white/10"
        >
          <CheckCircle2 className="w-4 h-4 text-[#4ade80] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =====================================================================
          HEADER & TOP CONTROLS
          ===================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.14em] mb-1"
            style={{ color: "var(--p23-text-eyebrow)" }}
            data-testid="reports-eyebrow"
          >
            REPORTS
          </p>
          <h1 className="text-3xl sm:text-[34px] font-bold tracking-[-0.025em] leading-tight text-[#070b16]">
            Reports
          </h1>
          <p className="text-[13.5px] mt-1 text-[#64748b]">
            Saved views of revenue, pipeline, campaigns and programmes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-end">
          {/* Date Range Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setDateRangeOpen((v) => !v)}
              data-testid="reports-date-range-btn"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-slate-200/90 text-[#070b16] text-xs font-semibold shadow-2xs hover:border-slate-300 transition-all cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{dateRange}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {dateRangeOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white border border-slate-200 shadow-xl py-1.5 z-40">
                {DATE_RANGES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setDateRange(r);
                      setDateRangeOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs font-medium flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                      dateRange === r
                        ? "text-[#070b16] font-semibold"
                        : "text-slate-600"
                    }`}
                  >
                    <span>{r}</span>
                    {dateRange === r && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6]" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Schedule Button */}
          <button
            type="button"
            onClick={() => setScheduleModalOpen(true)}
            data-testid="reports-schedule-btn"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-slate-200/90 text-[#070b16] text-xs font-semibold shadow-2xs hover:border-slate-300 transition-all cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Schedule</span>
          </button>

          {/* Export PDF Button */}
          <button
            type="button"
            onClick={handleExportPdf}
            data-testid="reports-export-pdf-btn"
            className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-full bg-[#0b0d14] text-white text-xs font-semibold shadow-md hover:opacity-90 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* =====================================================================
          MAIN WORKSPACE: LEFT SAVED REPORTS SIDEBAR + RIGHT BENTO GRID
          ===================================================================== */}
      <div className="flex flex-col xl:flex-row gap-4 items-stretch">
        {/* LEFT SIDEBAR: SAVED REPORTS DIRECTORY */}
        <aside
          className="p23-bento-card w-full xl:w-[244px] shrink-0 p-4 flex flex-col gap-5"
          data-testid="reports-sidebar"
        >
          <button
            type="button"
            onClick={() => setNewReportOpen(true)}
            data-testid="reports-new-report-btn"
            className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-full bg-[#0b0d14] text-white text-xs font-semibold shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New report</span>
          </button>

          <div className="space-y-5">
            {REPORT_CATEGORIES.map((category) => {
              const items = savedReports.filter((r) => r.category === category);
              return (
                <div key={category}>
                  <h2 className="px-2.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#94a3b8] mb-1.5">
                    {category}
                  </h2>
                  <div className="space-y-0.5">
                    {items.map((rep) => {
                      const isActive = rep.id === activeReport.id;
                      return (
                        <button
                          key={rep.id}
                          type="button"
                          onClick={() => setSelectedReportId(rep.id)}
                          data-testid={`saved-report-${rep.id}`}
                          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                            isActive
                              ? "bg-slate-100/95 font-bold text-[#070b16]"
                              : "font-medium text-[#475569] hover:bg-slate-50 hover:text-[#070b16]"
                          }`}
                        >
                          <span
                            className="w-2 h-2 rotate-45 rounded-[1.5px] shrink-0"
                            style={{ backgroundColor: rep.diamondColor }}
                          />
                          <span className="truncate">{rep.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* RIGHT WORKSPACE: 2-ROW BENTO DASHBOARD */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* =================================================================
              TOP ROW: HERO REPORT CARD (4 cols) + REVENUE BY ENGINE (5 cols) + TOP MARKETS (3 cols)
              ================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            {/* 1. HERO REPORT CARD (lg:col-span-4) */}
            <div
              data-testid="reports-hero-card"
              className="p23-hero-revenue-card lg:col-span-4 p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="text-[13px] font-semibold"
                    style={{ color: "var(--p23-hero-text)" }}
                    data-testid="hero-report-title"
                  >
                    {activeReport.heroTitle}
                  </span>
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[11px] font-bold"
                    style={{
                      background: "var(--p23-hero-badge-bg)",
                      color: "var(--p23-hero-badge-text)",
                    }}
                  >
                    {activeReport.heroDelta}
                  </span>
                </div>

                <div
                  className="text-[34px] font-extrabold tracking-tight leading-none mt-2 tabular-nums"
                  style={{ color: "var(--p23-hero-text)" }}
                  data-testid="hero-report-value"
                >
                  {activeReport.heroValue}
                </div>
                <p
                  className="text-[11.5px] font-medium mt-1.5"
                  style={{ color: "var(--p23-hero-subtext)" }}
                >
                  {activeReport.heroSubtext}
                </p>
              </div>

              {/* 2x2 Complementary Gradient KPI Grid */}
              <div className="grid grid-cols-2 gap-2.5 my-4">
                {activeReport.stats.map((st, idx) => {
                  const tileThemes = [
                    {
                      cls: "p23-kpi-card-leads",
                      labelColor: "#4c1d95",
                      valueColor: "#1e1b4b",
                    },
                    {
                      cls: "p23-kpi-card-conversion",
                      labelColor: "#115e59",
                      valueColor: "#022228",
                    },
                    {
                      cls: "p23-kpi-card-opps",
                      labelColor: "#78350f",
                      valueColor: "#451a03",
                    },
                    {
                      cls: "p23-kpi-card-programmes",
                      labelColor: "#701a75",
                      valueColor: "#3b0764",
                    },
                  ];
                  const t = tileThemes[idx % tileThemes.length];

                  return (
                    <div
                      key={st.label}
                      className={`rounded-xl p-3 ${t.cls}`}
                    >
                      <span
                        className="block text-[9.5px] font-bold uppercase tracking-wider"
                        style={{ color: t.labelColor }}
                      >
                        {st.label}
                      </span>
                      <span
                        className="block text-xl font-extrabold mt-0.5 tabular-nums"
                        style={{ color: t.valueColor }}
                      >
                        {st.value}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    showToast(
                      `Copied shareable link for "${activeReport.heroTitle}"`
                    )
                  }
                  data-testid="reports-share-btn"
                  className="px-4 py-2 rounded-full text-xs font-semibold transition-transform active:scale-95 cursor-pointer"
                  style={{
                    backgroundColor: "#0c1116",
                    color: "#ffffff",
                  }}
                >
                  Share report
                </button>
                <button
                  type="button"
                  onClick={() => setCompareModalOpen(true)}
                  data-testid="reports-compare-btn"
                  className="px-4 py-2 rounded-full text-xs font-semibold transition-transform active:scale-95 cursor-pointer"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.42)",
                    color: "#0c1116",
                    border: "1px solid rgba(12, 17, 22, 0.14)",
                  }}
                >
                  Compare periods
                </button>
              </div>
            </div>

            {/* 2. REVENUE BY ENGINE STACKED BAR CHART CARD (lg:col-span-5) */}
            <div
              className="p23-bento-card lg:col-span-5 p-5 flex flex-col justify-between"
              data-testid="reports-revenue-by-engine-card"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-[15px] font-bold text-[#070b16]">
                    Revenue by engine
                  </h2>

                  <div className="inline-flex items-center p-0.5 rounded-full bg-slate-100 border border-slate-200/70">
                    {(["Monthly", "Quarterly"] as const).map((mode) => {
                      const active = engineChartMode === mode;
                      return (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setEngineChartMode(mode)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                            active
                              ? "bg-white text-[#070b16] shadow-2xs"
                              : "text-[#64748b] hover:text-[#070b16]"
                          }`}
                        >
                          {mode}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center gap-4 mt-2.5 text-[11px] font-medium text-[#475569]">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#60a5fa]" />
                    B2B Market Entry
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#c084fc]" />
                    Membership
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#5eead4]" />
                    Paid Programmes
                  </span>
                </div>
              </div>

              {/* Stacked Bar Chart Area */}
              <div className="mt-5 pt-2 flex gap-3">
                {/* Y-Axis Labels */}
                <div className="flex flex-col justify-between text-[10.5px] font-medium text-[#94a3b8] h-[200px] pb-6 shrink-0">
                  <span>200k</span>
                  <span>150k</span>
                  <span>100k</span>
                  <span>50k</span>
                  <span>0</span>
                </div>

                {/* Columns + Grid Lines */}
                <div className="relative flex-1 h-[200px] flex flex-col justify-end">
                  {/* Horizontal Grid Lines */}
                  <div className="absolute inset-x-0 top-0 bottom-6 flex flex-col justify-between pointer-events-none">
                    {[0, 1, 2, 3, 4].map((idx) => (
                      <div
                        key={idx}
                        className="w-full border-b border-dashed border-slate-200/70"
                      />
                    ))}
                  </div>

                  {/* Stacked Bars Row */}
                  <div className="relative z-10 flex items-end justify-around gap-3 h-[174px] px-2">
                    {engineBars.map((bar) => {
                      const total =
                        bar.b2bUsd + bar.membershipUsd + bar.programmesUsd;
                      const maxScale = 210000;
                      const progH = Math.max(
                        18,
                        Math.round((bar.programmesUsd / maxScale) * 165)
                      );
                      const memH = Math.max(
                        24,
                        Math.round((bar.membershipUsd / maxScale) * 165)
                      );
                      const b2bH = Math.max(
                        28,
                        Math.round((bar.b2bUsd / maxScale) * 165)
                      );

                      return (
                        <div
                          key={bar.id}
                          className="flex flex-col items-center justify-end h-full flex-1 max-w-[44px]"
                          title={`${bar.periodLabel}: $${total.toLocaleString("en-US")}`}
                        >
                          <span
                            className={`text-[10.5px] mb-1.5 tabular-nums ${
                              bar.isHighlighted
                                ? "font-extrabold text-[#070b16]"
                                : "font-semibold text-[#64748b]"
                            }`}
                          >
                            {bar.totalFormatted}
                          </span>

                          <div className="w-full flex flex-col gap-1">
                            {/* Top: Paid Programmes */}
                            <div
                              className="w-full rounded-md transition-all duration-300"
                              style={{
                                height: `${progH}px`,
                                backgroundColor: bar.isHighlighted
                                  ? "#2dd4bf"
                                  : "#86efda",
                              }}
                            />
                            {/* Middle: Membership */}
                            <div
                              className="w-full rounded-md transition-all duration-300"
                              style={{
                                height: `${memH}px`,
                                backgroundColor: bar.isHighlighted
                                  ? "#c084fc"
                                  : "#d8b4fe",
                              }}
                            />
                            {/* Bottom: B2B Market Entry */}
                            <div
                              className="w-full rounded-md transition-all duration-300"
                              style={{
                                height: `${b2bH}px`,
                                backgroundColor: bar.isHighlighted
                                  ? "#60a5fa"
                                  : "#93c5fd",
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* X-Axis Labels */}
                  <div className="flex items-center justify-around text-[11px] font-medium text-[#64748b] pt-2 px-2">
                    {engineBars.map((bar) => (
                      <span
                        key={bar.id}
                        className={
                          bar.isHighlighted ? "font-bold text-[#070b16]" : ""
                        }
                      >
                        {bar.periodLabel}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. TOP MARKETS CARD (lg:col-span-3) */}
            <div
              className="p23-bento-card lg:col-span-3 p-5 flex flex-col justify-between"
              data-testid="reports-top-markets-card"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[15px] font-bold text-[#070b16]">
                    Top markets
                  </h2>
                  <span className="inline-flex items-center gap-0.5 text-xs font-medium text-[#64748b]">
                    <span>Oct</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>

                <div className="space-y-3">
                  {TOP_MARKETS.map((mkt) => (
                    <div
                      key={mkt.id}
                      className="grid grid-cols-[78px_1fr_44px_28px] items-center gap-2 text-xs"
                    >
                      <span className="text-[#334155] font-medium truncate">
                        {mkt.country}
                      </span>
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${mkt.barWidthPercent}%`,
                            backgroundColor: mkt.color,
                          }}
                        />
                      </div>
                      <span className="text-right font-bold text-[#070b16] tabular-nums">
                        {mkt.revenueFormatted}
                      </span>
                      <span className="text-right text-[11px] text-[#94a3b8] tabular-nums">
                        {mkt.sharePercent}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-[#f0fdf4] border border-emerald-500/15 p-3 text-[11.5px] leading-relaxed text-[#334155]">
                <strong className="font-bold text-[#15803d]">
                  Nigeria + Kenya
                </strong>{" "}
                drive 60% of revenue. Kenya grew fastest at{" "}
                <strong className="font-bold text-[#070b16]">+22%</strong> MoM.
              </div>
            </div>
          </div>

          {/* =================================================================
              BOTTOM ROW: CUSTOMER RETENTION BY COHORT (8 cols) + SCHEDULED REPORTS (4 cols)
              ================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            {/* 1. CUSTOMER RETENTION BY COHORT HEATMAP (lg:col-span-8) */}
            <div
              className="p23-bento-card lg:col-span-8 p-5 flex flex-col justify-between"
              data-testid="reports-cohort-retention-card"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <h2 className="text-[15px] font-bold text-[#070b16]">
                    Customer retention by cohort
                  </h2>

                  <div className="inline-flex items-center p-0.5 rounded-full bg-slate-100 border border-slate-200/70">
                    {(["% retained", "Revenue"] as const).map((mode) => {
                      const active = cohortMode === mode;
                      return (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setCohortMode(mode)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                            active
                              ? "bg-white text-[#070b16] shadow-2xs"
                              : "text-[#64748b] hover:text-[#070b16]"
                          }`}
                        >
                          {mode}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Cohort Heatmap Grid */}
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px] border-separate border-spacing-1.5">
                    <thead>
                      <tr className="text-[10.5px] font-semibold text-[#94a3b8]">
                        <th className="text-left py-1 px-2 font-medium">
                          Cohort
                        </th>
                        <th className="text-center py-1 px-2 font-medium">
                          Size
                        </th>
                        {["M0", "M1", "M2", "M3", "M4", "M5"].map((m) => (
                          <th
                            key={m}
                            className="text-center py-1 px-2 font-medium"
                          >
                            {m}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {RETENTION_COHORTS.map((row) => (
                        <tr key={row.id}>
                          <td className="py-1 px-2 text-xs font-bold text-[#070b16] whitespace-nowrap">
                            {row.cohort}
                          </td>
                          <td className="py-1 px-2 text-center text-xs text-[#64748b] tabular-nums">
                            {row.size}
                          </td>
                          {row.months.map((pct, idx) => {
                            const style = getCohortCellStyle(pct);
                            const label =
                              pct === null
                                ? ""
                                : cohortMode === "% retained"
                                ? `${pct}%`
                                : row.revenueMonths[idx] ?? `${pct}%`;

                            return (
                              <td key={idx} className="p-0">
                                <div
                                  className="h-9 rounded-lg flex items-center justify-center text-xs font-bold tabular-nums transition-colors"
                                  style={{
                                    backgroundColor: style.bg,
                                    color: style.text,
                                  }}
                                >
                                  {label}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Legend Bar */}
              <div className="flex items-center gap-2.5 pt-3 mt-2 text-[11px] text-[#64748b]">
                <span>Lower</span>
                <div
                  className="w-24 h-2 rounded-full"
                  style={{
                    background:
                      "linear-gradient(90deg, #ede9fe 0%, #c4b5fd 50%, #7c3aed 100%)",
                  }}
                />
                <span>Higher · Months since first purchase</span>
              </div>
            </div>

            {/* 2. SCHEDULED REPORTS & RECENT EXPORTS CARD (lg:col-span-4) */}
            <div
              className="p23-bento-card lg:col-span-4 p-5 flex flex-col justify-between space-y-5"
              data-testid="reports-scheduled-card"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h2 className="text-[15px] font-bold text-[#070b16]">
                      Scheduled reports
                    </h2>
                    <span className="text-xs font-semibold text-[#94a3b8]">
                      {scheduledReports.length}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setScheduleModalOpen(true)}
                    className="inline-flex items-center gap-0.5 text-xs font-medium text-[#64748b] hover:text-[#070b16] cursor-pointer"
                  >
                    <span>Manage</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2">
                  {scheduledReports.map((sched) => (
                    <div
                      key={sched.id}
                      className="flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-[#f8fafc] border border-slate-200/70"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-600 shrink-0">
                          <Clock className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[12.5px] font-bold text-[#070b16] truncate">
                            {sched.title}
                          </p>
                          <p className="text-[11px] text-[#64748b] truncate">
                            {sched.cadenceLabel}
                          </p>
                        </div>
                      </div>

                      {/* Toggle Switch */}
                      <button
                        type="button"
                        role="switch"
                        aria-checked={sched.enabled}
                        aria-label={`Toggle ${sched.title}`}
                        onClick={() => toggleScheduledReport(sched.id)}
                        className="w-9 h-5 rounded-full p-0.5 transition-colors shrink-0 cursor-pointer flex items-center"
                        style={{
                          backgroundColor: sched.enabled
                            ? sched.accentColor
                            : "#cbd5e1",
                        }}
                      >
                        <span
                          className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${
                            sched.enabled ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* RECENT EXPORTS */}
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#94a3b8] mb-2.5">
                  RECENT EXPORTS
                </h3>
                <div className="space-y-2">
                  {recentExports.map((exp) => (
                    <div
                      key={exp.id}
                      className="flex items-center justify-between gap-3 py-1.5 px-1"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-[9.5px] font-extrabold shrink-0 ${
                            exp.format === "PDF"
                              ? "bg-rose-50 text-rose-600 border border-rose-200/60"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                          }`}
                        >
                          {exp.format}
                        </span>
                        <div className="min-w-0">
                          <p className="text-[12.5px] font-bold text-[#070b16] truncate">
                            {exp.title}
                          </p>
                          <p className="text-[11px] text-[#94a3b8] truncate">
                            {exp.subtitle}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          showToast(
                            `Downloaded ${exp.title}.${exp.format.toLowerCase()}`
                          )
                        }
                        aria-label={`Download ${exp.title}`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#070b16] hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          MODAL 1: NEW SAVED REPORT
          ===================================================================== */}
      {newReportOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
          aria-label="New Report"
        >
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#070b16]">
                Create Saved Report
              </h2>
              <button
                type="button"
                onClick={() => setNewReportOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateReport} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Report Title
                </label>
                <input
                  type="text"
                  required
                  value={newReportTitle}
                  onChange={(e) => setNewReportTitle(e.target.value)}
                  placeholder="e.g. Q4 West Africa Pipeline Velocity"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-[#070b16]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={newReportCategory}
                  onChange={(e) =>
                    setNewReportCategory(e.target.value as SavedReportCategory)
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-[#070b16] bg-white"
                >
                  <option value="REVENUE">REVENUE</option>
                  <option value="PIPELINE">PIPELINE</option>
                  <option value="CAMPAIGNS">CAMPAIGNS</option>
                  <option value="PROGRAMMES">PROGRAMMES</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewReportOpen(false)}
                  className="px-4 py-2 rounded-full border border-slate-200 text-xs font-semibold text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-full bg-[#0b0d14] text-white text-xs font-semibold cursor-pointer"
                >
                  Save Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 2: SCHEDULE REPORT
          ===================================================================== */}
      {scheduleModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Schedule Report"
        >
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#070b16]">
                Schedule Automated Report
              </h2>
              <button
                type="button"
                onClick={() => setScheduleModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSchedule} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Report Name
                </label>
                <input
                  type="text"
                  required
                  value={schedTitle}
                  onChange={(e) => setSchedTitle(e.target.value)}
                  placeholder="e.g. Executive Weekly Revenue Digest"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-[#070b16]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Delivery Cadence &amp; Recipients
                </label>
                <input
                  type="text"
                  value={schedCadence}
                  onChange={(e) => setSchedCadence(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-[#070b16]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setScheduleModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-slate-200 text-xs font-semibold text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-full bg-[#0b0d14] text-white text-xs font-semibold cursor-pointer"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 3: COMPARE PERIODS
          ===================================================================== */}
      {compareModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Compare Periods"
        >
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#070b16]">
                Period Comparison · Oct vs. Sep
              </h2>
              <button
                type="button"
                onClick={() => setCompareModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/70">
                <span className="text-slate-500">October 2026</span>
                <p className="text-lg font-extrabold text-[#052e16] mt-0.5">
                  $184,200
                </p>
                <span className="text-[11px] font-semibold text-[#15803d]">
                  414 new customers
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-slate-500">September 2026</span>
                <p className="text-lg font-extrabold text-[#070b16] mt-0.5">
                  $161,160
                </p>
                <span className="text-[11px] text-slate-500">
                  362 new customers
                </span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setCompareModalOpen(false)}
                className="px-4 py-2 rounded-full bg-[#0b0d14] text-white text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

