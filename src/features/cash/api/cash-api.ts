import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGetData, apiPost, apiGetList, apiPut, apiDelete } from "@/shared/api/api-client";
import { queryKeys } from "@/lib/query-keys";
import { ENDPOINTS } from "@/shared/api/endpoints";
import type { ApiResponse, PaginatedResponse, PaginationParams } from "@/types/api";

export interface CashLedgerUser {
    uid: string;
    nama?: string | null;
    name?: string | null;
    email?: string | null;
    role?: string | null;
}

export interface CashLedgerCategory {
    uid: string;
    nama: string;
    keterangan?: string | null;
    is_recurring?: boolean;
    hari_jatuh_tempo?: number | null;
    created_at?: string;
    updated_at?: string;
    chart_of_account_uid?: string | null;
}

export interface CashLedgerExpense {
    uid: string;
    nomor_pengeluaran?: string | null;
    nama?: string | null;
    amount?: number;
    catatan?: string | null;
    tanggal?: string | null;
    created_at?: string;
    updated_at?: string;
    expense_category_uid?: string | null;
    cash_account_uid?: string | null;
    user_uid?: string | null;
    status?: string | null;
    catatan_void?: string | null;
    void_by_uid?: string | null;
    voided_at?: string | null;
    category?: CashLedgerCategory | null;
}

export interface CashLedgerSale {
    uid: string;
    nomor_transaksi: string;
    total?: number;
    catatan?: string | null;
    created_at?: string;
}

export interface CashLedgerSupplierPayment {
    uid: string;
    nomor_pembayaran: string;
    catatan?: string | null;
    amount?: number;
    supplier?: {
        nama?: string;
    } | null;
}

export interface CashLedgerPurchaseReturnSettlement {
    uid: string;
    nomor_transaksi?: string;
    purchase_return?: {
        uid: string;
        nomor_transaksi: string;
    } | null;
    purchaseReturn?: {
        uid: string;
        nomor_transaksi: string;
    } | null;
}

export interface CashLedgerDrawerMovement {
    uid: string;
    note?: string | null;
    tipe?: string | null;
    amount?: number;
    cash_drawer_session_uid?: string | null;
}

export interface CashLedgerDrawerSession {
    uid: string;
    status?: string;
    opening_balance?: number;
    expected_cash?: number;
    actual_closing_balance?: number | null;
    cash_sales_total?: number;
    cash_refunds_total?: number;
    cash_in_total?: number;
    cash_out_total?: number;
    difference?: number | null;
    opening_note?: string | null;
    closing_note?: string | null;
    opened_at?: string;
    closed_at?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface CashLedgerStockReceiving {
    uid: string;
    nomor_penerimaan?: string;
    nomor_po?: string;
    catatan?: string | null;
    supplier?: {
        nama?: string;
    } | null;
}

export interface CashLedgerMemberPayment {
    uid: string;
    nomor_pembayaran?: string;
    catatan?: string | null;
    member?: {
        nama?: string;
        kode?: string;
    } | null;
}

export interface CashLedgerChartOfAccount {
    uid: string;
    kode_akun?: string;
    nama_akun?: string;
    tipe_akun?: string;
}

export interface CashLedger {
    uid: string;
    cash_account_uid: string;
    amount: number;
    tipe: "debit" | "credit" | "inflow" | "outflow" | "transfer" | string;
    kategori: string;
    catatan?: string | null;
    created_at: string;
    updated_at?: string;

    // Direct UIDs
    sale_uid?: string | null;
    supplier_payment_uid?: string | null;
    purchase_return_settlement_uid?: string | null;
    expense_uid?: string | null;
    cash_drawer_movement_uid?: string | null;
    stock_receiving_uid?: string | null;
    cash_drawer_session_uid?: string | null;
    chart_of_account_uid?: string | null;
    member_payment_uid?: string | null;
    user_uid?: string | null;

    // Relations (camelCase & snake_case)
    cashAccount?: CashAccount | null;
    cash_account?: CashAccount | null;

    user?: CashLedgerUser | null;

    sale?: CashLedgerSale | null;

    supplierPayment?: CashLedgerSupplierPayment | null;
    supplier_payment?: CashLedgerSupplierPayment | null;

    purchaseReturnSettlement?: CashLedgerPurchaseReturnSettlement | null;
    purchase_return_settlement?: CashLedgerPurchaseReturnSettlement | null;

    expense?: CashLedgerExpense | null;

    cashDrawerMovement?: CashLedgerDrawerMovement | null;
    cash_drawer_movement?: CashLedgerDrawerMovement | null;

    cashDrawerSession?: CashLedgerDrawerSession | null;
    cash_drawer_session?: CashLedgerDrawerSession | null;

    stockReceiving?: CashLedgerStockReceiving | null;
    stock_receiving?: CashLedgerStockReceiving | null;

    memberPayment?: CashLedgerMemberPayment | null;
    member_payment?: CashLedgerMemberPayment | null;

    chartOfAccount?: CashLedgerChartOfAccount | null;
    chart_of_account?: CashLedgerChartOfAccount | null;
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
    tipe: "cash" | "bank" | "register" | string;
    nomor_rekening?: string | null;
    deskripsi?: string | null;
    saldo: number;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface CreateCashAccountInput {
    nama: string;
    tipe: "cash" | "bank" | "register";
    nomor_rekening?: string | null;
    deskripsi?: string | null;
    saldo_awal?: number;
}

export interface UpdateCashAccountInput {
    nama?: string;
    tipe?: "cash" | "bank" | "register";
    nomor_rekening?: string | null;
    deskripsi?: string | null;
    is_active?: boolean;
}

export interface DebitCreditInput {
    amount: number;
    chart_of_account_uid?: string | null;
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

export function useCashAccountDetail(uid: string) {
    return useQuery<CashAccount>({
        queryKey: queryKeys.cashAccounts.detail(uid),
        queryFn: () => apiGetData<CashAccount>(`${ENDPOINTS.CASH_ACCOUNTS}/${uid}`),
        enabled: !!uid,
    });
}

export function useCreateCashAccount() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<CashAccount>, Error, CreateCashAccountInput>({
        mutationFn: (data) =>
            apiPost<ApiResponse<CashAccount>, CreateCashAccountInput>(
                ENDPOINTS.CASH_ACCOUNTS,
                data,
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.cashAccounts.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.activityLogs.all });
        },
    });
}

export function useUpdateCashAccount() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<CashAccount>, Error, { uid: string; data: UpdateCashAccountInput }>({
        mutationFn: ({ uid, data }) =>
            apiPut<ApiResponse<CashAccount>, UpdateCashAccountInput>(
                `${ENDPOINTS.CASH_ACCOUNTS}/${uid}`,
                data,
            ),
        onSuccess: (_res, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.cashAccounts.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.cashAccounts.detail(variables.uid) });
            queryClient.invalidateQueries({ queryKey: queryKeys.activityLogs.all });
        },
    });
}

export function useDeleteCashAccount() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<null>, Error, string>({
        mutationFn: (uid) =>
            apiDelete<ApiResponse<null>>(`${ENDPOINTS.CASH_ACCOUNTS}/${uid}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.cashAccounts.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.activityLogs.all });
        },
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

