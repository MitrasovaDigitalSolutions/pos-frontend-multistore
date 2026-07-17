import { queryKeys } from "@/lib/query-keys";
import { apiGetList, apiPost } from "@/shared/api/api-client";
import type { PaginatedResponse, PaginationParams } from "@/types/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { BulkAssignPayload, CatalogProduct } from "../types";

// ─── Catalog Params ──────────────────────────────────────────────────────────

export interface CatalogParams extends PaginationParams {
    search?: string;
    category_uid?: string;
    brand_uid?: string;
    status?: string;
    is_jasa?: string;
    include_assigned?: "1";
    include_archived?: "1";
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

/**
 * Fetches the global product catalog (master products without store scope).
 * Uses GET /v1/products/catalog — admin/manager view.
 */
export function useProductCatalog(params?: CatalogParams) {
    return useQuery<PaginatedResponse<CatalogProduct>>({
        queryKey: [...queryKeys.productCatalog.list(), params],
        queryFn: () =>
            apiGetList<CatalogProduct>("/v1/products/catalog", {
                ...params,
                include_assigned: "1",
            } as PaginationParams),
    });
}

/**
 * Bulk-assigns a single product to many stores at once.
 * Uses POST /v1/products/{product_uid}/stores/bulk
 */
export function useBulkAssignProductStores() {
    const queryClient = useQueryClient();
    return useMutation<unknown, Error, { productUid: string; payload: BulkAssignPayload }>({
        mutationFn: ({ productUid, payload }) =>
            apiPost(`/v1/products/${productUid}/stores/bulk`, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.productCatalog.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.productStores.all });
        },
    });
}
