import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGetList, apiPost, apiPut, apiDelete } from "@/shared/api/api-client";
import { ENDPOINTS } from "@/shared/api/endpoints";
import { queryKeys } from "@/lib/query-keys";
import type { ApiResponse, PaginatedResponse, PaginationParams } from "@/types/api";
import type { Unit } from "../types";
import type { UnitInput } from "../schemas/unit-schema";

export function useUnits(params?: PaginationParams & { search?: string; tipe?: string; all?: boolean }) {
    return useQuery<PaginatedResponse<Unit>>({
        queryKey: queryKeys.units.list(params),
        queryFn: () => apiGetList<Unit>(ENDPOINTS.UNITS.LIST, params),
    });
}

export function useInfiniteUnits(params?: PaginationParams & { search?: string; tipe?: string }) {
    return useInfiniteQuery<PaginatedResponse<Unit>>({
        queryKey: [...queryKeys.units.all, "infinite", params],
        queryFn: ({ pageParam = 1 }) =>
            apiGetList<Unit>(ENDPOINTS.UNITS.LIST, {
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

export function useCreateUnit() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<Unit>, Error, UnitInput>({
        mutationFn: (data) =>
            apiPost<ApiResponse<Unit>, UnitInput>(ENDPOINTS.UNITS.CREATE, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.units.all });
        },
    });
}

export function useUpdateUnit() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<Unit>, Error, { uid: string; data: UnitInput }>({
        mutationFn: ({ uid, data }) =>
            apiPut<ApiResponse<Unit>, UnitInput>(ENDPOINTS.UNITS.UPDATE(uid), data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.units.all });
        },
    });
}

export function useDeleteUnit() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<void>, Error, string>({
        mutationFn: (uid) => apiDelete<ApiResponse<void>>(ENDPOINTS.UNITS.DELETE(uid)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.units.all });
        },
    });
}
