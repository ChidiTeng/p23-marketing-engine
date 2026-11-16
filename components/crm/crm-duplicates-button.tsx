"use client";

import Link from "next/link";
import { GitMerge } from "lucide-react";
import { useDuplicateReviews } from "@/hooks/use-duplicates";
import { useCurrentUser } from "@/hooks/use-current-user";

/**
 * Shared Duplicates Review Queue toolbar CTA used across CRM views
 * (/crm board and /crm/leads list).
 */
export function CrmDuplicatesButton() {
  const { isAdminOrOwner } = useCurrentUser();
  const { reviews } = useDuplicateReviews();

  if (!isAdminOrOwner) {
    return null;
  }

  const pendingCount = reviews.length;

  return (
    <Link
      href="/duplicates"
      data-testid="crm-duplicates-btn"
      className="se-control flex items-center gap-2 px-3 py-2 border border-gray-200 bg-white rounded-[10px] text-[12px] font-medium text-gray-600 hover:border-gray-300 hover:text-[#0B1215] transition-all shadow-sm"
      title={
        pendingCount > 0
          ? `${pendingCount} duplicate collision${pendingCount === 1 ? "" : "s"} pending review`
          : "Review duplicate lead collisions"
      }
    >
      <GitMerge size={13} className="shrink-0" />
      <span>Duplicates</span>
      {pendingCount > 0 && (
        <span
          data-testid="crm-duplicates-badge"
          className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full bg-amber-500/15 text-amber-700 border border-amber-500/30 text-[10px] font-bold leading-none tabular-nums"
        >
          {pendingCount}
        </span>
      )}
    </Link>
  );
}

