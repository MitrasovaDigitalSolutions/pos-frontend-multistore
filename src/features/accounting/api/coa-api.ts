import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGetData, apiPost, apiPut, apiDelete } from "@/shared/api/api-client";
import { queryKeys } from "@/lib/query-keys";
import { ENDPOINTS } from "@/shared/api/endpoints";
import type { ApiResponse } from "@/types/api";
import type { ChartOfAccount, ChartOfAccountType } from "../types";
import type { CoaSchemaInput } from "../schemas/coa-schema";

// 1. Get Hierarchical Tree View
export function useChartOfAccounts() {
    return useQuery<ChartOfAccount[]>({
        queryKey: queryKeys.chartOfAccounts.tree(),
        queryFn: () => apiGetData<ChartOfAccount[]>(ENDPOINTS.CHART_OF_ACCOUNTS.LIST),
    });
}

// 2. Get Flat List of Accounts
export function useFlatChartOfAccounts() {
    return useQuery<ChartOfAccount[]>({
        queryKey: queryKeys.chartOfAccounts.flat(),
        queryFn: () => apiGetData<ChartOfAccount[]>(ENDPOINTS.CHART_OF_ACCOUNTS.FLAT),
    });
}

// 3. Get Accounts by Type
export function useChartOfAccountsByType(type: ChartOfAccountType) {
    return useQuery<ChartOfAccount[]>({
        queryKey: queryKeys.chartOfAccounts.byType(type),
        queryFn: () => apiGetData<ChartOfAccount[]>(ENDPOINTS.CHART_OF_ACCOUNTS.BY_TYPE(type)),
    });
}

// 4. Get Account Detail
export function useChartOfAccountDetail(uid: string | null) {
    return useQuery<ChartOfAccount>({
        queryKey: queryKeys.chartOfAccounts.detail(uid || ""),
        queryFn: () => apiGetData<ChartOfAccount>(ENDPOINTS.CHART_OF_ACCOUNTS.DETAIL(uid || "")),
        enabled: !!uid,
    });
}

// 5. Create Account Mutation
export function useCreateChartOfAccount() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<ChartOfAccount>, Error, CoaSchemaInput>({
        mutationFn: (data) =>
            apiPost<ApiResponse<ChartOfAccount>, CoaSchemaInput>(ENDPOINTS.CHART_OF_ACCOUNTS.CREATE, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.chartOfAccounts.all });
        },
    });
}

// 6. Update Account Mutation
export function useUpdateChartOfAccount() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<ChartOfAccount>, Error, { uid: string; data: CoaSchemaInput }>({
        mutationFn: ({ uid, data }) =>
            apiPut<ApiResponse<ChartOfAccount>, CoaSchemaInput>(ENDPOINTS.CHART_OF_ACCOUNTS.UPDATE(uid), data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.chartOfAccounts.all });
        },
    });
}

// 7. Delete Account Mutation
export function useDeleteChartOfAccount() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<void>, Error, string>({
        mutationFn: (uid) => apiDelete<ApiResponse<void>>(ENDPOINTS.CHART_OF_ACCOUNTS.DELETE(uid)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.chartOfAccounts.all });
        },
    });
}
