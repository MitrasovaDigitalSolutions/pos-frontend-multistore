import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGetData, apiPost } from "@/shared/api/api-client";
import { queryKeys } from "@/lib/query-keys";
import { ENDPOINTS } from "@/shared/api/endpoints";
import type { ApiResponse } from "@/types/api";

export interface CashAccount {
    id: number;
    nama: string;
    tipe: string;
    nomor_rekening?: string | null;
    saldo: number;
    created_at?: string;
    updated_at?: string;
}

export interface DebitCreditInput {
    amount: number;
    kategori?: string | null;
    catatan?: string | null;
}

export interface TransferInput {
    from_account_id: number;
    to_account_id: number;
    amount: number;
    catatan?: string | null;
}

export interface TransferResponse {
    from_account: CashAccount;
    to_account: CashAccount;
}

export function useCashAccounts() {
    return useQuery<CashAccount[]>({
        queryKey: queryKeys.cashAccounts.all,
        queryFn: () => apiGetData<CashAccount[]>(ENDPOINTS.CASH_ACCOUNTS),
    });
}

export function useDebitCashAccount() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<CashAccount>, Error, { id: number; data: DebitCreditInput }>({
        mutationFn: ({ id, data }) =>
            apiPost<ApiResponse<CashAccount>, DebitCreditInput>(
                `${ENDPOINTS.CASH_ACCOUNTS}/${id}/debit`,
                data,
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.cashAccounts.all });
            // Invalidate activity logs as well so the logs feed updates instantly
            queryClient.invalidateQueries({ queryKey: queryKeys.activityLogs.all });
        },
    });
}

export function useCreditCashAccount() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<CashAccount>, Error, { id: number; data: DebitCreditInput }>({
        mutationFn: ({ id, data }) =>
            apiPost<ApiResponse<CashAccount>, DebitCreditInput>(
                `${ENDPOINTS.CASH_ACCOUNTS}/${id}/credit`,
                data,
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.cashAccounts.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.activityLogs.all });
        },
    });
}

export function useTransferCashAccount() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<TransferResponse>, Error, TransferInput>({
        mutationFn: (data) =>
            apiPost<ApiResponse<TransferResponse>, TransferInput>(
                `${ENDPOINTS.CASH_ACCOUNTS}/transfer`,
                data,
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.cashAccounts.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.activityLogs.all });
        },
    });
}
