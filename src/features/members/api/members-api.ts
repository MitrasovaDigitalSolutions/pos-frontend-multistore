import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGetData, apiGetList, apiPost, apiPut, apiDelete } from "@/shared/api/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { ApiResponse, PaginatedResponse, PaginationParams } from "@/types/api";
import type { Member } from "../types";
import type { MemberInput } from "../schemas/member-schema";

export function useMembers(params?: PaginationParams & { search?: string; status?: string }) {
    return useQuery<PaginatedResponse<Member>>({
        queryKey: [...queryKeys.members.all, params],
        queryFn: () => apiGetList<Member>("/v1/members", params),
    });
}

export function useAllMembers() {
    return useQuery<Member[]>({
        queryKey: [...queryKeys.members.all, "all"],
        queryFn: () => apiGetData<Member[]>("/v1/members/all"),
    });
}

export function useCreateMember() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<Member>, Error, MemberInput>({
        mutationFn: (data) =>
            apiPost<ApiResponse<Member>, MemberInput>("/v1/members", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.members.all });
        },
    });
}

export function useUpdateMember() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<Member>, Error, { id: number; data: MemberInput }>({
        mutationFn: ({ id, data }) =>
            apiPut<ApiResponse<Member>, MemberInput>(`/v1/members/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.members.all });
        },
    });
}

export function useDeleteMember() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<void>, Error, number>({
        mutationFn: (id) => apiDelete<ApiResponse<void>>(`/v1/members/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.members.all });
        },
    });
}
