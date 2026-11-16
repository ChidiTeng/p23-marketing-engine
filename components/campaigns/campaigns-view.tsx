"use client";

import React, { useMemo, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Plus,
  Search,
  Star,
  X,
} from "lucide-react";
import {
  INITIAL_CAMPAIGNS,
  INITIAL_CAMPAIGNS_METRICS,
  INITIAL_CHANNEL_LEADS,
  INITIAL_UPCOMING_LAUNCHES,
  type CampaignEngine,
  type CampaignRecord,
  type CampaignStatus,
} from "@/lib/api/contracts/campaigns";

const DATE_RANGES = [
  "Last 7 days",
  "Last 30 days",
  "Last 90 days",
  "All time",
] as const;

type SortField = "leads" | "spend" | "conversion" | "cpl";

const SORT_LABELS: Record<SortField, string> = {
  leads: "Sort: Leads",
  spend: "Sort: Spend",
  conversion: "Sort: Conversion",
  cpl: "Sort: CPL",
};

function EngineSubtitle({ engine }: { engine: CampaignEngine }) {
  const color =
    engine === "B2B Market Entry"
      ? "#2563eb"
      : engine === "Membership"
      ? "#7c3aed"
      : "#0d9488";
  return (
    <span className="text-[11px] font-medium" style={{ color }}>
      {engine}
    </span>
  );
}

function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
  if (status === "Live") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#ecfccb] text-[#15803d]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" />
        Live
      </span>
    );
  }
  if (status === "Paused") {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#fef3c7] text-[#b45309]">
        Paused
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-[#475569]">
      Completed
    </span>
  );
}

export function CampaignsView() {
  const [campaigns, setCampaigns] = useState<CampaignRecord[]>(INITIAL_CAMPAIGNS);
  const [dateRange, setDateRange] = useState<string>("Last 30 days");
  const [dateRangeOpen, setDateRangeOpen] = useState(false);

  const [statusTab, setStatusTab] = useState<"All" | CampaignStatus>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [engineFilter, setEngineFilter] = useState<"All engines" | CampaignEngine>(
    "All engines"
  );
  const [engineDropdownOpen, setEngineDropdownOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortField>("leads");
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  // Spotlight campaign defaults to Referral Rewards (top conversion performer)
  const [spotlightId, setSpotlightId] = useState<string>("camp-referral-rewards");

  // Interactive modals & toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [newCampaignOpen, setNewCampaignOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);

  // New Campaign form state
  const [newName, setNewName] = useState("");
  const [newEngine, setNewEngine] = useState<CampaignEngine>("B2B Market Entry");
  const [newChannel, setNewChannel] = useState("LinkedIn");
  const [newBudget, setNewBudget] = useState("8000");
  const [newEnds, setNewEnds] = useState("Dec 20");

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3400);
  }

  const statusCounts = useMemo(() => {
    return {
      All: campaigns.length,
      Live: campaigns.filter((c) => c.status === "Live").length,
      Paused: campaigns.filter((c) => c.status === "Paused").length,
      Completed: campaigns.filter((c) => c.status === "Completed").length,
    };
  }, [campaigns]);

  const filteredCampaigns = useMemo(() => {
    const filtered = campaigns.filter((c) => {
      if (statusTab !== "All" && c.status !== statusTab) return false;
      if (engineFilter !== "All engines" && c.engine !== engineFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchName = c.name.toLowerCase().includes(q);
        const matchEngine = c.engine.toLowerCase().includes(q);
        const matchChannel = c.channels.some((ch) =>
          ch.name.toLowerCase().includes(q)
        );
        if (!matchName && !matchEngine && !matchChannel) return false;
      }
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "leads") return b.leads - a.leads;
      if (sortBy === "spend") return b.spentUsd - a.spentUsd;
      if (sortBy === "conversion") return b.conversionRate - a.conversionRate;
      return a.cplUsd - b.cplUsd;
    });
  }, [campaigns, statusTab, engineFilter, searchQuery, sortBy]);

  const spotlightCampaign = useMemo(() => {
    return (
      campaigns.find((c) => c.id === spotlightId) ??
      campaigns.find((c) => c.id === "camp-referral-rewards") ??
      campaigns[0]
    );
  }, [campaigns, spotlightId]);

  function handleDuplicateSpotlight() {
    if (!spotlightCampaign) return;
    const copy: CampaignRecord = {
      ...spotlightCampaign,
      id: `camp-copy-${Date.now()}`,
      name: `${spotlightCampaign.name} (Copy)`,
      status: "Live",
    };
    setCampaigns((prev) => [copy, ...prev]);
    showToast(`Duplicated "${spotlightCampaign.name}"`);
  }

  function handleCreateCampaign(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;

    const budgetNum = Math.max(1000, Number(newBudget) || 8000);
    const budgetK = `${(budgetNum / 1000).toFixed(1)}k`;

    const channelColor =
      newChannel === "Events"
        ? "#f59e0b"
        : newChannel === "LinkedIn"
        ? "#3b82f6"
        : newChannel === "Google Ads"
        ? "#ef4444"
        : newChannel === "Referrals"
        ? "#84cc16"
        : "#8b5cf6";

    const created: CampaignRecord = {
      id: `camp-${Date.now()}`,
      name: newName.trim(),
      engine: newEngine,
      iconBg: "#ede9fe",
      iconDotColor: channelColor,
      channels: [{ name: newChannel, dotColor: channelColor }],
      status: "Live",
      spentUsd: 1200,
      budgetUsd: budgetNum,
      spentFormatted: "$1.2k",
      budgetFormatted: budgetK,
      budgetBarVariant: "purple",
      leads: 210,
      cplUsd: 5.71,
      cplFormatted: "$5.71",
      conversionRate: 19.5,
      conversionFormatted: "19.5%",
      endsLabel: newEnds.trim() || "Dec 28",
      convertedCount: 41,
    };

    setCampaigns((prev) => [created, ...prev]);
    setSpotlightId(created.id);
    setNewName("");
    setNewCampaignOpen(false);
    showToast(`Launched campaign "${created.name}"`);
  }

  const metrics = INITIAL_CAMPAIGNS_METRICS;

  return (
    <div
      className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12 select-none"
      data-testid="campaigns-view"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          data-testid="campaigns-toast"
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
            data-testid="campaigns-eyebrow"
          >
            CAMPAIGNS
          </p>
          <h1 className="text-3xl sm:text-[34px] font-bold tracking-[-0.025em] leading-tight text-[#070b16]">
            Campaigns
          </h1>
          <p className="text-[13.5px] mt-1 text-[#64748b]">
            Spend, leads and conversion for every campaign across the three engines.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-end">
          {/* Date Range Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setDateRangeOpen((v) => !v)}
              data-testid="campaigns-date-range-btn"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-slate-200/90 text-[#070b16] text-xs font-semibold shadow-2xs hover:border-slate-300 transition-all cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{dateRange}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {dateRangeOpen && (
              <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-white border border-slate-200 shadow-xl py-1.5 z-40">
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

          {/* + New Campaign Button */}
          <button
            type="button"
            onClick={() => setNewCampaignOpen(true)}
            data-testid="campaigns-new-btn"
            className="inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-full bg-[#0b0d14] text-white text-xs font-semibold shadow-md hover:opacity-90 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Campaign</span>
          </button>
        </div>
      </div>

      {/* =====================================================================
          ROW 1: 5 KPI SUMMARY CARDS (P23 TOP-SHELF GRADIENT VARIATIONS)
          ===================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-5">
        {/* Card 1: Hero Leads Generated (Deep P23 Teal-Ink Gradient) */}
        <div
          data-testid="kpi-leads-generated"
          className="p23-hero-revenue-card p-5 flex flex-col justify-between min-h-[148px]"
        >
          <div className="flex items-center justify-between gap-2">
            <span
              className="text-[13px] font-semibold"
              style={{ color: "var(--p23-hero-text)" }}
            >
              Leads Generated
            </span>
            <span
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold"
              style={{
                background: "var(--p23-hero-badge-bg)",
                color: "var(--p23-hero-badge-text)",
              }}
            >
              ↑ {metrics.leadsGenerated.deltaPercent}%
            </span>
          </div>

          <div
            className="text-[32px] font-extrabold tracking-tight leading-none my-2 tabular-nums"
            style={{ color: "var(--p23-hero-text)" }}
          >
            {metrics.leadsGenerated.formatted}
          </div>

          <p
            className="text-[11.5px] font-medium"
            style={{ color: "var(--p23-hero-subtext)" }}
          >
            {metrics.leadsGenerated.subtext}
          </p>
        </div>

        {/* Card 2: Active Campaigns (Soft Electric Violet / Lavender Gradient) */}
        <div
          data-testid="kpi-active-campaigns"
          className="p23-bento-card p23-kpi-card-leads p-5 flex flex-col justify-between min-h-[148px]"
        >
          <div className="flex items-center justify-between gap-2">
            <span
              className="text-[12.5px] font-semibold"
              style={{ color: "#2e1065" }}
            >
              Active Campaigns
            </span>
            <span
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold"
              style={{
                background: "rgba(109, 40, 217, 0.14)",
                color: "#4c1d95",
              }}
            >
              {metrics.activeCampaigns.badgeText}
            </span>
          </div>

          <div
            className="text-[32px] font-extrabold tracking-tight leading-none my-2 tabular-nums"
            style={{ color: "#1e1b4b" }}
          >
            {metrics.activeCampaigns.value}
          </div>

          <p className="text-[11.5px] font-medium" style={{ color: "#4c1d95" }}>
            {metrics.activeCampaigns.subtext}
          </p>
        </div>

        {/* Card 3: Total Spend (Mint / Aqua Emerald Gradient) */}
        <div
          data-testid="kpi-total-spend"
          className="p23-bento-card p23-kpi-card-conversion p-5 flex flex-col justify-between min-h-[148px]"
        >
          <div className="flex items-center justify-between gap-2">
            <span
              className="text-[12.5px] font-semibold"
              style={{ color: "#042f2e" }}
            >
              Total Spend
            </span>
            <span
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold"
              style={{
                background: "rgba(13, 148, 136, 0.16)",
                color: "#115e59",
              }}
            >
              {metrics.totalSpend.badgeText}
            </span>
          </div>

          <div
            className="text-[32px] font-extrabold tracking-tight leading-none my-2 tabular-nums"
            style={{ color: "#022228" }}
          >
            {metrics.totalSpend.formatted}
          </div>

          <p className="text-[11.5px] font-medium" style={{ color: "#115e59" }}>
            {metrics.totalSpend.subtext}
          </p>
        </div>

        {/* Card 4: Cost per Lead (Warm Golden Amber / Peach Gradient) */}
        <div
          data-testid="kpi-cost-per-lead"
          className="p23-bento-card p23-kpi-card-opps p-5 flex flex-col justify-between min-h-[148px]"
        >
          <div className="flex items-center justify-between gap-2">
            <span
              className="text-[12.5px] font-semibold"
              style={{ color: "#451a03" }}
            >
              Cost per Lead
            </span>
            <span
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold"
              style={{
                background: "rgba(217, 119, 6, 0.16)",
                color: "#92400e",
              }}
            >
              ↓ {metrics.costPerLead.deltaPercent}%
            </span>
          </div>

          <div
            className="text-[32px] font-extrabold tracking-tight leading-none my-2 tabular-nums"
            style={{ color: "#451a03" }}
          >
            {metrics.costPerLead.formatted}
          </div>

          <p className="text-[11.5px] font-medium" style={{ color: "#78350f" }}>
            {metrics.costPerLead.subtext}
          </p>
        </div>

        {/* Card 5: Return on Ad Spend (Rose Orchid / Coral Pink Gradient) */}
        <div
          data-testid="kpi-roas"
          className="p23-bento-card p23-kpi-card-programmes p-5 flex flex-col justify-between min-h-[148px]"
        >
          <div className="flex items-center justify-between gap-2">
            <span
              className="text-[12.5px] font-semibold"
              style={{ color: "#4a044e" }}
            >
              Return on Ad Spend
            </span>
            <span
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold"
              style={{
                background: "rgba(192, 38, 211, 0.14)",
                color: "#701a75",
              }}
            >
              {metrics.roas.deltaText}
            </span>
          </div>

          <div
            className="text-[32px] font-extrabold tracking-tight leading-none my-2 tabular-nums"
            style={{ color: "#3b0764" }}
          >
            {metrics.roas.value}
          </div>

          <p className="text-[11.5px] font-medium" style={{ color: "#701a75" }}>
            {metrics.roas.subtext}
          </p>
        </div>
      </div>

      {/* =====================================================================
          ROW 2: 2-COLUMN SPLIT (CAMPAIGNS TABLE LEFT + 3 BENTO CARDS RIGHT)
          ===================================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        {/* LEFT COLUMN (xl:col-span-8): CAMPAIGNS TABLE BENTO CARD */}
        <div
          className="p23-bento-card xl:col-span-8 p-4 sm:p-5 overflow-hidden"
          data-testid="campaigns-table-card"
        >
          {/* Top Filter Tabs & Search / Engine / Sort Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            {/* Status Filter Pills */}
            <div
              className="flex flex-wrap items-center gap-1.5"
              role="tablist"
              aria-label="Filter campaigns by status"
            >
              {(["All", "Live", "Paused", "Completed"] as const).map((tab) => {
                const isActive = statusTab === tab;
                const count = statusCounts[tab];
                return (
                  <button
                    key={tab}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    data-testid={`campaign-status-tab-${tab}`}
                    onClick={() => setStatusTab(tab)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#0b0d14] text-white shadow-xs"
                        : "bg-transparent text-[#475569] hover:text-[#070b16] hover:bg-slate-100/80"
                    }`}
                  >
                    <span>{tab}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10.5px] font-bold tabular-nums ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 text-[#64748b]"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right Controls: Search + Engine Filter + Sort */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 sm:w-44">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search campaigns"
                  aria-label="Search campaigns"
                  data-testid="campaigns-search-input"
                  className="w-full pl-8 pr-3 py-1.5 rounded-full bg-slate-50/90 border border-slate-200/80 text-xs text-[#070b16] placeholder:text-slate-400 focus:outline-none focus:border-[#8b5cf6] transition-colors"
                />
              </div>

              {/* Engine Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setEngineDropdownOpen((v) => !v);
                    setSortDropdownOpen(false);
                  }}
                  data-testid="campaigns-engine-filter-btn"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200/90 text-xs font-medium text-[#070b16] hover:border-slate-300 transition-colors cursor-pointer"
                >
                  <span>{engineFilter}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {engineDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white border border-slate-200 shadow-xl py-1.5 z-30">
                    {(
                      [
                        "All engines",
                        "B2B Market Entry",
                        "Membership",
                        "Paid Programmes",
                      ] as const
                    ).map((eng) => (
                      <button
                        key={eng}
                        type="button"
                        onClick={() => {
                          setEngineFilter(eng);
                          setEngineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2 text-xs font-medium hover:bg-slate-50 cursor-pointer ${
                          engineFilter === eng
                            ? "text-[#070b16] font-semibold"
                            : "text-slate-600"
                        }`}
                      >
                        {eng}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setSortDropdownOpen((v) => !v);
                    setEngineDropdownOpen(false);
                  }}
                  data-testid="campaigns-sort-btn"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200/90 text-xs font-medium text-[#070b16] hover:border-slate-300 transition-colors cursor-pointer"
                >
                  <span>{SORT_LABELS[sortBy]}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {sortDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-white border border-slate-200 shadow-xl py-1.5 z-30">
                    {(["leads", "spend", "conversion", "cpl"] as const).map(
                      (field) => (
                        <button
                          key={field}
                          type="button"
                          onClick={() => {
                            setSortBy(field);
                            setSortDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3.5 py-2 text-xs font-medium hover:bg-slate-50 cursor-pointer ${
                            sortBy === field
                              ? "text-[#070b16] font-semibold"
                              : "text-slate-600"
                          }`}
                        >
                          {SORT_LABELS[field]}
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Campaigns Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-[#94a3b8]">
                  <th className="py-3 pl-2 pr-2.5">CAMPAIGN</th>
                  <th className="py-3 px-2.5">CHANNEL</th>
                  <th className="py-3 px-2.5">STATUS</th>
                  <th className="py-3 px-2.5">BUDGET USED</th>
                  <th className="py-3 px-2.5 text-right">LEADS</th>
                  <th className="py-3 px-2.5 text-right">CPL</th>
                  <th className="py-3 px-2.5 text-right">CONV.</th>
                  <th className="py-3 pl-2.5 pr-2 text-right">ENDS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {filteredCampaigns.map((camp) => {
                  const budgetPct = Math.min(
                    100,
                    Math.max(10, Math.round((camp.spentUsd / camp.budgetUsd) * 100))
                  );
                  const isSpotlight = spotlightCampaign?.id === camp.id;

                  return (
                    <tr
                      key={camp.id}
                      onClick={() => setSpotlightId(camp.id)}
                      data-testid={`campaign-row-${camp.id}`}
                      className={`transition-colors cursor-pointer ${
                        isSpotlight ? "bg-[#f5f3ff]/60" : "hover:bg-slate-50/90"
                      }`}
                    >
                      {/* CAMPAIGN */}
                      <td className="py-3.5 pl-2 pr-2.5">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                            style={{ backgroundColor: camp.iconBg }}
                          >
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: camp.iconDotColor }}
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="text-[13px] font-bold text-[#070b16] truncate">
                              {camp.name}
                            </div>
                            <EngineSubtitle engine={camp.engine} />
                          </div>
                        </div>
                      </td>

                      {/* CHANNEL */}
                      <td className="py-3.5 px-2.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {camp.channels.map((ch) => (
                            <span
                              key={ch.name}
                              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100/90 text-[11px] font-medium text-[#334155] whitespace-nowrap"
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full shrink-0"
                                style={{ backgroundColor: ch.dotColor }}
                              />
                              {ch.name}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* STATUS */}
                      <td className="py-3.5 px-2.5">
                        <CampaignStatusBadge status={camp.status} />
                      </td>

                      {/* BUDGET USED */}
                      <td className="py-3.5 px-2.5">
                        <div className="flex items-center gap-2.5 whitespace-nowrap">
                          <div className="w-14 h-1.5 rounded-full bg-slate-100 overflow-hidden shrink-0">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${budgetPct}%`,
                                background:
                                  camp.budgetBarVariant === "warning"
                                    ? "linear-gradient(90deg, #f59e0b 0%, #ef4444 100%)"
                                    : "linear-gradient(90deg, #a78bfa 0%, #7c3aed 100%)",
                              }}
                            />
                          </div>
                          <span className="text-[12px] text-[#475569] tabular-nums">
                            <strong className="font-semibold text-[#070b16]">
                              {camp.spentFormatted}
                            </strong>{" "}
                            / {camp.budgetFormatted}
                          </span>
                        </div>
                      </td>

                      {/* LEADS */}
                      <td className="py-3.5 px-2.5 text-right text-[13px] font-bold text-[#070b16] tabular-nums whitespace-nowrap">
                        {camp.leads.toLocaleString("en-US")}
                      </td>

                      {/* CPL */}
                      <td
                        className={`py-3.5 px-2.5 text-right text-[12.5px] font-semibold tabular-nums whitespace-nowrap ${
                          camp.isHighCpl ? "text-[#e11d48]" : "text-[#475569]"
                        }`}
                      >
                        {camp.cplFormatted}
                      </td>

                      {/* CONV. */}
                      <td
                        className={`py-3.5 px-2.5 text-right text-[12.5px] font-bold tabular-nums whitespace-nowrap ${
                          camp.isHighConversion
                            ? "text-[#15803d]"
                            : "text-[#070b16]"
                        }`}
                      >
                        {camp.conversionFormatted}
                      </td>

                      {/* ENDS */}
                      <td className="py-3.5 pl-2.5 pr-2 text-right text-[12px] text-[#94a3b8] whitespace-nowrap">
                        {camp.endsLabel}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Summary Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-4 mt-2 border-t border-slate-100 text-xs text-[#64748b]">
            <div>
              {campaigns.length} campaigns · Totals:{" "}
              <strong className="font-bold text-[#070b16]">$38,400</strong> spend
              · <strong className="font-bold text-[#070b16]">6,215</strong> leads ·{" "}
              <strong className="font-bold text-[#070b16]">$6.18</strong> CPL
            </div>

            <button
              type="button"
              onClick={() =>
                showToast("No archived campaigns in the selected 30-day window")
              }
              className="inline-flex items-center gap-0.5 text-xs font-semibold text-[#64748b] hover:text-[#070b16] cursor-pointer"
            >
              <span>View archived</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN (xl:col-span-4): 3 STACKED BENTO CARDS */}
        <div className="xl:col-span-4 space-y-4">
          {/* 1. TOP PERFORMER SPOTLIGHT CARD */}
          {spotlightCampaign && (
            <div
              data-testid="campaigns-top-performer-card"
              className="p23-hero-revenue-card p-5 space-y-4"
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold"
                  style={{ color: "var(--p23-hero-badge-text)" }}
                >
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>Top performer · conversion</span>
                </span>
                <span
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-bold"
                  style={{
                    background: "var(--p23-hero-badge-bg)",
                    color: "var(--p23-hero-badge-text)",
                  }}
                >
                  {spotlightCampaign.conversionFormatted}
                </span>
              </div>

              <div>
                <h2
                  className="text-[22px] font-extrabold tracking-tight leading-snug"
                  style={{ color: "var(--p23-hero-text)" }}
                  data-testid="spotlight-campaign-name"
                >
                  {spotlightCampaign.name}
                </h2>
                <p
                  className="text-[11.5px] font-medium mt-0.5"
                  style={{ color: "var(--p23-hero-subtext)" }}
                >
                  {spotlightCampaign.engine} engine ·{" "}
                  {spotlightCampaign.leads.toLocaleString("en-US")} leads at{" "}
                  {spotlightCampaign.cplFormatted} each
                </p>
              </div>

              {/* 2 Translucent Stat Boxes */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-xl bg-white/10 border border-white/15 p-3">
                  <span
                    className="block text-[9.5px] font-bold uppercase tracking-wider"
                    style={{ color: "var(--p23-hero-subtext)" }}
                  >
                    CONVERTED
                  </span>
                  <span
                    className="block text-xl font-extrabold mt-0.5 tabular-nums"
                    style={{ color: "var(--p23-hero-text)" }}
                  >
                    {spotlightCampaign.convertedCount}
                  </span>
                </div>
                <div className="rounded-xl bg-white/10 border border-white/15 p-3">
                  <span
                    className="block text-[9.5px] font-bold uppercase tracking-wider"
                    style={{ color: "var(--p23-hero-subtext)" }}
                  >
                    SPEND
                  </span>
                  <span
                    className="block text-xl font-extrabold mt-0.5 tabular-nums"
                    style={{ color: "var(--p23-hero-text)" }}
                  >
                    ${spotlightCampaign.spentUsd.toLocaleString("en-US")}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={handleDuplicateSpotlight}
                  data-testid="spotlight-duplicate-btn"
                  className="px-4 py-1.5 rounded-full text-xs font-semibold transition-transform active:scale-95 cursor-pointer"
                  style={{
                    backgroundColor: "#0c1116",
                    color: "#ffffff",
                  }}
                >
                  Duplicate
                </button>
                <button
                  type="button"
                  onClick={() => setReportModalOpen(true)}
                  data-testid="spotlight-view-report-btn"
                  className="px-4 py-1.5 rounded-full text-xs font-semibold transition-transform active:scale-95 cursor-pointer"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.42)",
                    color: "#0c1116",
                    border: "1px solid rgba(12, 17, 22, 0.14)",
                  }}
                >
                  View report
                </button>
              </div>
            </div>
          )}

          {/* 2. LEADS BY CHANNEL CARD */}
          <div
            className="p23-bento-card p-5 space-y-4"
            data-testid="campaigns-leads-by-channel-card"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-bold text-[#070b16]">
                Leads by channel
              </h3>
              <span className="inline-flex items-center gap-0.5 text-xs font-medium text-[#64748b]">
                <span>30d</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="space-y-3">
              {INITIAL_CHANNEL_LEADS.map((ch) => (
                <div
                  key={ch.id}
                  className="grid grid-cols-[110px_1fr_48px] items-center gap-3 text-xs"
                >
                  <span className="text-[#475569] font-medium truncate">
                    {ch.channel}
                  </span>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${ch.percentageOfMax}%`,
                        backgroundColor: ch.color,
                      }}
                    />
                  </div>
                  <span className="text-right font-bold text-[#070b16] tabular-nums">
                    {ch.leads.toLocaleString("en-US")}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. UPCOMING LAUNCHES CARD */}
          <div
            className="p23-bento-card p-5 space-y-3.5"
            data-testid="campaigns-upcoming-launches-card"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-[15px] font-bold text-[#070b16]">
                  Upcoming launches
                </h3>
                <span className="text-xs font-semibold text-[#94a3b8]">
                  {INITIAL_UPCOMING_LAUNCHES.length}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setCalendarModalOpen(true)}
                className="inline-flex items-center gap-0.5 text-xs font-medium text-[#64748b] hover:text-[#070b16] cursor-pointer"
              >
                <span>Calendar</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {INITIAL_UPCOMING_LAUNCHES.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-[#f8fafc] border border-slate-200/70"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#f3e8ff] flex flex-col items-center justify-center shrink-0 leading-none">
                      <span className="text-[8.5px] font-bold uppercase tracking-wider text-[#6d28d9]">
                        {item.monthShort}
                      </span>
                      <span className="text-[13px] font-extrabold text-[#4c1d95] mt-0.5">
                        {item.dayNumber}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <p className="text-[12.5px] font-bold text-[#070b16] truncate">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-[#64748b] truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: item.dotColor }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          MODAL 1: NEW CAMPAIGN
          ===================================================================== */}
      {newCampaignOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
          aria-label="New Campaign"
          data-testid="new-campaign-modal"
        >
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#070b16]">New Campaign</h2>
              <button
                type="button"
                onClick={() => setNewCampaignOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Campaign Name
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. East Africa Fintech Summit"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-[#070b16]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Business Engine
                  </label>
                  <select
                    value={newEngine}
                    onChange={(e) =>
                      setNewEngine(e.target.value as CampaignEngine)
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-[#070b16] bg-white"
                  >
                    <option value="B2B Market Entry">B2B Market Entry</option>
                    <option value="Membership">Membership</option>
                    <option value="Paid Programmes">Paid Programmes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Primary Channel
                  </label>
                  <select
                    value={newChannel}
                    onChange={(e) => setNewChannel(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-[#070b16] bg-white"
                  >
                    <option value="Events">Events</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Email">Email</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Google Ads">Google Ads</option>
                    <option value="Referrals">Referrals</option>
                    <option value="Webinar">Webinar</option>
                    <option value="Meta Ads">Meta Ads</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Total Budget (USD)
                  </label>
                  <input
                    type="number"
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-[#070b16]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    End Date Label
                  </label>
                  <input
                    type="text"
                    value={newEnds}
                    onChange={(e) => setNewEnds(e.target.value)}
                    placeholder="e.g. Dec 28"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-[#070b16]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewCampaignOpen(false)}
                  className="px-4 py-2 rounded-full border border-slate-200 text-xs font-semibold text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-full bg-[#0b0d14] text-white text-xs font-semibold cursor-pointer"
                >
                  Launch Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 2: SPOTLIGHT CAMPAIGN REPORT
          ===================================================================== */}
      {reportModalOpen && spotlightCampaign && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Campaign Performance Report"
        >
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#070b16]">
                {spotlightCampaign.name} · Report
              </h2>
              <button
                type="button"
                onClick={() => setReportModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-slate-500">Engine</span>
                <p className="font-bold text-[#070b16] mt-0.5">
                  {spotlightCampaign.engine}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-slate-500">Conversion Rate</span>
                <p className="font-bold text-[#15803d] mt-0.5">
                  {spotlightCampaign.conversionFormatted}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-slate-500">Leads Generated</span>
                <p className="font-bold text-[#070b16] mt-0.5">
                  {spotlightCampaign.leads.toLocaleString("en-US")}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-slate-500">Converted Deals</span>
                <p className="font-bold text-[#070b16] mt-0.5">
                  {spotlightCampaign.convertedCount}
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setReportModalOpen(false)}
                className="px-4 py-2 rounded-full bg-[#0b0d14] text-white text-xs font-semibold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 3: UPCOMING LAUNCHES CALENDAR
          ===================================================================== */}
      {calendarModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Upcoming Campaign Calendar"
        >
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#070b16]">
                December Launch Schedule
              </h2>
              <button
                type="button"
                onClick={() => setCalendarModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              {INITIAL_UPCOMING_LAUNCHES.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70"
                >
                  <div>
                    <p className="text-xs font-bold text-[#070b16]">
                      {item.monthShort} {item.dayNumber} · {item.title}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>
                  <span className="text-[11px] font-semibold text-[#6d28d9]">
                    Scheduled
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setCalendarModalOpen(false)}
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

