import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGetData, apiGetList, apiPost } from "@/shared/api/api-client";
import { ENDPOINTS } from "@/shared/api/endpoints";
import { queryKeys } from "@/lib/query-keys";
import type { ApiResponse, PaginationParams } from "@/types/api";
import type { StockTransfer } from "../types";

export function useStockTransfers(params?: PaginationParams) {
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
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.inventory.stockTransfers() }),
  });
}

export function useFinalizeStockTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (uid: string) => apiPost<ApiResponse<StockTransfer>, void>(ENDPOINTS.INVENTORY.STOCK_TRANSFERS.FINALIZE(uid)),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.inventory.stockTransfers() }),
  });
}

export function useReceiveStockTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (uid: string) => apiPost<ApiResponse<StockTransfer>, void>(ENDPOINTS.INVENTORY.STOCK_TRANSFERS.RECEIVE(uid)),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.inventory.stockTransfers() }),
  });
}

export function useCancelStockTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (uid: string) => apiPost<ApiResponse<StockTransfer>, void>(ENDPOINTS.INVENTORY.STOCK_TRANSFERS.CANCEL(uid)),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.inventory.stockTransfers() }),
  });
}
