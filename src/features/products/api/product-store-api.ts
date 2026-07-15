import { queryKeys } from "@/lib/query-keys";
import {
    apiDelete,
    apiGet,
    apiPatch,
    apiPost
} from "@/shared/api/api-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ProductStore } from "../types";

export function useProductStores(productUid?: string) {
    return useQuery<ProductStore[]>({
        queryKey: queryKeys.productStores.list(productUid!),
        queryFn: () => apiGet<ProductStore[]>(`/v1/products/${productUid}/stores`),
        enabled: !!productUid,
    });
}

export function useAssignProductStore() {
    const queryClient = useQueryClient();
    return useMutation<
        ProductStore,
        Error,
        { productUid: string; store_uid: string; stok?: number; harga_beli?: number; harga_jual?: number; margin?: number; status?: "active" | "inactive" }
    >({
        mutationFn: ({ productUid, ...data }) =>
            apiPost<ProductStore, Omit<typeof data, "productUid">>(
                `/v1/products/${productUid}/stores`,
                data,
            ),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.productStores.list(variables.productUid) });
        },
    });
}

export function useUpdateProductStore() {
    const queryClient = useQueryClient();
    return useMutation<
        ProductStore,
        Error,
        { productUid: string; storeUid: string; stok?: number; harga_beli?: number; harga_jual?: number; margin?: number; status?: "active" | "inactive" }
    >({
        mutationFn: ({ productUid, storeUid, ...data }) =>
            apiPatch<ProductStore, Omit<typeof data, "productUid" | "storeUid">>(
                `/v1/products/${productUid}/stores/${storeUid}`,
                data,
            ),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.productStores.list(variables.productUid) });
        },
    });
}

export function useDetachProductStore() {
    const queryClient = useQueryClient();
    return useMutation<void, Error, { productUid: string; storeUid: string }>({
        mutationFn: ({ productUid, storeUid }) =>
            apiDelete<void>(`/v1/products/${productUid}/stores/${storeUid}`),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.productStores.list(variables.productUid) });
        },
    });
}
