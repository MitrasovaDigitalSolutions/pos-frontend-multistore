import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGetData, apiGetList, apiPost } from "@/shared/api/api-client";
import { ENDPOINTS } from "@/shared/api/endpoints";
import { queryKeys } from "@/lib/query-keys";
import type { ApiResponse, PaginatedResponse, PaginationParams } from "@/types/api";
import type { RequestTransfer, RequestTransferDetail, RequestTransferSummary } from "../types";
import type { RequestTransferInput } from "../schemas/request-transfer-schema";

export function useIncomingRequestTransfers(params?: PaginationParams & { supplier_uid?: string }) {
    return useQuery<PaginatedResponse<RequestTransferSummary>>({
        queryKey: queryKeys.requestTransfers.incoming(params),
        queryFn: () => apiGetList<RequestTransferSummary>(ENDPOINTS.REQUEST_TRANSFER.INCOMING, params),
    });
}

export function useOutgoingRequestTransfers(params?: PaginationParams & { supplier_uid?: string }) {
    return useQuery<PaginatedResponse<RequestTransferSummary>>({
        queryKey: queryKeys.requestTransfers.outgoing(params),
        queryFn: () => apiGetList<RequestTransferSummary>(ENDPOINTS.REQUEST_TRANSFER.OUTGOING, params),
    });
}

export function useRequestTransferDetail(summaryUid: string) {
    return useQuery<RequestTransferDetail>({
        queryKey: queryKeys.requestTransfers.summary(summaryUid),
        queryFn: () =>
            apiGetData<RequestTransferDetail>(
                ENDPOINTS.REQUEST_TRANSFER.SUMMARY(summaryUid),
            ),
        enabled: !!summaryUid,
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
    return useMutation<ApiResponse<void>, Error, { summaryUid: string }>({
        mutationFn: ({ summaryUid }) =>
            apiPost<ApiResponse<void>, void>(
                ENDPOINTS.REQUEST_TRANSFER.REJECT(summaryUid),
            ),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.requestTransfers.all });
            queryClient.invalidateQueries({
                queryKey: queryKeys.requestTransfers.summary(variables.summaryUid),
            });
        },
    });
}

export function useOrderRequestTransfer() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<unknown>, Error, { summaryUid: string; supplier_uid?: string }>({
        mutationFn: ({ summaryUid, supplier_uid }) =>
            apiPost<ApiResponse<unknown>, { supplier_uid?: string }>(
                ENDPOINTS.REQUEST_TRANSFER.ORDER(summaryUid),
                supplier_uid ? { supplier_uid } : {},
            ),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.requestTransfers.all });
            queryClient.invalidateQueries({
                queryKey: queryKeys.requestTransfers.summary(variables.summaryUid),
            });
        },
    });
}

export function useSendRequestTransfer() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<unknown>, Error, { summaryUid: string }>({
        mutationFn: ({ summaryUid }) =>
            apiPost<ApiResponse<unknown>, void>(
                ENDPOINTS.REQUEST_TRANSFER.SEND(summaryUid),
            ),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.requestTransfers.all });
            queryClient.invalidateQueries({
                queryKey: queryKeys.requestTransfers.summary(variables.summaryUid),
            });
        },
    });
}

