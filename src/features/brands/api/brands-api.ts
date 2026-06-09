import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGetList, apiPost, apiPut, apiDelete } from "@/shared/api/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { ApiResponse, PaginatedResponse, PaginationParams } from "@/types/api";
import type { Brand } from "../types";
import type { BrandInput } from "../schemas/brand-schema";

export function useBrands(params?: PaginationParams & { search?: string }) {
    return useQuery<PaginatedResponse<Brand>>({
        queryKey: [...queryKeys.brands.all, params],
        queryFn: () => apiGetList<Brand>("/v1/brands", params),
    });
}

export function useCreateBrand() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<Brand>, Error, BrandInput>({
        mutationFn: (data) =>
            apiPost<ApiResponse<Brand>, BrandInput>("/v1/brands", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.brands.all });
        },
    });
}

export function useUpdateBrand() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<Brand>, Error, { id: number; data: BrandInput }>({
        mutationFn: ({ id, data }) =>
            apiPut<ApiResponse<Brand>, BrandInput>(`/v1/brands/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.brands.all });
        },
    });
}

export function useDeleteBrand() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<void>, Error, number>({
        mutationFn: (id) => apiDelete<ApiResponse<void>>(`/v1/brands/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.brands.all });
        },
    });
}
