import { queryKeys } from "@/lib/query-keys";
import { apiGetData } from "@/shared/api/api-client";
import { useQuery } from "@tanstack/react-query";
import type { DashboardSummary } from "../types";

export function useDashboardSummary() {
    return useQuery<DashboardSummary>({
        queryKey: queryKeys.dashboard.summary(),
        queryFn: () => apiGetData<DashboardSummary>("/v1/reports/summary"),
    });
}
