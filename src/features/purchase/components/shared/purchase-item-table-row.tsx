"use client";

import { AppButton } from "@/components/shared/app-button";
import { FormNumberInput } from "@/components/forms/form-number-input";
import { FormNominalInput } from "@/components/forms/form-nominal-input";
import { NominalInput } from "@/components/ui/nominal-input";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import type { PurchaseItemLocal } from "../../types";

interface PurchaseItemTableRowProps {
    item: PurchaseItemLocal;
    index: number;
    disabled?: boolean;
    isPriceReadOnly?: boolean;
    isFlashing?: boolean;
    allowSubtotalInput?: boolean;
    onUpdateItem: (
        temp_uid: string,
        data: Partial<Pick<PurchaseItemLocal, "kuantitas" | "harga_estimasi">>
    ) => void;
    onRemoveItem: (temp_uid: string) => void;
}

export function PurchaseItemTableRow({
    item,
    index,
    disabled = false,
    isPriceReadOnly = false,
    isFlashing = false,
    allowSubtotalInput = false,
    onUpdateItem,
    onRemoveItem,
}: PurchaseItemTableRowProps) {
    const calculatedSubtotal = Math.round(item.kuantitas * item.harga_estimasi);
    const [subtotalInput, setSubtotalInput] = useState<number | null>(null);
    const [isSubtotalFocused, setIsSubtotalFocused] = useState(false);

    // Value shown while user is typing in subtotal vs computed from qty * unit price
    const currentDisplaySubtotal = isSubtotalFocused ? subtotalInput : calculatedSubtotal;

    const handleSubtotalChange = (val: number | null) => {
        setSubtotalInput(val);
        const total = val ?? 0;

        if (item.kuantitas <= 0) {
            // Default qty to 1 if it was 0/empty and set unit price to total
            onUpdateItem(item.temp_uid, { kuantitas: 1, harga_estimasi: total });
        } else {
            const newUnitPrice = Math.round(total / item.kuantitas);
            onUpdateItem(item.temp_uid, { harga_estimasi: newUnitPrice });
        }
    };

    const handleSubtotalFocus = () => {
        setIsSubtotalFocused(true);
        setSubtotalInput(calculatedSubtotal);
    };

    const handleSubtotalBlur = () => {
        setIsSubtotalFocused(false);
        setSubtotalInput(null);
    };

    return (
        <tr
            id={`purchase-item-row-${item.temp_uid}`}
            className={`transition-all duration-300 hover:bg-slate-50/50 ${isFlashing ? "bg-emerald-50 ring-1 ring-inset ring-emerald-200" : ""
                }`}
        >
            <td className="p-3 text-slate-400 font-mono font-bold">{index + 1}</td>
            <td className="p-3">
                <span className="font-mono text-slate-500 text-[11px]">
                    {item.barcode || "—"}
                </span>
            </td>
            <td className="p-3">
                <span className="font-semibold text-slate-800">{item.nama}</span>
                {isFlashing && (
                    <span className="ml-2 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                        ⚡ Baru
                    </span>
                )}
            </td>
            <td className="p-3">
                <FormNumberInput
                    name={`items.${index}.kuantitas`}
                    onValueChange={(val) => {
                        onUpdateItem(item.temp_uid, { kuantitas: val ?? 0 });
                    }}
                    disabled={disabled}
                    allowDecimal={true}
                    className="w-full h-8 text-center text-xs font-bold text-slate-800 rounded-lg border-slate-200 focus-visible:ring-emerald-400/20 focus-visible:border-emerald-400"
                />
            </td>
            <td className="p-3">
                {isPriceReadOnly ? (
                    <div className="text-right pr-2">
                        <span className="font-mono font-bold text-slate-500 text-xs whitespace-nowrap">
                            {formatRupiah(item.harga_estimasi)}
                        </span>
                    </div>
                ) : (
                    <div className="space-y-0.5">
                        <FormNominalInput
                            name={`items.${index}.harga_estimasi`}
                            onValueChange={(val) => {
                                onUpdateItem(item.temp_uid, { harga_estimasi: val ?? 0 });
                            }}
                            disabled={disabled}
                            placeholder="Rp 0"
                            className="w-full h-8 text-right text-xs font-bold text-slate-800 font-mono rounded-lg border-slate-200 focus-visible:ring-emerald-400/20 focus-visible:border-emerald-400"
                        />
                        {allowSubtotalInput && (
                            <span className="block text-[9px] text-slate-400 text-right font-medium pr-1">
                                per pcs
                            </span>
                        )}
                    </div>
                )}
            </td>
            <td className="p-3">
                {allowSubtotalInput ? (
                    <div className="space-y-0.5">
                        <NominalInput
                            value={currentDisplaySubtotal}
                            onValueChange={handleSubtotalChange}
                            onFocus={handleSubtotalFocus}
                            onBlur={handleSubtotalBlur}
                            disabled={disabled}
                            placeholder="Rp 0"
                            className="w-full h-8 text-right text-xs font-bold text-emerald-700 font-mono rounded-lg border-slate-200 bg-emerald-50/20 focus-visible:ring-emerald-400/20 focus-visible:border-emerald-400 focus:bg-white"
                        />
                        {isSubtotalFocused && item.kuantitas > 1 && (
                            <span className="block text-[9px] text-emerald-600 text-right font-medium pr-1 animate-fade-in">
                                ÷ {item.kuantitas} = {formatRupiah(Math.round((currentDisplaySubtotal || 0) / item.kuantitas))} /pcs
                            </span>
                        )}
                    </div>
                ) : (
                    <div className="text-right font-bold text-slate-900 font-mono pr-2">
                        {formatRupiah(calculatedSubtotal)}
                    </div>
                )}
            </td>
            <td className="p-3">
                <AppButton
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => onRemoveItem(item.temp_uid)}
                    disabled={disabled}
                    className="text-rose-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                    title="Hapus item"
                >
                    <IconTrash size={16} />
                </AppButton>
            </td>
        </tr>
    );
}
