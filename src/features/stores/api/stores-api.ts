import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/shared/api/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { Store, StoreUser } from "../types";
import type { StoreInput } from "../schemas/store-schema";

export function useStores() {
    return useQuery({
        queryKey: queryKeys.stores.list(),
        queryFn: () => apiGet<Store[]>("/v1/stores"),
    });
}

export function useCreateStore() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: StoreInput) => apiPost<Store, StoreInput>("/v1/stores", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.stores.all });
        },
    });
}

export function useUpdateStore() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ uid, data }: { uid: string; data: StoreInput }) =>
            apiPatch<Store, StoreInput>(`/v1/stores/${uid}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.stores.all });
        },
    });
}

export function useStoreUsers(storeUid: string) {
    return useQuery({
        queryKey: [...queryKeys.stores.detail(storeUid), "users"],
        queryFn: () => apiGet<StoreUser[]>(`/v1/stores/${storeUid}/users`),
        enabled: !!storeUid,
    });
}

export function useAssignStoreUsers() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ storeUid, user_uids }: { storeUid: string; user_uids: string[] }) =>
            apiPost<StoreUser[], { user_uids: string[] }>(`/v1/stores/${storeUid}/users`, {
                user_uids,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.stores.all });
        },
    });
}

export function useDetachStoreUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ storeUid, userUid }: { storeUid: string; userUid: string }) =>
            apiDelete(`/v1/stores/${storeUid}/users/${userUid}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.stores.all });
        },
    });
}