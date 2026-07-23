import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGetList, apiPost, apiPut, apiDelete } from "@/shared/api/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { ApiResponse, PaginatedResponse, PaginationParams } from "@/types/api";
import type { Category } from "../types";
import type { CategoryInput } from "../schemas/category-schema";

export function useCategories(params?: PaginationParams & { search?: string }) {
    return useQuery<PaginatedResponse<Category>>({
        queryKey: [...queryKeys.categories.all, params],
        queryFn: () => apiGetList<Category>("/v1/categories", params),
    });
}

export function useInfiniteCategories(params?: PaginationParams & { search?: string }) {
    return useInfiniteQuery<PaginatedResponse<Category>>({
        queryKey: [...queryKeys.categories.all, "infinite", params],
        queryFn: ({ pageParam = 1 }) =>
            apiGetList<Category>("/v1/categories", {
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

export function useCreateCategory() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<Category>, Error, CategoryInput>({
        mutationFn: (data) =>
            apiPost<ApiResponse<Category>, CategoryInput>("/v1/categories", data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.categories.all,
            });
        },
    });
}

export function useUpdateCategory() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<Category>, Error, { uid: string; data: CategoryInput }>({
        mutationFn: ({ uid, data }) =>
            apiPut<ApiResponse<Category>, CategoryInput>(`/v1/categories/${uid}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.categories.all,
            });
        },
    });
}

export function useDeleteCategory() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<void>, Error, string>({
        mutationFn: (uid) => apiDelete<ApiResponse<void>>(`/v1/categories/${uid}`),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.categories.all,
            });
        },
    });
}
