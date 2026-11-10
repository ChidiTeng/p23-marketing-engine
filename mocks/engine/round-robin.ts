import type { Member } from "@/lib/api/contracts/member";

export function pickNextRep(reps: Member[], lastAssignedId: number | null): number | null {
  const active = reps
    .filter((m) => m.role === "member" && m.status === "active")
    .sort((a, b) => a.id - b.id);

  if (active.length === 0) return null;

  const lastIndex = active.findIndex((m) => m.id === lastAssignedId);
  return active[(lastIndex + 1) % active.length].id;
}
