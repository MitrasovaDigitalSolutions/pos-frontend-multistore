import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

export function useInfiniteBrands(params?: PaginationParams & { search?: string }) {
    return useInfiniteQuery<PaginatedResponse<Brand>>({
        queryKey: [...queryKeys.brands.all, "infinite", params],
        queryFn: ({ pageParam = 1 }) =>
            apiGetList<Brand>("/v1/brands", {
                ...params,
                page: pageParam as number,
            }),
        getNextPageParam: (lastPage) => {
            if (lastPage.meta && lastPage.meta.current_page < lastPage.meta.last_page) {
                return lastPage.meta.current_page + 1;
            }
            return undefined;
        },
        initialPageParam: 1,
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
    return useMutation<ApiResponse<Brand>, Error, { uid: string; data: BrandInput }>({
        mutationFn: ({ uid, data }) =>
            apiPut<ApiResponse<Brand>, BrandInput>(`/v1/brands/${uid}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.brands.all });
        },
    });
}

export function useDeleteBrand() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<void>, Error, string>({
        mutationFn: (uid) => apiDelete<ApiResponse<void>>(`/v1/brands/${uid}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.brands.all });
        },
    });
}
