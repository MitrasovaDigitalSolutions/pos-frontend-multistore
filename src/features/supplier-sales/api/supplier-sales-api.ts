import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiDelete, apiGetData, apiGetList, apiPost, apiPut } from "@/shared/api/api-client";
import { ENDPOINTS } from "@/shared/api/endpoints";
import { queryKeys } from "@/lib/query-keys";
import { invalidateSupplierQueries } from "@/lib/cache-invalidation";
import type { ApiResponse, PaginatedResponse, PaginationParams } from "@/types/api";
import type { SupplierSale, SupplierSaleItem } from "../types";
import type { SupplierSalesInput, SupplierSalesItemInput } from "../schemas/supplier-sales-schema";

export function useSupplierSales(params?: PaginationParams & { search?: string; supplier_uid?: string; status?: string }) {
    return useQuery<PaginatedResponse<SupplierSale>>({
        queryKey: [...queryKeys.supplierSales.all, params],
        queryFn: () => apiGetList<SupplierSale>(ENDPOINTS.SUPPLIER_SALES.LIST, params),
    });
}

export function useAllSupplierSales() {
    return useQuery<SupplierSale[]>({
        queryKey: [...queryKeys.supplierSales.all, "all"],
        queryFn: () => apiGetData<SupplierSale[]>(ENDPOINTS.SUPPLIER_SALES.ALL),
    });
}

export function useSupplierSaleDetail(uid: string) {
    return useQuery<SupplierSale>({
        queryKey: queryKeys.supplierSales.detail(uid),
        queryFn: () => apiGetData<SupplierSale>(ENDPOINTS.SUPPLIER_SALES.DETAIL(uid)),
        enabled: !!uid,
    });
}

export function useCreateSupplierSale() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<SupplierSale>, Error, SupplierSalesInput>({
        mutationFn: (data) => apiPost<ApiResponse<SupplierSale>, SupplierSalesInput>(ENDPOINTS.SUPPLIER_SALES.CREATE, data),
        onSuccess: () => {
            invalidateSupplierQueries(queryClient);
        },
    });
}

export function useUpdateSupplierSale() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<SupplierSale>, Error, { uid: string; data: Partial<SupplierSalesInput> }>({
        mutationFn: ({ uid, data }) => apiPut<ApiResponse<SupplierSale>, Partial<SupplierSalesInput>>(ENDPOINTS.SUPPLIER_SALES.UPDATE(uid), data),
        onSuccess: (_, variables) => {
            invalidateSupplierQueries(queryClient);
            queryClient.invalidateQueries({ queryKey: queryKeys.supplierSales.detail(variables.uid) });
        },
    });
}

export function useDeleteSupplierSale() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<void>, Error, string>({
        mutationFn: (uid) => apiDelete<ApiResponse<void>>(ENDPOINTS.SUPPLIER_SALES.DELETE(uid)),
        onSuccess: () => {
            invalidateSupplierQueries(queryClient);
        },
    });
}

export function useAddSupplierSaleItem() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<SupplierSaleItem>, Error, { uid: string; data: SupplierSalesItemInput }>({
        mutationFn: ({ uid, data }) => apiPost<ApiResponse<SupplierSaleItem>, SupplierSalesItemInput>(ENDPOINTS.SUPPLIER_SALES.ADD_ITEM(uid), data),
        onSuccess: (_, variables) => {
            invalidateSupplierQueries(queryClient);
            queryClient.invalidateQueries({ queryKey: queryKeys.supplierSales.detail(variables.uid) });
        },
    });
}

export function useUpdateSupplierSaleItem() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<SupplierSaleItem>, Error, { uid: string; productUid: string; data: SupplierSalesItemInput }>({
        mutationFn: ({ uid, productUid, data }) =>
            apiPut<ApiResponse<SupplierSaleItem>, SupplierSalesItemInput>(ENDPOINTS.SUPPLIER_SALES.UPDATE_ITEM(uid, productUid), data),
        onSuccess: (_, variables) => {
            invalidateSupplierQueries(queryClient);
            queryClient.invalidateQueries({ queryKey: queryKeys.supplierSales.detail(variables.uid) });
        },
    });
}

export function useRemoveSupplierSaleItem() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<void>, Error, { uid: string; productUid: string }>({
        mutationFn: ({ uid, productUid }) => apiDelete<ApiResponse<void>>(ENDPOINTS.SUPPLIER_SALES.REMOVE_ITEM(uid, productUid)),
        onSuccess: (_, variables) => {
            invalidateSupplierQueries(queryClient);
            queryClient.invalidateQueries({ queryKey: queryKeys.supplierSales.detail(variables.uid) });
        },
    });
}
