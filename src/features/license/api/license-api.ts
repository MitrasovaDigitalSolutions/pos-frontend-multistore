import { queryKeys } from "@/lib/query-keys";
import { apiGet, apiPost } from "@/shared/api/api-client";
import { ENDPOINTS } from "@/shared/api/endpoints";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useLicenseStore } from "@/stores/license-store";
import type {
    ActivatePayload,
    ActivateResponse,
    CatalogProduct,
    CouponCheckPayload,
    CouponCheckResponse,
    CouponCheckResult,
    Invoice,
    InvoiceFilterParams,
    InvoicesResponse,
    LicenseStatus,
    LicenseStatusResponse,
    OrderPayload,
    OrderResponse,
    SyncResponse
} from "../types";

// ─── License API Object ──────────────────────────────────────────────────────

export const licenseApi = {
    getStatus: async (): Promise<LicenseStatus> => {
        // Hit sync endpoint first before retrieving latest status
        try {
            await apiPost<SyncResponse>(ENDPOINTS.LICENSE.SYNC);
        } catch (syncErr) {
            console.warn("Auto-sync prior to getStatus failed:", syncErr);
        }

        const response = await apiGet<LicenseStatusResponse>(ENDPOINTS.LICENSE.STATUS);
        const data = response.data;
        useLicenseStore.getState().setLicenseStatus(data);
        return data;
    },

    activate: async (payload: ActivatePayload): Promise<LicenseStatus> => {
        const response = await apiPost<ActivateResponse>(ENDPOINTS.LICENSE.ACTIVATE, payload);
        const data = response.data;
        useLicenseStore.getState().setLicenseStatus(data);
        return data;
    },

    sync: async (): Promise<LicenseStatus> => {
        const response = await apiPost<SyncResponse>(ENDPOINTS.LICENSE.SYNC);
        const data = response.data;
        useLicenseStore.getState().setLicenseStatus(data);
        return data;
    },

    checkCoupon: async (payload: CouponCheckPayload): Promise<CouponCheckResult> => {
        const response = await apiPost<CouponCheckResponse>(ENDPOINTS.LICENSE.CHECK_COUPON, payload);
        return response.data;
    },

    getCatalog: async (): Promise<CatalogProduct[]> => {
        try {
            const response = await apiGet<unknown>(ENDPOINTS.LICENSE.CATALOG);
            if (Array.isArray(response)) {
                return response as CatalogProduct[];
            }
            if (
                response &&
                typeof response === "object" &&
                "data" in response
            ) {
                const data = (response as { data: unknown }).data;
                if (Array.isArray(data)) {
                    return data as CatalogProduct[];
                }
                if (data && typeof data === "object") {
                    const record = data as Record<string, unknown>;
                    if (Array.isArray(record.products)) {
                        return record.products as CatalogProduct[];
                    }
                    if (Array.isArray(record.catalog)) {
                        return record.catalog as CatalogProduct[];
                    }
                }
            }
            return [];
        } catch (error) {
            console.warn("Failed to fetch license catalog:", error);
            return [];
        }
    },

    getInvoices: async (filters?: InvoiceFilterParams): Promise<Invoice[]> => {
        let endpoint: string = ENDPOINTS.LICENSE.INVOICES;
        if (filters) {
            const params = new URLSearchParams();
            if (filters.status && filters.status !== "all") {
                params.append("status", filters.status);
            }
            if (filters.year && Number(filters.year) > 0) {
                params.append("year", String(filters.year));
            }
            const qs = params.toString();
            if (qs) {
                endpoint = `${endpoint}?${qs}`;
            }
        }

        const response = await apiGet<InvoicesResponse | Invoice[]>(endpoint);
        if (Array.isArray(response)) {
            return response;
        }
        if (response && Array.isArray((response as InvoicesResponse).data)) {
            return (response as InvoicesResponse).data;
        }
        return [];
    },

    createOrder: async (payload: OrderPayload) => {
        const response = await apiPost<OrderResponse>(ENDPOINTS.LICENSE.ORDERS, payload);
        return response.data;
    },

    downloadInvoicePdf: async (invoiceNumber: string): Promise<void> => {
        // Open in new tab — the proxy will stream the PDF
        const baseUrl = "/api/proxy";
        const url = `${baseUrl}${ENDPOINTS.LICENSE.INVOICE_PDF(invoiceNumber)}`;
        window.open(url, "_blank");
    },
};

// ─── React Query Hooks ───────────────────────────────────────────────────────

export function useLicenseStatusQuery(options?: {
    enabled?: boolean;
    refetchOnMount?: boolean | "always";
}) {
    return useQuery({
        queryKey: queryKeys.license.status(),
        queryFn: () => licenseApi.getStatus(),
        staleTime: 1000 * 60 * 5, // 5 minutes
        enabled: options?.enabled ?? true,
        refetchOnMount: options?.refetchOnMount,
    });
}

export function useLicenseCatalogQuery() {
    return useQuery({
        queryKey: queryKeys.license.catalog(),
        queryFn: () => licenseApi.getCatalog(),
        staleTime: 1000 * 60 * 30, // 30 minutes – catalog rarely changes
    });
}

export function useLicenseInvoicesQuery(filters?: InvoiceFilterParams) {
    return useQuery({
        queryKey: queryKeys.license.invoices(filters),
        queryFn: () => licenseApi.getInvoices(filters),
        staleTime: 1000 * 60 * 5,
    });
}

export function useLicenseCheckCouponMutation() {
    return useMutation({
        mutationFn: (payload: CouponCheckPayload) => licenseApi.checkCoupon(payload),
    });
}

export function useLicenseActivateMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: ActivatePayload) => licenseApi.activate(payload),
        onSuccess: (data) => {
            if (data) {
                useLicenseStore.getState().setLicenseStatus(data);
            }
            void queryClient.invalidateQueries({ queryKey: queryKeys.license.all });
            toast.success("Lisensi berhasil diaktifkan.");
        },
        onError: (error: Error) => {
            toast.error(error.message ?? "Gagal mengaktifkan lisensi.");
        },
    });
}

export function useLicenseSyncMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => licenseApi.sync(),
        onSuccess: (data) => {
            if (data) {
                useLicenseStore.getState().setLicenseStatus(data);
            }
            void queryClient.invalidateQueries({ queryKey: queryKeys.license.all });
            toast.success("Status lisensi berhasil disinkronkan.");
        },
        onError: (error: Error) => {
            toast.error(error.message ?? "Gagal menyinkronkan lisensi.");
        },
    });
}

export function useLicenseOrderMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: OrderPayload) => licenseApi.createOrder(payload),
        onSuccess: (data) => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.license.all });
            if (data.payment_url) {
                window.open(data.payment_url, "_blank");
            }
            toast.success("Pesanan berhasil dibuat. Mengalihkan ke pembayaran...");
        },
        onError: (error: Error) => {
            toast.error(error.message ?? "Gagal membuat pesanan lisensi.");
        },
    });
}
