"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import {
  Users,
  UserCheck,
  UserX,
  Mail,
  UserPlus,
  Search,
  MoreVertical,
  RotateCcw,
  Ban,
  Shield,
  Trash2,
  CheckCircle,
  Clock,
  Send,
  Loader2,
} from "lucide-react";
import "./user-management.css";
import { useOrganizationMembers, useOrganizationInvitations } from "@/hooks/use-organization-members";
import { useCurrentUser } from "@/hooks/use-current-user";
import type { Member, MemberRole, SuspendPayload } from "@/lib/api/contracts/member";
import type { CreateInvitationPayload } from "@/lib/api/contracts/invitation";
import { InviteUserModal } from "./invite-user-modal";
import { SuspendMemberModal } from "./suspend-member-modal";
import { ChangeRoleModal } from "./change-role-modal";
import { resolveAvatarSrc } from "@/lib/avatar";

export function UserManagementView() {
  const {
    members,
    isLoading: isLoadingMembers,
    suspendMember,
    reactivateMember,
    updateRole,
    removeMember,
  } = useOrganizationMembers();

  const {
    invitations,
    isLoading: isLoadingInvitations,
    inviteUser,
    resendInvitation,
    revokeInvitation,
  } = useOrganizationInvitations();

  const { user: currentUser } = useCurrentUser();

  // State
  const [activeTab, setActiveTab] = useState<"members" | "invitations">("members");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeActionMenuId, setActiveActionMenuId] = useState<number | null>(null);

  // Modals state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedMemberForSuspend, setSelectedMemberForSuspend] = useState<Member | null>(null);
  const [selectedMemberForRole, setSelectedMemberForRole] = useState<Member | null>(null);
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);

  // Summary Metrics
  const totalMembers = members.length;
  const activeReps = members.filter((m) => m.role === "member" && m.status === "active").length;
  const suspendedMembers = members.filter((m) => m.status === "suspended").length;
  const pendingInvites = invitations.filter((i) => i.status === "pending").length;

  // Filtered Members
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === "all" || m.role === roleFilter;
      const matchesStatus = statusFilter === "all" || m.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [members, searchQuery, roleFilter, statusFilter]);

  // Handlers
  async function handleSuspend(payload: SuspendPayload) {
    if (!selectedMemberForSuspend) return;
    await suspendMember({ id: selectedMemberForSuspend.id, payload });
    setSelectedMemberForSuspend(null);
  }

  async function handleUpdateRole(role: MemberRole) {
    if (!selectedMemberForRole) return;
    await updateRole({ id: selectedMemberForRole.id, role });
    setSelectedMemberForRole(null);
  }

  async function handleReactivate(member: Member) {
    setActiveActionMenuId(null);
    await reactivateMember(member.id);
  }

  async function handleConfirmRemove() {
    if (!memberToRemove) return;
    await removeMember(memberToRemove.id);
    setMemberToRemove(null);
  }

  return (
    <div className="um-page">
      {/* Heading */}
      <div className="um-heading">
        <div>
          <div className="um-heading-badge">
            <Shield size={12} />
            <span>P23 Team & Access Control</span>
          </div>
          <h1>User Management</h1>
          <p>Manage team members, roles, round-robin lead allocation, and invitations.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsInviteModalOpen(true)}
          className="um-primary-btn"
        >
          <UserPlus size={16} />
          Invite Team Member
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="um-summary-grid">
        <div className="um-summary-card">
          <span>
            <Users size={16} className="text-[#2ae9c9]" />
            Total Team
          </span>
          <strong>{totalMembers}</strong>
        </div>
        <div className="um-summary-card">
          <span>
            <UserCheck size={16} className="text-emerald-400" />
            Active Sales Reps
          </span>
          <strong>{activeReps}</strong>
        </div>
        <div className="um-summary-card">
          <span>
            <UserX size={16} className="text-rose-400" />
            Suspended
          </span>
          <strong>{suspendedMembers}</strong>
        </div>
        <div className="um-summary-card">
          <span>
            <Mail size={16} className="text-amber-400" />
            Pending Invitations
          </span>
          <strong>{pendingInvites}</strong>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="um-tabs">
        <button
          type="button"
          onClick={() => setActiveTab("members")}
          className={`um-tab ${activeTab === "members" ? "is-active" : ""}`}
        >
          <Users size={16} />
          Team Members
          <span className="um-tab-badge">{members.length}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("invitations")}
          className={`um-tab ${activeTab === "invitations" ? "is-active" : ""}`}
        >
          <Mail size={16} />
          Pending Invitations
          <span className="um-tab-badge">{invitations.length}</span>
        </button>
      </div>

      {/* Tab 1: Members */}
      {activeTab === "members" && (
        <>
          {/* Toolbar */}
          <div className="um-toolbar">
            <div className="um-search-wrap">
              <Search size={16} className="um-search-icon" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="um-search-input"
              />
            </div>

            <div className="um-filters">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="um-select"
              >
                <option value="all">All Roles</option>
                <option value="owner">Owner</option>
                <option value="admin">Admin</option>
                <option value="member">Member</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="um-select"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          {/* Members Table */}
          <div className="um-table-card">
            {isLoadingMembers ? (
              <div className="p-12 flex flex-col items-center justify-center gap-3 text-white/50">
                <Loader2 size={24} className="animate-spin text-[#2ae9c9]" />
                <span>Loading team members...</span>
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="p-12 text-center text-white/50">
                No team members found matching your search.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="um-table">
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Round-Robin</th>
                      <th>Joined</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.map((member) => {
                      const isSelf = currentUser?.id === member.id;
                      const isOwner = member.role === "owner";
                      const isSuspended = member.status === "suspended";
                      const menuOpen = activeActionMenuId === member.id;

                      return (
                        <tr key={member.id}>
                          <td>
                            <div className="um-user-cell">
                              <div className="um-avatar">
                                {member.avatar_url ? (
                                  <Image
                                    src={resolveAvatarSrc(member.avatar_url)}
                                    alt={member.name}
                                    width={36}
                                    height={36}
                                    className="w-full h-full object-cover"
                                    unoptimized
                                  />
                                ) : (
                                  member.name.charAt(0).toUpperCase()
                                )}
                              </div>
                              <div className="um-user-info">
                                <p className="flex items-center gap-2">
                                  {member.name}
                                  {isSelf && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/70">
                                      You
                                    </span>
                                  )}
                                </p>
                                <span>{member.email}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`um-role-badge is-${member.role}`}>
                              {member.role}
                            </span>
                          </td>
                          <td>
                            <div className="flex flex-col gap-0.5">
                              <span className={`um-status-badge is-${member.status}`}>
                                <span className="um-status-dot" />
                                {isSuspended ? "Suspended" : "Active"}
                              </span>
                              {isSuspended && member.suspended_reason && (
                                <span className="text-[11px] text-red-300/80 max-w-xs truncate" title={member.suspended_reason}>
                                  {member.suspended_reason}
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            {member.role === "member" ? (
                              isSuspended ? (
                                <span className="um-rr-badge um-rr-skipped">
                                  <Ban size={12} />
                                  Skipped
                                </span>
                              ) : (
                                <span className="um-rr-badge um-rr-active">
                                  <CheckCircle size={12} />
                                  Active in Pool
                                </span>
                              )
                            ) : (
                              <span className="um-rr-excluded">Excluded</span>
                            )}
                          </td>
                          <td className="text-xs text-white/50">
                            {new Date(member.created_at).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                          <td className="text-right relative">
                            {isOwner ? (
                              <span className="text-xs text-white/30 italic pr-3">Protected</span>
                            ) : (
                              <div className="inline-block text-left">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setActiveActionMenuId(menuOpen ? null : member.id)
                                  }
                                  className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                                  aria-label="Actions"
                                >
                                  <MoreVertical size={16} />
                                </button>

                                {menuOpen && (
                                  <>
                                    <div
                                      className="fixed inset-0 z-30"
                                      onClick={() => setActiveActionMenuId(null)}
                                    />
                                    <div className="absolute right-0 top-full mt-1 w-44 bg-[#0d2d3a] border border-white/10 rounded-xl shadow-xl z-40 py-1.5 overflow-hidden">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setActiveActionMenuId(null);
                                          setSelectedMemberForRole(member);
                                        }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                                      >
                                        <Shield size={14} />
                                        Change Role
                                      </button>

                                      {isSuspended ? (
                                        <button
                                          type="button"
                                          onClick={() => handleReactivate(member)}
                                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors"
                                        >
                                          <RotateCcw size={14} />
                                          Reactivate
                                        </button>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setActiveActionMenuId(null);
                                            setSelectedMemberForSuspend(member);
                                          }}
                                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors"
                                        >
                                          <Ban size={14} />
                                          Suspend
                                        </button>
                                      )}

                                      <div className="my-1 border-t border-white/10" />

                                      <button
                                        type="button"
                                        onClick={() => {
                                          setActiveActionMenuId(null);
                                          setMemberToRemove(member);
                                        }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                                      >
                                        <Trash2 size={14} />
                                        Remove Member
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Tab 2: Invitations */}
      {activeTab === "invitations" && (
        <div className="um-table-card">
          {isLoadingInvitations ? (
            <div className="p-12 flex flex-col items-center justify-center gap-3 text-white/50">
              <Loader2 size={24} className="animate-spin text-[#2ae9c9]" />
              <span>Loading invitations...</span>
            </div>
          ) : invitations.length === 0 ? (
            <div className="p-12 text-center text-white/50">
              No pending invitations. Click &ldquo;Invite Team Member&rdquo; to invite someone.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="um-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Invited Role</th>
                    <th>Status</th>
                    <th>Sent At</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invitations.map((inv) => (
                    <tr key={inv.id}>
                      <td className="font-semibold text-white">
                        <div className="flex items-center gap-2.5">
                          <Mail size={16} className="text-white/40" />
                          {inv.email}
                        </div>
                      </td>
                      <td>
                        <span className={`um-role-badge is-${inv.role}`}>{inv.role}</span>
                      </td>
                      <td>
                        <span className="um-status-badge is-pending">
                          <span className="um-status-dot" />
                          Pending
                        </span>
                      </td>
                      <td className="text-xs text-white/50">
                        {new Date(inv.created_at).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => resendInvitation(inv.id)}
                          className="um-btn-ghost py-1 px-2.5 text-xs inline-flex items-center gap-1.5"
                        >
                          <Send size={12} />
                          Resend
                        </button>
                        <button
                          type="button"
                          onClick={() => revokeInvitation(inv.id)}
                          className="py-1 px-2.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                        >
                          Revoke
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <InviteUserModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onInvite={(payload: CreateInvitationPayload) => inviteUser(payload)}
      />

      <SuspendMemberModal
        member={selectedMemberForSuspend}
        isOpen={!!selectedMemberForSuspend}
        onClose={() => setSelectedMemberForSuspend(null)}
        onSuspend={handleSuspend}
      />

      <ChangeRoleModal
        member={selectedMemberForRole}
        isOpen={!!selectedMemberForRole}
        onClose={() => setSelectedMemberForRole(null)}
        onUpdateRole={handleUpdateRole}
      />

      {/* Remove Confirmation Dialog */}
      {memberToRemove && (
        <div className="um-modal-overlay" role="dialog" aria-modal="true">
          <div className="um-modal-box">
            <div className="um-modal-header">
              <h3 className="text-red-400 flex items-center gap-2">
                <Trash2 size={18} />
                Remove {memberToRemove.name}?
              </h3>
            </div>
            <div className="um-modal-body">
              <p className="text-white/80 text-sm">
                Are you sure you want to remove <strong>{memberToRemove.name}</strong> ({memberToRemove.email}) from the organization? This will revoke their access to P23 Marketing Engine.
              </p>
            </div>
            <div className="um-modal-footer">
              <button
                type="button"
                onClick={() => setMemberToRemove(null)}
                className="um-btn-ghost"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRemove}
                className="um-btn-danger"
              >
                Confirm Removal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

