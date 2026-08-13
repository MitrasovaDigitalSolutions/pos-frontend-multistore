import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGetData, apiGetList, apiPost } from "@/shared/api/api-client";
import { ENDPOINTS } from "@/shared/api/endpoints";
import { queryKeys } from "@/lib/query-keys";
import type { ApiResponse, PaginatedResponse, PaginationParams } from "@/types/api";
import type { RequestTransfer, RequestTransferDetail, RequestTransferSummary } from "../types";
import type { RequestTransferInput } from "../schemas/request-transfer-schema";

export function useRequestTransferSummaries(params?: PaginationParams & { supplier_uid?: string }) {
    return useQuery<PaginatedResponse<RequestTransferSummary>>({
        queryKey: [...queryKeys.requestTransfers.all, params],
        queryFn: () => apiGetList<RequestTransferSummary>(ENDPOINTS.REQUEST_TRANSFER.LIST, params),
    });
}

export function useRequestTransferDetail(supplierUid: string, supplierSalesUid?: string | null) {
    return useQuery<RequestTransferDetail>({
        queryKey: queryKeys.requestTransfers.summary(supplierUid, supplierSalesUid),
        queryFn: () =>
            apiGetData<RequestTransferDetail>(
                ENDPOINTS.REQUEST_TRANSFER.SUMMARY(supplierUid, supplierSalesUid),
            ),
        enabled: !!supplierUid,
    });
}

export function useCreateRequestTransfer() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<RequestTransfer>, Error, RequestTransferInput>({
        mutationFn: (payload) =>
            apiPost<ApiResponse<RequestTransfer>, RequestTransferInput>(
                ENDPOINTS.REQUEST_TRANSFER.CREATE,
                payload,
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.requestTransfers.all });
        },
    });
}

export function useRejectRequestTransfer() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<void>, Error, { supplierUid: string; supplierSalesUid?: string | null }>({
        mutationFn: ({ supplierUid, supplierSalesUid }) =>
            apiPost<ApiResponse<void>, void>(
                ENDPOINTS.REQUEST_TRANSFER.REJECT(supplierUid, supplierSalesUid),
            ),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.requestTransfers.all });
            queryClient.invalidateQueries({
                queryKey: queryKeys.requestTransfers.summary(variables.supplierUid, variables.supplierSalesUid),
            });
        },
    });
}

export function useOrderRequestTransfer() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<unknown>, Error, { supplierUid: string; supplierSalesUid?: string | null }>({
        mutationFn: ({ supplierUid, supplierSalesUid }) =>
            apiPost<ApiResponse<unknown>, void>(
                ENDPOINTS.REQUEST_TRANSFER.ORDER(supplierUid, supplierSalesUid),
            ),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.requestTransfers.all });
            queryClient.invalidateQueries({
                queryKey: queryKeys.requestTransfers.summary(variables.supplierUid, variables.supplierSalesUid),
            });
        },
    });
}

export function useSendRequestTransfer() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<unknown>, Error, { supplierUid: string; supplierSalesUid?: string | null }>({
        mutationFn: ({ supplierUid, supplierSalesUid }) =>
            apiPost<ApiResponse<unknown>, void>(
                ENDPOINTS.REQUEST_TRANSFER.SEND(supplierUid, supplierSalesUid),
            ),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.requestTransfers.all });
            queryClient.invalidateQueries({
                queryKey: queryKeys.requestTransfers.summary(variables.supplierUid, variables.supplierSalesUid),
            });
        },
    });
}
