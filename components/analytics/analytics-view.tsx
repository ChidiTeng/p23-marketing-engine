"use client";

import { useEffect, useState, useMemo } from "react";
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
  Users,
  TrendingUp,
  DollarSign,
  UserCheck,
  Filter,
  Layers,
  ArrowUpRight,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { useSourceBreakdown, useLeadOverviewAnalytics } from "@/hooks/use-analytics";
import "./analytics.css";

const SECTOR_COLORS: Record<string, string> = {
  Construction: "#2ae9c9",
  Technology: "#38bdf8",
  "Real Estate": "#f59e0b",
  "Business Consulting": "#a855f7",
  Agriculture: "#22c55e",
  Other: "#94a3b8",
};

const CHANNEL_COLORS: string[] = [
  "#2ae9c9",
  "#38bdf8",
  "#818cf8",
  "#c084fc",
  "#f472b6",
  "#fb923c",
  "#facc15",
  "#4ade80",
];

export function AnalyticsView() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [touchModel, setTouchModel] = useState<"first" | "last">("first");
  const [dateRange, setDateRange] = useState<string>("30d");

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: overview, isLoading: overviewLoading } = useLeadOverviewAnalytics();
  const { data: breakdown, isLoading: breakdownLoading } = useSourceBreakdown({
    touch: touchModel,
  });

  const totalLeads = overview?.total_leads ?? breakdown?.total_leads ?? 0;
  const pipelineValue = overview?.pipeline_value
    ? `$${overview.pipeline_value.toLocaleString()}`
    : "$485,000";
  const convRate = overview?.conversion_rate ?? 24;
  const activeReps = overview?.active_reps ?? 4;

  const channelsData = useMemo(() => {
    if (!breakdown?.channels?.length) return [];
    return breakdown.channels.map((c) => ({
      ...c,
      displayName: c.channel
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" "),
    }));
  }, [breakdown?.channels]);

  const interestsData = useMemo(() => {
    if (!breakdown?.interests?.length) return [];
    return breakdown.interests.map((item) => ({
      ...item,
      color: SECTOR_COLORS[item.interest] || "#94a3b8",
    }));
  }, [breakdown?.interests]);

  const captureMethods = useMemo(() => {
    return (
      breakdown?.capture_methods ?? [
        { capture_method: "website_form", count: 48, percentage: 40 },
        { capture_method: "manual", count: 32, percentage: 27 },
        { capture_method: "smart_lead", count: 24, percentage: 20 },
        { capture_method: "social_listening", count: 16, percentage: 13 },
      ]
    );
  }, [breakdown?.capture_methods]);

  const formatMethodName = (method: string) => {
    switch (method) {
      case "website_form":
        return "Website Intake Form";
      case "manual":
        return "Manual Direct Capture";
      case "smart_lead":
        return "Smart Lead AI Match";
      case "social_listening":
        return "Social Listening Intent";
      default:
        return method.replace(/_/g, " ");
    }
  };

  return (
    <div className="an-page" data-testid="analytics-view">
      {/* Page Header */}
      <div className="an-heading">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#2ae9c9]/15 text-[#2ae9c9] border border-[#2ae9c9]/30">
              P23 Attribution Engine
            </span>
          </div>
          <h1>Attribution & Performance Analytics</h1>
          <p>
            Real-time multi-channel tracking, primary sector classification, and rep intake throughput.
          </p>
        </div>

        <div className="an-controls">
          {/* Attribution Model Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-[#8da4a6] flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" /> Model:
            </span>
            <div className="an-toggle-group">
              <button
                type="button"
                className={`an-toggle-btn ${touchModel === "first" ? "is-active" : ""}`}
                onClick={() => setTouchModel("first")}
                data-testid="toggle-first-touch"
              >
                First Touch
              </button>
              <button
                type="button"
                className={`an-toggle-btn ${touchModel === "last" ? "is-active" : ""}`}
                onClick={() => setTouchModel("last")}
                data-testid="toggle-last-touch"
              >
                Last Touch
              </button>
            </div>
          </div>

          {/* Date Range Selector */}
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-[#8da4a6] flex items-center gap-1">
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
              <option value="all">All Time (Seed)</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="an-kpi-grid">
        <div className="an-kpi-card" data-testid="kpi-total-leads">
          <span>
            <Users className="w-4 h-4 text-[#2ae9c9]" /> Total Captured Leads
          </span>
          <strong>{overviewLoading ? "..." : totalLeads.toLocaleString()}</strong>
          <small className="flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3 text-[#4ade80]" /> +18% new this week
          </small>
        </div>

        <div className="an-kpi-card" data-testid="kpi-pipeline-value">
          <span>
            <DollarSign className="w-4 h-4 text-[#38bdf8]" /> Total Pipeline Value
          </span>
          <strong>{overviewLoading ? "..." : pipelineValue}</strong>
          <small className="text-[#38bdf8]">Heuristic weighted sum</small>
        </div>

        <div className="an-kpi-card" data-testid="kpi-conversion-rate">
          <span>
            <TrendingUp className="w-4 h-4 text-[#a855f7]" /> Win / Conversion Rate
          </span>
          <strong>{overviewLoading ? "..." : `${convRate}%`}</strong>
          <small className="text-[#a855f7]">Lead to Customer progression</small>
        </div>

        <div className="an-kpi-card" data-testid="kpi-active-reps">
          <span>
            <UserCheck className="w-4 h-4 text-[#f59e0b]" /> Active Round-Robin Reps
          </span>
          <strong>{overviewLoading ? "..." : activeReps}</strong>
          <small className="text-[#f59e0b]">Operational in rotation pool</small>
        </div>
      </div>

      {/* Main Charts Grid: Channel Breakdown & Sector Donut */}
      <div className="an-charts-grid">
        {/* Channel Breakdown Bar Chart */}
        <div className="an-chart-card">
          <div className="an-chart-card-header">
            <div>
              <h3>Lead Acquisition by Channel</h3>
              <p>Top acquisition channels ({touchModel === "first" ? "First" : "Last"} Touch Attribution)</p>
            </div>
            <span className="text-[11px] text-[#8da4a6] bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
              Click bar to filter CRM
            </span>
          </div>

          <div className="an-chart-container">
            {mounted && !breakdownLoading ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={channelsData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
                >
                  <XAxis
                    dataKey="displayName"
                    stroke="#8da4a6"
                    fontSize={11}
                    tickLine={false}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                  />
                  <YAxis stroke="#8da4a6" fontSize={11} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: "rgba(42, 233, 201, 0.08)" }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#07242b] border border-[#2ae9c9]/30 rounded-xl p-3 shadow-xl text-white text-xs">
                            <p className="font-semibold text-white mb-1">{data.displayName}</p>
                            <p className="text-[#2ae9c9]">
                              Leads: <strong>{data.count}</strong> ({data.percentage}%)
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="count"
                    radius={[6, 6, 0, 0]}
                    onClick={(entry: unknown) => {
                      const item = entry as { channel?: string; payload?: { channel?: string } } | undefined;
                      const channel = item?.channel ?? item?.payload?.channel;
                      if (channel) {
                        router.push(`/crm?channel=${encodeURIComponent(channel)}`);
                      }
                    }}
                    className="cursor-pointer"
                  >
                    {channelsData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHANNEL_COLORS[index % CHANNEL_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-[#8da4a6]">
                Loading channel metrics...
              </div>
            )}
          </div>
        </div>

        {/* Primary Interest Donut Chart */}
        <div className="an-chart-card">
          <div className="an-chart-card-header">
            <div>
              <h3>Primary Interest Sectors</h3>
              <p>Automated keyword taxonomy classification</p>
            </div>
            <Sparkles className="w-4 h-4 text-[#2ae9c9]" />
          </div>

          <div className="an-chart-container relative flex items-center justify-center">
            {mounted && !breakdownLoading ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-[#07242b] border border-white/20 rounded-xl p-3 shadow-xl text-white text-xs">
                              <p className="font-semibold text-white">{data.interest}</p>
                              <p style={{ color: data.color }}>
                                {data.count} leads ({data.percentage}%)
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Pie
                      data={interestsData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={3}
                      dataKey="count"
                      nameKey="interest"
                      onClick={(entry: unknown) => {
                        const item = entry as { interest?: string; name?: string; payload?: { interest?: string } } | undefined;
                        const interest = item?.interest ?? item?.name ?? item?.payload?.interest;
                        if (interest) {
                          router.push(`/crm?interest=${encodeURIComponent(interest)}`);
                        }
                      }}
                      className="cursor-pointer"
                    >
                      {interestsData.map((entry, index) => (
                        <Cell key={`interest-cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                {/* Donut Center Display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[26px] font-bold text-white tracking-tight leading-none">
                    {totalLeads}
                  </span>
                  <span className="text-[11px] text-[#8da4a6] uppercase tracking-wider font-medium mt-1">
                    Classified Leads
                  </span>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-[#8da4a6]">
                Loading sector taxonomy...
              </div>
            )}
          </div>

          {/* Interactive Sector Legend */}
          <div className="an-legend-list">
            {interestsData.map((item) => (
              <div
                key={item.interest}
                className="an-legend-item"
                onClick={() => router.push(`/crm?interest=${encodeURIComponent(item.interest)}`)}
                title={`Filter CRM by ${item.interest}`}
              >
                <div className="flex items-center">
                  <div
                    className="an-legend-color"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-[13px] font-medium text-white">{item.interest}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[12px] text-[#8da4a6]">{item.count} leads</span>
                  <span className="text-[11px] font-semibold text-[#2ae9c9] bg-[#2ae9c9]/10 px-2 py-0.5 rounded-full border border-[#2ae9c9]/20">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Capture Methods Breakdown Cards */}
      <div className="an-chart-card">
        <div className="an-chart-card-header">
          <div>
            <h3>Capture Method Intake Distribution</h3>
            <p>Ingestion streams tracked by the P23 marketing and listening pipeline</p>
          </div>
          <span className="text-xs text-[#8da4a6]">100% automated attribution</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
          {captureMethods.map((cm) => (
            <div
              key={cm.capture_method}
              className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-[#2ae9c9]/40 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-white">
                    {formatMethodName(cm.capture_method)}
                  </span>
                  <span className="text-xs font-bold text-[#2ae9c9]">{cm.percentage}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden mb-3">
                  <div
                    className="bg-[#2ae9c9] h-full rounded-full transition-all duration-500"
                    style={{ width: `${cm.percentage}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#8da4a6] pt-1 border-t border-white/5">
                <span>{cm.count} leads captured</span>
                {cm.capture_method === "website_form" && (
                  <button
                    type="button"
                    onClick={() => router.push("/demo/enquiry")}
                    className="text-[#2ae9c9] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Try Form <ExternalLink className="w-2.5 h-2.5" />
                  </button>
                )}
                {cm.capture_method === "social_listening" && (
                  <button
                    type="button"
                    onClick={() => router.push("/social-listening")}
                    className="text-[#2ae9c9] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Signals <ExternalLink className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

