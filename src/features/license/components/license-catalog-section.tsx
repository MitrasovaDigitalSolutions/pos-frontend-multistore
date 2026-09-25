"use client";

import { Badge } from "@/components/ui/badge";
import { AppButton } from "@/components/shared/app-button";
import { IconPackage, IconServer, IconShoppingCart } from "@tabler/icons-react";
import type { CatalogProduct, ServerPackage } from "../types";
import { LicenseOrderDialog } from "./license-order-dialog";
import { LicenseCatalogCard } from "./license-catalog-card";
import { useLicenseCatalog } from "../hooks/use-license-catalog";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { cn } from "@/lib/utils";

interface LicenseCatalogSectionProps {
    catalog?: CatalogProduct[];
    serverPackages?: ServerPackage[];
    activeAddons: string[];
    isOperable?: boolean;
}

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
        addons,
        billingView,
        setBillingView,
        orderOpen,
        setOrderOpen,
        selectedProductCode,
        selectedAddonId,
        openOrder,
    } = useLicenseCatalog(safeCatalog);

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

            {/* Server Infrastructure Packages Showcase */}
            {safeServerPackages.length > 0 && (
                <div className="pt-4 border-t border-slate-100 space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                            <IconServer size={15} />
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                Paket Server & Cloud Hosting
                            </h4>
                            <p className="text-[11px] text-slate-400 font-medium">
                                Pilihan infrastruktur server yang dioptimalkan untuk performa POS Multi-Store
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {safeServerPackages.map((server) => {
                            const isFree = server.harga_bulanan === 0;
                            const price = billingView === "annual" ? server.harga_tahunan : server.harga_bulanan;
                            return (
                                <div
                                    key={server.id}
                                    className="p-3.5 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 transition-all flex flex-col justify-between shadow-2xs space-y-2.5"
                                >
                                    <div className="space-y-1.5">
                                        <div className="flex items-start justify-between gap-1.5">
                                            <span className="font-bold text-xs text-slate-800 line-clamp-1">
                                                {server.nama}
                                            </span>
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    "text-[9px] font-mono px-1.5 py-0 shrink-0",
                                                    isFree
                                                        ? "bg-slate-100 text-slate-600 border-slate-200"
                                                        : "bg-blue-50 text-blue-700 border-blue-200"
                                                )}
                                            >
                                                {isFree ? "Local" : "Cloud"}
                                            </Badge>
                                        </div>
                                        {server.cpu && server.cpu !== "Self-Hosted" && (
                                            <div className="flex flex-wrap gap-1 text-[10px] text-slate-500 font-mono">
                                                <span className="px-1.5 py-0.2 rounded bg-slate-100 border border-slate-200/60">{server.cpu}</span>
                                                <span className="px-1.5 py-0.2 rounded bg-slate-100 border border-slate-200/60">{server.ram}</span>
                                                <span className="px-1.5 py-0.2 rounded bg-slate-100 border border-slate-200/60">{server.storage}</span>
                                            </div>
                                        )}
                                        {server.description && (
                                            <p className="text-[11px] text-slate-400 line-clamp-2">
                                                {server.description}
                                            </p>
                                        )}
                                    </div>
                                    <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
                                        <div>
                                            <span className="font-extrabold text-xs text-slate-900 font-mono">
                                                {isFree ? "Rp 0 (Gratis)" : formatRupiah(price)}
                                            </span>
                                            {!isFree && (
                                                <span className="text-[10px] text-slate-400 ml-0.5">
                                                    /{billingView === "annual" ? "thn" : "bln"}
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => openOrder(posProduct.code)}
                                            className="text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                                        >
                                            Pilih Server →
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <LicenseOrderDialog
                open={orderOpen}
                onOpenChange={setOrderOpen}
                catalog={[posProduct]}
                serverPackages={safeServerPackages}
                productCode={selectedProductCode}
                initialAddonId={selectedAddonId}
            />
        </div>
    );
}
