import { apiDelete, apiGet, apiPost, apiPut } from "@/shared/api/api-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
    CreateBatchPayload,
    CreatePrescriptionTemplatePayload,
    CreateUnitConversionPayload,
    PrescriptionHistoryResponse,
    PrescriptionTemplateDetailResponse,
    PrescriptionTemplatesResponse,
    ProductBatchesResponse,
    ProductBatchResponse,
    ProductUnitResponse,
    ProductUnitsResponse,
    UpdateBatchPayload,
} from "../types";

export const pharmacyQueryKeys = {
    all: ["pharmacy"] as const,
    batches: (productUid?: string) => ["pharmacy", "batches", productUid] as const,
    units: (productUid?: string) => ["pharmacy", "units", productUid] as const,
    templates: (params?: Record<string, unknown>) => ["pharmacy", "templates", params] as const,
    templateDetail: (uid?: string) => ["pharmacy", "template-detail", uid] as const,
    history: (params?: Record<string, unknown>) => ["pharmacy", "history", params] as const,
};

// ─── 1. Product Batches ───────────────────────────────────────────────────────

export function useProductBatches(productUid?: string, status: string = "active") {
    return useQuery<ProductBatchesResponse>({
        queryKey: [...pharmacyQueryKeys.batches(productUid), status],
        queryFn: async () => {
            if (!productUid) {
                return { status: "success", message: "", data: [] };
            }
            return apiGet<ProductBatchesResponse>(
                `/v1/pharmacy/products/${productUid}/batches`,
                { params: { status } }
            );
        },
        enabled: Boolean(productUid),
    });
}

export function useCreateProductBatch(productUid: string) {
    const queryClient = useQueryClient();
    return useMutation<ProductBatchResponse, Error, CreateBatchPayload>({
        mutationFn: async (payload) => {
            return apiPost<ProductBatchResponse>(
                `/v1/pharmacy/products/${productUid}/batches`,
                payload
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: pharmacyQueryKeys.batches(productUid) });
        },
    });
}

export function useUpdateProductBatch(productUid?: string) {
    const queryClient = useQueryClient();
    return useMutation<ProductBatchResponse, Error, { batchUid: string; payload: UpdateBatchPayload }>({
        mutationFn: async ({ batchUid, payload }) => {
            return apiPut<ProductBatchResponse>(
                `/v1/pharmacy/batches/${batchUid}`,
                payload
            );
        },
        onSuccess: () => {
            if (productUid) {
                queryClient.invalidateQueries({ queryKey: pharmacyQueryKeys.batches(productUid) });
            } else {
                queryClient.invalidateQueries({ queryKey: ["pharmacy", "batches"] });
            }
        },
    });
}

// ─── 2. Multi-Satuan / Unit Conversion ────────────────────────────────────────

export function useProductUnits(productUid?: string) {
    return useQuery<ProductUnitsResponse>({
        queryKey: pharmacyQueryKeys.units(productUid),
        queryFn: async () => {
            if (!productUid) {
                return { status: "success", message: "", data: [] };
            }
            return apiGet<ProductUnitsResponse>(`/v1/pharmacy/products/${productUid}/units`);
        },
        enabled: Boolean(productUid),
    });
}

export function useCreateProductUnit(productUid: string) {
    const queryClient = useQueryClient();
    return useMutation<ProductUnitResponse, Error, CreateUnitConversionPayload>({
        mutationFn: async (payload) => {
            return apiPost<ProductUnitResponse>(
                `/v1/pharmacy/products/${productUid}/units`,
                payload
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: pharmacyQueryKeys.units(productUid) });
        },
    });
}

export function useDeleteProductUnit(productUid?: string) {
    const queryClient = useQueryClient();
    return useMutation<ProductUnitResponse, Error, string>({
        mutationFn: async (conversionUid) => {
            return apiDelete<ProductUnitResponse>(`/v1/pharmacy/units/${conversionUid}`);
        },
        onSuccess: () => {
            if (productUid) {
                queryClient.invalidateQueries({ queryKey: pharmacyQueryKeys.units(productUid) });
            } else {
                queryClient.invalidateQueries({ queryKey: ["pharmacy", "units"] });
            }
        },
    });
}

// ─── 3. Template Racikan Master Store (Prescription Templates) ───────────────

export interface PrescriptionTemplateFilterParams {
    search?: string;
    page?: number;
    per_page?: number;
}

export function usePrescriptionTemplates(params?: PrescriptionTemplateFilterParams) {
    return useQuery<PrescriptionTemplatesResponse>({
        queryKey: pharmacyQueryKeys.templates(params as Record<string, unknown>),
        queryFn: async () => {
            return apiGet<PrescriptionTemplatesResponse>("/v1/pharmacy/prescriptions", {
                params: {
                    search: params?.search || "",
                    page: params?.page || 1,
                    per_page: params?.per_page || 15,
                },
            });
        },
    });
}

export function usePrescriptionTemplateDetail(uid?: string) {
    return useQuery<PrescriptionTemplateDetailResponse>({
        queryKey: pharmacyQueryKeys.templateDetail(uid),
        queryFn: async () => {
            return apiGet<PrescriptionTemplateDetailResponse>(`/v1/pharmacy/prescriptions/${uid}`);
        },
        enabled: Boolean(uid),
    });
}

export function useCreatePrescriptionTemplate() {
    const queryClient = useQueryClient();
    return useMutation<PrescriptionTemplateDetailResponse, Error, CreatePrescriptionTemplatePayload>({
        mutationFn: async (payload) => {
            return apiPost<PrescriptionTemplateDetailResponse>(
                "/v1/pharmacy/prescriptions",
                payload
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pharmacy", "templates"] });
        },
    });
}

export function useDeletePrescriptionTemplate() {
    const queryClient = useQueryClient();
    return useMutation<{ status: string; message: string }, Error, string>({
        mutationFn: async (uid) => {
            return apiDelete<{ status: string; message: string }>(`/v1/pharmacy/prescriptions/${uid}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pharmacy", "templates"] });
        },
    });
}

// ─── 4. Riwayat Racikan Terjual (Prescription History) ───────────────────────

export interface PrescriptionHistoryFilterParams {
    search?: string;
    page?: number;
    per_page?: number;
}

export function usePrescriptionHistories(params?: PrescriptionHistoryFilterParams) {
    return useQuery<PrescriptionHistoryResponse>({
        queryKey: pharmacyQueryKeys.history(params as Record<string, unknown>),
        queryFn: async () => {
            return apiGet<PrescriptionHistoryResponse>("/v1/pharmacy/prescriptions/history", {
                params: {
                    search: params?.search || "",
                    page: params?.page || 1,
                    per_page: params?.per_page || 15,
                },
            });
        },
    });
}
