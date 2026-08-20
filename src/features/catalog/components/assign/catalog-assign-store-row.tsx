"use client";

import { useWatch, useFormContext } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { FormNominalInput } from "@/components/forms/form-nominal-input";
import { FormNumberInput } from "@/components/forms/form-number-input";
import { FormSwitch } from "@/components/forms/form-switch";
import { Show } from "@/components/ui/show";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { STORE_BADGE_HQ } from "@/constants/store";
import {
    IconCheck,
    IconBuildingStore,
    IconTag,
    IconPercentage,
    IconChevronDown,
    IconChevronUp,
    IconAdjustmentsHorizontal,
} from "@tabler/icons-react";
import type { Store } from "@/features/stores/types";
import type { ProductStore } from "@/features/master/products/types";
import type { CatalogAssignFormValues, StoreAssignState } from "../../types";

interface CatalogAssignStoreRowProps {
    store: Store;
    formState: StoreAssignState;
    currentAssignment?: ProductStore;
    globalValues: {
        global_harga_jual: number | null;
        global_is_grosir: boolean;
        global_harga_grosir: number | null;
        global_min_qty_grosir: number | null;
    };
    masterPrice: number;
    onToggleChecked: (storeUid: string, current: boolean) => void;
    onToggleCustom: (storeUid: string, current: boolean) => void;
}

export function CatalogAssignStoreRow({
    store,
    formState,
    currentAssignment,
    globalValues,
    masterPrice,
    onToggleChecked,
    onToggleCustom,
}: CatalogAssignStoreRowProps) {
    const { control } = useFormContext<CatalogAssignFormValues>();

    const isChecked = formState.checked;
    const isCustom = formState.is_custom;

    // Watch specific store custom fields for live preview calculation
    const watchCustomPrice = useWatch({ control, name: `stores.${store.uid}.harga_jual` });
    const watchCustomIsGrosir = useWatch({ control, name: `stores.${store.uid}.is_grosir` });
    const watchCustomHargaGrosir = useWatch({ control, name: `stores.${store.uid}.harga_grosir` });
    const watchCustomMinQty = useWatch({ control, name: `stores.${store.uid}.min_qty_grosir` });

    // Calculate effective retail price
    const effectivePrice = isCustom && watchCustomPrice != null
        ? Number(watchCustomPrice)
        : globalValues.global_harga_jual != null
            ? Number(globalValues.global_harga_jual)
            : masterPrice;

    // Calculate effective wholesale
    const effectiveIsGrosir = isCustom ? Boolean(watchCustomIsGrosir) : Boolean(globalValues.global_is_grosir);
    const effectiveHargaGrosir = isCustom
        ? (watchCustomHargaGrosir ? Number(watchCustomHargaGrosir) : null)
        : globalValues.global_harga_jual != null || globalValues.global_harga_grosir != null
            ? globalValues.global_harga_grosir
            : null;
    const effectiveMinQty = isCustom
        ? (watchCustomMinQty ? Number(watchCustomMinQty) : null)
        : globalValues.global_min_qty_grosir;

    const hasEffectiveWholesale = Boolean(
        effectiveIsGrosir &&
        effectiveHargaGrosir &&
        effectiveMinQty &&
        effectiveMinQty > 0
    );

    return (
        <div
            className={`border rounded-2xl transition-all overflow-hidden ${
                isChecked
                    ? isCustom
                        ? "border-amber-300 bg-amber-50/10 shadow-xs"
                        : "border-emerald-200 bg-emerald-50/15 shadow-xs"
                    : "border-slate-200 bg-white hover:border-slate-300 opacity-80"
            }`}
        >
            {/* ── Main Row ───────────────────────────────────────────────────── */}
            <div className="p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                {/* Left: Checkbox & Store Info */}
                <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                    <button
                        type="button"
                        onClick={() => onToggleChecked(store.uid, isChecked)}
                        className={`w-5 h-5 mt-0.5 sm:mt-0 rounded-md flex items-center justify-center border transition-all shrink-0 cursor-pointer ${
                            isChecked
                                ? "bg-emerald-600 border-emerald-600 text-white shadow-xs"
                                : "bg-white border-slate-300 hover:border-emerald-500"
                        }`}
                        title={isChecked ? "Batalkan pilihan" : "Pilih toko"}
                    >
                        {isChecked && <IconCheck size={14} strokeWidth={3} />}
                    </button>

                    <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-xs text-slate-900 truncate">
                                {store.nama}
                            </span>
                            {store.is_central && (
                                <Badge className="text-[9px] px-1.5 py-0 bg-emerald-100 text-emerald-800 border-emerald-200 font-bold shrink-0">
                                    {STORE_BADGE_HQ}
                                </Badge>
                            )}
                            {currentAssignment ? (
                                <Badge className="text-[9px] px-1.5 py-0 bg-slate-100 text-slate-600 border-slate-200 font-semibold shrink-0">
                                    Terdaftar
                                </Badge>
                            ) : (
                                <Badge className="text-[9px] px-1.5 py-0 bg-amber-50 text-amber-700 border-amber-200 font-semibold shrink-0">
                                    Belum Terdaftar
                                </Badge>
                            )}
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                            <span>Status Saat Ini:</span>
                            <strong className="text-slate-600 font-semibold">
                                {currentAssignment?.harga_jual != null
                                    ? formatRupiah(currentAssignment.harga_jual)
                                    : "Belum diset"}
                            </strong>
                            {Boolean(currentAssignment?.is_grosir && currentAssignment?.harga_grosir) && (
                                <span className="text-[10px] text-emerald-700 font-mono">
                                    (Grosir: {formatRupiah(Number(currentAssignment?.harga_grosir))})
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Effective Price Preview & Custom Toggle Button */}
                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    {/* Live Effective Pill */}
                    {isChecked ? (
                        <div className="flex flex-col items-start sm:items-end text-right">
                            <div className="flex items-center gap-1.5 font-mono">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    {isCustom ? "Khusus:" : "Akan Diset:"}
                                </span>
                                <span className="text-xs font-black text-slate-900">
                                    {formatRupiah(effectivePrice)}
                                </span>
                            </div>

                            {hasEffectiveWholesale ? (
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.2 rounded-md font-mono mt-0.5">
                                    Grosir: {formatRupiah(Number(effectiveHargaGrosir))} (≥{effectiveMinQty} pcs)
                                </span>
                            ) : (
                                <span className="text-[9px] font-semibold text-slate-400">
                                    Tanpa Grosir
                                </span>
                            )}
                        </div>
                    ) : (
                        <span className="text-xs text-slate-400 italic">
                            Tidak dipilih
                        </span>
                    )}

                    {/* Customize Trigger Button */}
                    <button
                        type="button"
                        onClick={() => onToggleCustom(store.uid, isCustom)}
                        disabled={!isChecked}
                        className={`h-8 px-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all border ${
                            !isChecked
                                ? "opacity-30 pointer-events-none bg-slate-100 border-slate-200 text-slate-400"
                                : isCustom
                                    ? "bg-amber-500 hover:bg-amber-600 text-white border-amber-600 shadow-xs"
                                    : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-xs"
                        }`}
                        title="Kustomisasi harga dan skema grosir khusus toko ini"
                    >
                        <IconAdjustmentsHorizontal size={14} />
                        <span>{isCustom ? "Kustom Aktif" : "Kustomisasi"}</span>
                        {isCustom ? <IconChevronUp size={13} /> : <IconChevronDown size={13} />}
                    </button>
                </div>
            </div>

            {/* ── Collapsible Custom Pricing Section ──────────────────────────── */}
            <Show.When isTrue={Boolean(isChecked && isCustom)}>
                <div className="border-t border-amber-200/80 bg-amber-50/20 p-4 sm:p-4.5 space-y-3.5 animate-in fade-in-50 duration-150">
                    <div className="flex items-center gap-1.5 text-amber-900 font-extrabold text-xs">
                        <IconBuildingStore size={15} className="text-amber-600" />
                        <span>Pengaturan Khusus Toko: {store.nama}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 items-start">
                        {/* Custom Retail Price */}
                        <div className="space-y-1.5 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                            <div className="flex items-center gap-1 text-slate-700">
                                <IconTag size={13} className="text-slate-500" />
                                <span className="text-xs font-bold">Harga Jual Khusus Toko (Rp)</span>
                            </div>
                            <FormNominalInput<CatalogAssignFormValues>
                                name={`stores.${store.uid}.harga_jual`}
                                placeholder={
                                    globalValues.global_harga_jual != null
                                        ? `Ikuti Global (${formatRupiah(globalValues.global_harga_jual)})`
                                        : `Ikuti Master (${formatRupiah(masterPrice)})`
                                }
                                className="h-9 text-xs bg-slate-50/50"
                            />
                            <p className="text-[10px] text-slate-400">
                                Kosongkan jika ingin mengikuti harga global/master.
                            </p>
                        </div>

                        {/* Custom Wholesale Scheme */}
                        <div className="space-y-2 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                            <div className="flex items-center gap-1 text-slate-700">
                                <IconPercentage size={13} className="text-slate-500" />
                                <span className="text-xs font-bold">Skema Grosir Khusus Toko</span>
                            </div>

                            <FormSwitch<CatalogAssignFormValues>
                                name={`stores.${store.uid}.is_grosir`}
                                label="Aktifkan Grosir Toko Ini"
                                description="Gunakan aturan grosir tersendiri untuk toko ini"
                                className="bg-slate-50 p-2 rounded-lg border-slate-100"
                            />

                            <Show.When isTrue={Boolean(watchCustomIsGrosir)}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1.5 animate-in fade-in-50">
                                    <FormNumberInput<CatalogAssignFormValues>
                                        name={`stores.${store.uid}.min_qty_grosir`}
                                        label="Min. Qty (Pcs)"
                                        min={1}
                                        placeholder="Contoh: 5"
                                        className="h-8.5 text-xs bg-slate-50/50"
                                    />
                                    <FormNominalInput<CatalogAssignFormValues>
                                        name={`stores.${store.uid}.harga_grosir`}
                                        label="Harga Satuan Grosir (Rp)"
                                        placeholder="Contoh: 11.500"
                                        className="h-8.5 text-xs bg-slate-50/50"
                                    />
                                </div>
                            </Show.When>
                        </div>
                    </div>
                </div>
            </Show.When>
        </div>
    );
}
