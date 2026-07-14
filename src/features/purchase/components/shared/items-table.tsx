"use client";

import { formatRupiah } from "@/hooks/use-format-rupiah";
import { IconDeviceFloppy, IconTrash } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { FormNumberInput } from "@/components/forms/form-number-input";
import { FormNominalInput } from "@/components/forms/form-nominal-input";
import type { PurchaseItemLocal } from "../../types";


interface ItemsTableProps {
    items: PurchaseItemLocal[];
    onUpdateItem: (temp_uid: string, data: Partial<Pick<PurchaseItemLocal, "kuantitas" | "harga_estimasi">>) => void;
    onRemoveItem: (temp_uid: string) => void;
    priceLabel?: string;
    disabled?: boolean;
    isPriceReadOnly?: boolean;
}

export function ItemsTable({
    items,
    onUpdateItem,
    onRemoveItem,
    priceLabel = "Harga Estimasi",
    disabled = false,
    isPriceReadOnly = false,
}: ItemsTableProps) {
    const methods = useForm({
        values: {
            items: items.map((item) => ({
                kuantitas: item.kuantitas,
                harga_estimasi: item.harga_estimasi,
            })),
        },
    });

    const [flashId, setFlashId] = useState<string | null>(null);
    const prevLengthRef = useRef(items.length);
    const tableEndRef = useRef<HTMLDivElement>(null);

    // Flash animation when a new item is added
    useEffect(() => {
        if (items.length > prevLengthRef.current) {
            const lastItem = items[items.length - 1];
            if (lastItem) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setFlashId(lastItem.temp_uid);
                setTimeout(() => setFlashId(null), 800);
                // Scroll to bottom
                tableEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }
        }
        prevLengthRef.current = items.length;
    }, [items.length, items]);

    const totalItems = items.reduce((acc, item) => acc + item.kuantitas, 0);
    const totalValue = items.reduce((acc, item) => acc + item.kuantitas * item.harga_estimasi, 0);

    if (items.length === 0) {
        return (
            <div className="border border-dashed border-slate-200 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-slate-50 rounded-2xl flex items-center justify-center">
                    <IconDeviceFloppy size={28} className="text-slate-300" />
                </div>
                <p className="text-sm font-bold text-slate-500">Belum ada barang</p>
                <p className="text-xs text-slate-400 mt-1">
                    Scan barcode atau ketik nama produk untuk menambahkan barang.
                </p>
            </div>
        );
    }

    return (
        <FormProvider {...methods}>
            <div className="space-y-3">
                {/* Table */}
                <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                <th className="p-3 w-10">No</th>
                                <th className="p-3">Barcode</th>
                                <th className="p-3">Nama Produk</th>
                                <th className="p-3 text-center w-24">Qty</th>
                                <th className="p-3 text-right w-36">{priceLabel}</th>
                                <th className="p-3 text-right w-32">Subtotal</th>
                                <th className="p-3 w-12"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {items.map((item, idx) => {
                                const subtotal = item.kuantitas * item.harga_estimasi;
                                const isFlashing = flashId === item.temp_uid;

                                return (
                                    <tr
                                        key={item.temp_uid}
                                        className={`
                                        transition-all duration-500 hover:bg-slate-50/50
                                        ${isFlashing
                                                ? "bg-emerald-50 ring-1 ring-inset ring-emerald-200 animate-[pulse_0.6s_ease-in-out]"
                                                : ""
                                            }
                                    `}
                                    >
                                        <td className="p-3 text-slate-400 font-mono font-bold">
                                            {idx + 1}
                                        </td>
                                        <td className="p-3">
                                            <span className="font-mono text-slate-500 text-[11px]">
                                                {item.barcode || "—"}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <span className="font-semibold text-slate-800">
                                                {item.nama}
                                            </span>
                                            {isFlashing && (
                                                <span className="ml-2 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                                                    ⚡ baru
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-3">
                                            <FormNumberInput
                                                name={`items.${idx}.kuantitas`}
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
                                                <FormNominalInput
                                                    name={`items.${idx}.harga_estimasi`}
                                                    onValueChange={(val) => {
                                                        onUpdateItem(item.temp_uid, { harga_estimasi: val ?? 0 });
                                                    }}
                                                    disabled={disabled}
                                                    className="w-full h-8 text-right text-xs font-bold text-slate-800 font-mono rounded-lg border-slate-200 focus-visible:ring-emerald-400/20 focus-visible:border-emerald-400"
                                                />
                                            )}
                                        </td>
                                        <td className="p-3 text-right font-bold text-slate-900 font-mono">
                                            {formatRupiah(subtotal)}
                                        </td>
                                        <td className="p-3">
                                            <button
                                                type="button"
                                                onClick={() => onRemoveItem(item.temp_uid)}
                                                disabled={disabled}
                                                className="
                                                p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50
                                                rounded-lg transition-colors cursor-pointer
                                                disabled:opacity-40 disabled:cursor-not-allowed
                                            "
                                                title="Hapus item"
                                            >
                                                <IconTrash size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {/* Footer totals */}
                    <div className="bg-slate-50/80 border-t border-slate-100 px-4 py-3 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Total Items
                            </span>
                            <span className="text-sm font-extrabold text-slate-800">
                                {totalItems} pcs
                            </span>
                            <span className="text-slate-200">|</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                {items.length} produk
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Total Nilai
                            </span>
                            <span className="text-base font-extrabold text-emerald-600 font-mono">
                                {formatRupiah(totalValue)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Auto-save indicator */}
                <div className="flex items-center gap-1.5 px-1">
                    <IconDeviceFloppy size={12} className="text-emerald-500" />
                    <span className="text-[10px] text-slate-400 font-medium">
                        Data tersimpan otomatis di lokal komputer anda
                    </span>
                </div>

                <div ref={tableEndRef} />
            </div>
        </FormProvider>
    );
}
