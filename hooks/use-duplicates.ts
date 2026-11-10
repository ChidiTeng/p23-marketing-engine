"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  fetchDuplicateReviews,
  mergeDuplicateReview,
  keepBothDuplicateReview,
  dismissDuplicateReview,
} from "@/lib/api/duplicates";
import type { DuplicateReview } from "@/lib/api/contracts/duplicate";
import { toast } from "sonner";

export function useDuplicateReviews() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.duplicates.list(),
    queryFn: fetchDuplicateReviews,
  });

  const mergeMutation = useMutation({
    mutationFn: (id: number) => mergeDuplicateReview(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.duplicates.list() });
      const previousReviews = queryClient.getQueryData<DuplicateReview[]>(queryKeys.duplicates.list());

      if (previousReviews) {
        queryClient.setQueryData<DuplicateReview[]>(
          queryKeys.duplicates.list(),
          previousReviews.filter((r) => r.id !== id)
        );
      }

      return { previousReviews };
    },
    onError: (err, _id, context) => {
      if (context?.previousReviews) {
        queryClient.setQueryData(queryKeys.duplicates.list(), context.previousReviews);
      }
      toast.error(err instanceof Error ? err.message : "Failed to merge records");
    },
    onSuccess: (lead) => {
      toast.success(`Duplicate merged into existing deal "${lead.name}".`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.duplicates.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.crm.all });
    },
  });

  const keepBothMutation = useMutation({
    mutationFn: (id: number) => keepBothDuplicateReview(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.duplicates.list() });
      const previousReviews = queryClient.getQueryData<DuplicateReview[]>(queryKeys.duplicates.list());

      if (previousReviews) {
        queryClient.setQueryData<DuplicateReview[]>(
          queryKeys.duplicates.list(),
          previousReviews.filter((r) => r.id !== id)
        );
      }

      return { previousReviews };
    },
    onError: (err, _id, context) => {
      if (context?.previousReviews) {
        queryClient.setQueryData(queryKeys.duplicates.list(), context.previousReviews);
      }
      toast.error(err instanceof Error ? err.message : "Failed to save lead as separate");
    },
    onSuccess: (lead) => {
      const repName = lead.assignee?.name ? ` and assigned to ${lead.assignee.name} via Round-Robin` : "";
      toast.success(`New separate lead "${lead.name}" created${repName}.`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.duplicates.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.crm.all });
    },
  });

  const dismissMutation = useMutation({
    mutationFn: (id: number) => dismissDuplicateReview(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.duplicates.list() });
      const previousReviews = queryClient.getQueryData<DuplicateReview[]>(queryKeys.duplicates.list());

      if (previousReviews) {
        queryClient.setQueryData<DuplicateReview[]>(
          queryKeys.duplicates.list(),
          previousReviews.filter((r) => r.id !== id)
        );
      }

      return { previousReviews };
    },
    onError: (err, _id, context) => {
      if (context?.previousReviews) {
        queryClient.setQueryData(queryKeys.duplicates.list(), context.previousReviews);
      }
      toast.error(err instanceof Error ? err.message : "Failed to dismiss alert");
    },
    onSuccess: () => {
      toast.success("Duplicate alert dismissed.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.duplicates.all });
    },
  });

  return {
    reviews: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    mergeDuplicate: mergeMutation.mutateAsync,
    isMerging: mergeMutation.isPending,
    keepBothDuplicate: keepBothMutation.mutateAsync,
    isKeepingBoth: keepBothMutation.isPending,
    dismissDuplicate: dismissMutation.mutateAsync,
    isDismissing: dismissMutation.isPending,
  };
}

