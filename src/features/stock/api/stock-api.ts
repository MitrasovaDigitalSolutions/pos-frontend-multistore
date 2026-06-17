import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGetData, apiGetList, apiPost, apiPut, apiDelete } from "@/shared/api/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { ApiResponse, PaginatedResponse, PaginationParams } from "@/types/api";
import type { StockMovement, Opname, OpnameItem } from "../types";
import type { AdjustmentInput } from "../schemas/adjustment-schema";
import type { OpnameHeaderInput } from "../schemas/opname-schema";

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

export function useOpnameItems(id: number | null, params?: PaginationParams) {
    return useQuery<PaginatedResponse<OpnameItem>>({
        queryKey: [...queryKeys.inventory.opnameDetail(id || 0), "items", params],
        queryFn: () => apiGetList<OpnameItem>(`/v1/inventory/opname/${id}/items`, params),
        enabled: id !== null && id > 0,
    });
}

export interface OpnameProgress {
    id: number;
    status: string;
    progress: number;
    total_items: number;
    processed_items: number;
    error_message: string | null;
}

export function useOpnameProgress(id: number | null, enabled = true) {
    return useQuery<OpnameProgress>({
        queryKey: [...queryKeys.inventory.opnameDetail(id || 0), "progress"],
        queryFn: () => apiGetData<OpnameProgress>(`/v1/inventory/opname/${id}/progress`),
        enabled: id !== null && id > 0 && enabled,
        refetchInterval: (query) => {
            const data = query.state.data;
            if (!data) return 2000;
            return data.status === "processing" || data.status === "pending" ? 2000 : false;
        },
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
    return useMutation<ApiResponse<Opname>, Error, OpnameHeaderInput>({
        mutationFn: (data) =>
            apiPost<ApiResponse<Opname>, OpnameHeaderInput>(
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

export function useUpdateOpname() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<Opname>, Error, { id: number; data: OpnameHeaderInput }>({
        mutationFn: ({ id, data }) =>
            apiPut<ApiResponse<Opname>, OpnameHeaderInput>(
                `/v1/inventory/opname/${id}`,
                data,
            ),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.inventory.opnames(),
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.inventory.opnameDetail(variables.id),
            });
        },
    });
}

export function useUpdateOpnameItems() {
    const queryClient = useQueryClient();
    return useMutation<
        ApiResponse<Opname>,
        Error,
        {
            id: number;
            data: {
                items: Array<{
                    product_id: number;
                    stok_fisik: number;
                    alasan?: string | null;
                }>;
            };
        }
    >({
        mutationFn: ({ id, data }) =>
            apiPut<ApiResponse<Opname>, { items: Array<{ product_id: number; stok_fisik: number; alasan?: string | null }> }>(
                `/v1/inventory/opname/${id}/items`,
                data,
            ),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.inventory.opnames(),
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.inventory.opnameDetail(variables.id),
            });
        },
    });
}

export function useFinalizeOpname() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<Opname>, Error, number>({
        mutationFn: (id) =>
            apiPost<ApiResponse<Opname>, undefined>(
                `/v1/inventory/opname/${id}/finalize`,
                undefined,
            ),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.inventory.opnames(),
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.inventory.opnameDetail(id),
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
