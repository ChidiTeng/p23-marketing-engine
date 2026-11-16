"use client";

import React, { useMemo, useState } from "react";
import {
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Mail,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import {
  INITIAL_CUSTOMERS,
  INITIAL_CUSTOMERS_METRICS,
  OWNERS,
  type CustomerEngine,
  type CustomerRecord,
  type CustomerStatus,
} from "@/lib/api/contracts/customers";

const ENGINE_TABS: Array<{
  key: "All" | CustomerEngine;
  label: string;
}> = [
  { key: "All", label: "All" },
  { key: "B2B Market Entry", label: "B2B Market Entry" },
  { key: "Membership", label: "Membership" },
  { key: "Paid Programmes", label: "Paid Programmes" },
];

function EngineDot({ engine }: { engine: CustomerEngine }) {
  const color =
    engine === "B2B Market Entry"
      ? "#3b82f6"
      : engine === "Membership"
      ? "#8b5cf6"
      : "#10b981";
  return (
    <span
      className="w-2 h-2 rounded-full shrink-0"
      style={{ backgroundColor: color }}
    />
  );
}

function EnginePill({ engine }: { engine: CustomerEngine }) {
  const styles: Record<CustomerEngine, { bg: string; text: string }> = {
    "B2B Market Entry": { bg: "#e0f2fe", text: "#0369a1" },
    Membership: { bg: "#f3e8ff", text: "#7e22ce" },
    "Paid Programmes": { bg: "#dcfce7", text: "#15803d" },
  };
  const s = styles[engine];
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold"
      style={{ backgroundColor: s.bg, color: s.text }}
    >
      {engine}
    </span>
  );
}

function StatusBadge({ status }: { status: CustomerStatus }) {
  const styles: Record<CustomerStatus, { bg: string; text: string }> = {
    Active: { bg: "#dcfce7", text: "#15803d" },
    "Renewal due": { bg: "#fef3c7", text: "#b45309" },
    Onboarding: { bg: "#f3e8ff", text: "#6d28d9" },
    "At risk": { bg: "#ffe4e6", text: "#be123c" },
  };
  const s = styles[status];
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap"
      style={{ backgroundColor: s.bg, color: s.text }}
    >
      {status}
    </span>
  );
}

function HealthBar({ score }: { score: number }) {
  const gradient =
    score >= 70
      ? "linear-gradient(90deg, #34d399 0%, #a3e635 100%)"
      : score >= 50
      ? "linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)"
      : "linear-gradient(90deg, #fb7185 0%, #ef4444 100%)";

  return (
    <div className="flex items-center gap-2.5">
      <div className="w-12 h-1.5 rounded-full bg-slate-100 overflow-hidden shrink-0">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${Math.max(10, Math.min(100, score))}%`,
            background: gradient,
          }}
        />
      </div>
      <span className="text-[12.5px] font-semibold text-[#070b16] tabular-nums">
        {score}
      </span>
    </div>
  );
}

export function CustomersView() {
  const [customers, setCustomers] = useState<CustomerRecord[]>(INITIAL_CUSTOMERS);
  const [selectedId, setSelectedId] = useState<string>(INITIAL_CUSTOMERS[0].id);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(
    () => new Set([INITIAL_CUSTOMERS[0].id])
  );
  const [activeEngineTab, setActiveEngineTab] = useState<"All" | CustomerEngine>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | CustomerStatus>("All");
  const [countryFilter, setCountryFilter] = useState<string>("All");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Interactive Modals & Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);
  const [newDealOpen, setNewDealOpen] = useState(false);
  const [logActivityOpen, setLogActivityOpen] = useState(false);

  // Add Customer form state
  const [newCustName, setNewCustName] = useState("");
  const [newCustIndustry, setNewCustIndustry] = useState("Fintech");
  const [newCustCity, setNewCustCity] = useState("Lagos");
  const [newCustCountry, setNewCustCountry] = useState("Nigeria");
  const [newCustEngine, setNewCustEngine] = useState<CustomerEngine>("B2B Market Entry");
  const [newCustLtv, setNewCustLtv] = useState("18500");
  const [newCustOwner, setNewCustOwner] = useState<"AO" | "TB" | "CE">("AO");

  // New Deal form state
  const [dealTitle, setDealTitle] = useState("");
  const [dealValue, setDealValue] = useState("15000");

  // Log Activity form state
  const [activityTitle, setActivityTitle] = useState("");
  const [activitySubtitle, setActivitySubtitle] = useState("");

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3400);
  }

  const countries = useMemo(() => {
    const set = new Set(customers.map((c) => c.country));
    return ["All", ...Array.from(set)];
  }, [customers]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (statusFilter !== "All") count += 1;
    if (countryFilter !== "All") count += 1;
    return count;
  }, [statusFilter, countryFilter]);

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (activeEngineTab !== "All" && c.primaryEngine !== activeEngineTab) {
        return false;
      }
      if (statusFilter !== "All" && c.status !== statusFilter) {
        return false;
      }
      if (countryFilter !== "All" && c.country !== countryFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchName = c.name.toLowerCase().includes(q);
        const matchInd = c.industry.toLowerCase().includes(q);
        const matchCountry = c.country.toLowerCase().includes(q);
        const matchOwner = c.owner.name.toLowerCase().includes(q);
        if (!matchName && !matchInd && !matchCountry && !matchOwner) {
          return false;
        }
      }
      return true;
    });
  }, [customers, activeEngineTab, statusFilter, countryFilter, searchQuery]);

  const selectedCustomer = useMemo(() => {
    return (
      customers.find((c) => c.id === selectedId) ??
      filteredCustomers[0] ??
      customers[0]
    );
  }, [customers, filteredCustomers, selectedId]);

  const allVisibleChecked =
    filteredCustomers.length > 0 &&
    filteredCustomers.every((c) => checkedIds.has(c.id));

  function toggleCheckAll() {
    if (allVisibleChecked) {
      setCheckedIds(new Set());
    } else {
      setCheckedIds(new Set(filteredCustomers.map((c) => c.id)));
    }
  }

  function toggleCheckRow(id: string) {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleExportCsv() {
    const headers = [
      "Customer",
      "Industry",
      "Engine",
      "Country",
      "Lifetime Value",
      "Health Score",
      "Status",
      "Owner",
      "Last Activity",
    ];
    const rows = filteredCustomers.map((c) => [
      c.name,
      c.industry,
      c.primaryEngine,
      c.country,
      c.lifetimeValueFormatted,
      String(c.healthScore),
      c.status,
      c.owner.name,
      c.lastActivity,
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    try {
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "p23-customers-export.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Ignore in test environments without full Blob URL support
    }
    showToast(`Exported ${filteredCustomers.length} customers to CSV`);
  }

  function handleAddCustomer(e: React.FormEvent) {
    e.preventDefault();
    if (!newCustName.trim()) return;

    const words = newCustName.trim().split(/\s+/);
    const initials =
      words.length >= 2
        ? `${words[0][0]}${words[1][0]}`.toUpperCase()
        : newCustName.trim().slice(0, 2).toUpperCase();

    const ltvNum = Math.max(0, Number(newCustLtv) || 15000);
    const ltvFormatted = `$${ltvNum.toLocaleString("en-US")}`;
    const newRecord: CustomerRecord = {
      id: `cust-${Date.now()}`,
      initials,
      avatarBg: "#ddd6fe",
      avatarText: "#3730a3",
      name: newCustName.trim(),
      industry: newCustIndustry.trim() || "Technology",
      city: newCustCity.trim() || "Lagos",
      country: newCustCountry.trim() || "Nigeria",
      sinceLabel: "Nov 2026",
      primaryEngine: newCustEngine,
      engines: [newCustEngine],
      lifetimeValueUsd: ltvNum,
      lifetimeValueFormatted: ltvFormatted,
      ltvDelta90dFormatted: `+${ltvFormatted} in the last 90 days`,
      healthScore: 88,
      status: "Onboarding",
      owner: OWNERS[newCustOwner],
      lastActivity: "Just now",
      dealsWon: 1,
      openOpps: 1,
      timeline: [
        {
          id: `tl-${Date.now()}`,
          title: `Account converted via ${newCustEngine}`,
          subtitle: `${ltvFormatted} · Assigned to ${OWNERS[newCustOwner].name}`,
          relativeTime: "1m",
          dotColor: "#8b5cf6",
        },
      ],
      contacts: [
        {
          id: `ct-${Date.now()}`,
          initials,
          name: `${newCustName.trim().split(" ")[0]} Executive`,
          role: "Primary Contact",
          email: `contact@${newCustName
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "")}.com`,
          avatarBg: "#bae6fd",
          avatarText: "#0c4a6e",
        },
      ],
    };

    setCustomers((prev) => [newRecord, ...prev]);
    setSelectedId(newRecord.id);
    setCheckedIds(new Set([newRecord.id]));
    setNewCustName("");
    setAddCustomerOpen(false);
    showToast(`Added ${newRecord.name} to Customers`);
  }

  function handleCreateDeal(e: React.FormEvent) {
    e.preventDefault();
    if (!dealTitle.trim() || !selectedCustomer) return;
    const amount = Math.max(0, Number(dealValue) || 10000);
    const formattedAmount = `$${amount.toLocaleString("en-US")}`;

    setCustomers((prev) =>
      prev.map((c) =>
        c.id === selectedCustomer.id
          ? {
              ...c,
              openOpps: c.openOpps + 1,
              lastActivity: "Just now",
              timeline: [
                {
                  id: `tl-deal-${Date.now()}`,
                  title: `Opportunity: ${dealTitle.trim()}`,
                  subtitle: `${formattedAmount} · Proposal created by ${c.owner.name}`,
                  relativeTime: "now",
                  dotColor: "#8b5cf6",
                },
                ...c.timeline,
              ],
            }
          : c
      )
    );
    setDealTitle("");
    setNewDealOpen(false);
    showToast(`New deal "${dealTitle.trim()}" created for ${selectedCustomer.name}`);
  }

  function handleLogActivity(e: React.FormEvent) {
    e.preventDefault();
    if (!activityTitle.trim() || !selectedCustomer) return;

    setCustomers((prev) =>
      prev.map((c) =>
        c.id === selectedCustomer.id
          ? {
              ...c,
              lastActivity: "Just now",
              timeline: [
                {
                  id: `tl-act-${Date.now()}`,
                  title: activityTitle.trim(),
                  subtitle:
                    activitySubtitle.trim() || `Logged by ${c.owner.name}`,
                  relativeTime: "now",
                  dotColor: "#14b8a6",
                },
                ...c.timeline,
              ],
            }
          : c
      )
    );
    setActivityTitle("");
    setActivitySubtitle("");
    setLogActivityOpen(false);
    showToast(`Activity logged for ${selectedCustomer.name}`);
  }

  const metrics = INITIAL_CUSTOMERS_METRICS;

  return (
    <div
      className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12 select-none"
      data-testid="customers-view"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          data-testid="customers-toast"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl text-xs font-semibold bg-[#0b0d14] text-white border border-white/10"
        >
          <CheckCircle2 className="w-4 h-4 text-[#4ade80] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =====================================================================
          HEADER & TOP ACTIONS
          ===================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.14em] mb-1"
            style={{ color: "var(--p23-text-eyebrow)" }}
            data-testid="customers-eyebrow"
          >
            CUSTOMERS
          </p>
          <h1 className="text-3xl sm:text-[34px] font-bold tracking-[-0.025em] leading-tight text-[#070b16]">
            Customers
          </h1>
          <p className="text-[13.5px] mt-1 text-[#64748b]">
            Every converted lead, by engine, health and owner.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-end">
          <button
            type="button"
            onClick={handleExportCsv}
            data-testid="customers-export-csv-btn"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-slate-200/90 text-[#070b16] text-xs font-semibold shadow-2xs hover:border-slate-300 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setAddCustomerOpen(true)}
            data-testid="customers-add-btn"
            className="inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-full bg-[#0b0d14] text-white text-xs font-semibold shadow-md hover:opacity-90 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* =====================================================================
          ROW 1: 4 KPI SUMMARY CARDS (P23 TOP-SHELF GRADIENT VARIATIONS)
          ===================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
        {/* Card 1: Hero Total Customers (Deep P23 Teal-Ink Gradient) */}
        <div
          data-testid="kpi-total-customers"
          className="p23-hero-revenue-card p-5 flex flex-col justify-between min-h-[148px]"
        >
          <div className="flex items-center justify-between gap-2">
            <span
              className="text-[13px] font-semibold"
              style={{ color: "var(--p23-hero-text)" }}
            >
              Total Customers
            </span>
            <span
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold"
              style={{
                background: "var(--p23-hero-badge-bg)",
                color: "var(--p23-hero-badge-text)",
              }}
            >
              ↑ {metrics.totalCustomers.deltaPercent}%
            </span>
          </div>

          <div
            className="text-[34px] font-extrabold tracking-tight leading-none my-2 tabular-nums"
            style={{ color: "var(--p23-hero-text)" }}
          >
            {metrics.totalCustomers.formatted}
          </div>

          <p
            className="text-[11.5px] font-medium"
            style={{ color: "var(--p23-hero-subtext)" }}
          >
            {metrics.totalCustomers.subtext}
          </p>
        </div>

        {/* Card 2: Active Accounts (Soft Electric Violet / Lavender Gradient) */}
        <div
          data-testid="kpi-active-accounts"
          className="p23-bento-card p23-kpi-card-leads p-5 flex flex-col justify-between min-h-[148px]"
        >
          <div className="flex items-center justify-between gap-2">
            <span
              className="text-[12.5px] font-semibold"
              style={{ color: "#2e1065" }}
            >
              Active Accounts
            </span>
            <span
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold"
              style={{
                background: "rgba(109, 40, 217, 0.14)",
                color: "#4c1d95",
              }}
            >
              ↑ {metrics.activeAccounts.deltaPercent}%
            </span>
          </div>

          <div
            className="text-[34px] font-extrabold tracking-tight leading-none my-2 tabular-nums"
            style={{ color: "#1e1b4b" }}
          >
            {metrics.activeAccounts.formatted}
          </div>

          <p className="text-[11.5px] font-medium" style={{ color: "#4c1d95" }}>
            {metrics.activeAccounts.subtext}
          </p>
        </div>

        {/* Card 3: Avg. Lifetime Value (Mint / Aqua Emerald Gradient) */}
        <div
          data-testid="kpi-avg-ltv"
          className="p23-bento-card p23-kpi-card-conversion p-5 flex flex-col justify-between min-h-[148px]"
        >
          <div className="flex items-center justify-between gap-2">
            <span
              className="text-[12.5px] font-semibold"
              style={{ color: "#042f2e" }}
            >
              Avg. Lifetime Value
            </span>
            <span
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold"
              style={{
                background: "rgba(13, 148, 136, 0.16)",
                color: "#115e59",
              }}
            >
              ↑ {metrics.avgLifetimeValue.deltaPercent}%
            </span>
          </div>

          <div
            className="text-[34px] font-extrabold tracking-tight leading-none my-2 tabular-nums"
            style={{ color: "#022228" }}
          >
            {metrics.avgLifetimeValue.formatted}
          </div>

          <p className="text-[11.5px] font-medium" style={{ color: "#115e59" }}>
            {metrics.avgLifetimeValue.subtext}
          </p>
        </div>

        {/* Card 4: Churn Rate (Warm Golden Amber / Peach Gradient) */}
        <div
          data-testid="kpi-churn-rate"
          className="p23-bento-card p23-kpi-card-opps p-5 flex flex-col justify-between min-h-[148px]"
        >
          <div className="flex items-center justify-between gap-2">
            <span
              className="text-[12.5px] font-semibold"
              style={{ color: "#451a03" }}
            >
              Churn Rate
            </span>
            <span
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold"
              style={{
                background: "rgba(217, 119, 6, 0.16)",
                color: "#92400e",
              }}
            >
              ↓ {metrics.churnRate.deltaPercent}%
            </span>
          </div>

          <div
            className="text-[34px] font-extrabold tracking-tight leading-none my-2 tabular-nums"
            style={{ color: "#451a03" }}
          >
            {metrics.churnRate.formatted}
          </div>

          <p className="text-[11.5px] font-medium" style={{ color: "#78350f" }}>
            {metrics.churnRate.subtext}
          </p>
        </div>
      </div>

      {/* =====================================================================
          ROW 2: MASTER-DETAIL LAYOUT (TABLE LEFT + INSPECTOR RIGHT)
          ===================================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        {/* LEFT: CUSTOMERS TABLE CARD (8 cols) */}
        <div
          className="p23-bento-card xl:col-span-8 p-4 sm:p-5 overflow-hidden"
          data-testid="customers-table-card"
        >
          {/* Top Filter Tabs & Search Toolbar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            {/* Engine Filter Pills */}
            <div
              className="flex flex-wrap items-center gap-1.5"
              role="tablist"
              aria-label="Filter customers by business engine"
            >
              {ENGINE_TABS.map((tab) => {
                const isActive = activeEngineTab === tab.key;
                const count =
                  tab.key === "All"
                    ? metrics.engineCounts.all
                    : metrics.engineCounts[tab.key];

                return (
                  <button
                    key={tab.key}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    data-testid={`engine-tab-${tab.key}`}
                    onClick={() => {
                      setActiveEngineTab(tab.key);
                      setCurrentPage(1);
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#0b0d14] text-white shadow-xs"
                        : "bg-transparent text-[#475569] hover:text-[#070b16] hover:bg-slate-100/80"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10.5px] font-bold tabular-nums ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 text-[#64748b]"
                      }`}
                    >
                      {count.toLocaleString("en-US")}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right Search + Filter Popover */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-48">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search customers"
                  aria-label="Search customers"
                  data-testid="customers-search-input"
                  className="w-full pl-8 pr-3 py-1.5 rounded-full bg-slate-50/90 border border-slate-200/80 text-xs text-[#070b16] placeholder:text-slate-400 focus:outline-none focus:border-[#8b5cf6] transition-colors"
                />
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setFiltersOpen((v) => !v)}
                  data-testid="customers-filters-btn"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200/90 text-xs font-semibold text-[#070b16] hover:border-slate-300 transition-colors cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                  <span>Filters</span>
                  <span className="w-4 h-4 rounded-full bg-[#8b5cf6] text-white text-[10px] font-bold inline-flex items-center justify-center">
                    {activeFilterCount > 0 ? activeFilterCount : 2}
                  </span>
                </button>

                {filtersOpen && (
                  <div
                    className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-xl p-4 z-30 space-y-3"
                    data-testid="customers-filters-popover"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#070b16]">
                        Filter Customers
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setStatusFilter("All");
                          setCountryFilter("All");
                        }}
                        className="text-[11px] font-semibold text-[#7c3aed] hover:underline cursor-pointer"
                      >
                        Reset
                      </button>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Status
                      </label>
                      <select
                        value={statusFilter}
                        onChange={(e) =>
                          setStatusFilter(e.target.value as "All" | CustomerStatus)
                        }
                        className="w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs text-[#070b16] bg-white"
                      >
                        <option value="All">All Statuses</option>
                        <option value="Active">Active</option>
                        <option value="Renewal due">Renewal due</option>
                        <option value="Onboarding">Onboarding</option>
                        <option value="At risk">At risk</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Country
                      </label>
                      <select
                        value={countryFilter}
                        onChange={(e) => setCountryFilter(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs text-[#070b16] bg-white"
                      >
                        {countries.map((c) => (
                          <option key={c} value={c}>
                            {c === "All" ? "All Countries" : c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-[#94a3b8]">
                  <th className="py-3 pl-2 pr-2 w-8">
                    <button
                      type="button"
                      aria-label="Select all customers"
                      onClick={toggleCheckAll}
                      className={`w-4 h-4 rounded flex items-center justify-center border transition-colors cursor-pointer ${
                        allVisibleChecked
                          ? "bg-[#8b5cf6] border-[#8b5cf6] text-white"
                          : "border-slate-300 bg-white hover:border-slate-400"
                      }`}
                    >
                      {allVisibleChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </button>
                  </th>
                  <th className="py-3 px-2.5">CUSTOMER</th>
                  <th className="py-3 px-2.5">ENGINE</th>
                  <th className="py-3 px-2.5">COUNTRY</th>
                  <th className="py-3 px-2.5">LIFETIME VALUE</th>
                  <th className="py-3 px-2.5">HEALTH</th>
                  <th className="py-3 px-2.5">STATUS</th>
                  <th className="py-3 px-2.5">OWNER</th>
                  <th className="py-3 pl-2.5 pr-3 text-right">LAST ACTIVITY</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {filteredCustomers.map((cust) => {
                  const isSelected = selectedCustomer?.id === cust.id;
                  const isChecked = checkedIds.has(cust.id);

                  return (
                    <tr
                      key={cust.id}
                      onClick={() => setSelectedId(cust.id)}
                      data-testid={`customer-row-${cust.id}`}
                      className={`group transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-[#f5f3ff]"
                          : "hover:bg-slate-50/90"
                      }`}
                    >
                      <td
                        className="py-3 pl-2 pr-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCheckRow(cust.id);
                          setSelectedId(cust.id);
                        }}
                      >
                        <button
                          type="button"
                          aria-label={`Select ${cust.name}`}
                          className={`w-4 h-4 rounded flex items-center justify-center border transition-colors cursor-pointer ${
                            isChecked || isSelected
                              ? "bg-[#8b5cf6] border-[#8b5cf6] text-white"
                              : "border-slate-300 bg-white group-hover:border-slate-400"
                          }`}
                        >
                          {(isChecked || isSelected) && (
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          )}
                        </button>
                      </td>

                      {/* CUSTOMER */}
                      <td className="py-3 px-2.5">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-bold shrink-0"
                            style={{
                              backgroundColor: cust.avatarBg,
                              color: cust.avatarText,
                            }}
                          >
                            {cust.initials}
                          </div>
                          <div className="min-w-0">
                            <div className="text-[13px] font-bold text-[#070b16] truncate">
                              {cust.name}
                            </div>
                            <div className="text-[11px] text-[#94a3b8] truncate">
                              {cust.industry}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* ENGINE */}
                      <td className="py-3 px-2.5">
                        <div className="flex items-center gap-2 text-[12.5px] font-medium text-[#334155] whitespace-nowrap">
                          <EngineDot engine={cust.primaryEngine} />
                          <span>{cust.primaryEngine}</span>
                        </div>
                      </td>

                      {/* COUNTRY */}
                      <td className="py-3 px-2.5 text-[12.5px] text-[#475569] whitespace-nowrap">
                        {cust.country}
                      </td>

                      {/* LIFETIME VALUE */}
                      <td className="py-3 px-2.5 text-[13px] font-bold text-[#070b16] tabular-nums whitespace-nowrap">
                        {cust.lifetimeValueFormatted}
                      </td>

                      {/* HEALTH */}
                      <td className="py-3 px-2.5">
                        <HealthBar score={cust.healthScore} />
                      </td>

                      {/* STATUS */}
                      <td className="py-3 px-2.5">
                        <StatusBadge status={cust.status} />
                      </td>

                      {/* OWNER */}
                      <td className="py-3 px-2.5">
                        <div
                          title={cust.owner.name}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-[10.5px] font-bold"
                          style={{
                            backgroundColor: cust.owner.bg,
                            color: cust.owner.text,
                          }}
                        >
                          {cust.owner.initials}
                        </div>
                      </td>

                      {/* LAST ACTIVITY */}
                      <td className="py-3 pl-2.5 pr-3 text-right text-[12px] text-[#94a3b8] whitespace-nowrap">
                        {cust.lastActivity}
                      </td>
                    </tr>
                  );
                })}

                {filteredCustomers.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="py-12 text-center text-xs text-slate-400"
                    >
                      No customers match the active filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 mt-2 border-t border-slate-100 text-xs text-[#64748b]">
            <span>
              Showing {(currentPage - 1) * 10 + 1}–
              {Math.min(
                currentPage * 10,
                activeEngineTab === "All"
                  ? metrics.engineCounts.all
                  : metrics.engineCounts[activeEngineTab]
              )}{" "}
              of{" "}
              {(activeEngineTab === "All"
                ? metrics.engineCounts.all
                : metrics.engineCounts[activeEngineTab]
              ).toLocaleString("en-US")}
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Previous page"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {[1, 2, 3].map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7 h-7 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                    currentPage === pageNum
                      ? "bg-[#0b0d14] text-white"
                      : "text-[#475569] hover:bg-slate-100"
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <span className="px-1 text-slate-400">…</span>

              <button
                type="button"
                onClick={() => setCurrentPage(472)}
                className={`px-2 h-7 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                  currentPage === 472
                    ? "bg-[#0b0d14] text-white"
                    : "text-[#475569] hover:bg-slate-100"
                }`}
              >
                472
              </button>

              <button
                type="button"
                aria-label="Next page"
                onClick={() => setCurrentPage((p) => Math.min(472, p + 1))}
                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: SELECTED CUSTOMER INSPECTOR CARD (4 cols) */}
        {selectedCustomer && (
          <div
            className="p23-bento-card xl:col-span-4 p-5 space-y-5"
            data-testid="customer-inspector-card"
          >
            {/* Inspector Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-xs font-bold shrink-0"
                  style={{
                    backgroundColor: selectedCustomer.avatarBg,
                    color: selectedCustomer.avatarText,
                  }}
                >
                  {selectedCustomer.initials}
                </div>
                <div className="min-w-0">
                  <h2
                    className="text-[16px] font-bold text-[#070b16] truncate"
                    data-testid="inspector-customer-name"
                  >
                    {selectedCustomer.name}
                  </h2>
                  <p className="text-[11.5px] text-[#64748b] truncate mt-0.5">
                    {selectedCustomer.industry} · {selectedCustomer.city},{" "}
                    {selectedCustomer.country} · since {selectedCustomer.sinceLabel}
                  </p>
                </div>
              </div>

              <StatusBadge status={selectedCustomer.status} />
            </div>

            {/* Lifetime Value Hero Gradient Box */}
            <div className="p23-hero-revenue-card p-4.5 space-y-3">
              <div>
                <span
                  className="text-[11.5px] font-semibold"
                  style={{ color: "var(--p23-hero-text)" }}
                >
                  Lifetime value
                </span>
                <div
                  className="text-[30px] font-extrabold tracking-tight leading-tight mt-0.5 tabular-nums"
                  style={{ color: "var(--p23-hero-text)" }}
                  data-testid="inspector-ltv"
                >
                  {selectedCustomer.lifetimeValueFormatted}
                </div>
                <p
                  className="text-[11.5px] font-medium mt-0.5"
                  style={{ color: "var(--p23-hero-subtext)" }}
                >
                  {selectedCustomer.ltvDelta90dFormatted}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => setNewDealOpen(true)}
                  data-testid="inspector-new-deal-btn"
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-transform active:scale-95 cursor-pointer"
                  style={{
                    backgroundColor: "#0c1116",
                    color: "#ffffff",
                  }}
                >
                  New deal
                </button>
                <button
                  type="button"
                  onClick={() => setLogActivityOpen(true)}
                  data-testid="inspector-log-activity-btn"
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-transform active:scale-95 cursor-pointer"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.42)",
                    color: "#0c1116",
                    border: "1px solid rgba(12, 17, 22, 0.14)",
                  }}
                >
                  Log activity
                </button>
              </div>
            </div>

            {/* 3 Mini Stat Boxes: DEALS WON, OPEN OPPS, HEALTH */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="rounded-xl bg-[#f8fafc] border border-slate-200/70 p-3">
                <span className="block text-[9.5px] font-bold uppercase tracking-wider text-[#94a3b8]">
                  DEALS WON
                </span>
                <span className="block text-xl font-extrabold text-[#070b16] mt-1 tabular-nums">
                  {selectedCustomer.dealsWon}
                </span>
              </div>

              <div className="rounded-xl bg-[#f8fafc] border border-slate-200/70 p-3">
                <span className="block text-[9.5px] font-bold uppercase tracking-wider text-[#94a3b8]">
                  OPEN OPPS
                </span>
                <span className="block text-xl font-extrabold text-[#070b16] mt-1 tabular-nums">
                  {selectedCustomer.openOpps}
                </span>
              </div>

              <div className="rounded-xl bg-[#f8fafc] border border-slate-200/70 p-3">
                <span className="block text-[9.5px] font-bold uppercase tracking-wider text-[#94a3b8]">
                  HEALTH
                </span>
                <span
                  className={`block text-xl font-extrabold mt-1 tabular-nums ${
                    selectedCustomer.healthScore >= 70
                      ? "text-[#15803d]"
                      : selectedCustomer.healthScore >= 50
                      ? "text-[#b45309]"
                      : "text-[#be123c]"
                  }`}
                >
                  {selectedCustomer.healthScore}
                </span>
              </div>
            </div>

            {/* ENGINES */}
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#94a3b8] mb-2">
                ENGINES
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                {selectedCustomer.engines.map((eng) => (
                  <EnginePill key={eng} engine={eng} />
                ))}
              </div>
            </div>

            {/* RECENT TIMELINE */}
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#94a3b8] mb-3">
                RECENT TIMELINE
              </h3>
              <div className="space-y-3">
                {selectedCustomer.timeline.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <span
                        className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                        style={{ backgroundColor: item.dotColor }}
                      />
                      <div className="min-w-0">
                        <p className="text-[12.5px] font-semibold text-[#070b16] leading-snug">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-[#64748b] mt-0.5">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] text-[#94a3b8] shrink-0">
                      {item.relativeTime}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* KEY CONTACTS */}
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#94a3b8] mb-2.5">
                KEY CONTACTS
              </h3>
              <div className="space-y-2">
                {selectedCustomer.contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-[#f8fafc] border border-slate-200/70"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                        style={{
                          backgroundColor: contact.avatarBg,
                          color: contact.avatarText,
                        }}
                      >
                        {contact.initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12.5px] font-bold text-[#070b16] truncate">
                          {contact.name}
                        </p>
                        <p className="text-[11px] text-[#64748b] truncate">
                          {contact.role}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        showToast(`Opened email composer for ${contact.name} (${contact.email})`)
                      }
                      aria-label={`Email ${contact.name}`}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200/90 flex items-center justify-center text-slate-600 hover:text-[#070b16] hover:border-slate-300 transition-colors cursor-pointer shrink-0"
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =====================================================================
          MODAL 1: ADD CUSTOMER
          ===================================================================== */}
      {addCustomerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Add Customer"
          data-testid="add-customer-modal"
        >
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#070b16]">Add Customer</h2>
              <button
                type="button"
                onClick={() => setAddCustomerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="e.g. Zenith Logistics"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-[#070b16]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Industry
                  </label>
                  <input
                    type="text"
                    value={newCustIndustry}
                    onChange={(e) => setNewCustIndustry(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-[#070b16]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Primary Engine
                  </label>
                  <select
                    value={newCustEngine}
                    onChange={(e) =>
                      setNewCustEngine(e.target.value as CustomerEngine)
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-[#070b16] bg-white"
                  >
                    <option value="B2B Market Entry">B2B Market Entry</option>
                    <option value="Membership">Membership</option>
                    <option value="Paid Programmes">Paid Programmes</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={newCustCity}
                    onChange={(e) => setNewCustCity(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-[#070b16]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={newCustCountry}
                    onChange={(e) => setNewCustCountry(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-[#070b16]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Lifetime Value (USD)
                  </label>
                  <input
                    type="number"
                    value={newCustLtv}
                    onChange={(e) => setNewCustLtv(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-[#070b16]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Account Owner
                  </label>
                  <select
                    value={newCustOwner}
                    onChange={(e) =>
                      setNewCustOwner(e.target.value as "AO" | "TB" | "CE")
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-[#070b16] bg-white"
                  >
                    <option value="AO">Adeze Okafor (AO)</option>
                    <option value="TB">Tunde Bello (TB)</option>
                    <option value="CE">Chidi Eze (CE)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddCustomerOpen(false)}
                  className="px-4 py-2 rounded-full border border-slate-200 text-xs font-semibold text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-full bg-[#0b0d14] text-white text-xs font-semibold cursor-pointer"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 2: NEW DEAL FOR SELECTED CUSTOMER
          ===================================================================== */}
      {newDealOpen && selectedCustomer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
          aria-label="New Deal"
        >
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#070b16]">
                New Deal · {selectedCustomer.name}
              </h2>
              <button
                type="button"
                onClick={() => setNewDealOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDeal} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Opportunity Title
                </label>
                <input
                  type="text"
                  required
                  value={dealTitle}
                  onChange={(e) => setDealTitle(e.target.value)}
                  placeholder="e.g. West Africa Expansion Retainer"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-[#070b16]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Projected Value (USD)
                </label>
                <input
                  type="number"
                  value={dealValue}
                  onChange={(e) => setDealValue(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-[#070b16]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewDealOpen(false)}
                  className="px-4 py-2 rounded-full border border-slate-200 text-xs font-semibold text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-full bg-[#0b0d14] text-white text-xs font-semibold cursor-pointer"
                >
                  Create Deal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 3: LOG ACTIVITY FOR SELECTED CUSTOMER
          ===================================================================== */}
      {logActivityOpen && selectedCustomer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Log Activity"
        >
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#070b16]">
                Log Activity · {selectedCustomer.name}
              </h2>
              <button
                type="button"
                onClick={() => setLogActivityOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleLogActivity} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Activity Summary
                </label>
                <input
                  type="text"
                  required
                  value={activityTitle}
                  onChange={(e) => setActivityTitle(e.target.value)}
                  placeholder="e.g. Executive QBR Call Completed"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-[#070b16]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Details / Notes
                </label>
                <input
                  type="text"
                  value={activitySubtitle}
                  onChange={(e) => setActivitySubtitle(e.target.value)}
                  placeholder="e.g. Reviewed Q4 expansion roadmap with CFO"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-[#070b16]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setLogActivityOpen(false)}
                  className="px-4 py-2 rounded-full border border-slate-200 text-xs font-semibold text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-full bg-[#0b0d14] text-white text-xs font-semibold cursor-pointer"
                >
                  Save Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

