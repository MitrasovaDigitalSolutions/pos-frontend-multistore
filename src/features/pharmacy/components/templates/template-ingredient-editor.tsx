"use client";

import { BarcodeInput } from "@/components/shared/barcode-input";
import { NumberInput } from "@/components/ui/number-input";
import { IconPill, IconTrash } from "@tabler/icons-react";
import { toast } from "sonner";
import type { Product } from "@/features/master/products/types";
import type { TemplateIngredientFormItem } from "../../hooks/use-template-form";

interface TemplateIngredientEditorProps {
    ingredients: TemplateIngredientFormItem[];
    onAddProduct: (product: Product) => void;
    onUpdateQty: (index: number, kuantitas: number) => void;
    onUpdateDosis: (index: number, dosis: string) => void;
    onRemove: (index: number) => void;
}

export function TemplateIngredientEditor({
    ingredients,
    onAddProduct,
    onUpdateQty,
    onUpdateDosis,
    onRemove,
}: TemplateIngredientEditorProps) {
    return (
        <div className="border-t border-slate-200 dark:border-slate-800 pt-3 space-y-2.5">
            <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <IconPill size={14} className="text-emerald-500" />
                    <span>Bahan Obat Penyusun ({ingredients.length})</span>
                </label>
            </div>

            {/* Scanner / Barcode Input */}
            <div className="bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <BarcodeInput
                    onProductFound={onAddProduct}
                    onError={(msg) => toast.error(msg)}
                    placeholder="Scan barcode atau ketik nama obat penyusun... (Enter)"
                    mode="sell"
                    isRawMaterial={false}
                />
            </div>

            {/* Table of selected ingredients */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100/75 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800 sticky top-0">
                        <tr>
                            <th className="px-3 py-2">Nama Obat</th>
                            <th className="px-3 py-2 w-24">Jumlah</th>
                            <th className="px-3 py-2">Dosis / Ket</th>
                            <th className="px-2 py-2 text-center w-10">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {ingredients.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-3 py-6 text-center text-slate-400">
                                    <div className="flex flex-col items-center justify-center gap-1.5">
                                        <IconPill size={20} className="text-slate-300 dark:text-slate-600" />
                                        <span className="text-xs">Belum ada bahan obat yang dipilih. Pindai barcode atau ketik nama obat di atas.</span>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            ingredients.map((item, idx) => (
                                <tr key={item.product_uid} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                                    <td className="px-3 py-2 font-medium text-slate-900 dark:text-slate-100">
                                        {item.nama_produk}
                                    </td>
                                    <td className="px-3 py-2">
                                        <NumberInput
                                            value={item.kuantitas}
                                            onChange={(val) => onUpdateQty(idx, val ?? 1)}
                                            min={0.01}
                                            allowDecimal
                                            className="h-7 text-xs w-20 font-bold"
                                        />
                                    </td>
                                    <td className="px-3 py-2">
                                        <input
                                            type="text"
                                            value={item.dosis || ""}
                                            onChange={(e) => onUpdateDosis(idx, e.target.value)}
                                            placeholder="Misal: 500 mg"
                                            className="h-7 text-xs px-2 w-full rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                                        />
                                    </td>
                                    <td className="px-2 py-2 text-center">
                                        <button
                                            type="button"
                                            onClick={() => onRemove(idx)}
                                            className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors cursor-pointer"
                                        >
                                            <IconTrash size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
