import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGetData, apiGetList, apiPost, apiPut, apiDelete } from "@/shared/api/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { ApiResponse, PaginatedResponse, PaginationParams } from "@/types/api";
import type { StockMovement, Opname } from "../types";
import type { AdjustmentInput } from "../schemas/adjustment-schema";
import type { OpnameInput } from "../schemas/opname-schema";

export function useStockMovements(params?: PaginationParams) {
    return useQuery<PaginatedResponse<StockMovement>>({
        queryKey: [...queryKeys.inventory.movements(), params],
        queryFn: () => apiGetList<StockMovement>("/v1/inventory/movements", params),
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

// ─── Opname Deletion Hook ────────────────────────────────────────────────────

export function useDeleteOpname() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<void>, Error, number>({
        mutationFn: (id) => apiDelete<ApiResponse<void>>(`/v1/inventory/opname/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.inventory.opnames(),
            });
        },
    });
}

// ─── Audit / Activity Logs Hooks ─────────────────────────────────────────────

export interface ActivityLog {
    id: number;
    user_id: number | null;
    action: string;
    model_type: string | null;
    model_id: number | null;
    description: string;
    ip_address: string | null;
    user_agent: string | null;
    properties: Record<string, unknown> | null;
    created_at: string;
    user?: {
        id: number;
        name: string;
        username: string;
    };
}

export function useActivityLogs(params?: PaginationParams & { search?: string }) {
    return useQuery<PaginatedResponse<ActivityLog>>({
        queryKey: [...queryKeys.activityLogs.list(), params],
        queryFn: () => apiGetList<ActivityLog>("/v1/activity-logs", params),
    });
}
