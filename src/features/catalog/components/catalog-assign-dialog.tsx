"use client";

import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { BaseDialog } from "@/components/ui/base-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    IconBuildingStore,
    IconCheck,
    IconMinus,
    IconLoader2,
    IconSearch,
    IconX,
} from "@tabler/icons-react";
import { useStores } from "@/features/stores/api/stores-api";
import { useProductStores } from "@/features/master/products/api/product-store-api";
import { useBulkAssignProductStores } from "../api/catalog-api";
import { Scrollable } from "@/components/ui/scrollable";
import { CatalogAssignProductSummary } from "./assign/catalog-assign-product-summary";
import { CatalogAssignGlobalPreset } from "./assign/catalog-assign-global-preset";
import { CatalogAssignStoreRow } from "./assign/catalog-assign-store-row";
import type { BulkAssignmentItem, CatalogAssignFormValues, CatalogProduct } from "../types";

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
    const [storeSearch, setStoreSearch] = useState("");

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
            global_is_grosir: false,
            global_harga_grosir: null,
            global_min_qty_grosir: null,
            stores: {},
        },
    });

    const { control, setValue, handleSubmit, reset } = methods;

    useEffect(() => {
        if (open && product && !isLoading) {
            const masterPrice = Number(product.harga_jual ?? product.harga);
            const masterHargaGrosir = product.harga_grosir != null ? Number(product.harga_grosir) : null;
            const masterMinQtyGrosir = product.min_qty_grosir != null ? Number(product.min_qty_grosir) : null;

            const storeMap: CatalogAssignFormValues["stores"] = {};
            stores.forEach((s) => {
                const existing = assignments.find((a) => a.store_uid === s.uid);

                // Check if store has custom pricing or wholesale data differing from master
                const hasDifferentRetailPrice = Boolean(
                    existing &&
                    existing.harga_jual != null &&
                    Number(existing.harga_jual) !== masterPrice
                );
                const hasWholesale = Boolean(
                    existing && (
                        existing.is_grosir === true ||
                        (existing.harga_grosir != null && Number(existing.harga_grosir) > 0)
                    )
                );
                const hasDifferentWholesalePrice = Boolean(
                    existing &&
                    existing.harga_grosir != null &&
                    (masterHargaGrosir == null || Number(existing.harga_grosir) !== masterHargaGrosir)
                );
                const hasDifferentMinQty = Boolean(
                    existing &&
                    existing.min_qty_grosir != null &&
                    (masterMinQtyGrosir == null || Number(existing.min_qty_grosir) !== masterMinQtyGrosir)
                );

                const hasCustom = Boolean(
                    hasDifferentRetailPrice ||
                    hasWholesale ||
                    hasDifferentWholesalePrice ||
                    hasDifferentMinQty
                );

                storeMap[s.uid] = {
                    checked: !!existing,
                    is_custom: hasCustom,
                    harga_jual: hasCustom && existing?.harga_jual != null ? Number(existing.harga_jual) : null,
                    is_grosir: hasCustom ? Boolean(existing?.is_grosir ?? (existing?.harga_grosir != null)) : false,
                    harga_grosir: hasCustom && existing?.harga_grosir != null ? Number(existing.harga_grosir) : null,
                    min_qty_grosir: hasCustom && existing?.min_qty_grosir != null ? Number(existing.min_qty_grosir) : null,
                };
            });

            reset({
                global_harga_jual: null,
                global_is_grosir: Boolean(product.is_grosir),
                global_harga_grosir: product.harga_grosir ?? null,
                global_min_qty_grosir: product.min_qty_grosir ?? null,
                stores: storeMap,
            });
        }
    }, [open, product, isLoading, stores, assignments, reset]);

    const watchStores = useWatch({ control, name: "stores" });
    const watchGlobalPrice = useWatch({ control, name: "global_harga_jual" });
    const watchGlobalIsGrosir = useWatch({ control, name: "global_is_grosir" });
    const watchGlobalHargaGrosir = useWatch({ control, name: "global_harga_grosir" });
    const watchGlobalMinQty = useWatch({ control, name: "global_min_qty_grosir" });

    const globalValues = useMemo(() => ({
        global_harga_jual: watchGlobalPrice ?? null,
        global_is_grosir: Boolean(watchGlobalIsGrosir),
        global_harga_grosir: watchGlobalHargaGrosir ? Number(watchGlobalHargaGrosir) : null,
        global_min_qty_grosir: watchGlobalMinQty ? Number(watchGlobalMinQty) : null,
    }), [watchGlobalPrice, watchGlobalIsGrosir, watchGlobalHargaGrosir, watchGlobalMinQty]);

    const storeEntries = useMemo(() => {
        const storeMap = watchStores || {};
        return stores.map((s) => ({
            store: s,
            formState: storeMap[s.uid] || {
                checked: false,
                is_custom: false,
                harga_jual: null,
                is_grosir: false,
                harga_grosir: null,
                min_qty_grosir: null,
            },
            currentAssignment: assignments.find((a) => a.store_uid === s.uid),
        }));
    }, [stores, watchStores, assignments]);

    const filteredStoreEntries = useMemo(() => {
        if (!storeSearch.trim()) return storeEntries;
        const q = storeSearch.toLowerCase();
        return storeEntries.filter((e) => e.store.nama.toLowerCase().includes(q));
    }, [storeEntries, storeSearch]);

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
        setValue(`stores.${storeUid}.is_custom`, next, { shouldDirty: true });
        if (next) {
            const storeMap = watchStores || {};
            const currentStore = storeMap[storeUid];
            const existing = assignments.find((a) => a.store_uid === storeUid);
            const masterPrice = product ? Number(product.harga_jual ?? product.harga) : 0;

            if (currentStore?.harga_jual == null) {
                const initialPrice = existing?.harga_jual != null
                    ? Number(existing.harga_jual)
                    : (globalValues.global_harga_jual ?? masterPrice);
                setValue(`stores.${storeUid}.harga_jual`, initialPrice, { shouldDirty: true });
            }
            if (!currentStore?.is_grosir && (existing?.is_grosir || globalValues.global_is_grosir)) {
                setValue(`stores.${storeUid}.is_grosir`, true, { shouldDirty: true });
                if (currentStore?.harga_grosir == null) {
                    setValue(`stores.${storeUid}.harga_grosir`, existing?.harga_grosir ?? globalValues.global_harga_grosir, { shouldDirty: true });
                }
                if (currentStore?.min_qty_grosir == null) {
                    setValue(`stores.${storeUid}.min_qty_grosir`, existing?.min_qty_grosir ?? globalValues.global_min_qty_grosir, { shouldDirty: true });
                }
            }
        }
    };

    const onSubmit = (data: CatalogAssignFormValues) => {
        if (!product) return;

        const selectedStores = stores.filter((s) => data.stores[s.uid]?.checked);
        if (selectedStores.length === 0) {
            toast.warning("Pilih minimal satu toko untuk didistribusikan.");
            return;
        }

        const masterPrice = Number(product.harga_jual ?? product.harga);
        const globalPrice = data.global_harga_jual != null ? Number(data.global_harga_jual) : null;
        const globalIsGrosir = Boolean(data.global_is_grosir);
        const globalHargaGrosir = data.global_harga_grosir ? Number(data.global_harga_grosir) : null;
        const globalMinQty = data.global_min_qty_grosir ? Number(data.global_min_qty_grosir) : null;

        const payloadAssignments: BulkAssignmentItem[] = selectedStores.map((s) => {
            const storeData = data.stores[s.uid];
            const isCustom = storeData?.is_custom;

            let finalHargaJual = masterPrice;
            if (isCustom && storeData?.harga_jual != null) {
                finalHargaJual = Number(storeData.harga_jual);
            } else if (globalPrice != null) {
                finalHargaJual = globalPrice;
            }

            let finalIsGrosir = globalIsGrosir;
            let finalHargaGrosir = globalHargaGrosir;
            let finalMinQty = globalMinQty;

            if (isCustom) {
                finalIsGrosir = Boolean(storeData?.is_grosir);
                if (finalIsGrosir) {
                    finalHargaGrosir = storeData?.harga_grosir ? Number(storeData.harga_grosir) : null;
                    finalMinQty = storeData?.min_qty_grosir ? Number(storeData.min_qty_grosir) : null;
                } else {
                    finalHargaGrosir = null;
                    finalMinQty = null;
                }
            }

            // Ensure wholesale integrity (if disabled or incomplete, send null & false)
            if (!finalIsGrosir || finalHargaGrosir == null || finalMinQty == null || finalMinQty <= 0) {
                finalIsGrosir = false;
                finalHargaGrosir = null;
                finalMinQty = null;
            }

            return {
                store_uid: s.uid,
                harga_jual: finalHargaJual,
                is_grosir: finalIsGrosir,
                harga_grosir: finalHargaGrosir,
                min_qty_grosir: finalMinQty,
            };
        });

        bulkAssign.mutate(
            { productUid: product.uid, payload: { assignments: payloadAssignments } },
            {
                onSuccess: () => {
                    toast.success(
                        `Produk master berhasil didistribusikan ke ${payloadAssignments.length} toko.`
                    );
                    onOpenChange(false);
                },
                onError: (err) => {
                    toast.error(err.message || "Gagal menyimpan distribusi produk.");
                },
            }
        );
    };

    const masterPrice = product ? (product.harga_jual ?? product.harga) : 0;

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
                        <span className="text-base font-extrabold text-slate-900">
                            Distribusi Produk ke Toko
                        </span>
                        <span className="text-xs font-medium text-slate-400">
                            Atur ketersediaan toko, harga jual cabang, serta skema harga grosir
                        </span>
                    </div>
                </div>
            }
            className="!max-w-4xl w-full h-[88vh] max-h-[88vh] flex flex-col"
            scrollable={false}
        >
            <FormProvider {...methods}>
                <form id="catalog-assign-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0 justify-between gap-4 pt-3">
                    {/* ── Scrollable Body Area ────────────────────────────────────── */}
                    <Scrollable className="flex-1 min-h-0" scrollbarClassName="z-40">
                        <div className="flex flex-col gap-5 py-1 pr-3 pb-3">
                            {/* ── Product Summary Banner ─────────────────────────────────── */}
                            {product && <CatalogAssignProductSummary product={product} />}

                            {/* ── Global Pricing & Wholesale Preset Card ─────────────────── */}
                            {product && <CatalogAssignGlobalPreset product={product} />}

                            {/* ── Stores List Header & Search ────────────────────────────── */}
                            <div className="flex flex-col gap-3.5">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-1">
                                    <div className="flex items-center gap-2.5">
                                        <button
                                            type="button"
                                            onClick={toggleAll}
                                            className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all shrink-0 cursor-pointer ${
                                                allChecked
                                                    ? "bg-emerald-600 border-emerald-600 text-white shadow-xs"
                                                    : someChecked
                                                        ? "bg-emerald-100 border-emerald-400 text-emerald-700"
                                                        : "bg-white border-slate-300 hover:border-emerald-500"
                                            }`}
                                            title={allChecked ? "Batalkan semua" : "Pilih semua toko"}
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

                                    {/* Store Search */}
                                    <div className="relative w-full sm:w-64">
                                        <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <Input
                                            value={storeSearch}
                                            onChange={(e) => setStoreSearch(e.target.value)}
                                            placeholder="Cari nama toko cabang..."
                                            className="h-8.5 pl-8 pr-7 text-xs rounded-xl border-slate-200 bg-white"
                                        />
                                        {storeSearch && (
                                            <button
                                                type="button"
                                                onClick={() => setStoreSearch("")}
                                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                                            >
                                                <IconX size={13} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* ── Stores Row Cards ───────────────────────────────────────── */}
                                <div className="flex flex-col gap-3">
                                    {isLoading ? (
                                        <div className="py-16 flex flex-col items-center justify-center gap-2 text-slate-400 border border-slate-100 rounded-2xl bg-slate-50/50">
                                            <IconLoader2 size={24} className="animate-spin text-emerald-600" />
                                            <span className="text-xs font-semibold">Memuat penugasan toko...</span>
                                        </div>
                                    ) : filteredStoreEntries.length === 0 ? (
                                        <div className="py-12 text-center text-xs text-slate-400 font-medium border border-dashed border-slate-200 rounded-2xl">
                                            {storeSearch ? "Tidak ada toko yang sesuai pencarian." : "Tidak ada data toko."}
                                        </div>
                                    ) : (
                                        filteredStoreEntries.map(({ store, formState, currentAssignment }) => (
                                            <CatalogAssignStoreRow
                                                key={store.uid}
                                                store={store}
                                                formState={formState}
                                                currentAssignment={currentAssignment}
                                                globalValues={globalValues}
                                                masterPrice={masterPrice}
                                                onToggleChecked={toggleRow}
                                                onToggleCustom={toggleCustomPrice}
                                            />
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </Scrollable>

                    {/* ── Sticky / Fixed Footer Actions (Always Visible) ─────────── */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3.5 border-t border-slate-100 shrink-0 bg-white">
                        <span className="text-xs font-semibold text-slate-500">
                            {selectedCount > 0
                                ? `${selectedCount} toko akan diperbarui dengan data harga & grosir.`
                                : "Pilih minimal 1 toko untuk melanjutkan."}
                        </span>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={bulkAssign.isPending}
                                className="h-10 px-4 text-xs font-bold rounded-xl border-slate-200 cursor-pointer"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                form="catalog-assign-form"
                                disabled={bulkAssign.isPending || selectedCount === 0}
                                className="h-10 px-5 text-xs font-bold rounded-xl gap-2 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-md shadow-emerald-600/10"
                            >
                                {bulkAssign.isPending ? (
                                    <>
                                        <IconLoader2 size={16} className="animate-spin" />
                                        <span>Menyimpan Distribusi...</span>
                                    </>
                                ) : (
                                    <>
                                        <IconCheck size={16} />
                                        <span>Simpan ke {selectedCount} Toko</span>
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
