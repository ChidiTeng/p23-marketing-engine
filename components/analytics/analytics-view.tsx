"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import {
  ArrowUpRight,
  Bot,
  CheckCircle2,
  Download,
  Filter,
  Layers,
  Link2,
  Mail,
  MousePointerClick,
  Send,
  TrendingUp,
  Zap,
} from "lucide-react";
import {
  EMAIL_AUTOMATION_ANALYTICS_DATA,
  computeDynamicEmailPerformance,
  getEmailAutomationStore,
  recordEmailDispatchAndTrackingEvent,
  subscribeEmailAutomationStore,
} from "@/lib/api/contracts/email-automation";
import "./analytics.css";

export function AnalyticsView() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [metricFocus, setMetricFocus] = useState<"open_rate" | "reply_rate">(
    "open_rate"
  );
  const [dateRange, setDateRange] = useState<string>("30d");
  const [engineFilter, setEngineFilter] = useState<string>("All engines");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [storeState, setStoreState] = useState(() => getEmailAutomationStore());

  useEffect(() => {
    setMounted(true);
    setStoreState(getEmailAutomationStore());
    return subscribeEmailAutomationStore(() => {
      setStoreState({ ...getEmailAutomationStore() });
    });
  }, []);

  const data = EMAIL_AUTOMATION_ANALYTICS_DATA;
  const dynamicPerf = computeDynamicEmailPerformance(storeState);

  const filteredWorkflows = storeState.workflows.filter(
    (wf) => engineFilter === "All engines" || wf.engine === engineFilter
  );

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3400);
  }

  function handleSimulateDispatch() {
    const next = recordEmailDispatchAndTrackingEvent({
      batchSize: 50,
      sourceModule: "Smart Lead",
    });
    setStoreState({ ...next });
    showToast(
      "Dispatched 50 automated emails — Sent, Delivered, Opened & Link Click metrics updated"
    );
  }

  function handleExportEmailReport() {
    const headers = [
      "Workflow",
      "Engine",
      "Automation Type",
      "AI Tone",
      "Enrolled",
      "Emails Sent",
      "Delivered",
      "Deliverability %",
      "Opened",
      "Open Rate %",
      "Link Clicks",
      "Click Rate %",
      "Reply Rate %",
      "Attributed Revenue",
    ];
    const rows = filteredWorkflows.map((w) => [
      w.name,
      w.engine,
      w.automationType,
      w.tone,
      String(w.enrolledCount),
      String(w.sentCount),
      String(w.deliveredCount ?? Math.round(w.sentCount * 0.99)),
      `${w.deliveredRatePct}%`,
      String(w.openedCount ?? Math.round(w.sentCount * (w.openRatePct / 100))),
      `${w.openRatePct}%`,
      String(w.clickedCount ?? Math.round(w.sentCount * (w.clickRatePct / 100))),
      `${w.clickRatePct}%`,
      `${w.replyRatePct}%`,
      w.revenueFormatted,
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    try {
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `p23-email-automation-analytics-${dateRange}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Fallback for test environments without Blob URL
    }

    showToast(`Exported p23-email-automation-analytics-${dateRange}.csv`);
  }

  const dynamicFunnel = [
    {
      stage: "Sent (Dispatched)",
      count: dynamicPerf.totalSent,
      percentage: 100,
      dropOffNote: "All triggered automation sends across 3 engines & Smart Lead",
    },
    {
      stage: "Delivered to Inbox",
      count: dynamicPerf.totalDelivered,
      percentage: dynamicPerf.deliverabilityRatePct,
      dropOffNote: "DKIM/SPF verified · 1.0% bounce guardrailed",
    },
    {
      stage: "Opened Email",
      count: dynamicPerf.totalOpened,
      percentage: dynamicPerf.openRatePct,
      dropOffNote: "+8.4% above B2B Africa benchmark",
    },
    {
      stage: "Link Performance (Clicks)",
      count: dynamicPerf.totalClicked,
      percentage: dynamicPerf.clickRatePct,
      dropOffNote: "Deck views, syllabus clicks & calendar links",
    },
    {
      stage: "Replied / Converted Deal",
      count: dynamicPerf.totalConverted,
      percentage: dynamicPerf.replyRatePct,
      dropOffNote: `${dynamicPerf.totalRevenueFormatted} attributed pipeline conversion`,
    },
  ];

  return (
    <div className="an-page" data-testid="analytics-view">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          data-testid="email-analytics-toast"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl text-xs font-semibold bg-[#0b0d14] text-white border border-white/10"
        >
          <CheckCircle2 className="w-4 h-4 text-[#4ade80] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="an-heading">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="an-eyebrow-pill">
              P23 Email Automation Intelligence
            </span>
          </div>
          <h1>Email Automation Analytics &amp; Reports</h1>
          <p>
            Dedicated sequence deliverability, Sent / Delivered / Opened / Link Clicks telemetry, AI tone performance, and Smart Lead sync.
          </p>
        </div>

        <div className="an-controls">
          {/* Metric Focus Toggle */}
          <div className="flex items-center gap-2">
            <span className="an-control-label">
              <Layers className="w-3.5 h-3.5" /> Focus:
            </span>
            <div className="an-toggle-group">
              <button
                type="button"
                className={`an-toggle-btn ${
                  metricFocus === "open_rate" ? "is-active" : ""
                }`}
                onClick={() => setMetricFocus("open_rate")}
                data-testid="toggle-open-rate-focus"
              >
                Open &amp; Click Rate
              </button>
              <button
                type="button"
                className={`an-toggle-btn ${
                  metricFocus === "reply_rate" ? "is-active" : ""
                }`}
                onClick={() => setMetricFocus("reply_rate")}
                data-testid="toggle-reply-rate-focus"
              >
                Reply &amp; Conversion
              </button>
            </div>
          </div>

          {/* Date Range Selector */}
          <div className="flex items-center gap-2">
            <span className="an-control-label">
              <Filter className="w-3.5 h-3.5" /> Range:
            </span>
            <select
              aria-label="Date range selector"
              className="an-select"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>

          {/* Simulate Live Email Dispatch (Ticket 7 Dynamic Metric Update) */}
          <button
            type="button"
            onClick={handleSimulateDispatch}
            data-testid="analytics-simulate-dispatch-btn"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-slate-200 text-[#070b16] text-xs font-semibold cursor-pointer hover:border-[#2ae9c9]"
          >
            <Send className="w-3.5 h-3.5 text-[#0d9488]" />
            <span>Dispatch Batch (+50)</span>
          </button>

          {/* Export Dedicated Email Report */}
          <button
            type="button"
            onClick={handleExportEmailReport}
            data-testid="export-email-report-btn"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#022228] text-[#2ae9c9] text-xs font-semibold cursor-pointer hover:opacity-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Email Report</span>
          </button>

          <Link
            href="/email-automation?source=analytics"
            data-testid="analytics-view-email-automation-btn"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-slate-200 text-[#070b16] text-xs font-semibold hover:border-slate-300"
          >
            <Mail className="w-3.5 h-3.5 text-[#0d9488]" />
            <span>View Email Automation</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid — Ticket 7: Sent, Delivered, Opened, Link Performance (Clicks) */}
      <div className="an-kpi-grid">
        <div
          className="an-kpi-card an-kpi-card-mint"
          data-testid="kpi-total-emails-sent"
        >
          <span>
            <Mail className="w-4 h-4 text-[#0d9488]" /> Sent &amp; Delivered
          </span>
          <strong>
            {dynamicPerf.totalSentFormatted}{" "}
            <span className="text-base font-bold opacity-75">
              ({dynamicPerf.totalDeliveredFormatted} deliv)
            </span>
          </strong>
          <small className="flex items-center gap-1 text-[#065f46]">
            <ArrowUpRight className="w-3.5 h-3.5" />{" "}
            {dynamicPerf.deliverabilityRatePct}% inbox deliverability · Smart
            Lead synced: {dynamicPerf.smartLeadSyncedFormatted}
          </small>
        </div>

        <div
          className="an-kpi-card an-kpi-card-violet"
          data-testid="kpi-email-open-rate"
        >
          <span>
            <TrendingUp className="w-4 h-4 text-[#7c3aed]" /> Opened Emails
          </span>
          <strong>
            {dynamicPerf.openRatePct}%{" "}
            <span className="text-base font-bold opacity-75">
              ({dynamicPerf.totalOpenedFormatted})
            </span>
          </strong>
          <small className="text-[#5b21b6]">
            +{data.openRateDeltaPct}% vs. prior 30-day period
          </small>
        </div>

        <div
          className="an-kpi-card an-kpi-card-amber"
          data-testid="kpi-email-ctr-reply"
        >
          <span>
            <MousePointerClick className="w-4 h-4 text-[#d97706]" /> Link
            Performance (Clicks)
          </span>
          <strong>
            {dynamicPerf.clickRatePct}% / {dynamicPerf.replyRatePct}%{" "}
            <span className="text-base font-bold opacity-75">
              ({dynamicPerf.totalClickedFormatted} clicks)
            </span>
          </strong>
          <small className="text-[#92400e]">
            {data.unsubscribeRatePct}% unsubscribe · {data.bounceRatePct}% bounce
          </small>
        </div>

        <div
          className="an-kpi-card an-kpi-card-rose"
          data-testid="kpi-email-attributed-revenue"
        >
          <span>
            <Zap className="w-4 h-4 text-[#c026d3]" /> Email-Attributed Revenue
          </span>
          <strong>{dynamicPerf.totalRevenueFormatted}</strong>
          <small className="text-[#86198f]">
            +{data.revenueDeltaPct}% across {dynamicPerf.activeWorkflowsCount}{" "}
            active AI flows
          </small>
        </div>
      </div>

      {/* Main Charts Grid: Automation Type Performance & AI Tone Donut */}
      <div className="an-charts-grid">
        <div className="an-chart-card" data-testid="chart-automation-types">
          <div className="an-chart-card-header">
            <div>
              <h3>Performance by AI Automation Type</h3>
              <p>
                Comparing{" "}
                {metricFocus === "open_rate"
                  ? "Open Rate (%)"
                  : "Conversion Rate (%)"}{" "}
                across standard AI sequence archetypes
              </p>
            </div>
            <span className="an-pill-hint">Click bar to inspect flow</span>
          </div>

          <div className="an-chart-container">
            {mounted ? (
              <ResponsiveContainer width="100%" height={290}>
                <BarChart
                  data={data.performanceByType}
                  margin={{ top: 10, right: 12, left: -18, bottom: 28 }}
                >
                  <XAxis
                    dataKey="typeLabel"
                    stroke="var(--an-axis-stroke)"
                    fontSize={11}
                    tickLine={false}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis
                    stroke="var(--an-axis-stroke)"
                    fontSize={11}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(20, 184, 166, 0.08)" }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const row = payload[0].payload;
                        return (
                          <div
                            className="rounded-xl p-3 shadow-xl text-white text-xs"
                            style={{
                              background: "var(--an-tooltip-bg)",
                              border: "1px solid var(--an-tooltip-border)",
                            }}
                          >
                            <p className="font-semibold text-white mb-1">
                              {row.typeLabel}
                            </p>
                            <p className="text-[#2ae9c9]">
                              Open: <strong>{row.openRatePct}%</strong> · Click:{" "}
                              <strong>{row.clickRatePct}%</strong>
                            </p>
                            <p className="text-slate-300 mt-0.5">
                              Revenue: <strong>{row.revenueFormatted}</strong> (
                              {row.enrolled} enrolled)
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey={
                      metricFocus === "open_rate"
                        ? "openRatePct"
                        : "conversionRatePct"
                    }
                    radius={[7, 7, 0, 0]}
                    onClick={() => router.push("/email-automation")}
                    className="cursor-pointer"
                  >
                    {data.performanceByType.map((entry, index) => (
                      <Cell key={`type-cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[290px] flex items-center justify-center text-sm opacity-60">
                Loading email automation metrics...
              </div>
            )}
          </div>
        </div>

        {/* AI Tone / Vibe Conversion Donut Chart */}
        <div className="an-chart-card" data-testid="chart-ai-tone-breakdown">
          <div className="an-chart-card-header">
            <div>
              <h3>AI Message Tone &amp; Vibe Telemetry</h3>
              <p>Engagement &amp; conversion share by AI-calibrated tone</p>
            </div>
            <Bot className="w-4 h-4 text-[#14b8a6]" />
          </div>

          <div className="relative flex items-center justify-center h-[230px]">
            {mounted ? (
              <>
                <ResponsiveContainer width="100%" height={225}>
                  <PieChart>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const row = payload[0].payload;
                          return (
                            <div
                              className="rounded-xl p-3 shadow-xl text-white text-xs"
                              style={{
                                background: "var(--an-tooltip-bg)",
                                border: "1px solid var(--an-tooltip-border)",
                              }}
                            >
                              <p className="font-semibold text-white">
                                {row.toneLabel}
                              </p>
                              <p style={{ color: row.color }}>
                                {row.sent.toLocaleString()} sent ·{" "}
                                {row.openRatePct}% open · {row.replyRatePct}%
                                reply
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Pie
                      data={data.performanceByTone}
                      cx="50%"
                      cy="50%"
                      innerRadius={62}
                      outerRadius={92}
                      paddingAngle={3}
                      dataKey="sent"
                      nameKey="toneLabel"
                      onClick={() => router.push("/email-automation")}
                      className="cursor-pointer"
                    >
                      {data.performanceByTone.map((entry, index) => (
                        <Cell key={`tone-cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="an-donut-center-value">
                    {dynamicPerf.totalSentFormatted}
                  </span>
                  <span className="an-donut-center-label">AI Emails Sent</span>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-sm opacity-60">
                Loading AI tone distribution...
              </div>
            )}
          </div>

          <div className="an-legend-list">
            {data.performanceByTone.map((item) => (
              <div
                key={item.toneId}
                className="an-legend-item"
                onClick={() =>
                  router.push(`/email-automation?tone=${item.toneId}`)
                }
                title={`Inspect ${item.toneLabel} workflows`}
              >
                <div className="flex items-center min-w-0">
                  <div
                    className="an-legend-color"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="an-legend-name truncate">
                    {item.toneLabel}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="an-legend-count">{item.openRatePct}% open</span>
                  <span className="an-legend-pct">{item.replyRatePct}% reply</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sequence Step Drop-Off & Deliverability Funnel (Sent -> Delivered -> Opened -> Link Clicks -> Converted) */}
      <div className="an-chart-card mb-6" data-testid="email-sequence-funnel">
        <div className="an-chart-card-header">
          <div>
            <h3>Email Automation Delivery &amp; Link Performance Funnel</h3>
            <p>
              End-to-end progression from Sent to Delivered, Opened, Link Performance (Clicks), and Deal Conversion
            </p>
          </div>
          <span className="an-pill-hint">
            Smart Lead + CRM + Customers Unified Telemetry
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 mt-2">
          {dynamicFunnel.map((stage, idx) => {
            const themes = [
              "an-method-card-teal",
              "an-method-card-sky",
              "an-method-card-violet",
              "an-method-card-rose",
              "an-method-card-teal",
            ];
            return (
              <div
                key={stage.stage}
                className={`an-method-card ${themes[idx % themes.length]}`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="an-method-title">{stage.stage}</span>
                    <span className="an-method-pct">{stage.percentage}%</span>
                  </div>
                  <div className="an-method-track">
                    <div
                      className="an-method-fill"
                      style={{ width: `${stage.percentage}%` }}
                    />
                  </div>
                </div>
                <div className="an-method-footer">
                  <span>
                    <strong>{stage.count.toLocaleString("en-US")}</strong>{" "}
                    emails
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  {stage.dropOffNote}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ticket 7: Link Performance (Clicks) Breakdown Table */}
      <div
        className="an-chart-card mb-6"
        data-testid="analytics-link-performance-card"
      >
        <div className="an-chart-card-header">
          <div>
            <h3>Tracked Link Performance (Clicks)</h3>
            <p>
              Real-time click-through telemetry across all automated sequence CTAs, playbooks, and booking links
            </p>
          </div>
          <span className="an-pill-hint">
            {dynamicPerf.totalClickedFormatted} Total Clicks ({dynamicPerf.clickRatePct}% CTR)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
          {dynamicPerf.allTrackedLinks.map((lnk) => (
            <div
              key={lnk.id}
              className="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/70 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-[#0d9488] shrink-0" />
                  <span className="text-xs font-bold text-[#070b16] truncate">
                    {lnk.label}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  {lnk.url}
                </p>
              </div>
              <div className="text-right shrink-0 tabular-nums">
                <span className="block text-xs font-extrabold text-[#070b16]">
                  {lnk.clicks.toLocaleString("en-US")} clicks
                </span>
                <span className="block text-[10.5px] font-semibold text-[#0d9488]">
                  {lnk.uniqueClicks.toLocaleString("en-US")} unique · {lnk.ctrPct}% CTR
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dedicated Email Automation Workflow Performance Report Table */}
      <div
        className="an-chart-card"
        data-testid="email-automation-reports-table"
      >
        <div className="an-chart-card-header">
          <div>
            <h3>Dedicated Email Automation Workflow Reports</h3>
            <p>
              Granular sequence report by Business Engine, Trigger event, and Smart Lead transmission cohort
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              aria-label="Filter email reports by engine"
              value={engineFilter}
              onChange={(e) => setEngineFilter(e.target.value)}
              className="an-select"
            >
              <option value="All engines">All Engines</option>
              <option value="B2B Market Entry">B2B Market Entry</option>
              <option value="Membership">Membership</option>
              <option value="Paid Programmes">Paid Programmes</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto mt-2">
          <table className="w-full min-w-[780px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-2.5">WORKFLOW REPORT</th>
                <th className="py-3 px-2.5">ENGINE</th>
                <th className="py-3 px-2.5">SOURCE</th>
                <th className="py-3 px-2.5 text-right">SENT</th>
                <th className="py-3 px-2.5 text-right">DELIVERED</th>
                <th className="py-3 px-2.5 text-right">OPENED</th>
                <th className="py-3 px-2.5 text-right">LINK CLICKS</th>
                <th className="py-3 px-2.5 text-right">REPLY RATE</th>
                <th className="py-3 px-2.5 text-right">REVENUE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredWorkflows.map((wf) => (
                <tr
                  key={wf.id}
                  onClick={() => router.push("/email-automation")}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-2.5 font-bold text-[#070b16]">
                    {wf.name}
                  </td>
                  <td className="py-3 px-2.5 text-slate-600">{wf.engine}</td>
                  <td className="py-3 px-2.5">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[11px] font-semibold text-slate-700">
                      {wf.sourceModule}
                    </span>
                  </td>
                  <td className="py-3 px-2.5 text-right font-semibold tabular-nums">
                    {wf.sentCount.toLocaleString("en-US")}
                  </td>
                  <td className="py-3 px-2.5 text-right text-emerald-700 font-semibold tabular-nums">
                    {(wf.deliveredCount ?? Math.round(wf.sentCount * 0.99)).toLocaleString("en-US")} ({wf.deliveredRatePct}%)
                  </td>
                  <td className="py-3 px-2.5 text-right font-bold text-[#070b16] tabular-nums">
                    {(wf.openedCount ?? Math.round(wf.sentCount * (wf.openRatePct / 100))).toLocaleString("en-US")} ({wf.openRatePct}%)
                  </td>
                  <td className="py-3 px-2.5 text-right font-semibold text-[#0d9488] tabular-nums">
                    {(wf.clickedCount ?? Math.round(wf.sentCount * (wf.clickRatePct / 100))).toLocaleString("en-US")} ({wf.clickRatePct}%)
                  </td>
                  <td className="py-3 px-2.5 text-right font-semibold text-[#6d28d9] tabular-nums">
                    {wf.replyRatePct}%
                  </td>
                  <td className="py-3 px-2.5 text-right font-bold text-[#15803d] tabular-nums">
                    {wf.revenueFormatted}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
