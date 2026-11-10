export const queryKeys = {
  members: {
    all: ["members"] as const,
    list: () => [...queryKeys.members.all, "list"] as const,
  },
  invitations: {
    all: ["invitations"] as const,
    list: () => [...queryKeys.invitations.all, "list"] as const,
  },
  analytics: {
    all: ["analytics"] as const,
    overview: () => [...queryKeys.analytics.all, "overview"] as const,
    sources: (range?: { from: string; to: string }, touch: string = "first") =>
      [...queryKeys.analytics.all, "sources", range, touch] as const,
  },
  duplicates: {
    all: ["duplicates"] as const,
    list: () => [...queryKeys.duplicates.all, "list"] as const,
  },
  crm: {
    all: ["crm"] as const,
    leads: (filters?: Record<string, unknown>) => [...queryKeys.crm.all, "leads", filters] as const,
    lead: (id: number) => [...queryKeys.crm.all, "lead", id] as const,
    pipelines: () => [...queryKeys.crm.all, "pipelines"] as const,
    assignees: () => [...queryKeys.crm.all, "assignees"] as const,
  },
};
