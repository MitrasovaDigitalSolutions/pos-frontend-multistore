import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGetData, apiPost, apiGetList } from "@/shared/api/api-client";
import { queryKeys } from "@/lib/query-keys";
import { ENDPOINTS } from "@/shared/api/endpoints";
import type { ApiResponse, PaginatedResponse, PaginationParams } from "@/types/api";

export interface CashLedger {
    id: number;
    cash_account_id: number;
    amount: number;
    tipe: "inflow" | "outflow" | "transfer";
    kategori: string;
    sale_id?: number | null;
    supplier_payment_id?: number | null;
    purchase_return_settlement_id?: number | null;
    expense_id?: number | null;
    cash_drawer_movement_id?: number | null;
    cash_drawer_session_id?: number | null;
    created_at: string;
    updated_at?: string;

    // Relations (Laravel camelCase / snake_case relations)
    cashAccount?: CashAccount | null;
    cash_account?: CashAccount | null;
    
    sale?: {
        id: number;
        nomor_transaksi: string;
        total?: number;
    } | null;

    supplierPayment?: {
        id: number;
        nomor_pembayaran: string;
        catatan?: string | null;
    } | null;
    supplier_payment?: {
        id: number;
        nomor_pembayaran: string;
        catatan?: string | null;
    } | null;

    purchaseReturnSettlement?: {
        id: number;
        nomor_transaksi: string;
        purchase_return?: {
            id: number;
            nomor_transaksi: string;
        } | null;
        purchaseReturn?: {
            id: number;
            nomor_transaksi: string;
        } | null;
    } | null;
    purchase_return_settlement?: {
        id: number;
        nomor_transaksi: string;
        purchase_return?: {
            id: number;
            nomor_transaksi: string;
        } | null;
        purchaseReturn?: {
            id: number;
            nomor_transaksi: string;
        } | null;
    } | null;

    expense?: {
        id: number;
        nomor_pengeluaran?: string;
        nama?: string | null;
        catatan?: string | null;
        category?: {
            id: number;
            nama: string;
        } | null;
    } | null;

    cashDrawerMovement?: {
        id: number;
        note?: string | null;
    } | null;
    cash_drawer_movement?: {
        id: number;
        note?: string | null;
    } | null;

    cashDrawerSession?: {
        id: number;
        opened_at?: string;
        closed_at?: string | null;
    } | null;
    cash_drawer_session?: {
        id: number;
        opened_at?: string;
        closed_at?: string | null;
    } | null;
}

export interface CashFlowFilters extends PaginationParams {
    cash_account_id?: number;
    tipe?: string;
    kategori?: string;
    from?: string;
    to?: string;
    start_date?: string;
    end_date?: string;
}


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

export function useCashFlow(filters?: CashFlowFilters) {
    return useQuery<PaginatedResponse<CashLedger>>({
        queryKey: queryKeys.cashAccounts.cashFlow(filters),
        queryFn: () => apiGetList<CashLedger>(ENDPOINTS.CASH_FLOW, filters),
    });
}

export function useAccountCashFlow(id: number, filters?: CashFlowFilters) {
    return useQuery<PaginatedResponse<CashLedger>>({
        queryKey: queryKeys.cashAccounts.accountCashFlow(id, filters),
        queryFn: () => apiGetList<CashLedger>(ENDPOINTS.ACCOUNT_CASH_FLOW(id), filters),
        enabled: !!id,
    });
}

