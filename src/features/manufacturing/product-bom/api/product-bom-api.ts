import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiDelete, apiGet, apiPost } from "@/shared/api/api-client";
import { ENDPOINTS } from "@/shared/api/endpoints";
import { queryKeys } from "@/lib/query-keys";
import type { ApiResponse } from "@/types/api";
import type { ProductBomResponse } from "../types";
import type { CopyBomInput, ProductBomBatchInput } from "../schemas/product-bom-schema";

export function useProductBoms(productUid: string | null | undefined) {
    return useQuery<ApiResponse<ProductBomResponse> | null>({
        queryKey: queryKeys.productBoms.detail(productUid || ""),
        queryFn: async () => {
            if (!productUid) return null;
            return apiGet<ApiResponse<ProductBomResponse>>(
                ENDPOINTS.PRODUCT_BOMS.LIST(productUid)
            );
        },
        enabled: Boolean(productUid),
    });
}

export function useSaveProductBoms() {
    const queryClient = useQueryClient();

    return useMutation<ApiResponse<ProductBomResponse>, Error, { productUid: string; data: ProductBomBatchInput }>({
        mutationFn: async ({ productUid, data }) => {
            return apiPost<ApiResponse<ProductBomResponse>, ProductBomBatchInput>(
                ENDPOINTS.PRODUCT_BOMS.CREATE(productUid),
                data
            );
        },
        onSuccess: (_res, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.productBoms.detail(variables.productUid) });
            queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
        },
    });
}

export function useCopyProductBom() {
    const queryClient = useQueryClient();

    return useMutation<ApiResponse<ProductBomResponse>, Error, { targetProductUid: string; data: CopyBomInput }>({
        mutationFn: async ({ targetProductUid, data }) => {
            return apiPost<ApiResponse<ProductBomResponse>, CopyBomInput>(
                ENDPOINTS.PRODUCT_BOMS.COPY(targetProductUid),
                data
            );
        },
        onSuccess: (_res, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.productBoms.detail(variables.targetProductUid) });
            queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
        },
    });
}

export function useDeleteProductBom() {
    const queryClient = useQueryClient();

    return useMutation<ApiResponse<void>, Error, { productUid: string; bomUid: string }>({
        mutationFn: async ({ productUid, bomUid }) => {
            return apiDelete<ApiResponse<void>>(
                ENDPOINTS.PRODUCT_BOMS.DELETE(productUid, bomUid)
            );
        },
        onSuccess: (_res, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.productBoms.detail(variables.productUid) });
        },
    });
}
