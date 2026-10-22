"use client";

import { useLicenseCatalog } from "../hooks/use-license-catalog";
import type { CatalogProduct, ServerPackage } from "../types";
import { LicenseCatalogCard } from "./license-catalog-card";
import { LicenseCatalogToolbar } from "./license-catalog-toolbar";
import { LicenseOrderDialog } from "./license-order-dialog";
import { LicenseServerPackages } from "./license-server-packages";
import { AppButton } from "@/components/shared/app-button";
import { IconPackageOff, IconRotate } from "@tabler/icons-react";

interface LicenseCatalogSectionProps {
    catalog?: CatalogProduct[];
    serverPackages?: ServerPackage[];
    activeAddons: string[];
    isOperable?: boolean;
}

/**
 * Top-level Declarative Coordinator for the "Katalog Fitur & Add-on POS" tab.
 * Adheres strictly to Anti-God Component policy, delegating UI sub-sections to focused components.
 */
export function LicenseCatalogSection({
    catalog = [],
    serverPackages = [],
    activeAddons,
    isOperable = true,
}: LicenseCatalogSectionProps) {
    const safeCatalog = Array.isArray(catalog) ? catalog : [];
    const safeServerPackages = Array.isArray(serverPackages) ? serverPackages : [];

    const {
        posProduct,
        filteredAddons,
        billingView,
        setBillingView,
        searchQuery,
        setSearchQuery,
        stats,
        resetSearch,
        activeAddonSet,
        orderOpen,
        setOrderOpen,
        selectedProductCode,
        selectedAddonId,
        openOrder,
    } = useLicenseCatalog(safeCatalog, activeAddons);

    if (!posProduct) {
        return (
            <div className="text-center py-10 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                <IconPackageOff size={32} className="mx-auto text-slate-400" />
                <p className="text-xs font-bold text-slate-700">
                    Katalog paket POS tidak ditemukan
                </p>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                    Koneksi ke katalog produk server pusat tidak tersedia. Coba periksa koneksi internet atau muat ulang halaman.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Top Toolbar: Title, Search, Period Switch, & Order Action */}
            <LicenseCatalogToolbar
                posProduct={posProduct}
                billingView={billingView}
                onBillingViewChange={setBillingView}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                stats={stats}
                onOpenOrder={() => openOrder(posProduct.code)}
            />

            {/* Add-ons Grid: Formatted uniformly in a 3-column compact grid, matching server package size */}
            {filteredAddons.length === 0 ? (
                <div className="text-center py-10 px-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/40 space-y-2.5">
                    <p className="text-xs font-bold text-slate-700">
                        Tidak ada add-on yang sesuai dengan pencarian &ldquo;{searchQuery}&rdquo;
                    </p>
                    <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                        Coba gunakan kata kunci lain seperti nama modul, kode, atau fitur kasir.
                    </p>
                    <AppButton
                        variant="outline"
                        size="sm"
                        onClick={resetSearch}
                        className="h-8 text-xs font-bold rounded-lg border-slate-200 gap-1.5 shadow-2xs"
                    >
                        <IconRotate size={13} />
                        <span>Reset Pencarian</span>
                    </AppButton>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredAddons.map((addon) => {
                        const isOwned = activeAddonSet.has((addon.code || "").toLowerCase());
                        return (
                            <LicenseCatalogCard
                                key={addon.id}
                                addon={addon}
                                isOwned={isOwned}
                                isOperable={isOperable}
                                billingView={billingView}
                                onOrder={() => openOrder(posProduct.code, addon.id)}
                            />
                        );
                    })}
                </div>
            )}

            {/* Server Infrastructure Packages Showcase (Unified 3-column layout) */}
            <LicenseServerPackages
                serverPackages={safeServerPackages}
                billingView={billingView}
                onSelectServer={(serverCode) => openOrder(posProduct.code, serverCode)}
            />

            {/* Order & Checkout Dialog */}
            <LicenseOrderDialog
                open={orderOpen}
                onOpenChange={setOrderOpen}
                catalog={[posProduct]}
                serverPackages={safeServerPackages}
                productCode={selectedProductCode}
                initialAddonId={selectedAddonId}
                isOperable={isOperable}
            />
        </div>
    );
}
