"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAppRouter } from "@/hooks/use-app-router";
import { useLicenseStatusQuery } from "../api/license-api";
import { toast } from "sonner";

import type { BusinessPresetType } from "../types";

interface LicenseAdminGuardProps {
    children: React.ReactNode;
}

/**
 * Mapping of route prefixes to their required addon module code and user-friendly label.
 */
const ROUTE_ADDON_MAP: Array<{ prefix: string; addon: string; label: string }> = [
    { prefix: "/admin/accounting", addon: "accounting", label: "Akuntansi" },
    { prefix: "/admin/purchase", addon: "purchasing", label: "Pembelian & Supplier" },
    { prefix: "/admin/suppliers", addon: "purchasing", label: "Supplier" },
    { prefix: "/admin/sales", addon: "purchasing", label: "Sales Supplier" },
    { prefix: "/admin/consignment", addon: "consignment", label: "Konsinyasi" },
    { prefix: "/admin/debts", addon: "debts", label: "Hutang & Piutang" },
    { prefix: "/admin/expenses", addon: "expenses", label: "Pengeluaran" },
    { prefix: "/admin/members", addon: "members", label: "Member & CRM" },
    { prefix: "/admin/inventory/stock-opname", addon: "stock_opname", label: "Stock Opname" },
    { prefix: "/admin/inventory/stock-transfer", addon: "multi_store", label: "Transfer Stok" },
    { prefix: "/admin/request-transfer", addon: "multi_store", label: "Request Transfer Stok" },
    { prefix: "/admin/remittance", addon: "multi_store", label: "Setoran Cabang" },
    { prefix: "/admin/manufacturing", addon: "production", label: "Manufaktur & Produksi" },
    { prefix: "/admin/assets", addon: "assets", label: "Manajemen Aset" },
    { prefix: "/admin/reports/central", addon: "multi_store", label: "Laporan Konsolidasi" },
    { prefix: "/admin/reports/laba-rugi", addon: "reports", label: "Laporan Laba Rugi" },
    { prefix: "/admin/reports/sales", addon: "reports", label: "Laporan Penjualan" },
    { prefix: "/admin/reports/pembelian", addon: "reports", label: "Laporan Pembelian" },
    { prefix: "/admin/reports/pengeluaran", addon: "reports", label: "Laporan Pengeluaran" },
];

/**
 * Mapping of route prefixes to their allowed business presets.
 */
const ROUTE_PRESET_MAP: Array<{
    prefix: string;
    presets: BusinessPresetType[];
    label: string;
}> = [
    { prefix: "/admin/manufacturing", presets: ["confectionery"], label: "Manufaktur & Produksi" },
    { prefix: "/admin/consignment", presets: ["confectionery"], label: "Konsinyasi" },
];

/**
 * Guard component for admin layout.
 * 1. Ensures only users with an active & valid license (or in allowed grace period)
 *    can access /admin and its subpages. If expired/suspended/not activated, redirects to /licenses.
 * 2. Ensures users can only access specific add-on pages (e.g. /admin/accounting) if their license
 *    has that addon active. If unsubscribed, blocks access and redirects to /admin.
 */
export function LicenseAdminGuard({ children }: LicenseAdminGuardProps) {
    const router = useAppRouter();
    const pathname = usePathname();
    const { data: status, isLoading } = useLicenseStatusQuery();

    useEffect(() => {
        if (isLoading || !status) return;

        // 1. Base license status validation
        const isGraceAllowed = status.is_grace_period && status.can_operate;
        const isActiveAndValid = status.status === "active" && status.can_operate;

        if (!isActiveAndValid && !isGraceAllowed) {
            toast.error("Lisensi toko tidak aktif atau kedaluwarsa. Anda dialihkan ke halaman langganan.");
            router.replace("/licenses");
            return;
        }

        // 2. Business preset route access validation
        const currentBusinessType: BusinessPresetType = status.business_type || "retail";
        const matchedPreset = ROUTE_PRESET_MAP.find((item) =>
            pathname === item.prefix || pathname.startsWith(item.prefix + "/")
        );

        if (matchedPreset && !matchedPreset.presets.includes(currentBusinessType)) {
            toast.error(
                `Fitur ${matchedPreset.label} tidak tersedia untuk jenis usaha Anda.`
            );
            router.replace("/admin");
            return;
        }

        // 3. Add-on module subscription validation
        const matchedAddon = ROUTE_ADDON_MAP.find((item) =>
            pathname === item.prefix || pathname.startsWith(item.prefix + "/")
        );

        if (matchedAddon) {
            const userAddons = (status.active_addons ?? []).map((a) => a.toLowerCase());
            if (!userAddons.includes(matchedAddon.addon.toLowerCase())) {
                toast.error(
                    `Add-on ${matchedAddon.label} belum aktif pada paket langganan Anda. Silakan aktifkan add-on di halaman Kelola Langganan.`
                );
                router.replace("/admin");
            }
        }
    }, [status, isLoading, pathname, router]);

    // Prevent flashing content of unpurchased addon, incompatible preset, or inactive license
    if (status) {
        const isGraceAllowed = status.is_grace_period && status.can_operate;
        const isActiveAndValid = status.status === "active" && status.can_operate;

        if (!isActiveAndValid && !isGraceAllowed) {
            return null;
        }

        const currentBusinessType: BusinessPresetType = status.business_type || "retail";
        const matchedPreset = ROUTE_PRESET_MAP.find((item) =>
            pathname === item.prefix || pathname.startsWith(item.prefix + "/")
        );

        if (matchedPreset && !matchedPreset.presets.includes(currentBusinessType)) {
            return null;
        }

        const matchedAddon = ROUTE_ADDON_MAP.find((item) =>
            pathname === item.prefix || pathname.startsWith(item.prefix + "/")
        );

        if (matchedAddon) {
            const userAddons = (status.active_addons ?? []).map((a) => a.toLowerCase());
            if (!userAddons.includes(matchedAddon.addon.toLowerCase())) {
                return null;
            }
        }
    }

    return <>{children}</>;
}
