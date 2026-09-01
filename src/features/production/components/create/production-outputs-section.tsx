"use client";

import { useEffect, useRef } from "react";
import { useFormContext, type FieldPath } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormNumberInput } from "@/components/forms/form-number-input";
import { FormNominalInput } from "@/components/forms/form-nominal-input";
import { FormSwitch } from "@/components/forms/form-switch";
import { Show } from "@/components/ui/show";
import { BarcodeInput } from "@/components/shared/barcode-input";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import type { Product } from "@/features/master/products/types";
import {
    IconMinus,
    IconPackage,
    IconPlus,
    IconScan,
    IconTrash,
} from "@tabler/icons-react";
import type {
    ProductionCreateInput,
    ProductionOutputInput,
} from "../../schemas/production-schema";

interface ProductionOutputsSectionProps {
    productsMap: Record<string, Product>;
    fields: { id: string }[];
    watchedOutputs: ProductionOutputInput[];
    onProductFound: (product: Product) => void;
    onRemoveItem: (index: number) => void;
    disabled?: boolean;
    totalOutputQty: number;
    totalAlokasiHpp: number;
    lastScannedUid: string | null;
    onClearScannedUid: () => void;
}

export function ProductionOutputsSection({
    productsMap,
    fields,
    watchedOutputs,
    onProductFound,
    onRemoveItem,
    disabled = false,
    totalOutputQty,
    totalAlokasiHpp,
    lastScannedUid,
    onClearScannedUid,
}: ProductionOutputsSectionProps) {
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
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs flex flex-col justify-between h-full relative">
            <div>
                {/* Header */}
                <div className="p-3 px-3.5 bg-emerald-50/70 border-b border-emerald-200/50 rounded-t-2xl flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center">
                            <IconPackage size={13} />
                        </div>
                        <span className="text-xs font-bold text-slate-900">
                            Hasil Barang Jadi &amp; HPP
                        </span>
                    </div>
                    {fields.length > 0 && (
                        <Badge variant="outline" className="bg-emerald-100/70 text-emerald-800 border-emerald-200 text-[10px] px-2 py-0 font-bold">
                            {totalOutputQty} Pcs
                        </Badge>
                    )}
                </div>

                <div className="p-3 space-y-2.5">
                    {/* Compact Barcode Scanner Box */}
                    <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase">
                            <span className="flex items-center gap-1">
                                <IconScan size={12} className="text-emerald-600" /> Scan / Cari Barang Jadi
                            </span>
                            <span className="text-slate-400 font-normal">Tekan Enter utk tambah</span>
                        </div>
                        <BarcodeInput
                            ref={barcodeInputRef}
                            refocusOnFound={false}
                            isRawMaterial={false}
                            isJasa={false}
                            onProductFound={onProductFound}
                            placeholder="Scan barcode SKU / cari nama barang jadi..."
                            disabled={disabled}
                        />
                    </div>

                    {/* Empty State */}
                    {fields.length === 0 ? (
                        <div className="py-6 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/40 space-y-1">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                                <IconPackage size={16} />
                            </div>
                            <p className="text-xs font-bold text-slate-700">Belum ada barang jadi</p>
                            <p className="text-[10px] text-slate-400 max-w-xs mx-auto">
                                Scan barcode produk jadi untuk menerima hasil produksi.
                            </p>
                        </div>
                    ) : (
                        /* ── 2-Tier Structured Bento Row List (Spacious & Clean) ── */
                        <div className="space-y-2.5">
                            {fields.map((field, idx) => {
                                const item = watchedOutputs[idx];
                                const productUid = item?.product_uid;
                                const prod = productsMap[productUid];
                                const qty = Number(item?.kuantitas) || 0;
                                const hppSatuan = Number(item?.hpp_satuan) || 0;
                                const subtotalHpp = qty * hppSatuan;
                                const isUpdateHarga = Boolean(item?.update_harga_jual);

                                return (
                                    <div
                                        key={field.id}
                                        className="p-3 bg-white hover:bg-emerald-50/20 border border-slate-200/90 rounded-2xl space-y-2.5 shadow-2xs transition-colors"
                                    >
                                        {/* ── Baris 1: Header Produk Jadi & Total Nilai HPP ── */}
                                        <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[10px] font-bold text-slate-400 font-mono">#{idx + 1}</span>
                                                    <h4 className="text-xs font-bold text-slate-900 truncate">
                                                        {prod?.nama || "Produk Jadi"}
                                                    </h4>
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                                                    <span className="font-mono">{prod?.barcode || "-"}</span>
                                                    <span>•</span>
                                                    <span>Harga Jual Toko: <strong className="text-slate-600 font-mono">{formatRupiah(prod?.harga ?? 0)}</strong></span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                <div className="text-right">
                                                    <span className="text-[9px] text-slate-400 block font-medium">Total HPP Output:</span>
                                                    <span className="font-extrabold text-emerald-800 font-mono text-xs">
                                                        {formatRupiah(subtotalHpp)}
                                                    </span>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onRemoveItem(idx)}
                                                    disabled={disabled}
                                                    className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                                                    title="Hapus Barang Jadi"
                                                >
                                                    <IconTrash size={13} />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* ── Baris 2: Input Kuantitas Jadi & HPP Satuan Manual ── */}
                                        <div className="grid grid-cols-12 gap-2.5 items-center">
                                            {/* Qty Hasil Jadi */}
                                            <div className="col-span-5 sm:col-span-5">
                                                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                                                    Qty Hasil Jadi *
                                                </label>
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            const newQty = Math.max(1, qty - 1);
                                                            setValue(`outputs.${idx}.kuantitas`, newQty, {
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
                                                        name={`outputs.${idx}.kuantitas` as FieldPath<ProductionCreateInput>}
                                                        placeholder="1"
                                                        disabled={disabled}
                                                        allowDecimal={true}
                                                        inputRef={(el) => {
                                                            if (el && productUid) {
                                                                qtyInputRefs.current.set(productUid, el);
                                                            }
                                                        }}
                                                        className="h-7.5 text-xs font-bold text-center flex-1"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setValue(`outputs.${idx}.kuantitas`, qty + 1, {
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
                                            </div>

                                            {/* HPP Satuan (Manual) */}
                                            <div className="col-span-7 sm:col-span-4">
                                                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                                                    HPP Satuan (Rp) *
                                                </label>
                                                <FormNominalInput<ProductionCreateInput>
                                                    name={`outputs.${idx}.hpp_satuan` as FieldPath<ProductionCreateInput>}
                                                    placeholder="0"
                                                    disabled={disabled}
                                                    className="h-7.5 text-xs text-right font-mono font-semibold"
                                                />
                                            </div>

                                            {/* Toggle Update Jual */}
                                            <div className="col-span-12 sm:col-span-3 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                                                <span className="text-[10px] font-bold text-slate-500 uppercase">Update Jual:</span>
                                                <div className="mt-0.5">
                                                    <FormSwitch<ProductionCreateInput>
                                                        name={`outputs.${idx}.update_harga_jual` as FieldPath<ProductionCreateInput>}
                                                        label=""
                                                        disabled={disabled}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* ── Sub-Baris Opsional: Update Harga Jual Retail Baru ── */}
                                        <Show.When isTrue={isUpdateHarga}>
                                            <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-200/80 space-y-1.5 animate-in fade-in-50 duration-200">
                                                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                                                    Penetapan Harga Jual Baru Toko
                                                </span>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <FormNominalInput<ProductionCreateInput>
                                                        name={`outputs.${idx}.harga_jual_baru` as FieldPath<ProductionCreateInput>}
                                                        label="Harga Jual Retail Baru (Rp)"
                                                        placeholder="0"
                                                        disabled={disabled}
                                                        className="h-7.5 text-xs text-right"
                                                    />
                                                    <FormNumberInput<ProductionCreateInput>
                                                        name={`outputs.${idx}.margin_baru` as FieldPath<ProductionCreateInput>}
                                                        label="Margin Target (%)"
                                                        placeholder="0"
                                                        disabled={disabled}
                                                        className="h-7.5 text-xs text-center"
                                                    />
                                                </div>
                                            </div>
                                        </Show.When>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Section Footer */}
            <div className="p-2.5 px-3.5 bg-slate-50 border-t border-slate-200/80 rounded-b-2xl flex items-center justify-between text-xs font-semibold text-slate-700">
                <span className="text-[11px] text-slate-500">Total Alokasi HPP:</span>
                <span className="font-extrabold text-sm text-emerald-800 font-mono">
                    {formatRupiah(totalAlokasiHpp)}
                </span>
            </div>
        </div>
    );
}
