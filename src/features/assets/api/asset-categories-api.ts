import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGetData, apiPost, apiPut, apiDelete } from "@/shared/api/api-client";
import { queryKeys } from "@/lib/query-keys";
import { ENDPOINTS } from "@/shared/api/endpoints";
import type { ApiResponse } from "@/types/api";
import type {
    AssetCategory,
    CreateAssetCategoryPayload,
    UpdateAssetCategoryPayload,
} from "../types";

// 1. Get List of Asset Categories
export function useAssetCategories() {
    return useQuery<AssetCategory[]>({
        queryKey: queryKeys.assetCategories.list(),
        queryFn: () => apiGetData<AssetCategory[]>(ENDPOINTS.ASSETS.CATEGORIES.LIST),
    });
}

// 2. Get Asset Category Detail
export function useAssetCategoryDetail(uid: string | null) {
    return useQuery<AssetCategory>({
        queryKey: queryKeys.assetCategories.detail(uid || ""),
        queryFn: () => apiGetData<AssetCategory>(ENDPOINTS.ASSETS.CATEGORIES.DETAIL(uid || "")),
        enabled: !!uid,
    });
}

// 3. Create Asset Category Mutation
export function useCreateAssetCategory() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<AssetCategory>, Error, CreateAssetCategoryPayload>({
        mutationFn: (data) =>
            apiPost<ApiResponse<AssetCategory>, CreateAssetCategoryPayload>(
                ENDPOINTS.ASSETS.CATEGORIES.CREATE,
                data
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.assetCategories.all });
            // Invalidate COA tree as well because auto-created COA might be generated
            queryClient.invalidateQueries({ queryKey: queryKeys.chartOfAccounts.all });
        },
    });
}

// 4. Update Asset Category Mutation
export function useUpdateAssetCategory() {
    const queryClient = useQueryClient();
    return useMutation<
        ApiResponse<AssetCategory>,
        Error,
        { uid: string; data: UpdateAssetCategoryPayload }
    >({
        mutationFn: ({ uid, data }) =>
            apiPut<ApiResponse<AssetCategory>, UpdateAssetCategoryPayload>(
                ENDPOINTS.ASSETS.CATEGORIES.UPDATE(uid),
                data
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.assetCategories.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.assets.all });
        },
    });
}

// 5. Delete Asset Category Mutation
export function useDeleteAssetCategory() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<void>, Error, string>({
        mutationFn: (uid) =>
            apiDelete<ApiResponse<void>>(ENDPOINTS.ASSETS.CATEGORIES.DELETE(uid)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.assetCategories.all });
        },
    });
}
