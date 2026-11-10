"use client";

import React, { useState } from "react";
import { X, Shield, Loader2 } from "lucide-react";
import type { Member, MemberRole } from "@/lib/api/contracts/member";

type Props = {
  member: Member | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateRole: (role: MemberRole) => Promise<unknown>;
};

export function ChangeRoleModal({ member, isOpen, onClose, onUpdateRole }: Props) {
  const [role, setRole] = useState<MemberRole>(member?.role ?? "member");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state if member changes
  React.useEffect(() => {
    if (member) setRole(member.role);
  }, [member]);

  if (!isOpen || !member) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (role === member?.role) {
      onClose();
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onUpdateRole(role);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change role");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="um-modal-overlay" role="dialog" aria-modal="true">
      <div className="um-modal-box">
        <div className="um-modal-header">
          <h3>Change Role for {member.name}</h3>
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
            {error && (
              <div className="p-3 text-xs text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-2">
                Select System Role
              </label>

              <div className="space-y-2">
                <label
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    role === "member"
                      ? "border-[#2ae9c9] bg-[#2ae9c9]/10"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="member"
                    checked={role === "member"}
                    onChange={() => setRole("member")}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-semibold text-sm text-white">Member (Sales Representative)</div>
                    <div className="text-xs text-white/60">
                      Can capture leads, access assigned pipeline deals, and use discovery tools.
                    </div>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    role === "admin"
                      ? "border-[#2ae9c9] bg-[#2ae9c9]/10"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={role === "admin"}
                    onChange={() => setRole("admin")}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-semibold text-sm text-white">Administrator</div>
                    <div className="text-xs text-white/60">
                      Full access to Analytics, User Management, Round-Robin configuration, and Duplicate Lead review.
                    </div>
                  </div>
                </label>
              </div>
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
              className="um-primary-btn"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Updating...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

