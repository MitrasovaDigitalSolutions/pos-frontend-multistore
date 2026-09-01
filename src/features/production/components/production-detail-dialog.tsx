"use client";

import { BaseDialog } from "@/components/ui/base-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { formatToReadableDate } from "@/lib/date-utils";
import { IconAssembly, IconBox, IconPackage, IconUser } from "@tabler/icons-react";
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

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={
                <div className="flex items-center gap-2">
                    <IconAssembly size={20} className="text-emerald-600" />
                    <span>Detail Produksi Harian</span>
                </div>
            }
            className="sm:max-w-3xl"
            scrollable={true}
        >
            {isLoading ? (
                <div className="space-y-4 py-2">
                    <Skeleton className="h-20 w-full rounded-2xl" />
                    <Skeleton className="h-40 w-full rounded-2xl" />
                    <Skeleton className="h-40 w-full rounded-2xl" />
                </div>
            ) : !production ? (
                <div className="p-8 text-center text-slate-400">
                    Data transaksi produksi tidak ditemukan.
                </div>
            ) : (
                <div className="space-y-6 pb-2">
                    {/* Header Details Card */}
                    <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                No. Produksi
                            </span>
                            <span className="font-mono font-bold text-slate-800 text-sm">
                                {production.nomor_produksi}
                            </span>
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                Tanggal
                            </span>
                            <span className="font-semibold text-slate-700">
                                {formatToReadableDate(production.tanggal)}
                            </span>
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                Operator
                            </span>
                            <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                                <IconUser size={14} className="text-slate-400" />
                                <span>{production.user?.name || "System"}</span>
                            </div>
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                Status
                            </span>
                            <StatusBadge status={production.status} />
                        </div>
                        {production.catatan && (
                            <div className="col-span-2 sm:col-span-4 pt-2 border-t border-slate-200/60">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                                    Catatan Produksi
                                </span>
                                <p className="text-slate-600 italic">{production.catatan}</p>
                            </div>
                        )}
                    </div>

                    {/* Section 1: Bahan Baku Terpakai */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                                <IconBox size={16} className="text-amber-500" />
                                Bahan Baku Terpakai
                            </h4>
                            <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-full">
                                Total: {formatRupiah(production.total_biaya_bahan)}
                            </span>
                        </div>

                        <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200/80 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                            <th className="py-2.5 px-3.5">Nama Bahan</th>
                                            <th className="py-2.5 px-3 text-right">Kuantitas</th>
                                            <th className="py-2.5 px-3 text-right">Harga Satuan</th>
                                            <th className="py-2.5 px-3.5 text-right">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {(production.materials || []).map((m: ProductionMaterial) => (
                                            <tr key={m.uid} className="hover:bg-slate-50/50">
                                                <td className="py-2.5 px-3.5">
                                                    <span className="font-semibold text-slate-800 block">
                                                        {m.product?.nama || "Item Bahan"}
                                                    </span>
                                                    {m.product?.barcode && (
                                                        <span className="text-[10px] text-slate-400 font-mono">
                                                            {m.product.barcode}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-2.5 px-3 text-right font-medium text-slate-700">
                                                    {m.kuantitas}
                                                </td>
                                                <td className="py-2.5 px-3 text-right text-slate-600">
                                                    {formatRupiah(m.harga_satuan)}
                                                </td>
                                                <td className="py-2.5 px-3.5 text-right font-bold text-slate-800">
                                                    {formatRupiah(m.subtotal)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Hasil Barang Jadi */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                                <IconPackage size={16} className="text-emerald-500" />
                                Hasil Barang Jadi
                            </h4>
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
                                {production.outputs?.reduce((s: number, o: ProductionOutput) => s + Number(o.kuantitas), 0)} Pcs
                            </span>
                        </div>

                        <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200/80 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                            <th className="py-2.5 px-3.5">Nama Barang Jadi</th>
                                            <th className="py-2.5 px-3 text-right">Qty Jadi</th>
                                            <th className="py-2.5 px-3 text-right">HPP Satuan</th>
                                            <th className="py-2.5 px-3.5 text-right">Total Alokasi HPP</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {(production.outputs || []).map((o: ProductionOutput) => (
                                            <tr key={o.uid} className="hover:bg-slate-50/50">
                                                <td className="py-2.5 px-3.5">
                                                    <span className="font-semibold text-slate-800 block">
                                                        {o.product?.nama || "Item Barang Jadi"}
                                                    </span>
                                                    {o.product?.barcode && (
                                                        <span className="text-[10px] text-slate-400 font-mono">
                                                            {o.product.barcode}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-2.5 px-3 text-right font-bold text-slate-800">
                                                    {o.kuantitas}
                                                </td>
                                                <td className="py-2.5 px-3 text-right font-semibold text-emerald-700">
                                                    {formatRupiah(o.hpp_satuan)}
                                                </td>
                                                <td className="py-2.5 px-3.5 text-right font-bold text-slate-800">
                                                    {formatRupiah(o.subtotal_hpp)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => onOpenChange(false)}
                            className="text-xs h-9 rounded-xl font-bold px-5 cursor-pointer"
                        >
                            Tutup
                        </Button>
                    </div>
                </div>
            )}
        </BaseDialog>
    );
}
