import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGetData, apiGetList, apiPost, apiPut, apiPatch, apiDelete } from "@/shared/api/api-client";
import { apiClient } from "@/shared/api/axios";
import { queryKeys } from "@/lib/query-keys";
import { ENDPOINTS } from "@/shared/api/endpoints";
import type { ApiResponse, PaginatedResponse, PaginationParams } from "@/types/api";
import type { Receiving, PurchaseOrder, ReceivingPayment, CashAccount } from "../types";
import type { ReceivingInput } from "../schemas/receiving-schema";
import type { PurchaseOrderInput } from "../schemas/order-schema";
import type { PaymentInput } from "../schemas/payment-schema";

// ─── Stock Receiving Hooks ────────────────────────────────────────────────────

export function useReceivings(params?: PaginationParams & { search?: string; status?: string; supplier_id?: number }) {
    return useQuery<PaginatedResponse<Receiving>>({
        queryKey: [...queryKeys.purchase.receivings(), params],
        queryFn: () => apiGetList<Receiving>(ENDPOINTS.PURCHASE.RECEIVING.LIST, params),
    });
}

export function useReceivingDetail(id: number | null) {
    return useQuery<Receiving>({
        queryKey: [...queryKeys.purchase.receivings(), "detail", id || 0],
        queryFn: () => apiGetData<Receiving>(ENDPOINTS.PURCHASE.RECEIVING.DETAIL(id || 0)),
        enabled: id !== null && id > 0,
    });
}

export function useCreateReceiving() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<Receiving>, Error, ReceivingInput>({
        mutationFn: (data) =>
            apiPost<ApiResponse<Receiving>, ReceivingInput>(
                ENDPOINTS.PURCHASE.RECEIVING.CREATE,
                data,
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.purchase.receivings(),
            });
            queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
        },
    });
}

export function useUpdateReceiving() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<Receiving>, Error, { id: number; data: ReceivingInput }>({
        mutationFn: ({ id, data }) =>
            apiPut<ApiResponse<Receiving>, ReceivingInput>(
                ENDPOINTS.PURCHASE.RECEIVING.UPDATE(id),
                data,
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.purchase.receivings(),
            });
            queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
        },
    });
}

export function useDeleteReceiving() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<void>, Error, number>({
        mutationFn: (id) => apiDelete<ApiResponse<void>>(ENDPOINTS.PURCHASE.RECEIVING.DELETE(id)),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.purchase.receivings(),
            });
        },
    });
}

export function useUpdateReceivingPaymentStatus() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<Receiving>, Error, { id: number; status_pembayaran: "pending" | "paid" }>({
        mutationFn: ({ id, status_pembayaran }) =>
            apiPatch<ApiResponse<Receiving>, { status_pembayaran: "pending" | "paid" }>(
                ENDPOINTS.PURCHASE.RECEIVING.PAYMENT_STATUS(id),
                { status_pembayaran },
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.purchase.receivings(),
            });
        },
    });
}

export interface ComparePricesInput {
    items: {
        product_id: number;
        harga_beli: number;
    }[];
}

export interface ComparePricesResult {
    product_id: number;
    nama: string;
    harga_beli_lama: number;
    harga_beli_baru: number;
    harga_jual_lama: number;
    margin_lama: number;
    harga_jual_saran: number;
    selisih_harga_beli: number;
    perlu_alert: boolean;
}

export function useComparePrices() {
    return useMutation<ApiResponse<ComparePricesResult[]>, Error, ComparePricesInput>({
        mutationFn: (data) =>
            apiPost<ApiResponse<ComparePricesResult[]>, ComparePricesInput>(
                ENDPOINTS.PURCHASE.RECEIVING.COMPARE_PRICES,
                data,
            ),
    });
}

// ─── Purchase Order Hooks ─────────────────────────────────────────────────────

export function usePurchaseOrders(params?: PaginationParams & { search?: string; status?: string; supplier_id?: number; start_date?: string; end_date?: string }) {
    return useQuery<PaginatedResponse<PurchaseOrder>>({
        queryKey: [...queryKeys.purchase.orders(), params],
        queryFn: () => apiGetList<PurchaseOrder>(ENDPOINTS.PURCHASE.ORDER.LIST, params),
    });
}

export function usePurchaseOrderDetail(id: number | null) {
    return useQuery<PurchaseOrder>({
        queryKey: [...queryKeys.purchase.orders(), "detail", id || 0],
        queryFn: () => apiGetData<PurchaseOrder>(ENDPOINTS.PURCHASE.ORDER.DETAIL(id || 0)),
        enabled: id !== null && id > 0,
    });
}

export function useCreatePurchaseOrder() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<PurchaseOrder>, Error, PurchaseOrderInput>({
        mutationFn: (data) =>
            apiPost<ApiResponse<PurchaseOrder>, PurchaseOrderInput>(
                ENDPOINTS.PURCHASE.ORDER.CREATE,
                data,
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.purchase.orders(),
            });
        },
    });
}

export function useUpdatePurchaseOrder() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<PurchaseOrder>, Error, { id: number; data: PurchaseOrderInput }>({
        mutationFn: ({ id, data }) =>
            apiPut<ApiResponse<PurchaseOrder>, PurchaseOrderInput>(
                ENDPOINTS.PURCHASE.ORDER.UPDATE(id),
                data,
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.purchase.orders(),
            });
        },
    });
}

export function useDeletePurchaseOrder() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<void>, Error, number>({
        mutationFn: (id) => apiDelete<ApiResponse<void>>(ENDPOINTS.PURCHASE.ORDER.DELETE(id)),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.purchase.orders(),
            });
        },
    });
}

export function useFinalizePurchaseOrder() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<PurchaseOrder>, Error, number>({
        mutationFn: (id) =>
            apiPost<ApiResponse<PurchaseOrder>, void>(
                ENDPOINTS.PURCHASE.ORDER.FINALIZE(id),
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.purchase.orders(),
            });
        },
    });
}

export function useCancelPurchaseOrder() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<PurchaseOrder>, Error, number>({
        mutationFn: (id) =>
            apiPost<ApiResponse<PurchaseOrder>, void>(
                ENDPOINTS.PURCHASE.ORDER.CANCEL(id),
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.purchase.orders(),
            });
        },
    });
}

// ─── Cash Accounts Hook ────────────────────────────────────────────────────────

export function useCashAccounts() {
    return useQuery<CashAccount[]>({
        queryKey: queryKeys.cashAccounts.all,
        queryFn: async () => {
            const res = await apiGetData<CashAccount[]>(ENDPOINTS.CASH_ACCOUNTS);
            return res;
        },
    });
}

// ─── Supplier Payment Hooks ───────────────────────────────────────────────────

export function usePayments(params?: PaginationParams & { stock_receiving_id?: number; start_date?: string; end_date?: string }) {
    return useQuery<PaginatedResponse<ReceivingPayment>>({
        queryKey: [...queryKeys.purchase.payments(), params],
        queryFn: () => apiGetList<ReceivingPayment>(ENDPOINTS.PURCHASE.PAYMENT.LIST, params),
    });
}

export function usePaymentDetail(id: number | null) {
    return useQuery<ReceivingPayment>({
        queryKey: [...queryKeys.purchase.payments(), "detail", id || 0],
        queryFn: () => apiGetData<ReceivingPayment>(ENDPOINTS.PURCHASE.PAYMENT.DETAIL(id || 0)),
        enabled: id !== null && id > 0,
    });
}

export function useCreatePayment() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<ReceivingPayment>, Error, PaymentInput>({
        mutationFn: (data) =>
            apiPost<ApiResponse<ReceivingPayment>, PaymentInput>(
                ENDPOINTS.PURCHASE.PAYMENT.CREATE,
                data,
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.purchase.payments(),
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.purchase.receivings(),
            });
        },
    });
}

export function useUpdatePayment() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<ReceivingPayment>, Error, { id: number; data: PaymentInput }>({
        mutationFn: ({ id, data }) =>
            apiPut<ApiResponse<ReceivingPayment>, PaymentInput>(
                ENDPOINTS.PURCHASE.PAYMENT.UPDATE(id),
                data,
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.purchase.payments(),
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.purchase.receivings(),
            });
        },
    });
}

export function useDeletePayment() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<ReceivingPayment>, Error, { id: number; alasan?: string }>({
        mutationFn: async ({ id, alasan }) => {
            const { data } = await apiClient.delete<ApiResponse<ReceivingPayment>>(
                ENDPOINTS.PURCHASE.PAYMENT.DELETE(id),
                { data: { alasan } }
            );
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.purchase.payments(),
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.purchase.receivings(),
            });
        },
    });
}
