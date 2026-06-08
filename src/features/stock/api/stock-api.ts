import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGetData, apiGetList, apiPost, apiPut, apiPatch, apiDelete } from "@/shared/api/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { ApiResponse, PaginatedResponse, PaginationParams } from "@/types/api";
import type { StockMovement, Receiving, Opname, Supplier } from "../types";
import type { AdjustmentInput } from "../schemas/adjustment-schema";
import type { ReceivingInput } from "../schemas/receiving-schema";
import type { OpnameInput } from "../schemas/opname-schema";
import type { SupplierInput } from "../schemas/supplier-schema";

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

// ─── Supplier Master Data Hooks ──────────────────────────────────────────────

export function useSuppliers(params?: PaginationParams & { search?: string }) {
    return useQuery<PaginatedResponse<Supplier>>({
        queryKey: [...queryKeys.inventory.suppliers(), params],
        queryFn: () => apiGetList<Supplier>("/v1/inventory/suppliers", params),
    });
}

export function useAllSuppliers() {
    return useQuery<Supplier[]>({
        queryKey: [...queryKeys.inventory.suppliers(), "all"],
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
                queryKey: queryKeys.inventory.suppliers(),
            });
        },
    });
}

export function useUpdateSupplier() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<Supplier>, Error, { id: number; data: SupplierInput }>({
        mutationFn: ({ id, data }) =>
            apiPut<ApiResponse<Supplier>, SupplierInput>(
                `/v1/inventory/suppliers/${id}`,
                data,
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.inventory.suppliers(),
            });
        },
    });
}

export function useDeleteSupplier() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<void>, Error, number>({
        mutationFn: (id) => apiDelete<ApiResponse<void>>(`/v1/inventory/suppliers/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.inventory.suppliers(),
            });
        },
    });
}

// ─── Enhanced Receiving Hooks ────────────────────────────────────────────────

export function useUpdateReceiving() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<Receiving>, Error, { id: number; data: ReceivingInput }>({
        mutationFn: ({ id, data }) =>
            apiPut<ApiResponse<Receiving>, ReceivingInput>(
                `/v1/inventory/receiving/${id}`,
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

export function useDeleteReceiving() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<void>, Error, number>({
        mutationFn: (id) => apiDelete<ApiResponse<void>>(`/v1/inventory/receiving/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.inventory.receivings(),
            });
        },
    });
}

export function useUpdateReceivingPaymentStatus() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<Receiving>, Error, { id: number; status_pembayaran: "pending" | "paid" }>({
        mutationFn: ({ id, status_pembayaran }) =>
            apiPatch<ApiResponse<Receiving>, { status_pembayaran: "pending" | "paid" }>(
                `/v1/inventory/receiving/${id}/payment-status`,
                { status_pembayaran },
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.inventory.receivings(),
            });
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
    properties: any;
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

export function useReceivingDetail(id: number | null) {
    return useQuery<Receiving>({
        queryKey: [...queryKeys.inventory.receivings(), "detail", id || 0],
        queryFn: () => apiGetData<Receiving>(`/v1/inventory/receiving/${id}`),
        enabled: id !== null && id > 0,
    });
}
