import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGetData, apiPost, apiGetList } from "@/shared/api/api-client";
import { queryKeys } from "@/lib/query-keys";
import { ENDPOINTS } from "@/shared/api/endpoints";
import type { ApiResponse, PaginatedResponse, PaginationParams } from "@/types/api";

export interface CashLedger {
    uid: string;
    cash_account_uid: string;
    amount: number;
    tipe: "inflow" | "outflow" | "transfer";
    kategori: string;
    sale_uid?: string | null;
    supplier_payment_uid?: string | null;
    purchase_return_settlement_uid?: string | null;
    expense_uid?: string | null;
    cash_drawer_movement_uid?: string | null;
    cash_drawer_session_uid?: string | null;
    created_at: string;
    updated_at?: string;

    // Relations (Laravel camelCase / snake_case relations)
    cashAccount?: CashAccount | null;
    cash_account?: CashAccount | null;

    sale?: {
        uid: string;
        nomor_transaksi: string;
        total?: number;
    } | null;

    supplierPayment?: {
        uid: string;
        nomor_pembayaran: string;
        catatan?: string | null;
    } | null;
    supplier_payment?: {
        uid: string;
        nomor_pembayaran: string;
        catatan?: string | null;
    } | null;

    purchaseReturnSettlement?: {
        uid: string;
        nomor_transaksi: string;
        purchase_return?: {
            uid: string;
            nomor_transaksi: string;
        } | null;
        purchaseReturn?: {
            uid: string;
            nomor_transaksi: string;
        } | null;
    } | null;
    purchase_return_settlement?: {
        uid: string;
        nomor_transaksi: string;
        purchase_return?: {
            uid: string;
            nomor_transaksi: string;
        } | null;
        purchaseReturn?: {
            uid: string;
            nomor_transaksi: string;
        } | null;
    } | null;

    expense?: {
        uid: string;
        nomor_pengeluaran?: string;
        nama?: string | null;
        catatan?: string | null;
        category?: {
            uid: string;
            nama: string;
        } | null;
    } | null;

    cashDrawerMovement?: {
        uid: string;
        note?: string | null;
    } | null;
    cash_drawer_movement?: {
        uid: string;
        note?: string | null;
    } | null;

    cashDrawerSession?: {
        uid: string;
        opened_at?: string;
        closed_at?: string | null;
    } | null;
    cash_drawer_session?: {
        uid: string;
        opened_at?: string;
        closed_at?: string | null;
    } | null;
}

export interface CashFlowFilters extends PaginationParams {
    cash_account_uid?: string;
    tipe?: string;
    kategori?: string;
    from?: string;
    to?: string;
    start_date?: string;
    end_date?: string;
}


export interface CashAccount {
    uid: string;
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
    from_account_uid: string;
    to_account_uid: string;
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
    return useMutation<ApiResponse<CashAccount>, Error, { uid: string; data: DebitCreditInput }>({
        mutationFn: ({ uid, data }) =>
            apiPost<ApiResponse<CashAccount>, DebitCreditInput>(
                `${ENDPOINTS.CASH_ACCOUNTS}/${uid}/debit`,
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
    return useMutation<ApiResponse<CashAccount>, Error, { uid: string; data: DebitCreditInput }>({
        mutationFn: ({ uid, data }) =>
            apiPost<ApiResponse<CashAccount>, DebitCreditInput>(
                `${ENDPOINTS.CASH_ACCOUNTS}/${uid}/credit`,
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

export function useCashFlow(filters?: CashFlowFilters) {
    return useQuery<PaginatedResponse<CashLedger>>({
        queryKey: queryKeys.cashAccounts.cashFlow(filters),
        queryFn: () => apiGetList<CashLedger>(ENDPOINTS.CASH_FLOW, filters),
    });
}

export function useAccountCashFlow(uid: string, filters?: CashFlowFilters) {
    return useQuery<PaginatedResponse<CashLedger>>({
        queryKey: queryKeys.cashAccounts.accountCashFlow(uid, filters),
        queryFn: () => apiGetList<CashLedger>(ENDPOINTS.ACCOUNT_CASH_FLOW(uid), filters),
        enabled: !!uid,
    });
}

