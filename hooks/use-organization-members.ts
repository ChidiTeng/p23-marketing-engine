"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  fetchOrganizationMembers,
  suspendOrganizationMember,
  reactivateOrganizationMember,
  updateOrganizationMemberRole,
  removeOrganizationMember,
  fetchOrganizationInvitations,
  createOrganizationInvitation,
  resendOrganizationInvitation,
  revokeOrganizationInvitation,
} from "@/lib/api/organization-members";
import type { Member, MemberRole, SuspendPayload } from "@/lib/api/contracts/member";
import type { Invitation, CreateInvitationPayload } from "@/lib/api/contracts/invitation";
import { toast } from "sonner";

export function useOrganizationMembers() {
  const queryClient = useQueryClient();

  const membersQuery = useQuery({
    queryKey: queryKeys.members.list(),
    queryFn: fetchOrganizationMembers,
  });

  const suspendMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: SuspendPayload }) =>
      suspendOrganizationMember(id, payload),
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.members.list() });
      const previousMembers = queryClient.getQueryData<Member[]>(queryKeys.members.list());

      if (previousMembers) {
        queryClient.setQueryData<Member[]>(
          queryKeys.members.list(),
          previousMembers.map((m) =>
            m.id === id
              ? {
                  ...m,
                  status: "suspended",
                  suspended_at: new Date().toISOString(),
                  suspended_reason: payload.reason,
                  suspended_until: payload.suspended_until ?? null,
                }
              : m
          )
        );
      }

      return { previousMembers };
    },
    onError: (err, _variables, context) => {
      if (context?.previousMembers) {
        queryClient.setQueryData(queryKeys.members.list(), context.previousMembers);
      }
      toast.error(err instanceof Error ? err.message : "Failed to suspend member");
    },
    onSuccess: (data) => {
      toast.success(`${data.name} has been suspended.`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.members.all });
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: (id: number) => reactivateMemberWrapper(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.members.list() });
      const previousMembers = queryClient.getQueryData<Member[]>(queryKeys.members.list());

      if (previousMembers) {
        queryClient.setQueryData<Member[]>(
          queryKeys.members.list(),
          previousMembers.map((m) =>
            m.id === id
              ? {
                  ...m,
                  status: "active",
                  suspended_at: null,
                  suspended_until: null,
                  suspended_reason: null,
                }
              : m
          )
        );
      }

      return { previousMembers };
    },
    onError: (err, _variables, context) => {
      if (context?.previousMembers) {
        queryClient.setQueryData(queryKeys.members.list(), context.previousMembers);
      }
      toast.error(err instanceof Error ? err.message : "Failed to reactivate member");
    },
    onSuccess: (data) => {
      toast.success(`${data.name} has been reactivated.`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.members.all });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: number; role: MemberRole }) =>
      updateOrganizationMemberRole(id, role),
    onMutate: async ({ id, role }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.members.list() });
      const previousMembers = queryClient.getQueryData<Member[]>(queryKeys.members.list());

      if (previousMembers) {
        queryClient.setQueryData<Member[]>(
          queryKeys.members.list(),
          previousMembers.map((m) => (m.id === id ? { ...m, role } : m))
        );
      }

      return { previousMembers };
    },
    onError: (err, _variables, context) => {
      if (context?.previousMembers) {
        queryClient.setQueryData(queryKeys.members.list(), context.previousMembers);
      }
      toast.error(err instanceof Error ? err.message : "Failed to update member role");
    },
    onSuccess: (data) => {
      toast.success(`Role updated to ${data.role} for ${data.name}.`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.members.all });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: number) => removeOrganizationMember(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.members.list() });
      const previousMembers = queryClient.getQueryData<Member[]>(queryKeys.members.list());

      if (previousMembers) {
        queryClient.setQueryData<Member[]>(
          queryKeys.members.list(),
          previousMembers.filter((m) => m.id !== id)
        );
      }

      return { previousMembers };
    },
    onError: (err, _variables, context) => {
      if (context?.previousMembers) {
        queryClient.setQueryData(queryKeys.members.list(), context.previousMembers);
      }
      toast.error(err instanceof Error ? err.message : "Failed to remove member");
    },
    onSuccess: () => {
      toast.success("Member removed from organization.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.members.all });
    },
  });

  return {
    members: membersQuery.data ?? [],
    isLoading: membersQuery.isLoading,
    isError: membersQuery.isError,
    error: membersQuery.error,
    refetch: membersQuery.refetch,
    suspendMember: suspendMutation.mutateAsync,
    isSuspending: suspendMutation.isPending,
    reactivateMember: reactivateMutation.mutateAsync,
    isReactivating: reactivateMutation.isPending,
    updateRole: updateRoleMutation.mutateAsync,
    isUpdatingRole: updateRoleMutation.isPending,
    removeMember: removeMutation.mutateAsync,
    isRemoving: removeMutation.isPending,
  };
}

async function reactivateMemberWrapper(id: number): Promise<Member> {
  return reactivateOrganizationMember(id);
}

export function useOrganizationInvitations() {
  const queryClient = useQueryClient();

  const invitationsQuery = useQuery({
    queryKey: queryKeys.invitations.list(),
    queryFn: fetchOrganizationInvitations,
  });

  const inviteMutation = useMutation({
    mutationFn: (payload: CreateInvitationPayload) => createOrganizationInvitation(payload),
    onSuccess: (data) => {
      toast.success(`Invitation sent to ${data.email}.`);
      queryClient.invalidateQueries({ queryKey: queryKeys.invitations.all });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to send invitation");
    },
  });

  const resendMutation = useMutation({
    mutationFn: (id: number) => resendOrganizationInvitation(id),
    onSuccess: (data) => {
      toast.success(`Invitation resent to ${data.email}.`);
      queryClient.invalidateQueries({ queryKey: queryKeys.invitations.all });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to resend invitation");
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (id: number) => revokeOrganizationInvitation(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.invitations.list() });
      const prev = queryClient.getQueryData<Invitation[]>(queryKeys.invitations.list());
      if (prev) {
        queryClient.setQueryData<Invitation[]>(
          queryKeys.invitations.list(),
          prev.filter((inv) => inv.id !== id)
        );
      }
      return { prev };
    },
    onError: (err, _variables, context) => {
      if (context?.prev) {
        queryClient.setQueryData(queryKeys.invitations.list(), context.prev);
      }
      toast.error(err instanceof Error ? err.message : "Failed to revoke invitation");
    },
    onSuccess: () => {
      toast.success("Invitation revoked.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invitations.all });
    },
  });

  return {
    invitations: invitationsQuery.data ?? [],
    isLoading: invitationsQuery.isLoading,
    isError: invitationsQuery.isError,
    error: invitationsQuery.error,
    refetch: invitationsQuery.refetch,
    inviteUser: inviteMutation.mutateAsync,
    isInviting: inviteMutation.isPending,
    resendInvitation: resendMutation.mutateAsync,
    isResending: resendMutation.isPending,
    revokeInvitation: revokeMutation.mutateAsync,
    isRevoking: revokeMutation.isPending,
  };
}

