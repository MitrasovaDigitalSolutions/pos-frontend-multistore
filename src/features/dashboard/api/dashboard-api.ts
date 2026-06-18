import { queryKeys } from "@/lib/query-keys";
import { apiGetData, apiGet } from "@/shared/api/api-client";
import { useQuery } from "@tanstack/react-query";
import type { DashboardSummary, DashboardSummaryParams, Sale, SalesHistoryItem } from "../types";

export function useDashboardSummary(params?: DashboardSummaryParams) {
    return useQuery<DashboardSummary>({
        queryKey: [...queryKeys.dashboard.summary(), params],
        queryFn: () => apiGetData<DashboardSummary>("/v1/reports/summary", { params }),
    });
}

export function useSalesHistory(params?: DashboardSummaryParams) {
    return useQuery<SalesHistoryItem[]>({
        queryKey: [...queryKeys.dashboard.summary(), "history", params],
        queryFn: async () => {
            try {
                return await apiGetData<SalesHistoryItem[]>("/v1/reports/chart-histories", { params });
            } catch {
                console.warn("API /v1/reports/chart-histories not implemented yet. Using frontend fallback.");
                return [];
            }
        },
    });
}

import type { PaginatedResponse } from "@/types/api";

export function useTransactions(params?: DashboardSummaryParams) {
    return useQuery<PaginatedResponse<Sale>>({
        queryKey: [...queryKeys.transactions.all, "list", params],
        queryFn: () => apiGet<PaginatedResponse<Sale>>("/v1/transactions", { params }),
    });
}
