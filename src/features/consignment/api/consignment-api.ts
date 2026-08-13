import { apiDelete, apiGetData, apiGetList, apiPost, apiPostData, apiPutData } from "@/shared/api/api-client";
import type { PaginatedResponse } from "@/types/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  ConsignmentPayment,
  ConsignmentReceiving,
  ConsignmentReceivingParams,
  CreateConsignmentPaymentPayload,
  CreateConsignmentReceivingPayload,
  PriceComparisonItem,
  ReturnableItem,
} from "../types";

export const CONSIGNMENT_QUERY_KEYS = {
  all: ["consignment"] as const,
  receivings: (params?: ConsignmentReceivingParams) => [...CONSIGNMENT_QUERY_KEYS.all, "receivings", params] as const,
  receivingDetail: (uid: string) => [...CONSIGNMENT_QUERY_KEYS.all, "receiving", uid] as const,
  returnableItems: (uid: string) => [...CONSIGNMENT_QUERY_KEYS.all, "returnable-items", uid] as const,
  payments: (params?: ConsignmentReceivingParams) => [...CONSIGNMENT_QUERY_KEYS.all, "payments", params] as const,
};

export function useConsignmentReceivings(params?: ConsignmentReceivingParams) {
  return useQuery<PaginatedResponse<ConsignmentReceiving>>({
    queryKey: CONSIGNMENT_QUERY_KEYS.receivings(params),
    queryFn: () => apiGetList<ConsignmentReceiving>("/v1/consignment/receiving", params),
  });
}

export function useConsignmentReceivingDetail(uid: string, enabled = true) {
  return useQuery<ConsignmentReceiving>({
    queryKey: CONSIGNMENT_QUERY_KEYS.receivingDetail(uid),
    queryFn: () => apiGetData<ConsignmentReceiving>(`/v1/consignment/receiving/${uid}`),
    enabled: !!uid && enabled,
  });
}

export function useConsignmentReturnableItems(uid: string, enabled = true) {
  return useQuery<ReturnableItem[]>({
    queryKey: CONSIGNMENT_QUERY_KEYS.returnableItems(uid),
    queryFn: async () => {
      const res = await apiGetData<ReturnableItem[]>(`/v1/consignment/receiving/${uid}/returnable-items`);
      return res;
    },
    enabled: !!uid && enabled,
  });
}

export function useConsignmentPayments(params?: ConsignmentReceivingParams) {
  return useQuery<PaginatedResponse<ConsignmentReceiving>>({
    queryKey: CONSIGNMENT_QUERY_KEYS.payments(params),
    queryFn: () => apiGetList<ConsignmentReceiving>("/v1/consignment/payment", params),
  });
}

export function useCreateConsignmentDraftMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateConsignmentReceivingPayload) =>
      apiPostData<ConsignmentReceiving, CreateConsignmentReceivingPayload>("/v1/consignment/receiving", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONSIGNMENT_QUERY_KEYS.all });
    },
  });
}

export function useBulkConsignmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateConsignmentReceivingPayload) =>
      apiPostData<ConsignmentReceiving, CreateConsignmentReceivingPayload>("/v1/consignment/receiving/bulk", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONSIGNMENT_QUERY_KEYS.all });
    },
  });
}

export function useUpdateConsignmentDraftMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ uid, payload }: { uid: string; payload: CreateConsignmentReceivingPayload }) =>
      apiPutData<ConsignmentReceiving, CreateConsignmentReceivingPayload>(`/v1/consignment/receiving/${uid}`, payload),
    onSuccess: (_, { uid }) => {
      queryClient.invalidateQueries({ queryKey: CONSIGNMENT_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: CONSIGNMENT_QUERY_KEYS.receivingDetail(uid) });
    },
  });
}

export function useDeleteConsignmentDraftMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (uid: string) => apiDelete(`/v1/consignment/receiving/${uid}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONSIGNMENT_QUERY_KEYS.all });
    },
  });
}

export function useCompleteConsignmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (uid: string) => apiPostData<ConsignmentReceiving>(`/v1/consignment/receiving/${uid}/complete`, {}),
    onSuccess: (_, uid) => {
      queryClient.invalidateQueries({ queryKey: CONSIGNMENT_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: CONSIGNMENT_QUERY_KEYS.receivingDetail(uid) });
    },
  });
}

export function useVoidConsignmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (uid: string) => apiPostData<ConsignmentReceiving>(`/v1/consignment/receiving/${uid}/void`, {}),
    onSuccess: (_, uid) => {
      queryClient.invalidateQueries({ queryKey: CONSIGNMENT_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: CONSIGNMENT_QUERY_KEYS.receivingDetail(uid) });
    },
  });
}

export function useCreateConsignmentPaymentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ uid, payload }: { uid: string; payload: CreateConsignmentPaymentPayload }) =>
      apiPostData<ConsignmentPayment, CreateConsignmentPaymentPayload>(`/v1/consignment/receiving/${uid}/payment`, payload),
    onSuccess: (_, { uid }) => {
      queryClient.invalidateQueries({ queryKey: CONSIGNMENT_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: CONSIGNMENT_QUERY_KEYS.receivingDetail(uid) });
    },
  });
}

export function useCompareConsignmentPricesMutation() {
  return useMutation({
    mutationFn: (payload: { items: { product_uid: string; harga_beli: number }[] }) =>
      apiPostData<PriceComparisonItem[]>(`/v1/consignment/receiving/compare-prices`, payload),
  });
}

export function useScanConsignmentProductMutation() {
  return useMutation({
    mutationFn: (barcode: string) =>
      apiPost<{
        product_uid: string;
        nama: string;
        barcode: string;
        harga_beli: number;
        harga_jual: number;
        margin: number;
      }>(`/v1/consignment/receiving/scan`, { barcode }),
  });
}
