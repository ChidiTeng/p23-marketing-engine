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
import { buildFallbackSourceBreakdown } from "@/lib/api/analytics";
import "./analytics.css";

const SECTOR_COLORS: Record<string, string> = {
  Construction: "#14b8a6",
  Technology: "#0ea5e9",
  "Real Estate": "#f59e0b",
  "Business Consulting": "#8b5cf6",
  Agriculture: "#22c55e",
  Other: "#64748b",
};

const CHANNEL_COLORS: string[] = [
  "#14b8a6",
  "#0ea5e9",
  "#6366f1",
  "#a855f7",
  "#ec4899",
  "#f97316",
  "#eab308",
  "#22c55e",
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

  const totalLeads = overview?.total_leads || breakdown?.total_leads || 120;
  const pipelineValue = overview?.pipeline_value
    ? `$${overview.pipeline_value.toLocaleString()}`
    : "$485,000";
  const convRate = overview?.conversion_rate ?? 24;
  const activeReps = overview?.active_reps ?? 4;

  const fallbackBreakdown = useMemo(
    () => buildFallbackSourceBreakdown(touchModel, totalLeads),
    [touchModel, totalLeads]
  );

  const channelsData = useMemo(() => {
    const sourceChannels =
      breakdown?.channels && breakdown.channels.length > 0
        ? breakdown.channels
        : fallbackBreakdown.channels;

    return sourceChannels.map((c) => ({
      ...c,
      displayName: c.channel
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" "),
    }));
  }, [breakdown?.channels, fallbackBreakdown.channels]);

  const interestsData = useMemo(() => {
    const sourceInterests =
      breakdown?.interests && breakdown.interests.length > 0
        ? breakdown.interests
        : fallbackBreakdown.interests;

    return sourceInterests.map((item) => ({
      ...item,
      color: SECTOR_COLORS[item.interest] || "#64748b",
    }));
  }, [breakdown?.interests, fallbackBreakdown.interests]);

  const captureMethods = useMemo(() => {
    if (breakdown?.capture_methods && breakdown.capture_methods.length > 0) {
      return breakdown.capture_methods;
    }
    return fallbackBreakdown.capture_methods;
  }, [breakdown?.capture_methods, fallbackBreakdown.capture_methods]);

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

  const getMethodThemeClass = (method: string, index: number) => {
    switch (method) {
      case "website_form":
        return "an-method-card-teal";
      case "manual":
        return "an-method-card-sky";
      case "smart_lead":
        return "an-method-card-violet";
      case "social_listening":
        return "an-method-card-rose";
      default: {
        const themes = [
          "an-method-card-teal",
          "an-method-card-sky",
          "an-method-card-violet",
          "an-method-card-rose",
        ];
        return themes[index % themes.length];
      }
    }
  };

  return (
    <div className="an-page" data-testid="analytics-view">
      {/* Page Header */}
      <div className="an-heading">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="an-eyebrow-pill">P23 Attribution Engine</span>
          </div>
          <h1>Attribution &amp; Performance Analytics</h1>
          <p>
            Real-time multi-channel tracking, primary sector classification, and rep intake throughput.
          </p>
        </div>

        <div className="an-controls">
          {/* Attribution Model Toggle */}
          <div className="flex items-center gap-2">
            <span className="an-control-label">
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
              <option value="all">All Time (Seed)</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="an-kpi-grid">
        <div className="an-kpi-card an-kpi-card-mint" data-testid="kpi-total-leads">
          <span>
            <Users className="w-4 h-4 text-[#0d9488]" /> Total Captured Leads
          </span>
          <strong>{overviewLoading ? "..." : totalLeads.toLocaleString()}</strong>
          <small className="flex items-center gap-1 text-[#065f46]">
            <ArrowUpRight className="w-3.5 h-3.5" /> +18% new this week
          </small>
        </div>

        <div className="an-kpi-card an-kpi-card-rose" data-testid="kpi-pipeline-value">
          <span>
            <DollarSign className="w-4 h-4 text-[#c026d3]" /> Total Pipeline Value
          </span>
          <strong>{overviewLoading ? "..." : pipelineValue}</strong>
          <small className="text-[#86198f]">Heuristic weighted sum</small>
        </div>

        <div className="an-kpi-card an-kpi-card-violet" data-testid="kpi-conversion-rate">
          <span>
            <TrendingUp className="w-4 h-4 text-[#7c3aed]" /> Win / Conversion Rate
          </span>
          <strong>{overviewLoading ? "..." : `${convRate}%`}</strong>
          <small className="text-[#5b21b6]">Lead to Customer progression</small>
        </div>

        <div className="an-kpi-card an-kpi-card-amber" data-testid="kpi-active-reps">
          <span>
            <UserCheck className="w-4 h-4 text-[#d97706]" /> Active Round-Robin Reps
          </span>
          <strong>{overviewLoading ? "..." : activeReps}</strong>
          <small className="text-[#92400e]">Operational in rotation pool</small>
        </div>
      </div>

      {/* Main Charts Grid: Channel Breakdown & Sector Donut */}
      <div className="an-charts-grid">
        {/* Channel Breakdown Bar Chart */}
        <div className="an-chart-card">
          <div className="an-chart-card-header">
            <div>
              <h3>Lead Acquisition by Channel</h3>
              <p>
                Top acquisition channels ({touchModel === "first" ? "First" : "Last"} Touch Attribution)
              </p>
            </div>
            <span className="an-pill-hint">Click bar to filter CRM</span>
          </div>

          <div className="an-chart-container">
            {mounted && !breakdownLoading ? (
              <ResponsiveContainer width="100%" height={290}>
                <BarChart
                  data={channelsData}
                  margin={{ top: 10, right: 12, left: -18, bottom: 28 }}
                >
                  <XAxis
                    dataKey="displayName"
                    stroke="var(--an-axis-stroke)"
                    fontSize={11}
                    tickLine={false}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis stroke="var(--an-axis-stroke)" fontSize={11} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: "rgba(20, 184, 166, 0.08)" }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div
                            className="rounded-xl p-3 shadow-xl text-white text-xs"
                            style={{
                              background: "var(--an-tooltip-bg)",
                              border: "1px solid var(--an-tooltip-border)",
                            }}
                          >
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
                    radius={[7, 7, 0, 0]}
                    onClick={(entry: unknown) => {
                      const item = entry as
                        | { channel?: string; payload?: { channel?: string } }
                        | undefined;
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
              <div className="h-[290px] flex items-center justify-center text-sm opacity-60">
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
            <Sparkles className="w-4 h-4 text-[#14b8a6]" />
          </div>

          <div className="relative flex items-center justify-center h-[230px]">
            {mounted && !breakdownLoading ? (
              <>
                <ResponsiveContainer width="100%" height={225}>
                  <PieChart>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div
                              className="rounded-xl p-3 shadow-xl text-white text-xs"
                              style={{
                                background: "var(--an-tooltip-bg)",
                                border: "1px solid var(--an-tooltip-border)",
                              }}
                            >
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
                      innerRadius={62}
                      outerRadius={92}
                      paddingAngle={3}
                      dataKey="count"
                      nameKey="interest"
                      onClick={(entry: unknown) => {
                        const item = entry as
                          | {
                              interest?: string;
                              name?: string;
                              payload?: { interest?: string };
                            }
                          | undefined;
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
                  <span className="an-donut-center-value">{totalLeads}</span>
                  <span className="an-donut-center-label">Classified Leads</span>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-sm opacity-60">
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
                <div className="flex items-center min-w-0">
                  <div
                    className="an-legend-color"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="an-legend-name truncate">{item.interest}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="an-legend-count">{item.count}</span>
                  <span className="an-legend-pct">{item.percentage}%</span>
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
          <span className="an-pill-hint">100% automated attribution</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-1">
          {captureMethods.map((cm, idx) => (
            <div
              key={cm.capture_method}
              className={`an-method-card ${getMethodThemeClass(cm.capture_method, idx)}`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="an-method-title">
                    {formatMethodName(cm.capture_method)}
                  </span>
                  <span className="an-method-pct">{cm.percentage}%</span>
                </div>
                <div className="an-method-track">
                  <div
                    className="an-method-fill"
                    style={{ width: `${cm.percentage}%` }}
                  />
                </div>
              </div>
              <div className="an-method-footer">
                <span>{cm.count} leads captured</span>
                {cm.capture_method === "website_form" && (
                  <button
                    type="button"
                    onClick={() => router.push("/demo/enquiry")}
                    className="an-method-link"
                  >
                    Try Form <ExternalLink className="w-3 h-3" />
                  </button>
                )}
                {cm.capture_method === "social_listening" && (
                  <button
                    type="button"
                    onClick={() => router.push("/social-listening")}
                    className="an-method-link"
                  >
                    Signals <ExternalLink className="w-3 h-3" />
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
