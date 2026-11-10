"use client";

import React, { useState } from "react";
import { X, Mail, Shield, Loader2 } from "lucide-react";
import type { CreateInvitationPayload } from "@/lib/api/contracts/invitation";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (payload: CreateInvitationPayload) => Promise<unknown>;
};

export function InviteUserModal({ isOpen, onClose, onInvite }: Props) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "member">("member");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onInvite({ email, role });
      setEmail("");
      setRole("member");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send invitation");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="um-modal-overlay" role="dialog" aria-modal="true">
      <div className="um-modal-box">
        <div className="um-modal-header">
          <h3>Invite Team Member</h3>
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
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
                />
                <input
                  type="email"
                  required
                  placeholder="colleague@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#022228]/60 border border-white/10 rounded-xl py-2.5 pl-10 pr-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#2ae9c9]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5">
                Access Role
              </label>
              <div className="relative">
                <Shield
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
                />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as "admin" | "member")}
                  className="w-full bg-[#022228]/60 border border-white/10 rounded-xl py-2.5 pl-10 pr-3 text-white text-sm focus:outline-none focus:border-[#2ae9c9] cursor-pointer"
                >
                  <option value="member" className="bg-[#0d2d3a]">Member (Sales Rep - Assigned leads only)</option>
                  <option value="admin" className="bg-[#0d2d3a]">Admin (Full workspace & lead oversight)</option>
                </select>
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
                  Sending...
                </>
              ) : (
                "Send Invitation"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

