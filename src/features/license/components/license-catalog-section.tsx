"use client";

import { Badge } from "@/components/ui/badge";
import { AppButton } from "@/components/shared/app-button";
import { IconAlertTriangle, IconPackage, IconShoppingCart } from "@tabler/icons-react";
import type { CatalogProduct } from "../types";
import { LicenseOrderDialog } from "./license-order-dialog";
import { LicenseCatalogCard } from "./license-catalog-card";
import { useLicenseCatalog } from "../hooks/use-license-catalog";
import { cn } from "@/lib/utils";

interface LicenseCatalogSectionProps {
    catalog: CatalogProduct[];
    activeAddons: string[];
    isOperable?: boolean;
}

export function LicenseCatalogSection({
    catalog,
    activeAddons,
    isOperable = true,
}: LicenseCatalogSectionProps) {
    const {
        posProduct,
        addons,
        billingView,
        setBillingView,
        orderOpen,
        setOrderOpen,
        selectedProductCode,
        selectedAddonId,
        openOrder,
    } = useLicenseCatalog(catalog);

    if (!posProduct) {
        return (
            <div className="text-center py-10 rounded-xl border border-slate-200 bg-slate-50/50">
                <p className="text-xs text-slate-500">
                    Katalog paket POS tidak ditemukan.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Warning Banner if Subscription Expired */}
            {!isOperable && (
                <div className="rounded-xl border border-rose-200/90 bg-rose-50/70 p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs text-left">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                            <IconAlertTriangle size={16} />
                        </div>
                        <p className="text-xs text-rose-800 font-medium">
                            <strong className="font-bold">Paket Utama Kedaluwarsa:</strong> Perpanjang paket dasar POS untuk mengaktifkan kembali seluruh modul add-on atau memesan fitur baru.
                        </p>
                    </div>
                    <AppButton
                        size="sm"
                        onClick={() => openOrder(posProduct.code)}
                        className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shrink-0 h-8 self-end sm:self-center cursor-pointer shadow-2xs"
                    >
                        <span>Perpanjang Paket</span>
                    </AppButton>
                </div>
            )}

            {/* Top Bar: Section Info, Billing Toggle & Order Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100/70">
                        <IconPackage size={18} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                Katalog Fitur & Add-on POS
                            </h3>
                            <Badge
                                variant="outline"
                                className="text-[9px] font-mono font-bold px-1.5 py-0 rounded bg-slate-100 text-slate-600 border-slate-200"
                            >
                                {posProduct.nama}
                            </Badge>
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium">
                            Perluas fungsionalitas aplikasi POS sesuai skala dan alur bisnis toko Anda
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0 flex-wrap">
                    {/* Billing Period Toggle */}
                    <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg border border-slate-200/70 shadow-2xs">
                        <button
                            type="button"
                            onClick={() => setBillingView("monthly")}
                            className={cn(
                                "px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer",
                                billingView === "monthly"
                                    ? "bg-white text-slate-800 shadow-2xs"
                                    : "text-slate-500 hover:text-slate-700",
                            )}
                        >
                            Bulanan
                        </button>
                        <button
                            type="button"
                            onClick={() => setBillingView("annual")}
                            className={cn(
                                "px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1",
                                billingView === "annual"
                                    ? "bg-white text-slate-800 shadow-2xs"
                                    : "text-slate-500 hover:text-slate-700",
                            )}
                        >
                            <span>Tahunan</span>
                            <span className="text-[9px] font-extrabold px-1 rounded bg-emerald-100 text-emerald-700">
                                -16%
                            </span>
                        </button>
                    </div>

                    <AppButton
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold gap-1.5 h-8 rounded-lg shadow-2xs cursor-pointer"
                        onClick={() => openOrder(posProduct.code)}
                    >
                        <IconShoppingCart size={14} />
                        <span>Pesan Add-on</span>
                    </AppButton>
                </div>
            </div>

            {/* Aesthetic Add-on Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {addons.map((addon) => (
                    <LicenseCatalogCard
                        key={addon.id}
                        addon={addon}
                        isOwned={activeAddons.includes(addon.code)}
                        isOperable={isOperable}
                        billingView={billingView}
                        onOrder={() => openOrder(posProduct.code, addon.id)}
                    />
                ))}
            </div>

            <LicenseOrderDialog
                open={orderOpen}
                onOpenChange={setOrderOpen}
                catalog={[posProduct]}
                productCode={selectedProductCode}
                initialAddonId={selectedAddonId}
            />
        </div>
    );
}
