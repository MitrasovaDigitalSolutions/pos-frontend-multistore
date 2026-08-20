"use client";

import { useWatch, useFormContext } from "react-hook-form";
import { FormNominalInput } from "@/components/forms/form-nominal-input";
import { FormNumberInput } from "@/components/forms/form-number-input";
import { FormSwitch } from "@/components/forms/form-switch";
import { Show } from "@/components/ui/show";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { IconSparkles, IconTag, IconPercentage, IconInfoCircle } from "@tabler/icons-react";
import type { CatalogAssignFormValues, CatalogProduct } from "../../types";

interface CatalogAssignGlobalPresetProps {
    product: CatalogProduct;
}

export function CatalogAssignGlobalPreset({ product }: CatalogAssignGlobalPresetProps) {
    const { control } = useFormContext<CatalogAssignFormValues>();
    const watchGlobalIsGrosir = useWatch({ control, name: "global_is_grosir" });
    const watchGlobalHargaGrosir = useWatch({ control, name: "global_harga_grosir" });
    const watchGlobalMinQty = useWatch({ control, name: "global_min_qty_grosir" });

    const masterPrice = product.harga_jual ?? product.harga;

    return (
        <div className="bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-slate-50 border border-emerald-200/90 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs">
            <div className="flex items-start justify-between gap-2 border-b border-emerald-100/80 pb-3">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-emerald-600 text-white shadow-xs">
                        <IconSparkles size={16} />
                    </div>
                    <div>
                        <h4 className="text-xs font-extrabold text-slate-900 tracking-tight">
                            Preset Harga &amp; Grosir Global
                        </h4>
                        <p className="text-[11px] text-slate-500 font-medium">
                            Terapkan pengaturan seragam ke seluruh toko yang dipilih sekaligus.
                        </p>
                    </div>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    <IconInfoCircle size={12} />
                    Otomatis
                </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
                {/* ── Global Retail Price ────────────────────────────────────────── */}
                <div className="space-y-2 bg-white/90 p-3.5 rounded-xl border border-emerald-100/90 shadow-xs">
                    <div className="flex items-center gap-1.5 text-slate-700">
                        <IconTag size={15} className="text-emerald-600" />
                        <span className="text-xs font-bold">Harga Jual Global</span>
                    </div>
                    <FormNominalInput<CatalogAssignFormValues>
                        name="global_harga_jual"
                        placeholder={`Gunakan Master (${formatRupiah(masterPrice)})`}
                        className="bg-white"
                    />
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                        Kosongkan jika ingin mengikuti <strong>Harga Master ({formatRupiah(masterPrice)})</strong>.
                    </p>
                </div>

                {/* ── Global Wholesale Scheme ────────────────────────────────────── */}
                <div className="space-y-2.5 bg-white/90 p-3.5 rounded-xl border border-emerald-100/90 shadow-xs">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-slate-700">
                            <IconPercentage size={15} className="text-emerald-600" />
                            <span className="text-xs font-bold">Skema Grosir Global</span>
                        </div>
                    </div>

                    <FormSwitch<CatalogAssignFormValues>
                        name="global_is_grosir"
                        label="Aktifkan Harga Grosir Global"
                        description="Toko terpilih akan otomatis menerapkan skema grosir ini"
                        className="bg-slate-50/70 border-slate-200/60 p-2.5 rounded-lg"
                    />

                    <Show.When isTrue={Boolean(watchGlobalIsGrosir)}>
                        <div className="p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-xl space-y-3 mt-2 animate-in fade-in-50 duration-200">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <FormNumberInput<CatalogAssignFormValues>
                                    name="global_min_qty_grosir"
                                    label="Min. Qty Grosir (Pcs)"
                                    min={1}
                                    placeholder="Contoh: 10"
                                    className="bg-white h-10 text-xs"
                                />
                                <FormNominalInput<CatalogAssignFormValues>
                                    name="global_harga_grosir"
                                    label="Harga Satuan Grosir (Rp)"
                                    placeholder="Contoh: 12.000"
                                    className="bg-white h-10 text-xs"
                                />
                            </div>

                            {Boolean(watchGlobalHargaGrosir && watchGlobalMinQty) && (
                                <div className="text-[10px] text-emerald-800 font-bold bg-emerald-100/80 px-2.5 py-1 rounded-md flex items-center gap-1.5 font-mono">
                                    <span>Skema:</span>
                                    <span>
                                        Pembelian ≥ <strong>{watchGlobalMinQty} pcs</strong> ➔ <strong>{formatRupiah(Number(watchGlobalHargaGrosir))}/pcs</strong>
                                    </span>
                                </div>
                            )}
                        </div>
                    </Show.When>
                </div>
            </div>
        </div>
    );
}
