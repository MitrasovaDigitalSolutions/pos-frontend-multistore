import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    apiGetList,
    apiGetData,
    apiPost,
    apiPut,
    apiDelete,
} from "@/shared/api/api-client";
import { queryKeys } from "@/lib/query-keys";
import { ENDPOINTS } from "@/shared/api/endpoints";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type {
    Asset,
    AssetSummary,
    AssetPenyusutan,
    AssetFilterParams,
    CreateAssetPayload,
    UpdateAssetPayload,
    CreateAssetPenyusutanPayload,
    BulkAssetPenyusutanPayload,
} from "../types";

// 1. Get Paginated Assets
export function useAssets(params?: AssetFilterParams) {
    return useQuery<PaginatedResponse<Asset>>({
        queryKey: queryKeys.assets.list(params),
        queryFn: () =>
            apiGetList<Asset>(ENDPOINTS.ASSETS.LIST, params as Record<string, unknown>),
    });
}

// 2. Get Asset Summary Metrics
export function useAssetSummary() {
    return useQuery<AssetSummary>({
        queryKey: queryKeys.assets.summary(),
        queryFn: () => apiGetData<AssetSummary>(ENDPOINTS.ASSETS.SUMMARY),
    });
}

// 3. Get Asset Detail (with Relations & Depreciation History)
export function useAssetDetail(uid: string | null) {
    return useQuery<Asset>({
        queryKey: queryKeys.assets.detail(uid || ""),
        queryFn: () => apiGetData<Asset>(ENDPOINTS.ASSETS.DETAIL(uid || "")),
        enabled: !!uid,
    });
}

// 4. Create Asset Mutation
export function useCreateAsset() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<Asset>, Error, CreateAssetPayload>({
        mutationFn: (data) =>
            apiPost<ApiResponse<Asset>, CreateAssetPayload>(ENDPOINTS.ASSETS.CREATE, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.assets.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.assetCategories.all });
            queryClient.invalidateQueries({ queryKey: ["cash-accounts"] });
        },
    });
}

// 5. Update Asset Mutation
export function useUpdateAsset() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<Asset>, Error, { uid: string; data: UpdateAssetPayload }>({
        mutationFn: ({ uid, data }) =>
            apiPut<ApiResponse<Asset>, UpdateAssetPayload>(ENDPOINTS.ASSETS.UPDATE(uid), data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.assets.all });
        },
    });
}

// 6. Delete Asset Mutation
export function useDeleteAsset() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<void>, Error, string>({
        mutationFn: (uid) => apiDelete<ApiResponse<void>>(ENDPOINTS.ASSETS.DELETE(uid)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.assets.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.assetCategories.all });
            queryClient.invalidateQueries({ queryKey: ["cash-accounts"] });
        },
    });
}

// 7. Get Depreciation Logs for an Asset
export function useAssetPenyusutanList(assetUid: string | null) {
    return useQuery<AssetPenyusutan[]>({
        queryKey: queryKeys.assets.penyusutan(assetUid || ""),
        queryFn: () =>
            apiGetData<AssetPenyusutan[]>(ENDPOINTS.ASSETS.PENYUSUTAN.LIST(assetUid || "")),
        enabled: !!assetUid,
    });
}

// 8. Record Manual Depreciation for a Single Asset
export function useCreateAssetPenyusutan() {
    const queryClient = useQueryClient();
    return useMutation<
        ApiResponse<AssetPenyusutan>,
        Error,
        { assetUid: string; data: CreateAssetPenyusutanPayload }
    >({
        mutationFn: ({ assetUid, data }) =>
            apiPost<ApiResponse<AssetPenyusutan>, CreateAssetPenyusutanPayload>(
                ENDPOINTS.ASSETS.PENYUSUTAN.CREATE(assetUid),
                data
            ),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.assets.all });
            queryClient.invalidateQueries({
                queryKey: queryKeys.assets.penyusutan(variables.assetUid),
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.assets.detail(variables.assetUid),
            });
        },
    });
}

// 9. Record Bulk Depreciation across Multiple Assets
export function useBulkAssetPenyusutan() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<AssetPenyusutan[]>, Error, BulkAssetPenyusutanPayload>({
        mutationFn: (data) =>
            apiPost<ApiResponse<AssetPenyusutan[]>, BulkAssetPenyusutanPayload>(
                ENDPOINTS.ASSETS.PENYUSUTAN.BULK,
                data
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.assets.all });
        },
    });
}

// 10. Delete / Void Depreciation Transaction
export function useDeleteAssetPenyusutan() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<void>, Error, { penyusutanUid: string; assetUid?: string }>({
        mutationFn: ({ penyusutanUid }) =>
            apiDelete<ApiResponse<void>>(ENDPOINTS.ASSETS.PENYUSUTAN.DELETE(penyusutanUid)),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.assets.all });
            if (variables.assetUid) {
                queryClient.invalidateQueries({
                    queryKey: queryKeys.assets.penyusutan(variables.assetUid),
                });
                queryClient.invalidateQueries({
                    queryKey: queryKeys.assets.detail(variables.assetUid),
                });
            }
        },
    });
}
