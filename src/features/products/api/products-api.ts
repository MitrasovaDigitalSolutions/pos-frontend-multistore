import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    apiGetList,
    apiPost,
    apiPatch,
    apiDelete,
} from "@/shared/api/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { ApiResponse, PaginatedResponse, PaginationParams } from "@/types/api";
import type { Product } from "../types";

export function useProducts(params?: PaginationParams) {
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
        { id: number; data: FormData }
    >({
        mutationFn: ({ id, data }) =>
            apiPost<ApiResponse<Product>, FormData>(
                `/v1/products/${id}`,
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
        { id: number; status: "active" | "inactive" }
    >({
        mutationFn: ({ id, status }) =>
            apiPatch<ApiResponse<Product>, { status: "active" | "inactive" }>(
                `/v1/products/${id}/status`,
                { status },
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
        },
    });
}

export function useDeleteProduct() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<void>, Error, number>({
        mutationFn: (id) => apiDelete<ApiResponse<void>>(`/v1/products/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
        },
    });
}
