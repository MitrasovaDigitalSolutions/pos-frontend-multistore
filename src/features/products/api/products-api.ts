import { queryKeys } from "@/lib/query-keys";
import {
    apiDelete,
    apiGetList,
    apiPatch,
    apiPost
} from "@/shared/api/api-client";
import type { ApiResponse, PaginatedResponse, PaginationParams } from "@/types/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Product } from "../types";

export function useProducts(params?: PaginationParams & { status?: string; category_uid?: string; brand_uid?: string; is_jasa?: string }) {
    return useQuery<PaginatedResponse<Product>>({
        queryKey: [...queryKeys.products.list(), params],
        queryFn: () => apiGetList<Product>("/v1/products", params),
    });
}

export function useCreateProduct() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<Product>, Error, FormData>({
        mutationFn: (newProduct) =>
            apiPost<ApiResponse<Product>, FormData>(
                "/v1/products",
                newProduct,
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
        },
    });
}

export function useUpdateProduct() {
    const queryClient = useQueryClient();
    return useMutation<
        ApiResponse<Product>,
        Error,
        { uid: string; data: FormData }
    >({
        mutationFn: ({ uid, data }) =>
            apiPost<ApiResponse<Product>, FormData>(
                `/v1/products/${uid}`,
                data,
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
        },
    });
}

export function useToggleProductStatus() {
    const queryClient = useQueryClient();
    return useMutation<
        ApiResponse<Product>,
        Error,
        { uid: string; status: "active" | "inactive" }
    >({
        mutationFn: ({ uid, status }) =>
            apiPatch<ApiResponse<Product>, { status: "active" | "inactive" }>(
                `/v1/products/${uid}/status`,
                { status },
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
        },
    });
}

export function useDeleteProduct() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<void>, Error, string>({
        mutationFn: (uid) => apiDelete<ApiResponse<void>>(`/v1/products/${uid}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
        },
    });
}
