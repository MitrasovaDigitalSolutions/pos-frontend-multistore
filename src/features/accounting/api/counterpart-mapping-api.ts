import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGetData, apiPost, apiPut, apiDelete } from "@/shared/api/api-client";
import { queryKeys } from "@/lib/query-keys";
import { ENDPOINTS } from "@/shared/api/endpoints";
import type { ApiResponse } from "@/types/api";
import type {
    CoaCounterpartMapping,
    CreateCoaCounterpartMappingInput,
    UpdateCoaCounterpartMappingInput,
} from "../types";

// 1. Get List of CoA Counterpart Mappings
export function useCoaCounterpartMappings() {
    return useQuery<CoaCounterpartMapping[]>({
        queryKey: queryKeys.coaCounterpartMappings.list(),
        queryFn: () => apiGetData<CoaCounterpartMapping[]>(ENDPOINTS.COA_COUNTERPART_MAPPINGS.LIST),
    });
}

// 2. Create CoA Counterpart Mapping Mutation
export function useCreateCoaCounterpartMapping() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<CoaCounterpartMapping>, Error, CreateCoaCounterpartMappingInput>({
        mutationFn: (data) =>
            apiPost<ApiResponse<CoaCounterpartMapping>, CreateCoaCounterpartMappingInput>(
                ENDPOINTS.COA_COUNTERPART_MAPPINGS.CREATE,
                data
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.coaCounterpartMappings.all });
        },
    });
}

// 3. Update CoA Counterpart Mapping Mutation
export function useUpdateCoaCounterpartMapping() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<CoaCounterpartMapping>, Error, { uid: string; data: UpdateCoaCounterpartMappingInput }>({
        mutationFn: ({ uid, data }) =>
            apiPut<ApiResponse<CoaCounterpartMapping>, UpdateCoaCounterpartMappingInput>(
                ENDPOINTS.COA_COUNTERPART_MAPPINGS.UPDATE(uid),
                data
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.coaCounterpartMappings.all });
        },
    });
}

// 4. Delete CoA Counterpart Mapping Mutation
export function useDeleteCoaCounterpartMapping() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<void>, Error, string>({
        mutationFn: (uid) =>
            apiDelete<ApiResponse<void>>(ENDPOINTS.COA_COUNTERPART_MAPPINGS.DELETE(uid)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.coaCounterpartMappings.all });
        },
    });
}
