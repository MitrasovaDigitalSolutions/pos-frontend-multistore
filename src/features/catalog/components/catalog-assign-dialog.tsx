"use client";

import { useEffect, useMemo } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { BaseDialog } from "@/components/ui/base-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FormNominalInput } from "@/components/forms/form-nominal-input";
import {
    IconBuildingStore,
    IconPackage,
    IconTag,
    IconCheck,
    IconMinus,
    IconLoader2,
} from "@tabler/icons-react";
import { useStores } from "@/features/stores/api/stores-api";
import { useProductStores } from "@/features/master/products/api/product-store-api";
import { useBulkAssignProductStores } from "../api/catalog-api";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import type { CatalogProduct } from "../types";

export interface CatalogAssignFormValues {
    global_harga_jual: number | null;
    stores: Record<
        string,
        {
            checked: boolean;
            is_custom_price: boolean;
            harga_jual: number | null;
        }
    >;
}

interface CatalogAssignDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: CatalogProduct | null;
}

export function CatalogAssignDialog({
    open,
    onOpenChange,
    product,
}: CatalogAssignDialogProps) {
    const { data: storesRes, isLoading: isLoadingStores } = useStores({ per_page: 1000 });
    const { data: assignments = [], isLoading: isLoadingAssignments } = useProductStores(
        open ? product?.uid : undefined
    );
    const bulkAssign = useBulkAssignProductStores();

    const stores = useMemo(() => storesRes?.data ?? [], [storesRes?.data]);
    const isLoading = isLoadingStores || isLoadingAssignments;

    const methods = useForm<CatalogAssignFormValues>({
        defaultValues: {
            global_harga_jual: null,
            stores: {},
        },
    });

    const { control, setValue, handleSubmit, reset } = methods;

    useEffect(() => {
        if (open && product && !isLoading) {
            const storeMap: CatalogAssignFormValues["stores"] = {};
            stores.forEach((s) => {
                const existing = assignments.find((a) => a.store_uid === s.uid);
                storeMap[s.uid] = {
                    checked: !!existing,
                    is_custom_price: false,
                    harga_jual: null,
                };
            });
            reset({
                global_harga_jual: null,
                stores: storeMap,
            });
        }
    }, [open, product, isLoading, stores, assignments, reset]);

    const watchStores = useWatch({ control, name: "stores" }) || {};

    const storeEntries = stores.map((s) => ({
        store: s,
        formState: watchStores[s.uid] || { checked: false, is_custom_price: false, harga_jual: null },
        currentAssignment: assignments.find((a) => a.store_uid === s.uid),
    }));

    const selectedCount = storeEntries.filter((e) => e.formState.checked).length;
    const allChecked = storeEntries.length > 0 && selectedCount === storeEntries.length;
    const someChecked = selectedCount > 0 && selectedCount < storeEntries.length;

    const toggleAll = () => {
        const targetState = !allChecked;
        stores.forEach((s) => {
            setValue(`stores.${s.uid}.checked`, targetState, { shouldDirty: true });
        });
    };

    const toggleRow = (storeUid: string, current: boolean) => {
        setValue(`stores.${storeUid}.checked`, !current, { shouldDirty: true });
    };

    const toggleCustomPrice = (storeUid: string, current: boolean) => {
        const next = !current;
        setValue(`stores.${storeUid}.is_custom_price`, next, { shouldDirty: true });
        if (!next) {
            // Reset custom price input when disabled
            setValue(`stores.${storeUid}.harga_jual`, null, { shouldDirty: true });
        }
    };

    const onSubmit = (data: CatalogAssignFormValues) => {
        if (!product) return;

        const selectedStores = stores.filter((s) => data.stores[s.uid]?.checked);
        if (selectedStores.length === 0) {
            toast.warning("Pilih minimal satu toko untuk di-assign.");
            return;
        }

        const globalVal = data.global_harga_jual;

        const payloadAssignments = selectedStores.map((s) => {
            const storeData = data.stores[s.uid];
            const isCustom = storeData?.is_custom_price;
            const customPrice = storeData?.harga_jual;
            const finalPrice = isCustom && customPrice != null ? customPrice : globalVal;
            return {
                store_uid: s.uid,
                harga_jual: finalPrice ?? null,
            };
        });

        bulkAssign.mutate(
            { productUid: product.uid, payload: { assignments: payloadAssignments } },
            {
                onSuccess: () => {
                    toast.success(
                        `Produk berhasil di-assign ke ${payloadAssignments.length} toko.`
                    );
                    onOpenChange(false);
                },
                onError: (err) => {
                    toast.error(err.message || "Gagal menyimpan assignment.");
                },
            }
        );
    };

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={
                <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600">
                        <IconBuildingStore size={20} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-base font-bold text-slate-900">
                            Distribusi Produk ke Toko
                        </span>
                        <span className="text-xs font-medium text-slate-400">
                            Atur ketersediaan dan penyesuaian harga jual di seluruh cabang
                        </span>
                    </div>
                </div>
            }
            className="!max-w-3xl w-full"
            scrollable
        >
            <FormProvider {...methods}>
                <form id="catalog-assign-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* ── Product Info Summary Card ──────────────────────────── */}
                    {product && (
                        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-start gap-3">
                            <div className="p-2.5 rounded-xl bg-white border border-slate-200 shrink-0 text-slate-400">
                                <IconPackage size={22} />
                            </div>
                            <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-bold text-sm text-slate-900 leading-tight">
                                        {product.nama}
                                    </span>
                                    {product.is_jasa && (
                                        <Badge className="text-[9px] px-2 py-0.5 bg-blue-50 text-blue-700 border-blue-100 font-semibold">
                                            Jasa
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 flex-wrap text-xs text-slate-500">
                                    {product.barcode && (
                                        <span className="font-mono bg-white border border-slate-200 px-2 py-0.5 rounded-md text-[11px] font-semibold text-slate-700">
                                            {product.barcode}
                                        </span>
                                    )}
                                    {product.category && (
                                        <span>Kategori: <strong className="text-slate-700">{product.category.nama}</strong></span>
                                    )}
                                    {product.brand && (
                                        <span>Brand: <strong className="text-slate-700">{product.brand.nama}</strong></span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 pt-1">
                                    <IconTag size={14} className="text-slate-400" />
                                    <span className="text-xs text-slate-500">Harga Master:</span>
                                    <span className="font-extrabold text-xs text-slate-900">
                                        {formatRupiah(product.harga)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Global Price Input ─────────────────────────────────── */}
                    <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-4 space-y-2">
                        <FormNominalInput<CatalogAssignFormValues>
                            name="global_harga_jual"
                            label="Harga Jual Global (Opsional)"
                            placeholder="Masukkan nominal harga jual global..."
                            className="bg-white"
                        />
                        <p className="text-[11px] text-emerald-800/80 leading-relaxed font-medium">
                            Jika diisi, seluruh toko yang dipilih akan otomatis menggunakan harga jual ini, kecuali toko yang di-checklist untuk menggunakan harga khusus di bawah.
                        </p>
                    </div>

                    {/* ── Store Selection Table ──────────────────────────────── */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={toggleAll}
                                    className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all shrink-0 cursor-pointer ${allChecked
                                        ? "bg-emerald-600 border-emerald-600 text-white"
                                        : someChecked
                                            ? "bg-emerald-100 border-emerald-400 text-emerald-700"
                                            : "bg-white border-slate-300 hover:border-emerald-500"
                                        }`}
                                >
                                    {allChecked ? (
                                        <IconCheck size={14} strokeWidth={3} />
                                    ) : someChecked ? (
                                        <IconMinus size={14} strokeWidth={3} />
                                    ) : null}
                                </button>
                                <span className="text-xs font-bold text-slate-800">
                                    Pilih Toko ({selectedCount} dari {stores.length} toko dipilih)
                                </span>
                            </div>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Atur Harga Per Toko
                            </span>
                        </div>

                        <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 bg-white">
                            {isLoading ? (
                                <div className="py-12 flex flex-col items-center gap-2 text-slate-400">
                                    <IconLoader2 size={24} className="animate-spin text-emerald-600" />
                                    <span className="text-xs font-medium">Memuat data toko...</span>
                                </div>
                            ) : stores.length === 0 ? (
                                <div className="py-12 text-center text-xs text-slate-400 font-medium">
                                    Tidak ada toko tersedia
                                </div>
                            ) : (
                                storeEntries.map(({ store, formState, currentAssignment }) => {
                                    const isChecked = formState.checked;
                                    const isCustomPrice = formState.is_custom_price;
                                    return (
                                        <div
                                            key={store.uid}
                                            className={`flex items-center gap-4 px-4 py-3.5 transition-colors ${isChecked ? "bg-emerald-50/20" : "hover:bg-slate-50/70"
                                                }`}
                                        >
                                            {/* Store Assignment Checkbox */}
                                            <button
                                                type="button"
                                                onClick={() => toggleRow(store.uid, isChecked)}
                                                className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all shrink-0 cursor-pointer ${isChecked
                                                    ? "bg-emerald-600 border-emerald-600 text-white"
                                                    : "bg-white border-slate-300 hover:border-emerald-500"
                                                    }`}
                                            >
                                                {isChecked && <IconCheck size={14} strokeWidth={3} />}
                                            </button>

                                            {/* Store Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-slate-900 truncate">
                                                        {store.nama}
                                                    </span>
                                                    {store.is_central && (
                                                        <Badge className="text-[9px] px-1.5 py-0 bg-emerald-100 text-emerald-800 border-emerald-200 font-bold shrink-0">
                                                            Pusat
                                                        </Badge>
                                                    )}
                                                </div>
                                                <span className="text-[11px] text-slate-400">
                                                    Harga Terdaftar:{" "}
                                                    <strong className="text-slate-600 font-semibold">
                                                        {currentAssignment?.harga_jual != null
                                                            ? formatRupiah(currentAssignment.harga_jual)
                                                            : "Belum Terdaftar"}
                                                    </strong>
                                                </span>
                                            </div>

                                            {/* Custom Price Control Section */}
                                            <div className="flex items-center gap-3 shrink-0">
                                                {/* Checkbox for custom price override */}
                                                <label className={`flex items-center gap-1.5 text-xs font-medium cursor-pointer select-none ${!isChecked ? "opacity-40 pointer-events-none" : "text-slate-700"}`}>
                                                    <input
                                                        type="checkbox"
                                                        checked={isCustomPrice}
                                                        onChange={() => toggleCustomPrice(store.uid, isCustomPrice)}
                                                        disabled={!isChecked}
                                                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 accent-emerald-600 cursor-pointer disabled:cursor-not-allowed"
                                                    />
                                                    <span className="text-[11px] font-semibold">Harga Khusus</span>
                                                </label>

                                                {/* Custom Nominal Input */}
                                                <div className="w-40">
                                                    <FormNominalInput<CatalogAssignFormValues>
                                                        name={`stores.${store.uid}.harga_jual`}
                                                        placeholder={isCustomPrice ? "Nominal khusus" : "Harga global"}
                                                        disabled={!isChecked || !isCustomPrice}
                                                        className="h-9 text-xs"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* ── Footer Actions ─────────────────────────────────────── */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <span className="text-xs font-semibold text-slate-500">
                            {selectedCount} toko dipilih
                        </span>
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => onOpenChange(false)}
                                disabled={bulkAssign.isPending}
                                className="h-9 px-4 text-xs font-bold rounded-xl border-slate-200"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                form="catalog-assign-form"
                                disabled={bulkAssign.isPending || selectedCount === 0}
                                className="h-9 px-4 text-xs font-bold rounded-xl gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                            >
                                {bulkAssign.isPending ? (
                                    <>
                                        <IconLoader2 size={16} className="animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <IconCheck size={16} />
                                        Simpan ke {selectedCount} Toko
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </FormProvider>
        </BaseDialog>
    );
}
