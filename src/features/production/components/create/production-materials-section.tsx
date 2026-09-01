"use client";

import { useEffect, useRef } from "react";
import { useFormContext, type FieldPath } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormNumberInput } from "@/components/forms/form-number-input";
import { BarcodeInput } from "@/components/shared/barcode-input";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import type { Product } from "@/features/master/products/types";
import {
    IconAlertTriangle,
    IconBox,
    IconMinus,
    IconPlus,
    IconScan,
    IconTrash,
} from "@tabler/icons-react";
import type {
    ProductionCreateInput,
    ProductionMaterialInput,
} from "../../schemas/production-schema";

interface ProductionMaterialsSectionProps {
    productsMap: Record<string, Product>;
    fields: { id: string }[];
    watchedMaterials: ProductionMaterialInput[];
    onProductFound: (product: Product) => void;
    onRemoveItem: (index: number) => void;
    disabled?: boolean;
    totalBiayaBahan: number;
    lastScannedUid: string | null;
    onClearScannedUid: () => void;
}

export function ProductionMaterialsSection({
    productsMap,
    fields,
    watchedMaterials,
    onProductFound,
    onRemoveItem,
    disabled = false,
    totalBiayaBahan,
    lastScannedUid,
    onClearScannedUid,
}: ProductionMaterialsSectionProps) {
    const { setValue } = useFormContext<ProductionCreateInput>();
    const barcodeInputRef = useRef<HTMLInputElement>(null);
    const qtyInputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

    // Auto-focus quantity input after scanning
    useEffect(() => {
        if (lastScannedUid) {
            const timer = setTimeout(() => {
                const inputEl = qtyInputRefs.current.get(lastScannedUid);
                if (inputEl) {
                    inputEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
                    inputEl.focus({ preventScroll: true });
                    inputEl.select();
                }
                onClearScannedUid();
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [lastScannedUid, onClearScannedUid]);

    return (
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs flex flex-col justify-between h-full">
            <div>
                {/* Header */}
                <div className="p-3 px-3.5 bg-amber-50/70 border-b border-amber-200/50 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center">
                            <IconBox size={13} />
                        </div>
                        <span className="text-xs font-bold text-slate-900">
                            Bahan Baku Terpakai
                        </span>
                    </div>
                    {fields.length > 0 && (
                        <Badge variant="outline" className="bg-amber-100/70 text-amber-800 border-amber-200 text-[10px] px-2 py-0 font-bold">
                            {fields.length} Bahan
                        </Badge>
                    )}
                </div>

                <div className="p-3 space-y-2.5">
                    {/* Compact Barcode Scanner Box */}
                    <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase">
                            <span className="flex items-center gap-1">
                                <IconScan size={12} className="text-amber-600" /> Scan / Cari Bahan Baku
                            </span>
                            <span className="text-slate-400 font-normal">Tekan Enter utk tambah</span>
                        </div>
                        <BarcodeInput
                            ref={barcodeInputRef}
                            refocusOnFound={false}
                            isRawMaterial={true}
                            onProductFound={onProductFound}
                            placeholder="Scan barcode SKU / cari nama bahan baku..."
                            disabled={disabled}
                        />
                    </div>

                    {/* Empty State */}
                    {fields.length === 0 ? (
                        <div className="py-6 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/40 space-y-1">
                            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 mx-auto flex items-center justify-center">
                                <IconScan size={16} />
                            </div>
                            <p className="text-xs font-bold text-slate-700">Belum ada bahan baku</p>
                            <p className="text-[10px] text-slate-400 max-w-xs mx-auto">
                                Scan barcode bahan baku untuk memasukkan ke resep produksi.
                            </p>
                        </div>
                    ) : (
                        /* ── 2-Tier Structured Bento Row List (Matches Outputs Section) ── */
                        <div className="space-y-2.5">
                            {fields.map((field, idx) => {
                                const item = watchedMaterials[idx];
                                const productUid = item?.product_uid;
                                const prod = productsMap[productUid];
                                const stokTersedia = prod?.stok ?? 0;
                                const qty = Number(item?.kuantitas) || 0;
                                const hargaSatuan = Number(item?.harga_satuan) || 0;
                                const subtotal = qty * hargaSatuan;
                                const isStokKurang = qty > stokTersedia;

                                return (
                                    <div
                                        key={field.id}
                                        className="p-3 bg-white hover:bg-amber-50/20 border border-slate-200/90 rounded-2xl space-y-2.5 shadow-2xs transition-colors"
                                    >
                                        {/* ── Baris 1: Header Nama Bahan, Stok & Subtotal ── */}
                                        <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[10px] font-bold text-slate-400 font-mono">#{idx + 1}</span>
                                                    <h4 className="text-xs font-bold text-slate-900 truncate">
                                                        {prod?.nama || "Produk Bahan"}
                                                    </h4>
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                                                    <span className="font-mono">{prod?.barcode || "-"}</span>
                                                    <span>•</span>
                                                    <span
                                                        className={`font-semibold ${
                                                            isStokKurang
                                                                ? "text-rose-600 bg-rose-50 px-1 py-0.5 rounded"
                                                                : "text-slate-500"
                                                        }`}
                                                    >
                                                        Stok: {stokTersedia} unit
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                <div className="text-right">
                                                    <span className="text-[9px] text-slate-400 block font-medium">Subtotal Biaya:</span>
                                                    <span className="font-extrabold text-slate-900 font-mono text-xs">
                                                        {formatRupiah(subtotal)}
                                                    </span>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onRemoveItem(idx)}
                                                    disabled={disabled}
                                                    className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                                                    title="Hapus Bahan Baku"
                                                >
                                                    <IconTrash size={13} />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* ── Baris 2: Input Kuantitas Pakai & Harga Modal Satuan ── */}
                                        <div className="grid grid-cols-12 gap-2.5 items-center">
                                            {/* Qty Pakai */}
                                            <div className="col-span-7 sm:col-span-6">
                                                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                                                    Qty Pakai *
                                                </label>
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            const newQty = Math.max(1, qty - 1);
                                                            setValue(`materials.${idx}.kuantitas`, newQty, {
                                                                shouldValidate: true,
                                                                shouldDirty: true,
                                                            });
                                                        }}
                                                        disabled={disabled || qty <= 1}
                                                        className="h-7.5 w-7.5 p-0 rounded-lg border-slate-200"
                                                    >
                                                        <IconMinus size={12} />
                                                    </Button>
                                                    <FormNumberInput<ProductionCreateInput>
                                                        name={`materials.${idx}.kuantitas` as FieldPath<ProductionCreateInput>}
                                                        placeholder="1"
                                                        disabled={disabled}
                                                        allowDecimal={true}
                                                        inputRef={(el) => {
                                                            if (el && productUid) {
                                                                qtyInputRefs.current.set(productUid, el);
                                                            }
                                                        }}
                                                        className={`h-7.5 text-xs font-bold text-center flex-1 ${
                                                            isStokKurang ? "border-rose-400 text-rose-600 ring-rose-200" : ""
                                                        }`}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setValue(`materials.${idx}.kuantitas`, qty + 1, {
                                                                shouldValidate: true,
                                                                shouldDirty: true,
                                                            });
                                                        }}
                                                        disabled={disabled}
                                                        className="h-7.5 w-7.5 p-0 rounded-lg border-slate-200"
                                                    >
                                                        <IconPlus size={12} />
                                                    </Button>
                                                </div>
                                                {isStokKurang && (
                                                    <span className="text-[9px] text-rose-500 font-semibold flex items-center gap-1 mt-1">
                                                        <IconAlertTriangle size={10} /> Stok tidak mencukupi (Sisa: {stokTersedia})
                                                    </span>
                                                )}
                                            </div>

                                            {/* Harga Modal Satuan (Statis / Kunci) */}
                                            <div className="col-span-5 sm:col-span-6">
                                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                                    Harga Modal Satuan
                                                </label>
                                                <div className="h-7.5 px-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-end font-mono text-xs font-semibold text-slate-700">
                                                    {formatRupiah(hargaSatuan)} / unit
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Section Footer */}
            <div className="p-2.5 px-3.5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-xs font-semibold text-slate-700">
                <span className="text-[11px] text-slate-500">Total Biaya Bahan:</span>
                <span className="font-extrabold text-sm text-slate-900 font-mono">
                    {formatRupiah(totalBiayaBahan)}
                </span>
            </div>
        </div>
    );
}
