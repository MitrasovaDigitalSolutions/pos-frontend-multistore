import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGetData, apiGetList, apiPost, apiPut, apiPatch, apiDelete, apiGet } from "@/shared/api/api-client";
import { apiClient } from "@/shared/api/axios";
import { queryKeys } from "@/lib/query-keys";
import { ENDPOINTS } from "@/shared/api/endpoints";
import type { ApiResponse, PaginatedResponse, PaginationParams } from "@/types/api";
import type { Receiving, PurchaseOrder, ReceivingPayment, CashAccount, PurchaseReturn, PaymentSummary } from "../types";
import type { ReceivingInput, ReceivingHeaderInput } from "../schemas/receiving-schema";
import type { PurchaseOrderHeaderInput, PurchaseOrderBulkItemsInput } from "../schemas/order-schema";
import type { PaymentInput } from "../schemas/payment-schema";
import type { PurchaseReturnInput, PurchaseReturnHeaderInput, PurchaseReturnBulkItemsInput } from "../schemas/return-schema";
import type { Product } from "@/features/products/types";

// ─── Stock Receiving Hooks ────────────────────────────────────────────────────

export function useReceivings(params?: PaginationParams & { search?: string; status?: string; supplier_id?: number; start_date?: string; end_date?: string }) {
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

export function useCreateReceivingHeader() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<Receiving>, Error, ReceivingHeaderInput>({
        mutationFn: (data) =>
            apiPost<ApiResponse<Receiving>, ReceivingHeaderInput>(
                ENDPOINTS.PURCHASE.RECEIVING.CREATE,
                data,
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.purchase.receivings(),
            });
        },
    });
}

export function useBulkReplaceReceivingItems() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<Receiving>, Error, { id: number; data: unknown }>({
        mutationFn: ({ id, data }) =>
            apiPut<ApiResponse<Receiving>, unknown>(
                ENDPOINTS.PURCHASE.RECEIVING.ITEMS_REPLACE(id),
                data,
            ),
        onSuccess: (_, _variables) => {
            queryClient.invalidateQueries({
                queryKey: ["purchase"],
            });
        },
    });
}

export function useCompleteReceiving() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<Receiving>, Error, number>({
        mutationFn: (id) =>
            apiPost<ApiResponse<Receiving>, void>(
                ENDPOINTS.PURCHASE.RECEIVING.COMPLETE(id),
            ),
        onSuccess: (_, _id) => {
            queryClient.invalidateQueries({
                queryKey: ["purchase"],
            });
            queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
        },
    });
}

export interface ReceivingScanResponse {
    product: Product & { harga_beli_terakhir: number; harga_jual: number };
    po_item?: {
        kuantitas_dipesan: number;
        kuantitas_sudah_diterima: number;
        sisa: number;
        harga_estimasi: number;
    } | null;
}

export function useScanReceivingProduct() {
    return useMutation<ApiResponse<ReceivingScanResponse>, Error, { receiving_id: number; barcode: string }>({
        mutationFn: (data) =>
            apiPost<ApiResponse<ReceivingScanResponse>, { receiving_id: number; barcode: string }>(
                ENDPOINTS.PURCHASE.RECEIVING.SCAN,
                data,
            ),
    });
}


export function useUpdateReceiving() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<Receiving>, Error, { id: number; data: unknown }>({
        mutationFn: ({ id, data }) =>
            apiPut<ApiResponse<Receiving>, unknown>(
                ENDPOINTS.PURCHASE.RECEIVING.UPDATE(id),
                data,
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["purchase"],
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
                queryKey: ["purchase"],
            });
            queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
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

// Step 1: Create PO Header only (tanpa items)
export function useCreatePurchaseOrderHeader() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<PurchaseOrder>, Error, PurchaseOrderHeaderInput>({
        mutationFn: (data) =>
            apiPost<ApiResponse<PurchaseOrder>, PurchaseOrderHeaderInput>(
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

// Step 3: Bulk submit items to PO
export function useBulkSubmitPurchaseOrderItems() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<PurchaseOrder>, Error, { id: number; data: PurchaseOrderBulkItemsInput }>({
        mutationFn: ({ id, data }) =>
            apiPost<ApiResponse<PurchaseOrder>, PurchaseOrderBulkItemsInput>(
                ENDPOINTS.PURCHASE.ORDER.ITEMS_BULK(id),
                data,
            ),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.purchase.orders(),
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.purchase.orderDetail(variables.id),
            });
        },
    });
}

// Replace all items in PO (for editing existing items)
export function useBulkReplacePurchaseOrderItems() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<PurchaseOrder>, Error, { id: number; data: PurchaseOrderBulkItemsInput }>({
        mutationFn: ({ id, data }) =>
            apiPut<ApiResponse<PurchaseOrder>, PurchaseOrderBulkItemsInput>(
                ENDPOINTS.PURCHASE.ORDER.ITEMS_REPLACE(id),
                data,
            ),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.purchase.orders(),
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.purchase.orderDetail(variables.id),
            });
        },
    });
}

// Outstanding POs (ordered, belum selesai diterima)
export function useOutstandingPurchaseOrders(params?: PaginationParams) {
    return useQuery<PaginatedResponse<PurchaseOrder>>({
        queryKey: [...queryKeys.purchase.outstanding(), params],
        queryFn: () => apiGetList<PurchaseOrder>(ENDPOINTS.PURCHASE.ORDER.OUTSTANDING, params),
    });
}

// Receivings linked to a specific PO
export function usePurchaseOrderReceivings(poId: number | null, params?: PaginationParams) {
    return useQuery<PaginatedResponse<Receiving>>({
        queryKey: [...queryKeys.purchase.orderReceivings(poId || 0), params],
        queryFn: () => apiGetList<Receiving>(ENDPOINTS.PURCHASE.ORDER.RECEIVINGS(poId || 0), params),
        enabled: poId !== null && poId > 0,
    });
}

// Legacy: Create PO with items (backward compat — kept but not used by new flow)
export function useCreatePurchaseOrder() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<PurchaseOrder>, Error, PurchaseOrderHeaderInput>({
        mutationFn: (data) =>
            apiPost<ApiResponse<PurchaseOrder>, PurchaseOrderHeaderInput>(
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
    return useMutation<ApiResponse<PurchaseOrder>, Error, { id: number; data: PurchaseOrderHeaderInput }>({
        mutationFn: ({ id, data }) =>
            apiPut<ApiResponse<PurchaseOrder>, PurchaseOrderHeaderInput>(
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

// ─── Barcode Lookup ─────────────────────────────────────────────────────────

export async function lookupProductByBarcode(barcode: string): Promise<Product[]> {
    const res = await apiGet<ApiResponse<Product[]>>(
        ENDPOINTS.PRODUCTS.BARCODE(barcode),
    );
    return res.data;
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

export function usePayments(params?: PaginationParams & { stock_receiving_id?: number; receiving_id?: number; start_date?: string; end_date?: string }) {
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

export function usePaymentSummary(receivingId: number | null) {
    return useQuery<PaymentSummary>({
        queryKey: [...queryKeys.purchase.payments(), "summary", receivingId || 0],
        queryFn: async () => {
            if (!receivingId) throw new Error("Receiving ID is required");
            try {
                // Try fetching from the summary endpoint first
                const res = await apiGetData<PaymentSummary>(
                    ENDPOINTS.PURCHASE.PAYMENT.SUMMARY(receivingId)
                );
                if (!res) {
                    throw new Error("Empty summary response");
                }
                return res;
            } catch (err) {
                console.warn("Summary endpoint failed or not found, falling back to client-side aggregation:", err);

                // Fallback: fetch receiving detail and all payments
                const queryParams: PaginationParams & { stock_receiving_id: number } = {
                    per_page: 100,
                    stock_receiving_id: receivingId,
                };
                const [receiving, paymentsResponse] = await Promise.all([
                    apiGetData<Receiving>(ENDPOINTS.PURCHASE.RECEIVING.DETAIL(receivingId)),
                    apiGetList<ReceivingPayment>(ENDPOINTS.PURCHASE.PAYMENT.LIST, queryParams),
                ]);

                // Filter payments belonging to this receiving and which are completed (not voided)
                const completedPayments = (paymentsResponse.data || []).filter(
                    (p) => (p.referensi_id === receivingId || p.receiving?.id === receivingId) && p.status === "completed"
                );

                const totalFaktur = receiving.nilai_faktur || 0;
                const totalDibayar = completedPayments.reduce((sum, p) => sum + p.total, 0);
                const sisaHutang = Math.max(0, totalFaktur - totalDibayar);

                let statusPembayaran: "pending" | "partial" | "paid" = "pending";
                if (totalDibayar >= totalFaktur && totalFaktur > 0) {
                    statusPembayaran = "paid";
                } else if (totalDibayar > 0) {
                    statusPembayaran = "partial";
                }

                return {
                    receiving_id: receivingId,
                    nomor_penerimaan: receiving.nomor_penerimaan,
                    total_faktur: totalFaktur,
                    total_dibayar: totalDibayar,
                    sisa_hutang: sisaHutang,
                    status_pembayaran: statusPembayaran,
                    payments: completedPayments.map((p) => ({
                        id: p.id,
                        jumlah: p.total,
                        metode: p.metode_pembayaran,
                        tanggal: p.created_at,
                    })),
                };
            }
        },
        enabled: receivingId !== null && receivingId > 0,
    });
}

export function useOutstandingReceivings() {
    return useQuery<Receiving[]>({
        queryKey: [...queryKeys.purchase.receivings(), "outstanding"],
        queryFn: async () => {
            const queryParams: PaginationParams & { status: string } = {
                status: "completed",
                per_page: 100,
            };
            const res = await apiGetList<Receiving>(ENDPOINTS.PURCHASE.RECEIVING.LIST, queryParams);
            // Fallback filtering in case backend doesn't filter status_pembayaran
            return (res.data || []).filter(
                (r) => r.status_pembayaran === "pending" || r.status_pembayaran === "partial"
            );
        },
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

// ─── Purchase Return Hooks ───────────────────────────────────────────────────

export function usePurchaseReturns(params?: PaginationParams & { search?: string; status?: string; supplier_id?: number; stock_receiving_id?: number; start_date?: string; end_date?: string }) {
    return useQuery<PaginatedResponse<PurchaseReturn>>({
        queryKey: [...queryKeys.purchase.returns(), params],
        queryFn: () => apiGetList<PurchaseReturn>(ENDPOINTS.PURCHASE.RETURN.LIST, params),
    });
}

export function usePurchaseReturnDetail(id: number | null) {
    return useQuery<PurchaseReturn>({
        queryKey: [...queryKeys.purchase.returnDetail(id || 0)],
        queryFn: () => apiGetData<PurchaseReturn>(ENDPOINTS.PURCHASE.RETURN.DETAIL(id || 0)),
        enabled: id !== null && id > 0,
    });
}

export function useCreatePurchaseReturn() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<PurchaseReturn>, Error, PurchaseReturnInput>({
        mutationFn: (data) =>
            apiPost<ApiResponse<PurchaseReturn>, PurchaseReturnInput>(
                ENDPOINTS.PURCHASE.RETURN.CREATE,
                data,
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.purchase.returns(),
            });
        },
    });
}

export function useCreatePurchaseReturnHeader() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<PurchaseReturn>, Error, PurchaseReturnHeaderInput>({
        mutationFn: (data) =>
            apiPost<ApiResponse<PurchaseReturn>, PurchaseReturnHeaderInput>(
                ENDPOINTS.PURCHASE.RETURN.CREATE,
                data,
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.purchase.returns(),
            });
        },
    });
}

export function useUpdatePurchaseReturn() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<PurchaseReturn>, Error, { id: number; data: unknown }>({
        mutationFn: ({ id, data }) =>
            apiPut<ApiResponse<PurchaseReturn>, unknown>(
                ENDPOINTS.PURCHASE.RETURN.UPDATE(id),
                data,
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.purchase.returns(),
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.purchase.all,
            });
        },
    });
}

export function useBulkReplacePurchaseReturnItems() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<PurchaseReturn>, Error, { id: number; data: PurchaseReturnBulkItemsInput }>({
        mutationFn: ({ id, data }) =>
            apiPut<ApiResponse<PurchaseReturn>, PurchaseReturnBulkItemsInput>(
                ENDPOINTS.PURCHASE.RETURN.ITEMS_REPLACE(id),
                data,
            ),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.purchase.returns(),
            });
            queryClient.invalidateQueries({
                queryKey: [...queryKeys.purchase.returns(), "detail", variables.id],
            });
        },
    });
}

export function useDeletePurchaseReturn() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<void>, Error, number>({
        mutationFn: (id) => apiDelete<ApiResponse<void>>(ENDPOINTS.PURCHASE.RETURN.DELETE(id)),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.purchase.returns(),
            });
        },
    });
}

export interface FinalizeReturnInput {
    impact_type?: "refund" | "credit" | "credit_note" | "exchange" | null;
    resolution_type?: "refund" | "credit" | "credit_note" | "exchange" | null;
    cash_account_id?: number | null;
    stock_receiving_id?: number | null;
    catatan_penyelesaian?: string | null;
}

export function useFinalizePurchaseReturn() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<PurchaseReturn>, Error, { id: number; data: FinalizeReturnInput }>({
        mutationFn: ({ id, data }) =>
            apiPost<ApiResponse<PurchaseReturn>, FinalizeReturnInput>(
                ENDPOINTS.PURCHASE.RETURN.FINALIZE(id),
                data,
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.purchase.returns(),
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.products.all,
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.cashAccounts.all,
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.purchase.receivings(),
            });
        },
    });
}

export interface ReturnableItem {
    product_id: number;
    product: Product;
    kuantitas_diterima: number;
    kuantitas_diretur: number;
    kuantitas_sisa: number;
    harga_beli: number;
}

export function useReturnableItems(receivingId: number | null) {
    return useQuery<ReturnableItem[]>({
        queryKey: [...queryKeys.purchase.receivings(), "returnable-items", receivingId || 0],
        queryFn: async () => {
            if (!receivingId) return [];
            const res = await apiGetData<ReturnableItem[]>(
                ENDPOINTS.PURCHASE.RETURN.RETURNABLE_ITEMS(receivingId),
            );
            return res;
        },
        enabled: receivingId !== null && receivingId > 0,
    });
}

export interface ReturnScanResponse {
    product: {
        id: number;
        nama: string;
        barcode: string;
        harga_beli: number;
    };
    kuantitas_diterima: number;
    kuantitas_diretur: number;
    kuantitas_sisa: number;
}

export function useScanReturnProduct() {
    return useMutation<ApiResponse<ReturnScanResponse>, Error, { receiving_id: number; barcode: string }>({
        mutationFn: (data) =>
            apiPost<ApiResponse<ReturnScanResponse>, { receiving_id: number; barcode: string }>(
                ENDPOINTS.PURCHASE.RETURN.SCAN,
                data,
            ),
    });
}
