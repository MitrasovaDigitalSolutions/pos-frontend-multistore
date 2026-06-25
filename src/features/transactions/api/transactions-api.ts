import { useQuery } from "@tanstack/react-query";
import { apiGetData, apiGetList } from "@/shared/api/api-client";
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
