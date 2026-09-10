"use client";

import { useEffect, useRef } from "react";
import { useFormContext, type FieldPath } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormNumberInput } from "@/components/forms/form-number-input";
import { FormNominalInput } from "@/components/forms/form-nominal-input";
import { FormInput } from "@/components/forms/form-input";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import type { Product } from "@/features/master/products/types";
import {
    IconAlertTriangle,
    IconBox,
    IconCalculator,
    IconCoins,
    IconLoader2,
    IconMinus,
    IconPlus,
    IconTrash,
} from "@tabler/icons-react";
import type {
    ProductionAdditionalCostInput,
    ProductionCreateInput,
    ProductionMaterialInput,
} from "../../schemas/production-schema";

interface ProductionMaterialsSectionProps {
    productsMap: Record<string, Product>;
    fields: { id: string }[];
    watchedMaterials: ProductionMaterialInput[];
    onProductFound?: (product: Product) => void;
    onRemoveItem: (index: number) => void;
    disabled?: boolean;
    totalBiayaBahan: number;
    lastScannedUid: string | null;
    onClearScannedUid: () => void;
    // Hybrid BoM & Additional Cost Props
    onCalculateBom: () => void;
    isCalculatingBom: boolean;
    additionalCostsFields: { id: string }[];
    watchedAdditionalCosts: ProductionAdditionalCostInput[];
    onAddAdditionalCost: () => void;
    onRemoveAdditionalCost: (index: number) => void;
    totalBiayaTambahan: number;
    totalBersih: number;
}

export function ProductionMaterialsSection({
    productsMap,
    fields,
    watchedMaterials,
    onProductFound: _onProductFound,
    onRemoveItem,
    disabled = false,
    totalBiayaBahan,
    lastScannedUid,
    onClearScannedUid,
    onCalculateBom,
    isCalculatingBom,
    additionalCostsFields,
    watchedAdditionalCosts: _watchedAdditionalCosts,
    onAddAdditionalCost,
    onRemoveAdditionalCost,
    totalBiayaTambahan,
    totalBersih,
}: ProductionMaterialsSectionProps) {
    const { setValue } = useFormContext<ProductionCreateInput>();
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
            <div className="space-y-4">
                {/* ── 2. Header Bahan Baku & Tombol Sinkronkan BoM ── */}
                <div className="p-3 px-3.5 bg-amber-50/70 border-b border-amber-200/50 rounded-t-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center">
                            <IconBox size={13} />
                        </div>
                        <span className="text-xs font-bold text-slate-900">
                            2. Bahan Baku &amp; Biaya Tambahan
                        </span>
                        {fields.length > 0 && (
                            <Badge variant="outline" className="bg-amber-100/70 text-amber-800 border-amber-200 text-[10px] px-2 py-0 font-bold ml-1">
                                {fields.length} Bahan
                            </Badge>
                        )}
                    </div>

                    {/* Tombol Sinkronkan BoM */}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onCalculateBom}
                        disabled={disabled || isCalculatingBom}
                        className="h-7 px-2.5 bg-white hover:bg-amber-100/80 border-amber-300 text-amber-900 font-bold text-[11px] rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                        title="Hitung ulang kebutuhan bahan secara otomatis berdasarkan resep BoM barang jadi"
                    >
                        {isCalculatingBom ? (
                            <IconLoader2 size={13} className="animate-spin text-amber-600" />
                        ) : (
                            <IconCalculator size={13} className="text-amber-600" />
                        )}
                        <span>Hitung Ulang BoM</span>
                    </Button>
                </div>

                <div className="p-3 pt-0 space-y-3">
                    {/* Information Note: Raw materials strictly derived from BoM */}
                    <div className="p-2.5 px-3 bg-amber-50/80 border border-amber-200/70 rounded-xl text-xs flex items-center gap-2">
                        <IconBox size={16} className="text-amber-600 shrink-0" />
                        <p className="text-[11px] text-amber-900 leading-snug">
                            Komposisi bahan baku disinkronkan otomatis dari <strong>Resep BoM</strong> barang jadi terpilih pada panel sebelah kiri.
                        </p>
                    </div>

                    {/* Empty State */}
                    {fields.length === 0 ? (
                        <div className="py-7 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/40 space-y-1.5 px-4">
                            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 mx-auto flex items-center justify-center">
                                <IconCalculator size={16} />
                            </div>
                            <p className="text-xs font-bold text-slate-700">Daftar Bahan Baku Belum Dimuat</p>
                            <p className="text-[10px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                                Pilih barang jadi pada panel sebelah kiri. Kebutuhan bahan baku akan otomatis terisi dari resep BoM barang jadi yang dipilih.
                            </p>
                        </div>
                    ) : (
                        /* ── 2-Tier Structured Bento Row List ── */
                        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-0.5">
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
                                                        className={`font-semibold ${isStokKurang
                                                            ? "text-rose-600 bg-rose-50 px-1 py-0.5 rounded"
                                                            : "text-slate-500"
                                                            }`}
                                                    >
                                                        Stok: {stokTersedia} {prod?.satuan || "unit"}
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
                                                            const newQty = Math.max(0.1, Number((qty - 1).toFixed(2)));
                                                            setValue(`materials.${idx}.kuantitas`, newQty, {
                                                                shouldValidate: true,
                                                                shouldDirty: true,
                                                            });
                                                        }}
                                                        disabled={disabled || qty <= 0.1}
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
                                                        className={`h-7.5 text-xs font-bold text-center flex-1 ${isStokKurang ? "border-rose-400 text-rose-600 ring-rose-200" : ""
                                                            }`}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setValue(`materials.${idx}.kuantitas`, Number((qty + 1).toFixed(2)), {
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

                                            {/* Harga Modal Satuan */}
                                            <div className="col-span-5 sm:col-span-6">
                                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                                    Harga Modal Satuan
                                                </label>
                                                <div className="h-7.5 px-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-end font-mono text-xs font-semibold text-slate-700 truncate">
                                                    {formatRupiah(hargaSatuan)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* ── 2. Sub-Section: Biaya Tambahan Langsung ── */}
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                <div className="w-4.5 h-4.5 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center">
                                    <IconCoins size={12} />
                                </div>
                                <span className="text-xs font-bold text-slate-900">
                                    2. Biaya Tambahan Langsung
                                </span>
                                <span className="text-[10px] text-slate-400 font-normal">
                                    (Makloon, sablon, dll)
                                </span>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={onAddAdditionalCost}
                                disabled={disabled}
                                className="h-6.5 px-2 bg-blue-50/50 hover:bg-blue-100/80 border-blue-200 text-blue-700 font-bold text-[10px] rounded-lg cursor-pointer flex items-center gap-1"
                            >
                                <IconPlus size={11} />
                                <span>Tambah Biaya</span>
                            </Button>
                        </div>

                        {additionalCostsFields.length === 0 ? (
                            <div className="py-2.5 px-3 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/40 text-[10px] text-slate-400">
                                Tidak ada biaya tambahan langsung. Klik &ldquo;Tambah Biaya&rdquo; jika ada ongkos makloon atau sablon.
                            </div>
                        ) : (
                            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-0.5">
                                {additionalCostsFields.map((field, idx) => (
                                    <div
                                        key={field.id}
                                        className="flex items-center gap-2 p-2 bg-slate-50/80 border border-slate-200/80 rounded-xl"
                                    >
                                        <div className="flex-1">
                                            <FormInput<ProductionCreateInput>
                                                name={`additional_costs.${idx}.nama_biaya` as FieldPath<ProductionCreateInput>}
                                                placeholder="Nama Biaya (cth: Ongkos Jahit, Sablon Logo)"
                                                disabled={disabled}
                                                className="h-7 text-xs bg-white"
                                            />
                                        </div>
                                        <div className="w-32 sm:w-36 shrink-0">
                                            <FormNominalInput<ProductionCreateInput>
                                                name={`additional_costs.${idx}.nominal` as FieldPath<ProductionCreateInput>}
                                                placeholder="0"
                                                disabled={disabled}
                                                className="h-7 text-xs text-right font-mono font-semibold bg-white"
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onRemoveAdditionalCost(idx)}
                                            disabled={disabled}
                                            className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg shrink-0 cursor-pointer"
                                            title="Hapus Biaya"
                                        >
                                            <IconTrash size={13} />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── 3. Section Footer: Breakdown Biaya Bahan + Biaya Tambahan = Total Bersih ── */}
            <div className="p-3 px-3.5 bg-slate-50 border-t border-slate-200/80 rounded-b-2xl space-y-1 text-xs">
                <div className="flex items-center justify-between text-slate-500 text-[11px]">
                    <span>Biaya Bahan Baku:</span>
                    <span className="font-semibold font-mono text-slate-700">{formatRupiah(totalBiayaBahan)}</span>
                </div>
                {totalBiayaTambahan > 0 && (
                    <div className="flex items-center justify-between text-slate-500 text-[11px]">
                        <span>Biaya Tambahan Langsung:</span>
                        <span className="font-semibold font-mono text-blue-700">+{formatRupiah(totalBiayaTambahan)}</span>
                    </div>
                )}
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 font-bold text-slate-900">
                    <span className="text-xs">Total Biaya Bersih (Modal Produksi):</span>
                    <span className="font-extrabold text-sm font-mono text-slate-900">
                        {formatRupiah(totalBersih)}
                    </span>
                </div>
            </div>
        </div>
    );
}
