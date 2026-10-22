"use client";

import { AppButton } from "@/components/shared/app-button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
    IconPackage,
    IconShoppingCart,
} from "@tabler/icons-react";
import type { CatalogProduct } from "../types";
import { LicenseCatalogSearchBar } from "./catalog/license-catalog-search-bar";

interface LicenseCatalogToolbarProps {
    posProduct: CatalogProduct;
    billingView: "monthly" | "annual";
    onBillingViewChange: (period: "monthly" | "annual") => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    stats: {
        total: number;
        owned: number;
        available: number;
        discountPercent: number;
    };
    onOpenOrder: () => void;
}

/**
 * Single Responsibility: Compact, high-performance catalog toolbar.
 * Pairs the title overview with search filter, billing toggle, and primary order CTA.
 */
export function LicenseCatalogToolbar({
    posProduct,
    billingView,
    onBillingViewChange,
    searchQuery,
    onSearchChange,
    stats,
    onOpenOrder,
}: LicenseCatalogToolbarProps) {
    return (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            {/* Left: Title & Quick Overview */}
            <div className="flex items-start sm:items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 shadow-2xs">
                    <IconPackage size={17} />
                </div>
                <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                            Katalog Fitur & Add-on POS
                        </h3>
                        <Badge
                            variant="outline"
                            className="text-[10px] font-mono font-bold px-1.5 py-0 rounded bg-slate-100 text-slate-700 border-slate-200"
                        >
                            {posProduct.nama}
                        </Badge>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 inline-flex items-center gap-1 shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>{stats.owned} dari {stats.total} Terpasang</span>
                        </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5 truncate">
                        Perluas fungsionalitas kasir dan modul bisnis toko sesuai skala operasional Anda
                    </p>
                </div>
            </div>

            {/* Right: Search Filter + Billing Period Toggle + Order CTA */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 shrink-0">
                {/* Search Bar */}
                <LicenseCatalogSearchBar
                    searchQuery={searchQuery}
                    onSearchChange={onSearchChange}
                />

                <div className="flex items-center gap-2 shrink-0">
                    {/* Billing Period Toggle */}
                    <div className="flex items-center gap-0.5 p-0.5 bg-slate-100 rounded-lg border border-slate-200/70 shadow-2xs">
                        <button
                            type="button"
                            onClick={() => onBillingViewChange("monthly")}
                            className={cn(
                                "px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer",
                                billingView === "monthly"
                                    ? "bg-white text-slate-900 shadow-2xs"
                                    : "text-slate-500 hover:text-slate-700",
                            )}
                        >
                            Bulanan
                        </button>
                        <button
                            type="button"
                            onClick={() => onBillingViewChange("annual")}
                            className={cn(
                                "px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1",
                                billingView === "annual"
                                    ? "bg-white text-slate-900 shadow-2xs"
                                    : "text-slate-500 hover:text-slate-700",
                            )}
                        >
                            <span>Tahunan</span>
                            <span className="text-[9px] font-black px-1 rounded bg-emerald-100 text-emerald-700">
                                -{stats.discountPercent}%
                            </span>
                        </button>
                    </div>

                    {/* Primary Order Action */}
                    <AppButton
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold gap-1.5 h-8 rounded-lg shadow-2xs cursor-pointer"
                        onClick={onOpenOrder}
                    >
                        <IconShoppingCart size={14} />
                        <span>Pesan Add-on</span>
                    </AppButton>
                </div>
            </div>
        </div>
    );
}
