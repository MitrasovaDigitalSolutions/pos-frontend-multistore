import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGetList, apiPost, apiPut, apiDelete } from "@/shared/api/api-client";
import { ENDPOINTS } from "@/shared/api/endpoints";
import { queryKeys } from "@/lib/query-keys";
import type { ApiResponse, PaginatedResponse, PaginationParams } from "@/types/api";
import type { BomComponentType } from "../types";
import type { BomComponentTypeInput } from "../schemas/bom-component-type-schema";

export function useBomComponentTypes(
    params?: PaginationParams & {
        search?: string;
        kategori_bisnis?: string;
        is_main_driver?: boolean;
        all?: boolean;
    }
) {
    return useQuery<PaginatedResponse<BomComponentType>>({
        queryKey: queryKeys.bomComponentTypes.list(params),
        queryFn: () => apiGetList<BomComponentType>(ENDPOINTS.BOM_COMPONENT_TYPES.LIST, params),
    });
}

export function useInfiniteBomComponentTypes(
    params?: PaginationParams & {
        search?: string;
        kategori_bisnis?: string;
    }
) {
    return useInfiniteQuery<PaginatedResponse<BomComponentType>>({
        queryKey: [...queryKeys.bomComponentTypes.all, "infinite", params],
        queryFn: ({ pageParam = 1 }) =>
            apiGetList<BomComponentType>(ENDPOINTS.BOM_COMPONENT_TYPES.LIST, {
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

export function useCreateBomComponentType() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<BomComponentType>, Error, BomComponentTypeInput>({
        mutationFn: (data) =>
            apiPost<ApiResponse<BomComponentType>, BomComponentTypeInput>(
                ENDPOINTS.BOM_COMPONENT_TYPES.CREATE,
                data
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.bomComponentTypes.all });
        },
    });
}

export function useUpdateBomComponentType() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<BomComponentType>, Error, { uid: string; data: BomComponentTypeInput }>({
        mutationFn: ({ uid, data }) =>
            apiPut<ApiResponse<BomComponentType>, BomComponentTypeInput>(
                ENDPOINTS.BOM_COMPONENT_TYPES.UPDATE(uid),
                data
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.bomComponentTypes.all });
        },
    });
}

export function useDeleteBomComponentType() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<void>, Error, string>({
        mutationFn: (uid) =>
            apiDelete<ApiResponse<void>>(ENDPOINTS.BOM_COMPONENT_TYPES.DELETE(uid)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.bomComponentTypes.all });
        },
    });
}
