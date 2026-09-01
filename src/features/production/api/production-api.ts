import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiGetList, apiPost } from "@/shared/api/api-client";
import { ENDPOINTS } from "@/shared/api/endpoints";
import { queryKeys } from "@/lib/query-keys";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type { Production, ProductionListParams } from "../types";
import type { ProductionCreateInput } from "../schemas/production-schema";

export function useProductions(params?: ProductionListParams) {
    return useQuery<PaginatedResponse<Production>>({
        queryKey: queryKeys.productions.list(params),
        queryFn: async () => {
            const queryParams: Record<string, string | number> = {};
            if (params?.page) queryParams.page = params.page;
            if (params?.per_page) queryParams.per_page = params.per_page;
            if (params?.dari) queryParams.dari = params.dari;
            if (params?.sampai) queryParams.sampai = params.sampai;
            if (params?.q) queryParams.q = params.q;
            if (params?.status && params.status !== "all") queryParams.status = params.status;

            return apiGetList<Production>(ENDPOINTS.PRODUCTION.LIST, queryParams);
        },
    });
}

export function useProductionDetail(uid: string | null | undefined) {
    return useQuery<ApiResponse<Production> | null>({
        queryKey: queryKeys.productions.detail(uid || ""),
        queryFn: async () => {
            if (!uid) return null;
            return apiGet<ApiResponse<Production>>(ENDPOINTS.PRODUCTION.DETAIL(uid));
        },
        enabled: Boolean(uid),
    });
}

export function useCreateProduction() {
    const queryClient = useQueryClient();

    return useMutation<ApiResponse<Production>, Error, ProductionCreateInput>({
        mutationFn: async (data: ProductionCreateInput) => {
            return apiPost<ApiResponse<Production>, ProductionCreateInput>(
                ENDPOINTS.PRODUCTION.CREATE,
                data
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.productions.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
        },
    });
}
