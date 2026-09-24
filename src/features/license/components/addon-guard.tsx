"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Lock, Sparkles, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useHasAddon } from "@/stores/license-store";

export const ADDON_DETAILS: Record<string, { title: string; description: string }> = {
    purchasing: {
        title: "Pembelian & Supplier",
        description: "Kelola Purchase Order (PO), penerimaan barang masuk, pembayaran, dan retur supplier terintegrasi.",
    },
    debts: {
        title: "Hutang & Piutang",
        description: "Pencatatan dan pemantauan jatuh tempo hutang ke supplier serta piutang pelanggan secara akurat.",
    },
    expenses: {
        title: "Pengeluaran Operasional",
        description: "Manajemen pos pengeluaran operasional dan kategori biaya untuk kontrol arus kas bisnis.",
    },
    members: {
        title: "Member & Loyalty CRM",
        description: "Kelola database pelanggan setia, program membership, poin belanja, dan promosi khusus member.",
    },
    stock_opname: {
        title: "Stock Opname",
        description: "Audit fisik stok berkala, pencocokan stok sistem vs lapangan, dan rekonsiliasi selisih barang.",
    },
    reports: {
        title: "Laporan Bisnis & Analitik",
        description: "Laporan komprehensif laba-rugi, tren penjualan harian/bulanan, dan analisis performa toko.",
    },
    accounting: {
        title: "Akuntansi & Pembukuan",
        description: "Bagan akun (COA), jurnal umum manual, buku besar otomatis, dan laporan neraca keuangan terstandar.",
    },
    consignment: {
        title: "Konsinyasi",
        description: "Penerimaan barang konsinyasi pihak ketiga, sistem bagi hasil penjualan, dan retur barang konsinyasi.",
    },
    production: {
        title: "Manufaktur & Produksi",
        description: "Perumusan Bill of Materials (BOM), biaya bahan baku (HPP), dan manajemen proses produksi barang jadi.",
    },
    assets: {
        title: "Manajemen Aset",
        description: "Pencatatan aset fisik perusahaan, penghitungan depresiasi otomatis, dan status pemeliharaan.",
    },
    multi_store: {
        title: "Multi-Store & Cabang",
        description: "Dukungan pengelolaan lebih dari 1 cabang, transfer stok antar toko, dan laporan konsolidasi pusat.",
    },
};

export interface AddonGuardProps {
    addon: string;
    children: React.ReactNode;
    fallback?: React.ReactNode;
    title?: string;
    description?: string;
    showLockedCard?: boolean;
}

/**
 * Reusable guard component that restricts access to features requiring specific license add-ons.
 * If user has the addon active, renders children.
 * If not, displays an informative locked card with CTA to activate the add-on.
 */
export function AddonGuard({
    addon,
    children,
    fallback,
    title,
    description,
    showLockedCard = true,
}: AddonGuardProps) {
    const router = useRouter();
    const hasAddon = useHasAddon(addon);

    // If addon is active, render wrapped children normally
    if (hasAddon) {
        return <>{children}</>;
    }

    // Custom fallback provided
    if (fallback) {
        return <>{fallback}</>;
    }

    // If showLockedCard is false, render nothing
    if (!showLockedCard) {
        return null;
    }

    const addonInfo = ADDON_DETAILS[addon] || {
        title: title || `Add-on ${addon}`,
        description: description || "Fitur ini memerlukan add-on tambahan pada paket langganan Anda.",
    };

    const finalTitle = title || addonInfo.title;
    const finalDescription = description || addonInfo.description;

    return (
        <div className="flex items-center justify-center p-4 sm:p-8 min-h-[420px] w-full">
            <Card className="max-w-lg w-full border-dashed border-2 border-slate-200/90 dark:border-slate-800 shadow-sm bg-gradient-to-b from-slate-50/50 to-white dark:from-slate-900/40 dark:to-slate-950">
                <CardContent className="pt-8 pb-8 px-6 text-center flex flex-col items-center">
                    {/* Icon Lock with decorative rings */}
                    <div className="relative mb-5">
                        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                            <Lock className="w-8 h-8" />
                        </div>
                        <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white shadow-xs">
                            <Sparkles className="w-3.5 h-3.5" />
                        </div>
                    </div>

                    <Badge variant="secondary" className="mb-3 px-3 py-1 font-semibold text-xs tracking-wide bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200">
                        Add-on Premium Diperlukan
                    </Badge>

                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">
                        Fitur {finalTitle} Belum Aktif
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-md mb-6">
                        {finalDescription} Aktifkan add-on ini untuk membuka akses penuh ke fitur dan alur kerja terkait.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full sm:w-auto text-xs"
                            onClick={() => router.back()}
                        >
                            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                            Kembali
                        </Button>

                        <Button
                            size="sm"
                            className="w-full sm:w-auto text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs"
                            onClick={() => router.push("/licenses?tab=catalog")}
                        >
                            Aktifkan Add-on Sekarang
                            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
