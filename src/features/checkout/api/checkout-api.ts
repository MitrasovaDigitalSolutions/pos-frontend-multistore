import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    apiGet,
    apiGetData,
    apiGetList,
    apiPost,
    apiPut,
    apiDelete,
} from "@/shared/api/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { ApiResponse, PaginatedResponse, PaginationParams } from "@/types/api";
import type { HoldTransaction, TrxData, Receipt } from "../types";
import type { Product } from "@/features/products/types";

export function useHeldTransactions(params?: PaginationParams) {
    return useQuery<PaginatedResponse<HoldTransaction>>({
        queryKey: [...queryKeys.transactions.onHold(), params],
        queryFn: () =>
            apiGetList<HoldTransaction>("/v1/transactions/on-hold", params),
    });
}

export function useCreateTransaction() {
    return useMutation<ApiResponse<{ id: number }>, Error>({
        mutationFn: () =>
            apiPost<ApiResponse<{ id: number }>>("/v1/transactions"),
    });
}

export function useAddTransactionItem() {
    return useMutation<
        ApiResponse<unknown>,
        Error,
        { transactionId: number; product_id: number; quantity: number }
    >({
        mutationFn: ({ transactionId, product_id, quantity }) =>
            apiPost(`/v1/transactions/${transactionId}/items`, {
                product_id,
                quantity,
            }),
    });
}

export function useUpdateTransactionItem() {
    return useMutation<
        ApiResponse<unknown>,
        Error,
        { transactionId: number; itemId: number; quantity: number }
    >({
        mutationFn: ({ transactionId, itemId, quantity }) =>
            apiPut(`/v1/transactions/${transactionId}/items/${itemId}`, {
                quantity,
            }),
    });
}

export function useDeleteTransactionItem() {
    return useMutation<
        ApiResponse<unknown>,
        Error,
        { transactionId: number; itemId: number }
    >({
        mutationFn: ({ transactionId, itemId }) =>
            apiDelete(`/v1/transactions/${transactionId}/items/${itemId}`),
    });
}

export function useTransactionDetail() {
    return useMutation<ApiResponse<TrxData>, Error, number>({
        mutationFn: (id) =>
            apiGet<ApiResponse<TrxData>>(`/v1/transactions/${id}`),
    });
}

export function useHoldTransaction() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<unknown>, Error, number>({
        mutationFn: (id) => apiPost(`/v1/transactions/${id}/hold`),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.transactions.onHold(),
            });
        },
    });
}

export function useRecallTransaction() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<TrxData>, Error, number>({
        mutationFn: (id) => apiPost(`/v1/transactions/${id}/recall`),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.transactions.onHold(),
            });
        },
    });
}

export function usePayCash() {
    const queryClient = useQueryClient();
    return useMutation<
        ApiResponse<Receipt>,
        Error,
        { transactionId: number; cash_received: number }
    >({
        mutationFn: ({ transactionId, cash_received }) =>
            apiPost(`/v1/transactions/${transactionId}/pay/cash`, {
                cash_received,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
        },
    });
}

export function usePayCard() {
    const queryClient = useQueryClient();
    return useMutation<
        ApiResponse<Receipt>,
        Error,
        {
            transactionId: number;
            card_type: string;
            last_four: string;
            reference_number: string;
        }
    >({
        mutationFn: ({ transactionId, ...cardDetails }) =>
            apiPost(`/v1/transactions/${transactionId}/pay/card`, cardDetails),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
        },
    });
}

export async function lookupBarcode(barcode: string): Promise<Product> {
    const res = await apiGet<ApiResponse<Product>>(
        `/v1/products/barcode/${encodeURIComponent(barcode)}`,
    );
    return res.data;
}
