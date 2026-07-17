import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGetData, apiGetList, apiPost } from "@/shared/api/api-client";
import { ENDPOINTS } from "@/shared/api/endpoints";
import { queryKeys } from "@/lib/query-keys";
import type { ApiResponse, PaginationParams } from "@/types/api";
import type { StockTransfer } from "../types";

export interface StockTransferQueryParams extends PaginationParams {
  direction?: "outgoing" | "incoming";
  status?: string;
}

export function useStockTransfers(params?: StockTransferQueryParams) {
  return useQuery({
    queryKey: [...queryKeys.inventory.stockTransfers(), params],
    queryFn: () => apiGetList<StockTransfer>(ENDPOINTS.INVENTORY.STOCK_TRANSFERS.LIST, params),
  });
}

export function useStockTransferDetail(uid: string) {
  return useQuery({
    queryKey: queryKeys.inventory.stockTransferDetail(uid),
    queryFn: () => apiGetData<StockTransfer>(ENDPOINTS.INVENTORY.STOCK_TRANSFERS.DETAIL(uid)),
    enabled: !!uid,
  });
}

export function useCreateStockTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { store_uid_destination: string; catatan?: string | null; items: { product_uid: string; kuantitas: number }[] }) =>
      apiPost<ApiResponse<StockTransfer>, typeof payload>(ENDPOINTS.INVENTORY.STOCK_TRANSFERS.CREATE, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.inventory.stockTransfers() });
    },
  });
}

export function useFinalizeStockTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (uid: string) => apiPost<ApiResponse<StockTransfer>, void>(ENDPOINTS.INVENTORY.STOCK_TRANSFERS.FINALIZE(uid)),
    onSuccess: (_, uid) => {
      qc.invalidateQueries({ queryKey: queryKeys.inventory.stockTransfers() });
      qc.invalidateQueries({ queryKey: queryKeys.inventory.stockTransferDetail(uid) });
    },
  });
}

export function useReceiveStockTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (uid: string) => apiPost<ApiResponse<StockTransfer>, void>(ENDPOINTS.INVENTORY.STOCK_TRANSFERS.RECEIVE(uid)),
    onSuccess: (_, uid) => {
      qc.invalidateQueries({ queryKey: queryKeys.inventory.stockTransfers() });
      qc.invalidateQueries({ queryKey: queryKeys.inventory.stockTransferDetail(uid) });
    },
  });
}

export function useCancelStockTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ uid, alasan }: { uid: string; alasan?: string }) =>
      apiPost<ApiResponse<StockTransfer>, { alasan?: string }>(ENDPOINTS.INVENTORY.STOCK_TRANSFERS.CANCEL(uid), { alasan }),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.inventory.stockTransfers() });
      qc.invalidateQueries({ queryKey: queryKeys.inventory.stockTransferDetail(variables.uid) });
    },
  });
}
