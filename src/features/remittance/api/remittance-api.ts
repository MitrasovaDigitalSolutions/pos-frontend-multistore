import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGetData, apiGetList, apiPost } from "@/shared/api/api-client";
import { ENDPOINTS } from "@/shared/api/endpoints";
import type { ApiResponse } from "@/types/api";
import { REMITTANCE_QUERY_KEYS } from "../constants";
import type {
  ConsignmentStockPosition,
  CreateRemittancePayload,
  RejectRemittancePayload,
  RemittanceFilters,
  StoreRemittance,
  UnsettledSummary,
  UnsettledTransactionItem,
} from "../types";

/**
 * Fetch summary statistics of unsettled consignments for current branch
 */
export function useUnsettledRemittanceSummary() {
  return useQuery({
    queryKey: REMITTANCE_QUERY_KEYS.unsettled(),
    queryFn: () => apiGetData<UnsettledSummary>(ENDPOINTS.STORE_REMITTANCES.UNSETTLED),
    refetchOnMount: "always",
  });
}

/**
 * Fetch individual unsettled consignment sales items
 */
export function useUnsettledRemittanceItems(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: REMITTANCE_QUERY_KEYS.unsettledItems(params || {}),
    queryFn: () =>
      apiGetList<UnsettledTransactionItem>(ENDPOINTS.STORE_REMITTANCES.UNSETTLED_ITEMS, params),
    refetchOnMount: "always",
  });
}

/**
 * Fetch list of remittances (history for branch, incoming queue for central)
 */
export function useStoreRemittances(filters?: RemittanceFilters) {
  return useQuery({
    queryKey: REMITTANCE_QUERY_KEYS.list((filters as unknown as Record<string, unknown>) || {}),
    queryFn: () =>
      apiGetList<StoreRemittance>(ENDPOINTS.STORE_REMITTANCES.LIST, filters as Record<string, unknown>),
    refetchOnMount: "always",
  });
}

/**
 * Fetch detail of a single remittance
 */
export function useStoreRemittanceDetail(uid: string) {
  return useQuery({
    queryKey: REMITTANCE_QUERY_KEYS.detail(uid),
    queryFn: () => apiGetData<StoreRemittance>(ENDPOINTS.STORE_REMITTANCES.DETAIL(uid)),
    enabled: Boolean(uid),
    refetchOnMount: "always",
  });
}

/**
 * Mutation to submit a new branch remittance with proof file (FormData)
 */
export function useCreateStoreRemittance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateRemittancePayload) => {
      const formData = new FormData();
      formData.append("cash_account_source_uid", payload.cash_account_source_uid);
      formData.append("nominal_disetor", String(payload.nominal_disetor));
      if (payload.bukti_transfer) {
        formData.append("bukti_transfer", payload.bukti_transfer);
      }
      if (payload.catatan) {
        formData.append("catatan", payload.catatan);
      }

      return apiPost<ApiResponse<StoreRemittance>, FormData>(
        ENDPOINTS.STORE_REMITTANCES.CREATE,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REMITTANCE_QUERY_KEYS.all });
    },
  });
}

/**
 * Mutation for central HQ admin to verify & approve a remittance
 */
export function useVerifyStoreRemittance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uid: string) =>
      apiPost<ApiResponse<StoreRemittance>>(ENDPOINTS.STORE_REMITTANCES.VERIFY(uid)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REMITTANCE_QUERY_KEYS.all });
    },
  });
}

/**
 * Mutation for central HQ admin to reject a remittance with reason
 */
export function useRejectStoreRemittance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uid, payload }: { uid: string; payload: RejectRemittancePayload }) =>
      apiPost<ApiResponse<StoreRemittance>, RejectRemittancePayload>(
        ENDPOINTS.STORE_REMITTANCES.REJECT(uid),
        payload
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REMITTANCE_QUERY_KEYS.all });
    },
  });
}

/**
 * Fetch consignment stock positions (received, sold, returned, remaining stock & value)
 */
export function useConsignmentStockPositions(filters?: { store_uid?: string; search?: string }) {
  return useQuery({
    queryKey: REMITTANCE_QUERY_KEYS.consignmentStock((filters as Record<string, unknown>) || {}),
    queryFn: () =>
      apiGetList<ConsignmentStockPosition>(
        ENDPOINTS.STORE_REMITTANCES.CONSIGNMENT_STOCK,
        filters as Record<string, unknown>
      ),
    refetchOnMount: "always",
  });
}
