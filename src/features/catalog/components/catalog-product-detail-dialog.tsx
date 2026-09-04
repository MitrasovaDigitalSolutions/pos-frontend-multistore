"use client";

import { useState } from "react";
import { BaseDialog } from "@/components/ui/base-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { formatToReadableDateTime } from "@/lib/date-utils";
import { STORE_BADGE_HQ } from "@/constants/store";
import { ProductBarcodeDialog } from "@/components/shared/product-barcode-dialog";
import { cn } from "@/lib/utils";
import {
    IconArchiveOff,
    IconBarcode,
    IconBuildingStore,
    IconCalendar,
    IconPackage,
    IconUser,
} from "@tabler/icons-react";
import Image from "next/image";
import type { CatalogProduct } from "../types";
import type { Product } from "@/features/master/products/types";

interface CatalogProductDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: CatalogProduct | Product | null;
    onUnarchiveClick?: (product: CatalogProduct | Product) => void;
}

export function CatalogProductDetailDialog({
    open,
    onOpenChange,
    product,
    onUnarchiveClick,
}: CatalogProductDetailDialogProps) {
    const [barcodeModalOpen, setBarcodeModalOpen] = useState(false);

    if (!product) return null;

    const isArchived = product.status === "archived";
    const masterPrice = product.harga_jual ?? product.harga;
    const tokoNama = product.created_by_toko?.nama || STORE_BADGE_HQ;
    const userName = product.created_by_user?.name || "Sistem";
    const storeProduct = product.product_stores?.[0];
    const hargaGrosir = product.harga_grosir ?? storeProduct?.harga_grosir;
    const minQtyGrosir = product.min_qty_grosir ?? storeProduct?.min_qty_grosir;
    const isGrosirFlag = product.is_grosir ?? storeProduct?.is_grosir;
    const hasGrosir = Boolean(isGrosirFlag && hargaGrosir && minQtyGrosir);
    const barcodeDisplay = product.barcode || product.archived_barcode || "-";

    return (
        <>
            <BaseDialog
                open={open}
                onOpenChange={onOpenChange}
                title={
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 flex items-center justify-center shrink-0">
                            <IconArchiveOff size={15} />
                        </div>
                        <div>
                            <span className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                                Detail Produk Diarsipkan
                            </span>
                            <p className="text-[10.5px] font-normal text-slate-400 leading-none mt-0.5">
                                Arsip data produk yang telah dinonaktifkan
                            </p>
                        </div>
                    </div>
                }
                headerRight={
                    product.barcode ? (
                        <Button
                            type="button"
                            variant="outline"
                            size="xs"
                            onClick={() => setBarcodeModalOpen(true)}
                            className="h-7 px-2.5 text-xs font-semibold rounded-lg border-emerald-200 bg-emerald-50/70 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 gap-1.5 cursor-pointer shadow-2xs mr-1"
                            title="Lihat & Unduh Barcode Produk"
                        >
                            <IconBarcode size={14} />
                            <span>Barcode</span>
                        </Button>
                    ) : undefined
                }
                className="sm:max-w-lg p-4 sm:p-5 flex flex-col"
                scrollable={false}
            >
                <div className="space-y-3 pt-0.5">
                    {/* ── Status Banner Ringkas ── */}
                    {isArchived && (
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50/90 dark:bg-rose-950/40 border border-rose-200/70 dark:border-rose-900/40 text-xs">
                            <div className="flex items-center gap-2 min-w-0">
                                <div className="w-6 h-6 rounded-lg bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300 flex items-center justify-center shrink-0">
                                    <IconArchiveOff size={13} />
                                </div>
                                <div className="min-w-0">
                                    <span className="font-bold text-rose-800 dark:text-rose-200 text-[11px] block leading-tight truncate">
                                        Produk ini Sedang Diarsipkan (Dihapus)
                                    </span>
                                    {product.archived_at && (
                                        <span className="text-[10px] text-rose-600 dark:text-rose-400 font-mono">
                                            Waktu: {formatToReadableDateTime(product.archived_at)}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <Badge variant="destructive" className="text-[9px] font-bold px-1.5 py-0 h-4.5 uppercase shrink-0">
                                Archived
                            </Badge>
                        </div>
                    )}

                    {/* ── Bento Profile Card (Thumbnail & Identitas) ── */}
                    <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-3 items-start shadow-2xs">
                        {product.image_url ? (
                            <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-50 shadow-2xs">
                                <Image
                                    src={product.image_url}
                                    alt={product.nama}
                                    fill
                                    sizes="56px"
                                    className="object-cover"
                                />
                            </div>
                        ) : (
                            <div className="w-14 h-14 rounded-lg border border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center bg-slate-50 dark:bg-slate-800/80 text-slate-400 shrink-0">
                                <IconPackage size={22} className="opacity-50" />
                            </div>
                        )}

                        <div className="flex-1 min-w-0 space-y-1">
                            {/* Badges Row */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                                {product.is_jasa ? (
                                    <Badge variant="info" className="h-4.5 px-1.5 py-0 text-[9.5px] font-bold">
                                        Jasa
                                    </Badge>
                                ) : product.is_raw_material ? (
                                    <Badge variant="warning" className="h-4.5 px-1.5 py-0 text-[9.5px] font-bold">
                                        Bahan Baku
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary" className="h-4.5 px-1.5 py-0 text-[9.5px] font-bold">
                                        Barang Jadi
                                    </Badge>
                                )}

                                {/* Clickable Barcode Chip */}
                                <Badge
                                    variant="outline"
                                    onClick={() => product.barcode && setBarcodeModalOpen(true)}
                                    className={cn(
                                        "h-4.5 px-1.5 py-0 bg-slate-50 dark:bg-slate-800 border-slate-200 text-slate-700 dark:text-slate-200 font-mono font-bold text-[9.5px] gap-1 shadow-2xs",
                                        product.barcode && "hover:border-emerald-500 hover:text-emerald-700 cursor-pointer transition-colors"
                                    )}
                                    title={product.barcode ? "Klik untuk lihat & unduh barcode" : undefined}
                                >
                                    <IconBarcode size={11} className="text-slate-400" />
                                    <span>{barcodeDisplay}</span>
                                </Badge>
                            </div>

                            {/* Product Name */}
                            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug line-clamp-2">
                                {product.nama}
                            </h3>

                            {/* Category & Brand Breadcrumb */}
                            <p className="text-[10.5px] text-slate-400 leading-none">
                                <span>{product.category?.nama || "Kategori Umum"}</span>
                                {(product.brand?.nama || product.merek) && (
                                    <>
                                        <span className="mx-1">•</span>
                                        <span className="text-slate-600 dark:text-slate-300 font-medium">
                                            {product.brand?.nama || product.merek}
                                        </span>
                                    </>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* ── 4-Column Single-Strip Financial & Stock Matrix ── */}
                    <div className="grid grid-cols-4 gap-1 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 text-center">
                        <div className="space-y-0.5">
                            <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">
                                Harga Beli
                            </span>
                            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 font-mono block truncate">
                                {formatRupiah(product.harga_beli ?? 0)}
                            </span>
                        </div>
                        <div className="space-y-0.5 border-l border-slate-200/80 dark:border-slate-800 pl-1">
                            <span className="text-[9.5px] font-bold text-emerald-600 uppercase tracking-wider block">
                                Harga Jual
                            </span>
                            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 font-mono block truncate">
                                {formatRupiah(masterPrice)}
                            </span>
                        </div>
                        <div className="space-y-0.5 border-l border-slate-200/80 dark:border-slate-800 pl-1">
                            <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">
                                Margin
                            </span>
                            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 block truncate">
                                {product.margin != null ? `${product.margin}%` : "-"}
                            </span>
                        </div>
                        <div className="space-y-0.5 border-l border-slate-200/80 dark:border-slate-800 pl-1">
                            <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">
                                Stok Sisa
                            </span>
                            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 font-mono block truncate">
                                {product.stok ?? 0}
                            </span>
                        </div>
                    </div>

                    {/* Wholesale Notification (If applicable) */}
                    {hasGrosir && (
                        <div className="p-2 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800 flex items-center justify-between text-[11px]">
                            <span className="text-emerald-800 dark:text-emerald-300 font-medium">
                                Harga Grosir (Min. {minQtyGrosir} unit):
                            </span>
                            <span className="font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                                {formatRupiah(Number(hargaGrosir))}
                            </span>
                        </div>
                    )}

                    {/* ── Compact Metadata Summary (Origin & Dates) ── */}
                    <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5 text-xs shadow-2xs">
                        <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">
                            Histori &amp; Informasi Cabang
                        </span>
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                                <IconBuildingStore size={13} className="text-emerald-600 shrink-0" />
                                <span className="truncate">{tokoNama}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                                <IconUser size={13} className="text-slate-400 shrink-0" />
                                <span className="truncate">{userName}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                                <IconCalendar size={13} className="text-slate-400 shrink-0" />
                                <span className="truncate">
                                    Dibuat: {product.created_at ? formatToReadableDateTime(product.created_at) : "-"}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-medium">
                                <IconArchiveOff size={13} className="shrink-0" />
                                <span className="truncate">
                                    {product.archived_at
                                        ? `Dihapus: ${formatToReadableDateTime(product.archived_at)}`
                                        : "Status: Diarsipkan"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ── Footer Actions (Unarchive Button) ── */}
                    {isArchived && onUnarchiveClick && (
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                            <Button
                                type="button"
                                onClick={() => {
                                    onOpenChange(false);
                                    onUnarchiveClick(product);
                                }}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-emerald-600/20"
                            >
                                <IconArchiveOff className="w-4 h-4" />
                                <span>Batalkan Hapus (Aktifkan Kembali Produk)</span>
                            </Button>
                        </div>
                    )}
                </div>
            </BaseDialog>

            {/* Barcode Preview & Download Dialog */}
            {product.barcode && (
                <ProductBarcodeDialog
                    open={barcodeModalOpen}
                    onOpenChange={setBarcodeModalOpen}
                    barcode={product.barcode}
                    productName={product.nama}
                    price={masterPrice}
                    categoryName={product.category?.nama}
                />
            )}
        </>
    );
}
