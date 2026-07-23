import { IconDeviceFloppy, IconTrash } from "@tabler/icons-react";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import type { PurchaseItemLocal } from "../../../types";
import { FormProvider, useForm } from "react-hook-form";
import { FormNumberInput } from "@/components/forms/form-number-input";
import { FormSelect } from "@/components/forms/form-select";

interface ReturnItemsTableProps {
    items: PurchaseItemLocal[];
    isPending: boolean;
    updateItem: (temp_uid: string, updates: Partial<PurchaseItemLocal>) => void;
    returnLimitsMap: Record<string, { sisa: number; nama: string; harga: number }>;
    reasons: { value: string; label: string }[];
    activeItems: PurchaseItemLocal[];
    activeTotalValue: number;
}

export function ReturnItemsTable({
    items,
    isPending,
    updateItem,
    returnLimitsMap,
    reasons,
    activeItems,
    activeTotalValue,
}: ReturnItemsTableProps) {
    const methods = useForm({
        values: {
            items: items.map((item) => ({
                kuantitas: item.kuantitas,
                alasan: item.alasan || "damaged",
            })),
        },
    });

    if (items.length === 0) {
        return (
            <div className="border border-dashed border-slate-200 rounded-2xl p-8 text-center m-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-slate-50 rounded-2xl flex items-center justify-center">
                    <IconDeviceFloppy size={28} className="text-slate-300" />
                </div>
                <p className="text-sm font-bold text-slate-500">Tidak ada barang terdaftar</p>
                <p className="text-xs text-slate-400 mt-1">
                    Penerimaan barang referensi tidak memiliki item untuk diretur.
                </p>
            </div>
        );
    }

    return (
        <FormProvider {...methods}>
            <div className="space-y-3">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-sans">
                                <th className="p-3 w-10">No</th>
                                <th className="p-3">Barcode</th>
                                <th className="p-3 min-w-[280px]">Nama Produk</th>
                                <th className="p-3 text-center w-24">Sisa Penerimaan</th>
                                <th className="p-3 text-center w-24">Qty Retur</th>
                                <th className="p-3 text-right w-32">Harga Beli</th>
                                <th className="p-3 text-right w-32">Subtotal</th>
                                <th className="p-3 min-w-40">Alasan Retur</th>
                                <th className="p-3 w-12"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 font-medium">
                            {items.map((item, idx) => {
                                const limit = returnLimitsMap[item.product_uid];
                                const maxReturnable = limit ? limit.sisa : 0;
                                const subtotal = item.kuantitas * item.harga_estimasi;

                                return (
                                    <tr key={`${item.temp_uid || item.product_uid}-${idx}`} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-3 text-slate-400 font-mono font-bold">{idx + 1}</td>
                                        <td className="p-3">
                                            <span className="font-mono text-slate-500 text-[11px]">
                                                {item.barcode || "—"}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <span className="font-semibold text-slate-800">{item.nama}</span>
                                        </td>
                                        <td className="p-3 text-center text-slate-600 font-semibold">{maxReturnable} pcs</td>
                                        <td className="p-3">
                                            <FormNumberInput
                                                name={`items.${idx}.kuantitas`}
                                                min={0}
                                                max={maxReturnable}
                                                onValueChange={(val) => {
                                                    const checkedVal = Math.min(maxReturnable, Math.max(0, val ?? 0));
                                                    updateItem(item.temp_uid, { kuantitas: checkedVal });
                                                }}
                                                disabled={isPending}
                                                className="w-full h-8 text-center text-xs font-bold text-slate-800 rounded-lg border-slate-200 focus-visible:ring-emerald-400/20 focus-visible:border-emerald-400"
                                            />
                                        </td>
                                        <td className="p-3 text-right font-semibold text-slate-700 font-mono">
                                            {formatRupiah(item.harga_estimasi)}
                                        </td>
                                        <td className="p-3 text-right font-bold text-slate-900 font-mono">
                                            {formatRupiah(subtotal)}
                                        </td>
                                        <td className="p-3">
                                            <FormSelect
                                                name={`items.${idx}.alasan`}
                                                options={reasons}
                                                disabled={isPending || item.kuantitas === 0}
                                                onChange={(val) => {
                                                    updateItem(item.temp_uid, { alasan: val });
                                                }}
                                                size="sm"
                                            />
                                        </td>
                                        <td className="p-3">
                                            {item.kuantitas > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => updateItem(item.temp_uid, { kuantitas: 0 })}
                                                    disabled={isPending}
                                                    className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                                    title="Kosongkan item"
                                                >
                                                    <IconTrash size={16} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Table Totals */}
                <div className="bg-slate-50/80 border-t border-slate-100 px-4 py-3 flex justify-between items-center text-xs">
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Total Barang Retur
                        </span>
                        <span className="text-sm font-extrabold text-slate-800">
                            {activeItems.reduce((acc, i) => acc + i.kuantitas, 0)} pcs
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Total Nominal Retur
                        </span>
                        <span className="text-base font-extrabold text-emerald-600 font-mono">
                            {formatRupiah(activeTotalValue)}
                        </span>
                    </div>
                </div>

                {/* Auto-save/Auto-fill indicator */}
                <div className="flex items-center gap-1.5 px-3 py-1 text-slate-400">
                    <IconDeviceFloppy size={12} className="text-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-medium">
                        Data disimpan otomatis ke draft lokal sebelum disubmit.
                    </span>
                </div>
            </div>
        </FormProvider>
    );
}
