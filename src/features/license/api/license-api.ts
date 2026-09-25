import { queryKeys } from "@/lib/query-keys";
import { apiGet, apiPost } from "@/shared/api/api-client";
import { ENDPOINTS } from "@/shared/api/endpoints";
import { useLicenseStore } from "@/stores/license-store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
    ActivatePayload,
    ActivateResponse,
    CatalogData,
    CatalogProduct,
    CouponCheckPayload,
    CouponCheckResponse,
    CouponCheckResult,
    CouponDetail,
    Invoice,
    InvoiceFilterParams,
    InvoicesResponse,
    LicenseStatus,
    LicenseStatusResponse,
    OrderPayload,
    OrderResponse,
    ProrateCalculateData,
    ProrateCalculatePayload,
    ProrateCalculateResponse,
    ServerPackage,
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
        const root = response as unknown as {
            status?: string;
            message?: string;
            data?: {
                valid?: boolean;
                coupon?: Partial<CouponDetail>;
            } & Partial<CouponDetail>;
        };

        const data = root?.data;
        const rawCoupon = data?.coupon ?? data;
        const isValid = data?.valid !== false && root?.status !== "error";

        if (!isValid || !rawCoupon) {
            const errorMsg = root?.message || "Kupon tidak valid atau telah kedaluwarsa";
            throw new Error(errorMsg);
        }

        const discountAmount = Number(rawCoupon.discount_amount) || 0;
        const code = String(rawCoupon.code || payload.coupon_code).toUpperCase();
        const name = String(rawCoupon.name || code);
        const discountType = String(rawCoupon.discount_type || "fixed");
        const discountValue = Number(rawCoupon.discount_value) || 0;
        const formattedDiscount = rawCoupon.formatted_discount;
        const subtotal = rawCoupon.subtotal !== undefined ? Number(rawCoupon.subtotal) : undefined;
        const finalAmount = rawCoupon.final_amount !== undefined ? Number(rawCoupon.final_amount) : undefined;
        const description = rawCoupon.description;

        const couponDetail: CouponDetail = {
            code,
            name,
            discount_type: discountType,
            discount_value: discountValue,
            discount_amount: discountAmount,
            formatted_discount: formattedDiscount,
            subtotal: subtotal ?? 0,
            final_amount: finalAmount ?? 0,
            description,
        };

        return {
            valid: true,
            coupon: couponDetail,
            code,
            name,
            discount_type: discountType,
            discount_value: discountValue,
            discount_amount: discountAmount,
            formatted_discount: formattedDiscount,
            subtotal,
            final_amount: finalAmount,
            description,
        };
    },

    calculateProrate: async (payload: ProrateCalculatePayload): Promise<ProrateCalculateData> => {
        const response = await apiPost<ProrateCalculateResponse>(ENDPOINTS.LICENSE.CALCULATE_PRORATE, payload);
        return response.data;
    },

    getCatalog: async (): Promise<CatalogData> => {
        try {
            const response = await apiGet<unknown>(ENDPOINTS.LICENSE.CATALOG);
            if (Array.isArray(response)) {
                return {
                    products: response as CatalogProduct[],
                    server_packages: [],
                };
            }
            if (
                response &&
                typeof response === "object" &&
                "data" in response
            ) {
                const data = (response as { data: unknown }).data;
                if (Array.isArray(data)) {
                    return {
                        products: data as CatalogProduct[],
                        server_packages: [],
                    };
                }
                if (data && typeof data === "object") {
                    const record = data as Record<string, unknown>;
                    const products = (
                        Array.isArray(record.products)
                            ? record.products
                            : Array.isArray(record.catalog)
                                ? record.catalog
                                : []
                    ) as CatalogProduct[];
                    const serverPackages = (
                        Array.isArray(record.server_packages)
                            ? record.server_packages
                            : []
                    ) as ServerPackage[];

                    return {
                        products,
                        server_packages: serverPackages,
                    };
                }
            }
            return { products: [], server_packages: [] };
        } catch (error) {
            console.warn("Failed to fetch license catalog:", error);
            return { products: [], server_packages: [] };
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

export function useLicenseProrateQuery(
    addonIds: string[],
    options?: { enabled?: boolean }
) {
    const sortedKey = [...addonIds].sort().join(",");
    return useQuery({
        queryKey: queryKeys.license.prorate([sortedKey]),
        queryFn: () => licenseApi.calculateProrate({ addon_ids: addonIds }),
        enabled: (options?.enabled ?? true) && addonIds.length > 0,
        staleTime: 1000 * 60 * 5, // 5 minutes cache
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
