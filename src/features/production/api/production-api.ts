import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiDelete, apiGet, apiGetList, apiPost, apiPut } from "@/shared/api/api-client";
import { ENDPOINTS } from "@/shared/api/endpoints";
import { queryKeys } from "@/lib/query-keys";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type {
    BomCalculateRequest,
    BomCalculateResponse,
    HppPreviewResponse,
    Production,
    ProductionFinalizeInput,
    ProductionListParams,
} from "../types";
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
            if (params?.dari_mulai) queryParams.dari_mulai = params.dari_mulai;
            if (params?.sampai_mulai) queryParams.sampai_mulai = params.sampai_mulai;
            if (params?.dari_selesai) queryParams.dari_selesai = params.dari_selesai;
            if (params?.sampai_selesai) queryParams.sampai_selesai = params.sampai_selesai;
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

export function useUpdateProduction() {
    const queryClient = useQueryClient();

    return useMutation<ApiResponse<Production>, Error, { uid: string; data: ProductionCreateInput }>({
        mutationFn: async ({ uid, data }) => {
            return apiPut<ApiResponse<Production>, ProductionCreateInput>(
                ENDPOINTS.PRODUCTION.UPDATE(uid),
                data
            );
        },
        onSuccess: (_res, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.productions.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.productions.detail(variables.uid) });
            queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
        },
    });
}

export function useDeleteProduction() {
    const queryClient = useQueryClient();

    return useMutation<ApiResponse<void>, Error, string>({
        mutationFn: async (uid: string) => {
            return apiDelete<ApiResponse<void>>(ENDPOINTS.PRODUCTION.DELETE(uid));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.productions.all });
        },
    });
}

export function useFinalizeProduction() {
    const queryClient = useQueryClient();

    return useMutation<ApiResponse<Production>, Error, { uid: string; data?: ProductionFinalizeInput }>({
        mutationFn: async ({ uid, data }) => {
            return apiPost<ApiResponse<Production>, ProductionFinalizeInput | undefined>(
                ENDPOINTS.PRODUCTION.FINALIZE(uid),
                data
            );
        },
        onSuccess: (_res, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.productions.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.productions.detail(variables.uid) });
            queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
        },
    });
}

export function useVoidProduction() {
    const queryClient = useQueryClient();

    return useMutation<ApiResponse<Production>, Error, string>({
        mutationFn: async (uid: string) => {
            return apiPost<ApiResponse<Production>>(ENDPOINTS.PRODUCTION.VOID(uid));
        },
        onSuccess: (_res, uid) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.productions.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.productions.detail(uid) });
            queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
        },
    });
}

export function useCalculateBom() {
    return useMutation<ApiResponse<BomCalculateResponse>, Error, BomCalculateRequest>({
        mutationFn: async (data: BomCalculateRequest) => {
            return apiPost<ApiResponse<BomCalculateResponse>, BomCalculateRequest>(
                ENDPOINTS.PRODUCTION.CALCULATE_BOM,
                data
            );
        },
    });
}

export function useCalculateHppPreview() {
    return useMutation<ApiResponse<HppPreviewResponse>, Error, ProductionCreateInput>({
        mutationFn: async (data: ProductionCreateInput) => {
            return apiPost<ApiResponse<HppPreviewResponse>, ProductionCreateInput>(
                ENDPOINTS.PRODUCTION.CALCULATE_PREVIEW,
                data
            );
        },
    });
}
