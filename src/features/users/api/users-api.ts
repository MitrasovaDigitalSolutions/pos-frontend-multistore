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

export function useUsers(params?: PaginationParams) {
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
        { id: number; data: UserInput }
    >({
        mutationFn: ({ id, data }) =>
            apiPut<ApiResponse<User>, UserInput>(`/v1/users/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
        },
    });
}

export function useDeactivateUser() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<void>, Error, number>({
        mutationFn: (id) => apiDelete<ApiResponse<void>>(`/v1/users/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
        },
    });
}
