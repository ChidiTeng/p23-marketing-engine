"use client";

import {
  buildExecutiveDashboardData,
  type DashboardTimeRange,
  type ExecutiveDashboardData,
  type RevenueTimeframe,
} from "@/lib/api/contracts/executive-dashboard";
import { SALES_ENGINE_API_BASE_URL } from "@/lib/api/sales-engine";
import { getAuthTokenFromDocument } from "@/lib/auth/session";
import { getSalesEngineToken } from "@/lib/sales-engine/session";
import { useQuery } from "@tanstack/react-query";

export function useExecutiveDashboard(
  range: DashboardTimeRange = "30d",
  revPeriod: RevenueTimeframe = "30D"
) {
  return useQuery<ExecutiveDashboardData>({
    queryKey: ["executive-dashboard", range, revPeriod],
    queryFn: async () => {
      try {
        const token = getSalesEngineToken() || getAuthTokenFromDocument();
        const res = await fetch(
          `${SALES_ENGINE_API_BASE_URL}/dashboard/executive?range=${range}&revPeriod=${revPeriod}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );
        if (!res.ok) {
          return buildExecutiveDashboardData({ range, revPeriod });
        }
        const json = (await res.json()) as {
          success?: boolean;
          data?: ExecutiveDashboardData;
        };
        if (json?.data) {
          return json.data;
        }
        return buildExecutiveDashboardData({ range, revPeriod });
      } catch {
        return buildExecutiveDashboardData({ range, revPeriod });
      }
    },
    placeholderData: () => buildExecutiveDashboardData({ range, revPeriod }),
  });
}
