"use client";

import { BaseDialog } from "@/components/ui/base-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { formatToReadableDateTime } from "@/lib/date-utils";
import { STORE_BADGE_HQ } from "@/constants/store";
import { Scrollable } from "@/components/ui/scrollable";
import {
    IconArchiveOff,
    IconBarcode,
    IconBox,
    IconBuildingStore,
    IconCalendar,
    IconCategory,
    IconCoins,
    IconInfoCircle,
    IconPackage,
    IconTag,
    IconTools,
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
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={
                <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400">
                        <IconInfoCircle className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                            Detail Produk Master
                        </span>
                        <p className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                            Informasi spesifikasi lengkap dan harga master katalog
                        </p>
                    </div>
                </div>
            }
            className="sm:max-w-2xl flex flex-col max-h-[90dvh]"
        >
            <Scrollable className="space-y-4 max-h-[calc(90dvh-180px)] pr-1">
                {/* ── Status Banner for Archived Products ── */}
                {isArchived && (
                    <div className="p-3.5 rounded-2xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/40 flex items-start gap-3">
                        <div className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5">
                            <IconArchiveOff className="w-4 h-4" />
                        </div>
                        <div className="space-y-1 flex-1 text-xs">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-rose-800 dark:text-rose-300">
                                    Produk ini Sedang Diarsipkan (Dihapus)
                                </span>
                                <span className="badge text-[9px] font-extrabold px-2 py-0.5 rounded-md bg-rose-200 text-rose-800 dark:bg-rose-900 dark:text-rose-200 uppercase">
                                    Archived
                                </span>
                            </div>
                            <p className="text-[11px] text-rose-700/90 dark:text-rose-400 leading-relaxed">
                                Produk ini tidak dapat dijual atau didistribusikan ke toko cabang. Anda dapat mengaktifkannya kembali dengan menekan tombol &ldquo;Batalkan Hapus&rdquo;.
                            </p>
                            {product.archived_at && (
                                <p className="text-[10px] text-rose-600 dark:text-rose-400 font-mono pt-0.5">
                                    Waktu Diarsipkan: {formatToReadableDateTime(product.archived_at)}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Product Header Block ── */}
                <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col sm:flex-row gap-4 items-start">
                    {product.image_url ? (
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-white shadow-2xs">
                            <Image
                                src={product.image_url}
                                alt={product.nama}
                                fill
                                sizes="80px"
                                className="object-cover"
                            />
                        </div>
                    ) : (
                        <div className="w-20 h-20 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center bg-white dark:bg-slate-800/80 text-slate-400 shrink-0 shadow-2xs">
                            <IconPackage size={32} className="opacity-50" />
                        </div>
                    )}

                    <div className="flex-1 min-w-0 space-y-2">
                        {/* Baris 1: Status Badge + Tipe Produk + Barcode + Stok (Presisi & Pas di Tengah) */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <StatusBadge status={product.status} className="h-5 px-2.5 py-0 text-[10px] font-bold leading-none inline-flex items-center justify-center" />

                            {product.is_jasa && (
                                <Badge variant="info" className="h-5 px-2.5 py-0 text-[10px] font-bold gap-1 leading-none inline-flex items-center justify-center">
                                    <IconTools size={12} />
                                    <span className="translate-y-px">Jasa</span>
                                </Badge>
                            )}
                            {product.is_raw_material && (
                                <Badge variant="warning" className="h-5 px-2.5 py-0 text-[10px] font-bold gap-1 leading-none inline-flex items-center justify-center">
                                    <IconBox size={12} />
                                    <span className="translate-y-px">Bahan Baku</span>
                                </Badge>
                            )}
                            {!product.is_jasa && !product.is_raw_material && (
                                <Badge variant="secondary" className="h-5 px-2.5 py-0 text-[10px] font-bold gap-1 leading-none inline-flex items-center justify-center">
                                    <IconPackage size={12} />
                                    <span className="translate-y-px">Barang Jadi</span>
                                </Badge>
                            )}

                            {/* Barcode / SKU badge */}
                            <Badge
                                variant="outline"
                                className="h-5 px-2.5 py-0 bg-white dark:bg-slate-800 border-slate-200/90 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-mono font-bold text-[10px] gap-1.5 shadow-2xs leading-none inline-flex items-center justify-center"
                            >
                                <IconBarcode size={12} className="text-slate-400 shrink-0" />
                                <span className="translate-y-px">{barcodeDisplay}</span>
                            </Badge>

                            {/* Stok badge */}
                            <Badge
                                variant="secondary"
                                className="h-5 px-2.5 py-0 text-[10px] font-bold gap-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 leading-none inline-flex items-center justify-center"
                            >
                                <span className="translate-y-px">Stok:</span>
                                <span className="font-mono text-emerald-700 dark:text-emerald-400 font-extrabold translate-y-px">{product.stok ?? 0}</span>
                            </Badge>
                        </div>

                        {/* Baris 2: Nama Produk */}
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
                            {product.nama}
                        </h3>

                        {/* Baris 3 & 4: Kategori dan Brand (2 Baris) */}
                        <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400 pt-0.5">
                            <div className="flex items-center gap-1.5 font-medium">
                                <IconCategory size={14} className="text-slate-400 shrink-0" />
                                <span className="text-slate-400">Kategori:</span>
                                <strong className="text-slate-700 dark:text-slate-200 font-semibold">
                                    {product.category?.nama || "-"}
                                </strong>
                            </div>
                            <div className="flex items-center gap-1.5 font-medium flex-wrap">
                                <IconTag size={14} className="text-slate-400 shrink-0" />
                                <span className="text-slate-400">Brand:</span>
                                <strong className="text-slate-700 dark:text-slate-200 font-semibold">
                                    {product.brand?.nama || product.merek || "-"}
                                </strong>
                                {product.archived_barcode && product.archived_barcode !== product.barcode && (
                                    <span className="text-[10px] text-slate-400 font-mono ml-2">
                                        (Barcode Arsip: {product.archived_barcode})
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Asal & Waktu Info Cards ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Asal &amp; Pembuat
                        </span>
                        <div className="space-y-1.5 text-xs">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500 flex items-center gap-1.5">
                                    <IconBuildingStore size={14} className="text-emerald-600" /> Toko Asal
                                </span>
                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                    {tokoNama}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500 flex items-center gap-1.5">
                                    <IconUser size={14} className="text-slate-400" /> Pembuat
                                </span>
                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                    {userName}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Waktu &amp; Tanggal
                        </span>
                        <div className="space-y-1.5 text-xs">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500 flex items-center gap-1.5">
                                    <IconCalendar size={14} className="text-slate-400" /> Dibuat Pada
                                </span>
                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                    {product.created_at ? formatToReadableDateTime(product.created_at) : "-"}
                                </span>
                            </div>
                            {isArchived && product.archived_at ? (
                                <div className="flex items-center justify-between">
                                    <span className="text-rose-500 flex items-center gap-1.5">
                                        <IconArchiveOff size={14} className="text-rose-400" /> Diarsipkan
                                    </span>
                                    <span className="font-semibold text-rose-700 dark:text-rose-300">
                                        {formatToReadableDateTime(product.archived_at)}
                                    </span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500 flex items-center gap-1.5">
                                        <IconCalendar size={14} className="text-slate-400" /> Diperbarui
                                    </span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                                        {product.updated_at ? formatToReadableDateTime(product.updated_at) : "-"}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Pricing & Margins Card ── */}
                <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <IconCoins size={14} className="text-amber-500" /> Penetapan Harga &amp; Margin Master
                    </span>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
                            <span className="text-[10px] text-slate-400 block mb-0.5">Harga Beli</span>
                            <span className="font-bold text-xs text-slate-700 dark:text-slate-300">
                                {formatRupiah(product.harga_beli ?? 0)}
                            </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mb-0.5">Harga Jual</span>
                            <span className="font-extrabold text-xs text-emerald-700 dark:text-emerald-300">
                                {formatRupiah(masterPrice)}
                            </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
                            <span className="text-[10px] text-slate-400 block mb-0.5">Margin</span>
                            <span className="font-bold text-xs text-slate-700 dark:text-slate-300">
                                {product.margin != null ? `${product.margin}%` : "-"}
                            </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
                            <span className="text-[10px] text-slate-400 block mb-0.5">Stok Master</span>
                            <span className="font-bold text-xs text-slate-700 dark:text-slate-300">
                                {product.stok ?? 0}
                            </span>
                        </div>
                    </div>

                    {hasGrosir && (
                        <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/60 flex items-center justify-between text-xs">
                            <span className="text-emerald-800 font-semibold flex items-center gap-1.5">
                                <IconInfoCircle size={14} className="text-emerald-600" /> Harga Grosir Tersedia
                            </span>
                            <span className="font-bold text-emerald-700 font-mono">
                                {formatRupiah(Number(hargaGrosir))} <span className="font-normal text-slate-500 text-[10px]">(Min. {minQtyGrosir} unit)</span>
                            </span>
                        </div>
                    )}
                </div>

                {/* ── Assigned Store Distribution (If present) ── */}
                {product.product_stores && product.product_stores.length > 0 && (
                    <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <IconBuildingStore size={14} className="text-brand-600" /> Distribusi Toko ({product.product_stores.length} Toko)
                        </span>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                            {product.product_stores.map((ps) => (
                                <div key={ps.store_uid} className="py-2 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono text-[11px]">
                                            Store UID: {ps.store_uid.substring(0, 12)}...
                                        </span>
                                        <span className="text-[10px] text-slate-400">
                                            Stok: {ps.stok} | Status: {ps.status}
                                        </span>
                                    </div>
                                    <span className="font-bold text-slate-700 dark:text-slate-300">
                                        {formatRupiah(ps.harga_jual ?? masterPrice)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Scrollable>

            {/* ── Footer Actions ── */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800 mt-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    className="text-xs h-9 rounded-xl font-semibold cursor-pointer"
                >
                    Tutup
                </Button>

                {isArchived && onUnarchiveClick && (
                    <Button
                        type="button"
                        onClick={() => {
                            onOpenChange(false);
                            onUnarchiveClick(product);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                        <IconArchiveOff className="w-4 h-4" />
                        Batalkan Hapus (Unarchive)
                    </Button>
                )}
            </div>
        </BaseDialog>
    );
}
