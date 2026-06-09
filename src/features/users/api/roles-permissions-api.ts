import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGetData, apiPost, apiDelete } from "@/shared/api/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { ApiResponse } from "@/types/api";
import type { RoleWithPermissions, Permission } from "../types";

export function useRolesList() {
    return useQuery<RoleWithPermissions[]>({
        queryKey: queryKeys.roles.list(),
        queryFn: () => apiGetData<RoleWithPermissions[]>("/v1/roles"),
    });
}

export function usePermissionsList() {
    return useQuery<Permission[]>({
        queryKey: queryKeys.permissions.list(),
        queryFn: () => apiGetData<Permission[]>("/v1/permissions"),
    });
}

export function useAssignPermissionToRole() {
    const queryClient = useQueryClient();
    return useMutation<
        ApiResponse<RoleWithPermissions>,
        Error,
        { role: string | number; permission: string }
    >({
        mutationFn: ({ role, permission }) =>
            apiPost<ApiResponse<RoleWithPermissions>, { permission: string }>(
                `/v1/roles/${role}/permissions`,
                { permission }
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.roles.all });
        },
    });
}

export function useRevokePermissionFromRole() {
    const queryClient = useQueryClient();
    return useMutation<
        ApiResponse<RoleWithPermissions>,
        Error,
        { role: string | number; permission: string }
    >({
        mutationFn: ({ role, permission }) =>
            apiDelete<ApiResponse<RoleWithPermissions>>(
                `/v1/roles/${role}/permissions/${permission}`
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.roles.all });
        },
    });
}
