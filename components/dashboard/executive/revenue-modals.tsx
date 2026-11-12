"use client";

import type {
  BusinessEngineItem,
  RegionalRevenueBreakdown,
  RevenueForecastQuarter,
} from "@/lib/api/contracts/executive-dashboard";
import { ArrowUpRight, Globe2, Layers, Sparkles, TrendingUp, X } from "lucide-react";

interface RevenueBreakdownModalProps {
  open: boolean;
  onClose: () => void;
  totalRevenueFormatted: string;
  regions: RegionalRevenueBreakdown[];
  engines: BusinessEngineItem[];
}

export function RevenueBreakdownModal({
  open,
  onClose,
  totalRevenueFormatted,
  regions,
  engines,
}: RevenueBreakdownModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(5, 4, 12, 0.72)",
        backdropFilter: "blur(8px)",
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="revenue-breakdown-title"
      data-testid="revenue-breakdown-modal"
    >
      <div
        className="w-full max-w-2xl rounded-2xl p-6 shadow-2xl transition-all"
        style={{
          background: "var(--p23-card-bg)",
          border: "1px solid var(--p23-card-border)",
          color: "var(--p23-text-primary)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[var(--p23-card-border)]">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[var(--p23-text-eyebrow)]">
              P23 Africa Financial Intelligence
            </span>
            <h2 id="revenue-breakdown-title" className="text-xl font-bold mt-0.5">
              Revenue Breakdown · {totalRevenueFormatted} USD
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
            style={{ color: "var(--p23-text-secondary)" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Regional Breakdown */}
        <div className="mt-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider mb-3 text-[var(--p23-text-secondary)]">
            <Globe2 className="w-3.5 h-3.5 text-[#a855f7]" />
            Regional Corridor Performance
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {regions.map((reg) => (
              <div key={reg.region} className="p23-inner-row p-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{reg.region}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">
                    +{reg.yoyGrowthPercent}% YoY
                  </span>
                </div>
                <p className="text-[11px] mt-0.5" style={{ color: "var(--p23-text-muted)" }}>
                  {reg.countries}
                </p>
                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-base font-bold">
                    ${reg.revenueUsd.toLocaleString("en-US")}
                  </span>
                  <span className="text-xs" style={{ color: "var(--p23-text-secondary)" }}>
                    {reg.sharePercent}% of total
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full overflow-hidden bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#2dd4bf]"
                    style={{ width: `${reg.sharePercent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Business Engines Breakdown */}
        <div className="mt-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider mb-3 text-[var(--p23-text-secondary)]">
            <Layers className="w-3.5 h-3.5 text-[#2dd4bf]" />
            Business Engine Attribution
          </div>
          <div className="space-y-2.5">
            {engines.map((eng) => (
              <div
                key={eng.id}
                className="p23-inner-row px-4 py-3 flex items-center justify-between gap-4"
              >
                <div>
                  <div className="text-sm font-semibold">{eng.name}</div>
                  <div className="text-xs" style={{ color: "var(--p23-text-muted)" }}>
                    {eng.description} · {eng.activeDeals.toLocaleString("en-US")} active accounts
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold">
                    ${eng.revenueContributionUsd.toLocaleString("en-US")}
                  </div>
                  <div className="text-xs font-medium text-emerald-400">
                    {eng.percentage}% share ↑
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full text-xs font-semibold p23-export-btn"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

interface RevenueForecastModalProps {
  open: boolean;
  onClose: () => void;
  projectedNext90DaysUsd: number;
  growthRateAssumedPercent: number;
  pipelineCoverageRatio: number;
  quarters: RevenueForecastQuarter[];
}

export function RevenueForecastModal({
  open,
  onClose,
  projectedNext90DaysUsd,
  growthRateAssumedPercent,
  pipelineCoverageRatio,
  quarters,
}: RevenueForecastModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(5, 4, 12, 0.72)",
        backdropFilter: "blur(8px)",
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="revenue-forecast-title"
      data-testid="revenue-forecast-modal"
    >
      <div
        className="w-full max-w-xl rounded-2xl p-6 shadow-2xl transition-all"
        style={{
          background: "var(--p23-card-bg)",
          border: "1px solid var(--p23-card-border)",
          color: "var(--p23-text-primary)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[var(--p23-card-border)]">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-[#a855f7]">
              <Sparkles className="w-3.5 h-3.5" />
              P23 Predictive Revenue Model
            </span>
            <h2 id="revenue-forecast-title" className="text-xl font-bold mt-0.5">
              90-Day Growth Forecast
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
            style={{ color: "var(--p23-text-secondary)" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Summary KPI Strip */}
        <div className="grid grid-cols-3 gap-3 mt-5">
          <div className="p23-inner-row p-3.5">
            <span className="text-[11px]" style={{ color: "var(--p23-text-muted)" }}>
              90-Day Target
            </span>
            <div className="text-lg font-bold mt-1 text-[#bef264]">
              ${projectedNext90DaysUsd.toLocaleString("en-US")}
            </div>
          </div>
          <div className="p23-inner-row p-3.5">
            <span className="text-[11px]" style={{ color: "var(--p23-text-muted)" }}>
              Projected Velocity
            </span>
            <div className="text-lg font-bold mt-1 flex items-center gap-1 text-emerald-400">
              +{growthRateAssumedPercent}%
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="p23-inner-row p-3.5">
            <span className="text-[11px]" style={{ color: "var(--p23-text-muted)" }}>
              Pipeline Coverage
            </span>
            <div className="text-lg font-bold mt-1 text-[#a855f7]">
              {pipelineCoverageRatio}x
            </div>
          </div>
        </div>

        {/* Monthly Trajectory */}
        <div className="mt-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--p23-text-secondary)]">
            <TrendingUp className="w-3.5 h-3.5 text-[#bef264]" />
            Monthly Confidence Intervals
          </div>
          {quarters.map((q) => (
            <div key={q.period} className="p23-inner-row p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">{q.period}</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300">
                  {q.confidencePercent}% confidence
                </span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-lg font-bold">
                  ${q.projectedUsd.toLocaleString("en-US")}{" "}
                  <span className="text-xs font-normal" style={{ color: "var(--p23-text-muted)" }}>
                    expected
                  </span>
                </span>
                <span className="text-xs" style={{ color: "var(--p23-text-secondary)" }}>
                  Band: ${q.lowerBoundUsd.toLocaleString("en-US")} – $
                  {q.upperBoundUsd.toLocaleString("en-US")}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full text-xs font-semibold p23-export-btn"
          >
            Close Forecast
          </button>
        </div>
      </div>
    </div>
  );
}

