import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGetData, apiGetList, apiPost, apiPut, apiDelete } from "@/shared/api/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { ApiResponse, PaginatedResponse, PaginationParams } from "@/types/api";
import type { Supplier } from "../types";
import type { SupplierInput } from "../schemas/supplier-schema";

export function useSuppliers(params?: PaginationParams & { search?: string }) {
    return useQuery<PaginatedResponse<Supplier>>({
        queryKey: [...queryKeys.suppliers.all, params],
        queryFn: () => apiGetList<Supplier>("/v1/inventory/suppliers", params),
    });
}

export function useInfiniteSuppliers(params?: PaginationParams & { search?: string }) {
    return useInfiniteQuery<PaginatedResponse<Supplier>>({
        queryKey: [...queryKeys.suppliers.all, "infinite", params],
        queryFn: ({ pageParam = 1 }) =>
            apiGetList<Supplier>("/v1/inventory/suppliers", {
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

export function useAllSuppliers() {
    return useQuery<Supplier[]>({
        queryKey: [...queryKeys.suppliers.all, "all"],
        queryFn: () => apiGetData<Supplier[]>("/v1/inventory/suppliers/all"),
    });
}

export function useCreateSupplier() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<Supplier>, Error, SupplierInput>({
        mutationFn: (data) =>
            apiPost<ApiResponse<Supplier>, SupplierInput>(
                "/v1/inventory/suppliers",
                data,
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.suppliers.all,
            });
        },
    });
}

export function useUpdateSupplier() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<Supplier>, Error, { uid: string; data: SupplierInput }>({
        mutationFn: ({ uid, data }) =>
            apiPut<ApiResponse<Supplier>, SupplierInput>(
                `/v1/inventory/suppliers/${uid}`,
                data,
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.suppliers.all,
            });
        },
    });
}

export function useDeleteSupplier() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<void>, Error, string>({
        mutationFn: (uid) => apiDelete<ApiResponse<void>>(`/v1/inventory/suppliers/${uid}`),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.suppliers.all,
            });
        },
    });
}
