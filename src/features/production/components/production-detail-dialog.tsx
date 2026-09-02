"use client";

import { BaseDialog } from "@/components/ui/base-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { formatToReadableDate } from "@/lib/date-utils";
import { IconAssembly, IconBox, IconNotes, IconPackage, IconUser } from "@tabler/icons-react";
import { useProductionDetail } from "../api/production-api";
import type { ProductionMaterial, ProductionOutput } from "../types";

interface ProductionDetailDialogProps {
    productionUid: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ProductionDetailDialog({
    productionUid,
    open,
    onOpenChange,
}: ProductionDetailDialogProps) {
    const { data: res, isLoading } = useProductionDetail(productionUid);
    const production = res?.data;

    const totalOutputQty = (production?.outputs || []).reduce(
        (sum: number, o: ProductionOutput) => sum + Number(o.kuantitas || 0),
        0
    );

    const totalMaterialQty = (production?.materials || []).reduce(
        (sum: number, m: ProductionMaterial) => sum + Number(m.kuantitas || 0),
        0
    );

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/60 shrink-0">
                        <IconAssembly size={16} />
                    </div>
                    <span className="text-sm sm:text-base font-extrabold text-slate-800">
                        Detail Produksi Harian
                    </span>
                </div>
            }
            className="sm:max-w-4xl"
            scrollable={true}
        >
            {isLoading ? (
                <div className="space-y-3 py-1">
                    <Skeleton className="h-16 w-full rounded-xl" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Skeleton className="h-44 w-full rounded-xl" />
                        <Skeleton className="h-44 w-full rounded-xl" />
                    </div>
                </div>
            ) : !production ? (
                <div className="p-8 text-center text-xs text-slate-400">
                    Data transaksi produksi tidak ditemukan.
                </div>
            ) : (
                <div className="space-y-3 pb-1">
                    {/* Compact Metadata Strip */}
                    <div className="bg-slate-50/90 border border-slate-200/70 rounded-xl p-2.5 sm:p-3 space-y-2">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                            <div>
                                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block leading-none mb-1">
                                    No. Produksi
                                </span>
                                <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm">
                                    {production.nomor_produksi}
                                </span>
                            </div>
                            <div>
                                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block leading-none mb-1">
                                    Tanggal
                                </span>
                                <span className="font-semibold text-slate-700 text-xs">
                                    {formatToReadableDate(production.tanggal)}
                                </span>
                            </div>
                            <div>
                                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block leading-none mb-1">
                                    Operator
                                </span>
                                <div className="flex items-center gap-1 font-semibold text-slate-700 text-xs truncate">
                                    <IconUser size={13} className="text-slate-400 shrink-0" />
                                    <span className="truncate">{production.user?.name || "System"}</span>
                                </div>
                            </div>
                            <div>
                                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block leading-none mb-1">
                                    Status
                                </span>
                                <StatusBadge status={production.status} />
                            </div>
                        </div>

                        {production.catatan && (
                            <div className="pt-2 border-t border-slate-200/60 flex items-start gap-1.5 text-[11px] text-slate-600">
                                <IconNotes size={13} className="text-slate-400 shrink-0 mt-0.5" />
                                <span className="italic leading-snug">{production.catatan}</span>
                            </div>
                        )}
                    </div>

                    {/* Side-by-Side 2-Column Compact Tables */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
                        {/* Column 1: Bahan Baku Terpakai */}
                        <div className="border border-slate-200/80 rounded-xl overflow-hidden shadow-2xs bg-white">
                            <div className="bg-amber-50/70 border-b border-amber-100/80 px-3 py-2 flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <IconBox size={15} className="text-amber-600 shrink-0" />
                                    <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wide truncate">
                                        Bahan Terpakai
                                    </h4>
                                    <span className="text-[10px] text-amber-700/80 font-medium">
                                        ({production.materials?.length || 0})
                                    </span>
                                </div>
                                <span className="text-[11px] font-extrabold text-amber-900 bg-amber-100/80 border border-amber-200 px-2 py-0.5 rounded-md font-mono shrink-0">
                                    {formatRupiah(production.total_biaya_bahan)}
                                </span>
                            </div>

                            <div className="overflow-x-auto max-h-60 overflow-y-auto">
                                <table className="w-full text-left text-[11px] border-collapse">
                                    <thead className="sticky top-0 z-10 bg-slate-100/90 backdrop-blur-xs border-b border-slate-200/80 text-[9px] font-extrabold text-slate-500 uppercase tracking-wider">
                                        <tr>
                                            <th className="py-1.5 px-2.5">Bahan</th>
                                            <th className="py-1.5 px-2 text-right">Qty</th>
                                            <th className="py-1.5 px-2 text-right">Harga</th>
                                            <th className="py-1.5 px-2.5 text-right">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {(production.materials || []).map((m: ProductionMaterial) => (
                                            <tr key={m.uid} className="hover:bg-slate-50/60">
                                                <td className="py-1.5 px-2.5">
                                                    <span className="font-semibold text-slate-800 block truncate max-w-[130px]" title={m.product?.nama}>
                                                        {m.product?.nama || "Item Bahan"}
                                                    </span>
                                                    {m.product?.barcode && (
                                                        <span className="text-[9px] text-slate-400 font-mono block">
                                                            {m.product.barcode}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-1.5 px-2 text-right font-medium text-slate-700 whitespace-nowrap">
                                                    {m.kuantitas}
                                                </td>
                                                <td className="py-1.5 px-2 text-right text-slate-500 font-mono whitespace-nowrap">
                                                    {formatRupiah(m.harga_satuan)}
                                                </td>
                                                <td className="py-1.5 px-2.5 text-right font-bold text-slate-800 font-mono whitespace-nowrap">
                                                    {formatRupiah(m.subtotal)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="border-t border-slate-200 bg-slate-50/80 font-bold text-[10px] text-slate-700">
                                        <tr>
                                            <td className="py-1.5 px-2.5">Total</td>
                                            <td className="py-1.5 px-2 text-right">{totalMaterialQty}</td>
                                            <td className="py-1.5 px-2"></td>
                                            <td className="py-1.5 px-2.5 text-right font-mono text-amber-900 font-extrabold">
                                                {formatRupiah(production.total_biaya_bahan)}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                        {/* Column 2: Hasil Barang Jadi */}
                        <div className="border border-slate-200/80 rounded-xl overflow-hidden shadow-2xs bg-white">
                            <div className="bg-emerald-50/70 border-b border-emerald-100/80 px-3 py-2 flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <IconPackage size={15} className="text-emerald-600 shrink-0" />
                                    <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wide truncate">
                                        Barang Jadi
                                    </h4>
                                    <span className="text-[10px] text-emerald-700/80 font-medium">
                                        ({production.outputs?.length || 0})
                                    </span>
                                </div>
                                <span className="text-[11px] font-extrabold text-emerald-900 bg-emerald-100/80 border border-emerald-200 px-2 py-0.5 rounded-md font-mono shrink-0">
                                    {totalOutputQty} Pcs
                                </span>
                            </div>

                            <div className="overflow-x-auto max-h-60 overflow-y-auto">
                                <table className="w-full text-left text-[11px] border-collapse">
                                    <thead className="sticky top-0 z-10 bg-slate-100/90 backdrop-blur-xs border-b border-slate-200/80 text-[9px] font-extrabold text-slate-500 uppercase tracking-wider">
                                        <tr>
                                            <th className="py-1.5 px-2.5">Produk Jadi</th>
                                            <th className="py-1.5 px-2 text-right">Qty</th>
                                            <th className="py-1.5 px-2 text-right">HPP</th>
                                            <th className="py-1.5 px-2.5 text-right">Total HPP</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {(production.outputs || []).map((o: ProductionOutput) => (
                                            <tr key={o.uid} className="hover:bg-slate-50/60">
                                                <td className="py-1.5 px-2.5">
                                                    <span className="font-semibold text-slate-800 block truncate max-w-[130px]" title={o.product?.nama}>
                                                        {o.product?.nama || "Item Barang Jadi"}
                                                    </span>
                                                    {o.product?.barcode && (
                                                        <span className="text-[9px] text-slate-400 font-mono block">
                                                            {o.product.barcode}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-1.5 px-2 text-right font-bold text-emerald-700 whitespace-nowrap">
                                                    {o.kuantitas}
                                                </td>
                                                <td className="py-1.5 px-2 text-right text-slate-500 font-mono whitespace-nowrap">
                                                    {formatRupiah(o.hpp_satuan)}
                                                </td>
                                                <td className="py-1.5 px-2.5 text-right font-bold text-slate-800 font-mono whitespace-nowrap">
                                                    {formatRupiah(o.subtotal_hpp)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="border-t border-slate-200 bg-slate-50/80 font-bold text-[10px] text-slate-700">
                                        <tr>
                                            <td className="py-1.5 px-2.5">Total</td>
                                            <td className="py-1.5 px-2 text-right font-bold text-emerald-800">{totalOutputQty}</td>
                                            <td className="py-1.5 px-2"></td>
                                            <td className="py-1.5 px-2.5 text-right font-mono text-emerald-900 font-extrabold">
                                                {formatRupiah(
                                                    (production.outputs || []).reduce(
                                                        (s, o) => s + Number(o.subtotal_hpp || 0),
                                                        0
                                                    )
                                                )}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </BaseDialog>
    );
}
