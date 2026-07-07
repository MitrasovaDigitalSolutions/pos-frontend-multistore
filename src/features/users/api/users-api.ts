import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    apiGetList,
    apiPost,
    apiPut,
    apiDelete,
} from "@/shared/api/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { ApiResponse, PaginatedResponse, PaginationParams } from "@/types/api";
import type { User } from "../types";
import type { UserInput } from "../schemas/user-schema";

export function useUsers(params?: PaginationParams & { status?: string }) {
    return useQuery<PaginatedResponse<User>>({
        queryKey: [...queryKeys.users.list(), params],
        queryFn: () => apiGetList<User>("/v1/users", params),
    });
}

export function useCreateUser() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<User>, Error, UserInput>({
        mutationFn: (newUser) =>
            apiPost<ApiResponse<User>, UserInput>("/v1/users", newUser),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
        },
    });
}

export function useUpdateUser() {
    const queryClient = useQueryClient();
    return useMutation<
        ApiResponse<User>,
        Error,
        { uid: string; data: UserInput }
    >({
        mutationFn: ({ uid, data }) =>
            apiPut<ApiResponse<User>, UserInput>(`/v1/users/${uid}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
        },
    });
}

export function useDeactivateUser() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<void>, Error, string>({
        mutationFn: (uid) => apiDelete<ApiResponse<void>>(`/v1/users/${uid}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
        },
    });
}
