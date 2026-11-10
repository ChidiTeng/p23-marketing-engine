"use client";

import React, { useState } from "react";
import { X, AlertTriangle, Calendar, Clock, Ban, Loader2 } from "lucide-react";
import type { Member, SuspendPayload, SuspendType } from "@/lib/api/contracts/member";

type Props = {
  member: Member | null;
  isOpen: boolean;
  onClose: () => void;
  onSuspend: (payload: SuspendPayload) => Promise<unknown>;
};

export function SuspendMemberModal({ member, isOpen, onClose, onSuspend }: Props) {
  const [suspendType, setSuspendType] = useState<SuspendType>("duration");
  const [durationDays, setDurationDays] = useState<number>(7);
  const [untilDate, setUntilDate] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !member) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Please provide a reason for suspension");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const payload: SuspendPayload = {
        suspend_type: suspendType,
        reason: reason.trim(),
        duration_days: suspendType === "duration" ? durationDays : undefined,
        suspended_until:
          suspendType === "date"
            ? new Date(untilDate).toISOString()
            : suspendType === "duration"
            ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString()
            : undefined,
      };

      await onSuspend(payload);
      setReason("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to suspend member");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="um-modal-overlay" role="dialog" aria-modal="true">
      <div className="um-modal-box">
        <div className="um-modal-header">
          <div className="flex items-center gap-2 text-amber-400">
            <AlertTriangle size={18} />
            <h3 className="text-white">Suspend {member.name}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="um-modal-close-btn"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="um-modal-body space-y-4">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-200">
              Suspended members will immediately lose system access and will automatically be skipped by round-robin lead assignment.
            </div>

            {error && (
              <div className="p-3 text-xs text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-2">
                Suspension Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSuspendType("duration")}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium gap-1.5 transition-all ${
                    suspendType === "duration"
                      ? "border-[#2ae9c9] bg-[#2ae9c9]/10 text-[#2ae9c9]"
                      : "border-white/10 text-white/60 hover:border-white/20"
                  }`}
                >
                  <Clock size={16} />
                  Duration
                </button>
                <button
                  type="button"
                  onClick={() => setSuspendType("date")}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium gap-1.5 transition-all ${
                    suspendType === "date"
                      ? "border-[#2ae9c9] bg-[#2ae9c9]/10 text-[#2ae9c9]"
                      : "border-white/10 text-white/60 hover:border-white/20"
                  }`}
                >
                  <Calendar size={16} />
                  Fixed Date
                </button>
                <button
                  type="button"
                  onClick={() => setSuspendType("permanent")}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium gap-1.5 transition-all ${
                    suspendType === "permanent"
                      ? "border-red-400 bg-red-500/10 text-red-400"
                      : "border-white/10 text-white/60 hover:border-white/20"
                  }`}
                >
                  <Ban size={16} />
                  Indefinite
                </button>
              </div>
            </div>

            {suspendType === "duration" && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5">
                  Duration (Days)
                </label>
                <select
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  className="w-full bg-[#022228]/60 border border-white/10 rounded-xl py-2.5 px-3 text-white text-sm focus:outline-none focus:border-[#2ae9c9] cursor-pointer"
                >
                  <option value={7} className="bg-[#0d2d3a]">7 Days</option>
                  <option value={14} className="bg-[#0d2d3a]">14 Days</option>
                  <option value={30} className="bg-[#0d2d3a]">30 Days</option>
                  <option value={60} className="bg-[#0d2d3a]">60 Days</option>
                  <option value={90} className="bg-[#0d2d3a]">90 Days</option>
                </select>
              </div>
            )}

            {suspendType === "date" && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5">
                  Suspend Until
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split("T")[0]}
                  value={untilDate}
                  onChange={(e) => setUntilDate(e.target.value)}
                  className="w-full bg-[#022228]/60 border border-white/10 rounded-xl py-2.5 px-3 text-white text-sm focus:outline-none focus:border-[#2ae9c9]"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5">
                Reason for Suspension
              </label>
              <textarea
                required
                rows={3}
                placeholder="e.g. Extended leave of absence, policy violation..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-[#022228]/60 border border-white/10 rounded-xl p-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#2ae9c9] resize-none"
              />
            </div>
          </div>

          <div className="um-modal-footer">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="um-btn-ghost"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="um-btn-danger flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Suspending...
                </>
              ) : (
                "Confirm Suspension"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

