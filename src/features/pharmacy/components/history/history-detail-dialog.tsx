"use client";

import { BaseDialog } from "@/components/ui/base-dialog";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { formatToReadableDateTime } from "@/lib/date-utils";
import { IconHistory, IconPill, IconReceipt } from "@tabler/icons-react";
import type { PrescriptionHistory } from "../../types";

interface HistoryDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    history: PrescriptionHistory | null;
}

export function HistoryDetailDialog({
    open,
    onOpenChange,
    history,
}: HistoryDetailDialogProps) {
    if (!history) return null;

    const ingredients = history.ingredients || [];
    const totalFees = Number(history.tuslah_fee || 0) + Number(history.embalase_fee || 0);

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            className="sm:max-w-2xl"
            title={
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <IconHistory size={18} />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                            Detail Riwayat Racikan Terjual
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Rincian komposisi bahan dan pemotongan stok transaksi kasir
                        </p>
                    </div>
                </div>
            }
        >
            <div className="space-y-4 pt-2">
                {/* Information Card */}
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 dark:border-slate-800 pb-2.5">
                        <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                Nama Racikan Obat
                            </span>
                            <div className="text-base font-bold text-slate-900 dark:text-slate-100">
                                {history.nama_racikan}
                            </div>
                        </div>
                        <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 font-mono">
                            {history.jenis_racikan || "puyer"}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                                No. Transaksi
                            </span>
                            <span className="font-mono font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                                <IconReceipt size={12} className="text-slate-400" />
                                {history.sale?.nomor_transaksi || history.sale?.invoice_number || "—"}
                            </span>
                        </div>
                        <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                                Tanggal Checkout
                            </span>
                            <span className="text-slate-700 dark:text-slate-300">
                                {history.created_at ? formatToReadableDateTime(history.created_at) : "—"}
                            </span>
                        </div>
                        <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                                Kasir
                            </span>
                            <span className="text-slate-700 dark:text-slate-300">
                                {history.sale?.user?.name || "Kasir"}
                            </span>
                        </div>
                        <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                                Jumlah Kemasan
                            </span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                                {history.jumlah_kemasan || 1} kemasan
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2 border-t border-slate-200/50 dark:border-slate-800">
                        <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                                Aturan Pakai (Signa)
                            </span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {history.aturan_pakai || "—"}
                            </span>
                        </div>
                        <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                                Tuslah & Embalase
                            </span>
                            <span className="font-mono text-slate-700 dark:text-slate-300">
                                {formatRupiah(totalFees)}
                            </span>
                        </div>
                        <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                                Total Harga
                            </span>
                            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                {formatRupiah(history.total_harga || 0)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Ingredients List */}
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5 mb-2">
                        <IconPill size={14} className="text-emerald-500" />
                        <span>Komposisi Bahan Terjual ({ingredients.length})</span>
                    </h3>

                    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-slate-100/75 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                                    <tr>
                                        <th className="px-3 py-2">No</th>
                                        <th className="px-3 py-2">Nama Bahan / Obat</th>
                                        <th className="px-3 py-2 text-right">Kuantitas</th>
                                        <th className="px-3 py-2">Dosis / Keterangan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {ingredients.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-3 py-4 text-center text-slate-400">
                                                Tidak ada data bahan penyusun
                                            </td>
                                        </tr>
                                    ) : (
                                        ingredients.map((ing, idx) => (
                                            <tr key={ing.uid || `${ing.product_uid}-${idx}`} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                                                <td className="px-3 py-2 font-mono text-slate-400">{idx + 1}</td>
                                                <td className="px-3 py-2 font-medium text-slate-900 dark:text-slate-100">
                                                    {ing.nama_produk || ing.product?.nama || "Unknown"}
                                                </td>
                                                <td className="px-3 py-2 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                                                    {ing.kuantitas} {ing.product?.satuan || "satuan"}
                                                </td>
                                                <td className="px-3 py-2 text-slate-600 dark:text-slate-400">
                                                    {ing.dosis || "—"}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </BaseDialog>
    );
}
