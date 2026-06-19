import { useQuery } from "@tanstack/react-query";
import { apiGetData } from "@/shared/api/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { Transaction } from "../types";

export function useTransactionDetail(id: string | number) {
    return useQuery<Transaction>({
        queryKey: [...queryKeys.transactions.all, "detail", id],
        queryFn: () => apiGetData<Transaction>(`/v1/transactions/${id}`),
        enabled: !!id,
    });
}
