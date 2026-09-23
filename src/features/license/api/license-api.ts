import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/shared/api/api-client";
import { queryKeys } from "@/lib/query-keys";
import { ENDPOINTS } from "@/shared/api/endpoints";
import { toast } from "sonner";
import type {
    LicenseStatusResponse,
    CatalogResponse,
    InvoicesResponse,
    ActivatePayload,
    ActivateResponse,
    SyncResponse,
    OrderPayload,
    OrderResponse,
    LicenseStatus,
    Invoice,
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
        return response.data;
    },

    activate: async (payload: ActivatePayload): Promise<LicenseStatus> => {
        const response = await apiPost<ActivateResponse>(ENDPOINTS.LICENSE.ACTIVATE, payload);
        return response.data;
    },

    sync: async (): Promise<LicenseStatus> => {
        const response = await apiPost<SyncResponse>(ENDPOINTS.LICENSE.SYNC);
        return response.data;
    },

    getCatalog: async () => {
        const response = await apiGet<CatalogResponse>(ENDPOINTS.LICENSE.CATALOG);
        return response.data;
    },

    getInvoices: async (): Promise<Invoice[]> => {
        const response = await apiGet<InvoicesResponse | Invoice[]>(ENDPOINTS.LICENSE.INVOICES);
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

export function useLicenseInvoicesQuery() {
    return useQuery({
        queryKey: queryKeys.license.invoices(),
        queryFn: () => licenseApi.getInvoices(),
        staleTime: 1000 * 60 * 5,
    });
}

export function useLicenseActivateMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: ActivatePayload) => licenseApi.activate(payload),
        onSuccess: () => {
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
        onSuccess: () => {
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
