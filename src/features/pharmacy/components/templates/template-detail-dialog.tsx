"use client";

import { BaseDialog } from "@/components/ui/base-dialog";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { IconClipboardList, IconPill } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import type { PrescriptionTemplate } from "../../types";

interface TemplateDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    template: PrescriptionTemplate | null;
    onUse?: (template: PrescriptionTemplate) => void;
}

export function TemplateDetailDialog({
    open,
    onOpenChange,
    template,
    onUse,
}: TemplateDetailDialogProps) {
    if (!template) return null;

    const ingredients = template.ingredients || [];

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            className="sm:max-w-2xl"
            title={
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <IconClipboardList size={18} />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                            Detail Template Racikan
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Komposisi bahan dan ketentuan standar racikan
                        </p>
                    </div>
                </div>
            }
        >
            <div className="space-y-4 pt-2">
                {/* Header Information Card */}
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 dark:border-slate-800 pb-2.5">
                        <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                Nama Racikan Master
                            </span>
                            <div className="text-base font-bold text-slate-900 dark:text-slate-100">
                                {template.nama_racikan}
                            </div>
                        </div>
                        <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 font-mono">
                            {template.jenis_racikan || "Puyer"}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                                Aturan Pakai (Signa)
                            </span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {template.aturan_pakai || "—"}
                            </span>
                        </div>
                        <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                                Biaya Tuslah
                            </span>
                            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                                {formatRupiah(template.tuslah_fee || 0)}
                            </span>
                        </div>
                        <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                                Biaya Embalase
                            </span>
                            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                                {formatRupiah(template.embalase_fee || 0)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Ingredients List */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                            <IconPill size={14} className="text-emerald-500" />
                            <span>Bahan Penyusun ({ingredients.length})</span>
                        </h3>
                    </div>

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

                {/* Footer Action when used in Checkout */}
                {onUse && (
                    <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
                        <Button
                            type="button"
                            onClick={() => {
                                onUse(template);
                                onOpenChange(false);
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm shadow-emerald-600/20"
                        >
                            <IconPill size={15} />
                            <span>Gunakan Formula Ini di Kasir</span>
                        </Button>
                    </div>
                )}
            </div>
        </BaseDialog>
    );
}
