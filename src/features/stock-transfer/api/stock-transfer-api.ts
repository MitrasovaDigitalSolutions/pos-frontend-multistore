import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGetData, apiGetList, apiPost, apiPatch } from "@/shared/api/api-client";
import { ENDPOINTS } from "@/shared/api/endpoints";
import { queryKeys } from "@/lib/query-keys";
import type { ApiResponse, PaginationParams } from "@/types/api";
import type { StockTransfer } from "../types";

export interface StockTransferQueryParams extends PaginationParams {
  direction?: "outgoing" | "incoming";
  status?: string;
  status_penerimaan?: string;
}

export type StockTransferListMode = "outgoing" | "incoming" | "returns";

export function useStockTransfersByMode(mode: StockTransferListMode, params?: StockTransferQueryParams) {
  const endpoint =
    mode === "outgoing"
      ? ENDPOINTS.INVENTORY.STOCK_TRANSFERS.OUTGOING
      : mode === "incoming"
        ? ENDPOINTS.INVENTORY.STOCK_TRANSFERS.INCOMING
        : ENDPOINTS.INVENTORY.STOCK_TRANSFERS.RETURNS;
  return useQuery({
    queryKey: [...queryKeys.inventory.stockTransfers(), mode, params],
    queryFn: () => apiGetList<StockTransfer>(endpoint, params),
    refetchOnMount: "always",
  });
}

export function useStockTransfers(params?: StockTransferQueryParams) {
  return useQuery({
    queryKey: [...queryKeys.inventory.stockTransfers(), params],
    queryFn: () => apiGetList<StockTransfer>(ENDPOINTS.INVENTORY.STOCK_TRANSFERS.LIST, params),
    refetchOnMount: "always",
  });
}

export function useStockTransferDetail(uid: string) {
  return useQuery({
    queryKey: queryKeys.inventory.stockTransferDetail(uid),
    queryFn: () => apiGetData<StockTransfer>(ENDPOINTS.INVENTORY.STOCK_TRANSFERS.DETAIL(uid)),
    enabled: !!uid,
    refetchOnMount: "always",
  });
}

export function useCreateStockTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { store_uid_destination: string; catatan?: string | null; items: { product_uid: string; kuantitas: number }[] }) =>
      apiPost<ApiResponse<StockTransfer>, typeof payload>(ENDPOINTS.INVENTORY.STOCK_TRANSFERS.CREATE, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.inventory.stockTransfers(), refetchType: "all" });
    },
  });
}

export function useUpdateStockTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ uid, payload }: { uid: string; payload: { store_uid_destination: string; catatan?: string; items: { product_uid: string; kuantitas: number }[] } }) =>
      apiPatch<ApiResponse<StockTransfer>, typeof payload>(ENDPOINTS.INVENTORY.STOCK_TRANSFERS.UPDATE(uid), payload),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.inventory.stockTransfers(), refetchType: "all" });
      qc.invalidateQueries({ queryKey: queryKeys.inventory.stockTransferDetail(variables.uid), refetchType: "all" });
    },
  });
}

export function useFinalizeStockTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (uid: string) => apiPost<ApiResponse<StockTransfer>, void>(ENDPOINTS.INVENTORY.STOCK_TRANSFERS.FINALIZE(uid)),
    onSuccess: (_, uid) => {
      qc.invalidateQueries({ queryKey: queryKeys.inventory.stockTransfers(), refetchType: "all" });
      qc.invalidateQueries({ queryKey: queryKeys.inventory.stockTransferDetail(uid), refetchType: "all" });
    },
  });
}

export interface ReceiveStockTransferPayload {
  status?: "received" | "rejected";
  kuantitas_diterima?: number;
  jenis_selisih?: "salah_input" | "rusak" | "hilang";
  keterangan?: string;
}

export function useReceiveStockTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ uid, itemUid, payload }: { uid: string; itemUid: string; payload?: ReceiveStockTransferPayload }) =>
      apiPost<ApiResponse<StockTransfer>, ReceiveStockTransferPayload | undefined>(
        ENDPOINTS.INVENTORY.STOCK_TRANSFERS.RECEIVE_ITEM(uid, itemUid),
        payload
      ),
    onMutate: async ({ uid, itemUid, payload }) => {
      await qc.cancelQueries({ queryKey: queryKeys.inventory.stockTransferDetail(uid) });
      const previousDetail = qc.getQueryData<ApiResponse<StockTransfer>>(queryKeys.inventory.stockTransferDetail(uid));

      if (previousDetail?.data) {
        const updatedItems = previousDetail.data.items.map((it) => {
          if (it.uid === itemUid) {
            return {
              ...it,
              status: payload?.status || ("received" as const),
              kuantitas_diterima: payload?.status === "rejected" ? 0 : (payload?.kuantitas_diterima ?? it.kuantitas),
              jenis_selisih: payload?.jenis_selisih || it.jenis_selisih,
              keterangan: payload?.keterangan || it.keterangan,
            };
          }
          return it;
        });

        qc.setQueryData(queryKeys.inventory.stockTransferDetail(uid), {
          ...previousDetail,
          data: {
            ...previousDetail.data,
            items: updatedItems,
          },
        });
      }

      return { previousDetail };
    },
    onError: (err, variables, context) => {
      if (context?.previousDetail) {
        qc.setQueryData(queryKeys.inventory.stockTransferDetail(variables.uid), context.previousDetail);
      }
    },
    onSettled: (_, __, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.inventory.stockTransfers(), refetchType: "all" });
      qc.invalidateQueries({ queryKey: queryKeys.inventory.stockTransferDetail(variables.uid), refetchType: "all" });
    },
  });
}

export function useValidateStockTransferReturn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ uid, itemUid, kuantitas_return }: { uid: string; itemUid: string; kuantitas_return?: number }) =>
      apiPost<ApiResponse<StockTransfer>, { kuantitas_return?: number }>(
        ENDPOINTS.INVENTORY.STOCK_TRANSFERS.RETURN_ITEM(uid, itemUid), 
        { kuantitas_return }
      ),
    onMutate: async ({ uid, itemUid, kuantitas_return }) => {
      await qc.cancelQueries({ queryKey: queryKeys.inventory.stockTransferDetail(uid) });
      const previousDetail = qc.getQueryData<ApiResponse<StockTransfer>>(queryKeys.inventory.stockTransferDetail(uid));

      if (previousDetail?.data) {
        const updatedItems = previousDetail.data.items.map((it) => {
          if (it.uid === itemUid) {
            return {
              ...it,
              kuantitas_return: kuantitas_return ?? (it.kuantitas - (it.kuantitas_diterima || 0)),
              return_validated_at: new Date().toISOString(),
            };
          }
          return it;
        });

        qc.setQueryData(queryKeys.inventory.stockTransferDetail(uid), {
          ...previousDetail,
          data: {
            ...previousDetail.data,
            items: updatedItems,
          },
        });
      }

      return { previousDetail };
    },
    onError: (err, variables, context) => {
      if (context?.previousDetail) {
        qc.setQueryData(queryKeys.inventory.stockTransferDetail(variables.uid), context.previousDetail);
      }
    },
    onSettled: (_, __, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.inventory.stockTransfers(), refetchType: "all" });
      qc.invalidateQueries({ queryKey: queryKeys.inventory.stockTransferDetail(variables.uid), refetchType: "all" });
    },
  });
}

export function useCancelStockTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ uid, alasan }: { uid: string; alasan?: string }) =>
      apiPost<ApiResponse<StockTransfer>, { alasan?: string }>(ENDPOINTS.INVENTORY.STOCK_TRANSFERS.CANCEL(uid), { alasan }),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.inventory.stockTransfers(), refetchType: "all" });
      qc.invalidateQueries({ queryKey: queryKeys.inventory.stockTransferDetail(variables.uid), refetchType: "all" });
    },
  });
}
