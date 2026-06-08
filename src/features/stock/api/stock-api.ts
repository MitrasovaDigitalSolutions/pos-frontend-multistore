import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGetData, apiGetList, apiPost, apiPut } from "@/shared/api/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { ApiResponse, PaginatedResponse, PaginationParams } from "@/types/api";
import type { StockMovement, Receiving, Opname } from "../types";
import type { AdjustmentInput } from "../schemas/adjustment-schema";
import type { ReceivingInput } from "../schemas/receiving-schema";
import type { OpnameInput } from "../schemas/opname-schema";

export function useStockMovements(params?: PaginationParams) {
    return useQuery<PaginatedResponse<StockMovement>>({
        queryKey: [...queryKeys.inventory.movements(), params],
        queryFn: () => apiGetList<StockMovement>("/v1/inventory/movements", params),
    });
}

export function useReceivings(params?: PaginationParams) {
    return useQuery<PaginatedResponse<Receiving>>({
        queryKey: [...queryKeys.inventory.receivings(), params],
        queryFn: () => apiGetList<Receiving>("/v1/inventory/receiving", params),
    });
}

export function useOpnames(params?: PaginationParams) {
    return useQuery<PaginatedResponse<Opname>>({
        queryKey: [...queryKeys.inventory.opnames(), params],
        queryFn: () => apiGetList<Opname>("/v1/inventory/opname", params),
    });
}

export function useOpnameDetail(id: number | null) {
    return useQuery<Opname>({
        queryKey: queryKeys.inventory.opnameDetail(id || 0),
        queryFn: () => apiGetData<Opname>(`/v1/inventory/opname/${id}`),
        enabled: id !== null && id > 0,
    });
}

export function useCreateAdjustment() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<void>, Error, AdjustmentInput>({
        mutationFn: (data) =>
            apiPost<ApiResponse<void>, AdjustmentInput>(
                "/v1/inventory/adjustment",
                data,
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.inventory.movements(),
            });
            queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
        },
    });
}

export function useCreateReceiving() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<Receiving>, Error, ReceivingInput>({
        mutationFn: (data) =>
            apiPost<ApiResponse<Receiving>, ReceivingInput>(
                "/v1/inventory/receiving",
                data,
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.inventory.receivings(),
            });
            queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
        },
    });
}

export function useCreateOpname() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<Opname>, Error, OpnameInput>({
        mutationFn: (data) =>
            apiPost<ApiResponse<Opname>, OpnameInput>(
                "/v1/inventory/opname",
                data,
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.inventory.opnames(),
            });
            queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
        },
    });
}

export function useFinalizeOpname() {
    const queryClient = useQueryClient();
    return useMutation<
        ApiResponse<Opname>,
        Error,
        { id: number; data: Omit<OpnameInput, "catatan"> }
    >({
        mutationFn: ({ id, data }) =>
            apiPut<ApiResponse<Opname>, Omit<OpnameInput, "catatan">>(
                `/v1/inventory/opname/${id}`,
                data,
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.inventory.opnames(),
            });
            queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
        },
    });
}
