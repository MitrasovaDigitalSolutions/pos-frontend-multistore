import { useQuery, useMutation } from "@tanstack/react-query";
import { apiGetData, apiGetList, apiPost } from "@/shared/api/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { Transaction, TransactionQueryParams } from "../types";
import type { PaginatedResponse } from "@/types/api";

export function useTransactionDetail(uid: string | number) {
    return useQuery<Transaction>({
        queryKey: [...queryKeys.transactions.all, "detail", uid],
        queryFn: () => apiGetData<Transaction>(`/v1/transactions/${uid}`),
        enabled: !!uid,
    });
}

export function useTransactionsList(params?: TransactionQueryParams) {
    return useQuery<PaginatedResponse<Transaction>>({
        queryKey: [...queryKeys.transactions.all, "list", params],
        queryFn: () => apiGetList<Transaction>("/v1/transactions", params),
    });
}

export function useVoidTransaction() {
    return useMutation<{ message: string; transaction: Transaction }, Error, { id: string | number; void_reason: string }>({
        mutationFn: ({ id, void_reason }) => apiPost(`/v1/transactions/${id}/void`, { void_reason }),
    });
}
