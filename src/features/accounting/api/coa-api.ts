import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGetData, apiPost, apiPut, apiDelete } from "@/shared/api/api-client";
import { queryKeys } from "@/lib/query-keys";
import { ENDPOINTS } from "@/shared/api/endpoints";
import type { ApiResponse } from "@/types/api";
import type { ChartOfAccount, ChartOfAccountType } from "../types";
import type { CoaSchemaInput } from "../schemas/coa-schema";
import { normalizeCoaTree, normalizeCoaNode, flattenCoaTree } from "../constants/coa-constants";

// 1. Get Hierarchical Tree View
export function useChartOfAccounts() {
    return useQuery<ChartOfAccount[]>({
        queryKey: queryKeys.chartOfAccounts.tree(),
        queryFn: async () => {
            const data = await apiGetData<ChartOfAccount[]>(ENDPOINTS.CHART_OF_ACCOUNTS.LIST);
            return normalizeCoaTree(data);
        },
    });
}

export interface FlatChartOfAccountsParams {
    is_postable?: boolean;
}

// 2. Get Flat List of Accounts
export function useFlatChartOfAccounts(params?: FlatChartOfAccountsParams) {
    return useQuery<ChartOfAccount[]>({
        queryKey: queryKeys.chartOfAccounts.flat(params),
        queryFn: async () => {
            try {
                const queryParams: Record<string, unknown> = {};
                if (params?.is_postable !== undefined) {
                    queryParams.is_postable = params.is_postable;
                }
                const data = await apiGetData<ChartOfAccount[]>(ENDPOINTS.CHART_OF_ACCOUNTS.FLAT, {
                    params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
                });
                if (Array.isArray(data) && data.length > 0) {
                    const normalized = data.map(normalizeCoaNode);
                    if (params?.is_postable !== undefined) {
                        return normalized.filter((a) =>
                            params.is_postable ? a.is_postable !== false : a.is_postable === false
                        );
                    }
                    return normalized;
                }
            } catch {
                // If backend does not support /flat, fallback to flattening the tree response
            }
            const treeData = await apiGetData<ChartOfAccount[]>(ENDPOINTS.CHART_OF_ACCOUNTS.LIST);
            const flatList = flattenCoaTree(normalizeCoaTree(treeData));
            if (params?.is_postable !== undefined) {
                return flatList.filter((a) =>
                    params.is_postable ? a.is_postable !== false : a.is_postable === false
                );
            }
            return flatList;
        },
    });
}

// 3. Get Accounts by Type
export function useChartOfAccountsByType(type: ChartOfAccountType) {
    return useQuery<ChartOfAccount[]>({
        queryKey: queryKeys.chartOfAccounts.byType(type),
        queryFn: async () => {
            const data = await apiGetData<ChartOfAccount[]>(ENDPOINTS.CHART_OF_ACCOUNTS.BY_TYPE(type));
            return normalizeCoaTree(data);
        },
    });
}

// 4. Get Account Detail
export function useChartOfAccountDetail(uid: string | null) {
    return useQuery<ChartOfAccount>({
        queryKey: queryKeys.chartOfAccounts.detail(uid || ""),
        queryFn: async () => {
            const data = await apiGetData<ChartOfAccount>(ENDPOINTS.CHART_OF_ACCOUNTS.DETAIL(uid || ""));
            return normalizeCoaNode(data);
        },
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
