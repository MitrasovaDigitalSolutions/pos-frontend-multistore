import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPut, apiDelete } from "@/shared/api/api-client";
import { ENDPOINTS } from "@/shared/api/endpoints";
import { queryKeys } from "@/lib/query-keys";
import type { ApiResponse } from "@/types/api";
import type { Category } from "@/features/master/categories/types";

export interface ParentCategory {
    uid: string;
    nama: string;
    store_uid?: string | null;
    categories_count?: number;
    categories?: Category[];
    created_at?: string;
    updated_at?: string;
}

export interface ParentCategoryParams {
    search?: string;
    q?: string;
    sort_by?: "nama" | "created_at" | "categories_count";
    sort_order?: "asc" | "desc";
    all?: boolean;
}

export interface ParentCategoryInput {
    nama: string;
}

export interface AssignCategoriesInput {
    category_uid: string[];
}

export function useParentCategories(params?: ParentCategoryParams) {
    return useQuery<ParentCategory[]>({
        queryKey: [...queryKeys.parentCategories.all, params],
        queryFn: async () => {
            const res = await apiGet<ApiResponse<ParentCategory[]>>(ENDPOINTS.PARENT_CATEGORIES.LIST, {
                params: {
                    all: true,
                    ...params,
                },
            });
            return res.data;
        },
    });
}

export function useParentCategoryDetail(uid?: string) {
    return useQuery<ParentCategory>({
        queryKey: queryKeys.parentCategories.detail(uid ?? ""),
        queryFn: async () => {
            const res = await apiGet<ApiResponse<ParentCategory>>(ENDPOINTS.PARENT_CATEGORIES.DETAIL(uid!));
            return res.data;
        },
        enabled: !!uid,
    });
}

export function useCreateParentCategory() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<ParentCategory>, Error, ParentCategoryInput>({
        mutationFn: (data) =>
            apiPost<ApiResponse<ParentCategory>, ParentCategoryInput>(ENDPOINTS.PARENT_CATEGORIES.CREATE, data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.parentCategories.all,
            });
        },
    });
}

export function useUpdateParentCategory() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<ParentCategory>, Error, { uid: string; data: ParentCategoryInput }>({
        mutationFn: ({ uid, data }) =>
            apiPut<ApiResponse<ParentCategory>, ParentCategoryInput>(
                ENDPOINTS.PARENT_CATEGORIES.UPDATE(uid),
                data
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.parentCategories.all,
            });
        },
    });
}

export function useDeleteParentCategory() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<null>, Error, string>({
        mutationFn: (uid) =>
            apiDelete<ApiResponse<null>>(ENDPOINTS.PARENT_CATEGORIES.DELETE(uid)),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.parentCategories.all,
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.categories.all,
            });
        },
    });
}

export function useAssignParentCategory() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<{ assigned: number }>, Error, { parentCategoryUid: string; categoryUids: string[] }>({
        mutationFn: ({ parentCategoryUid, categoryUids }) =>
            apiPost<ApiResponse<{ assigned: number }>, AssignCategoriesInput>(
                ENDPOINTS.PARENT_CATEGORIES.ASSIGN(parentCategoryUid),
                { category_uid: categoryUids }
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.parentCategories.all,
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.categories.all,
            });
        },
    });
}
