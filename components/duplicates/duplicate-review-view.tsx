"use client";

import React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  GitMerge,
  Split,
  Trash2,
  CheckCircle2,
  User,
  Building,
  Phone,
  Mail,
  Compass,
  ArrowRight,
  Loader2,
} from "lucide-react";
import "./duplicate-review.css";
import { useDuplicateReviews } from "@/hooks/use-duplicates";

export function DuplicateReviewView() {
  const {
    reviews,
    isLoading,
    mergeDuplicate,
    isMerging,
    keepBothDuplicate,
    isKeepingBoth,
    dismissDuplicate,
    isDismissing,
  } = useDuplicateReviews();

  return (
    <div className="dr-page">
      {/* Heading */}
      <div className="dr-heading">
        <div>
          <h1>Duplicate Review Queue</h1>
          <p>Triage contact collisions and phone matches to keep your CRM database consolidated.</p>
        </div>

        {reviews.length > 0 && (
          <div className="dr-count-badge">
            <AlertTriangle size={15} />
            {reviews.length} {reviews.length === 1 ? "Collision Pending" : "Collisions Pending"}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3 text-white/50">
          <Loader2 size={28} className="animate-spin text-[#2ae9c9]" />
          <span>Scanning duplicate queue...</span>
        </div>
      ) : reviews.length === 0 ? (
        <div className="dr-empty-box">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Queue Clear</h3>
            <p className="text-white/60 text-sm max-w-md mx-auto">
              All incoming inquiries and duplicate candidates have been resolved. Your CRM records are fully unified.
            </p>
          </div>
          <Link
            href="/crm"
            className="dr-btn-primary mt-2"
          >
            Go to CRM Leads
            <ArrowRight size={15} />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => {
            const existing = review.existing_lead;
            const cand = review.candidate_lead;

            return (
              <div key={review.id} className="dr-card">
                {/* Collision Banner */}
                <div className="dr-card-header">
                  <div className="dr-collision-reason">
                    <AlertTriangle size={16} />
                    <span>{review.match_reason}</span>
                  </div>
                  <div className="dr-collision-time">
                    Detected {new Date(review.created_at).toLocaleString("en-GB", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </div>
                </div>

                {/* Split Comparison */}
                <div className="dr-comparison-grid">
                  {/* Left: Existing CRM Lead */}
                  <div className="dr-col dr-col-existing">
                    <div className="dr-col-title is-existing">
                      <Building size={16} />
                      Existing CRM Record #{existing?.id ?? review.existing_lead_id}
                    </div>

                    <div className="dr-field-group">
                      <div className="dr-field">
                        <span className="dr-field-label">Lead Name</span>
                        <span className="dr-field-value font-bold">{existing?.name ?? "—"}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="dr-field">
                          <span className="dr-field-label">Company</span>
                          <span className="dr-field-value">{existing?.company_name ?? "—"}</span>
                        </div>
                        <div className="dr-field">
                          <span className="dr-field-label">Position</span>
                          <span className="dr-field-value">{existing?.position ?? "—"}</span>
                        </div>
                      </div>

                      <div className="dr-field">
                        <span className="dr-field-label">Phone Collision</span>
                        <div className="mt-1">
                          <span className="dr-highlight-amber">
                            {existing?.phone || cand.phone || "—"}
                          </span>
                        </div>
                      </div>

                      <div className="dr-field">
                        <span className="dr-field-label">Email</span>
                        <span className="dr-field-value text-white/80">{existing?.email ?? "—"}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="dr-field">
                          <span className="dr-field-label">Assigned Rep</span>
                          <span className="dr-field-value text-emerald-400 font-semibold">
                            {existing?.assignee?.name ?? "Unassigned"}
                          </span>
                        </div>
                        <div className="dr-field">
                          <span className="dr-field-label">Acquisition Channel</span>
                          <span className="dr-field-value capitalize">{existing?.channel ?? existing?.source ?? "—"}</span>
                        </div>
                      </div>

                      {existing?.summary && (
                        <div className="dr-field">
                          <span className="dr-field-label">CRM Notes / Activity</span>
                          <p className="text-xs text-white/60 bg-black/20 p-2.5 rounded-lg border border-white/5 mt-1 line-clamp-3">
                            {existing.summary}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Incoming Candidate Submission */}
                  <div className="dr-col dr-col-candidate">
                    <div className="dr-col-title is-candidate">
                      <Compass size={16} />
                      Incoming Submission
                    </div>

                    <div className="dr-field-group">
                      <div className="dr-field">
                        <span className="dr-field-label">Candidate Name</span>
                        <span className="dr-field-value font-bold text-[#2ae9c9]">{cand.name}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="dr-field">
                          <span className="dr-field-label">Submitted Company</span>
                          <span className="dr-field-value">{cand.company_name ?? "—"}</span>
                        </div>
                        <div className="dr-field">
                          <span className="dr-field-label">Position</span>
                          <span className="dr-field-value">{cand.position ?? "—"}</span>
                        </div>
                      </div>

                      <div className="dr-field">
                        <span className="dr-field-label">Submitted Phone</span>
                        <div className="mt-1">
                          <span className="dr-highlight-amber">{cand.phone ?? "—"}</span>
                        </div>
                      </div>

                      <div className="dr-field">
                        <span className="dr-field-label">Submitted Email</span>
                        <div className="mt-1">
                          {cand.email && cand.email !== existing?.email ? (
                            <span className="dr-highlight-mint font-medium">{cand.email}</span>
                          ) : (
                            <span className="dr-field-value text-white/80">{cand.email ?? "—"}</span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="dr-field">
                          <span className="dr-field-label">Intake Method</span>
                          <span className="dr-field-value capitalize">{cand.capture_method}</span>
                        </div>
                        <div className="dr-field">
                          <span className="dr-field-label">Marketing Channel</span>
                          <span className="dr-field-value capitalize">{cand.channel}</span>
                        </div>
                      </div>

                      {cand.summary && (
                        <div className="dr-field">
                          <span className="dr-field-label">Submission Message / Summary</span>
                          <p className="text-xs text-white/70 bg-[#2ae9c9]/5 p-2.5 rounded-lg border border-[#2ae9c9]/15 mt-1 line-clamp-3">
                            {cand.summary}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Footer */}
                <div className="dr-card-footer">
                  <button
                    type="button"
                    onClick={() => dismissDuplicate(review.id)}
                    disabled={isDismissing}
                    className="dr-btn-ghost"
                  >
                    Dismiss Alert
                  </button>

                  <button
                    type="button"
                    onClick={() => keepBothDuplicate(review.id)}
                    disabled={isKeepingBoth}
                    className="dr-btn-secondary"
                  >
                    <Split size={15} />
                    Keep Both as Separate
                  </button>

                  <button
                    type="button"
                    onClick={() => mergeDuplicate(review.id)}
                    disabled={isMerging}
                    className="dr-btn-primary"
                  >
                    <GitMerge size={15} />
                    Merge into Existing
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

