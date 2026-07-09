import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPut, apiDelete, apiGetList } from "@/shared/api/api-client";
import { queryKeys } from "@/lib/query-keys";
import { ENDPOINTS } from "@/shared/api/endpoints";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type { ManualJournal, CreateManualJournalInput } from "../types/manual-journal";

// 1. Get Paginated Manual Journals List
export function useManualJournals(params?: Record<string, unknown>) {
    return useQuery<PaginatedResponse<ManualJournal>>({
        queryKey: queryKeys.manualJournals.list(params),
        queryFn: () => apiGetList<ManualJournal>(ENDPOINTS.MANUAL_JOURNALS.LIST, params),
    });
}

// 2. Get Manual Journal Detail
export function useManualJournalDetail(uid: string | null) {
    return useQuery<ManualJournal>({
        queryKey: queryKeys.manualJournals.detail(uid || ""),
        queryFn: () => apiGet<ManualJournal>(ENDPOINTS.MANUAL_JOURNALS.DETAIL(uid || "")),
        enabled: !!uid,
    });
}

// 3. Create Manual Journal Mutation
export function useCreateManualJournal() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<ManualJournal>, Error, CreateManualJournalInput>({
        mutationFn: (data) =>
            apiPost<ApiResponse<ManualJournal>, CreateManualJournalInput>(
                ENDPOINTS.MANUAL_JOURNALS.CREATE,
                data
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.manualJournals.all });
            // Invalidate reports / balance-sheet too!
            queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
        },
    });
}

// 4. Update Manual Journal Mutation
export function useUpdateManualJournal() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<ManualJournal>, Error, { uid: string; data: Partial<CreateManualJournalInput> }>({
        mutationFn: ({ uid, data }) =>
            apiPut<ApiResponse<ManualJournal>, Partial<CreateManualJournalInput>>(
                ENDPOINTS.MANUAL_JOURNALS.UPDATE(uid),
                data
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.manualJournals.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
        },
    });
}

// 5. Delete (Void) Manual Journal Mutation
export function useDeleteManualJournal() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<void>, Error, string>({
        mutationFn: (uid) => apiDelete<ApiResponse<void>>(ENDPOINTS.MANUAL_JOURNALS.DELETE(uid)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.manualJournals.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
        },
    });
}
