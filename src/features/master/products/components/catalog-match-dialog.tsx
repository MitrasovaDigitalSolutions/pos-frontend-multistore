"use client";

import { FormNominalInput } from "@/components/forms/form-nominal-input";
import { FormNumberInput } from "@/components/forms/form-number-input";
import { Badge } from "@/components/ui/badge";
import { BaseDialog } from "@/components/ui/base-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStores } from "@/features/stores/api/stores-api";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { useActiveStoreStore } from "@/stores/active-store-store";
import {
    IconAlertCircle,
    IconArrowLeft,
    IconCheck,
    IconInfoCircle,
    IconLoader2,
    IconPackage,
    IconPlus,
    IconSearch,
    IconSparkles,
    IconTrendingUp,
} from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { useAssignProductStore } from "../api/product-store-api";
import { useCatalogMatch, type CatalogMatchItem } from "../api/products-api";

interface CatalogMatchDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelectNewProduct: (nama: string) => void;
}

interface AssignCatalogFormValues {
    store_uid: string;
    harga_jual: number | null;
    harga_beli: number | null;
    stok: number;
    margin: number | null;
    status: "active" | "inactive";
}

export function CatalogMatchDialog({
    open,
    onOpenChange,
    onSelectNewProduct,
}: CatalogMatchDialogProps) {
    const activeStoreUid = useActiveStoreStore((s) => s.activeStoreUid);
    const { data: storesRes } = useStores({ per_page: 1000 });
    const stores = useMemo(() => storesRes?.data ?? [], [storesRes?.data]);

    const assignMutation = useAssignProductStore();

    const [step, setStep] = useState<"search" | "assign">("search");
    const [namaInput, setNamaInput] = useState("");
    const [debouncedNama, setDebouncedNama] = useState("");
    const [selectedItem, setSelectedItem] = useState<CatalogMatchItem | null>(null);

    // Debounce search input by 400ms
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedNama(namaInput.trim());
        }, 400);
        return () => clearTimeout(timer);
    }, [namaInput]);

    // Query catalog match
    const { data: matchData, isLoading: isMatching, isFetching } = useCatalogMatch(
        debouncedNama,
        { enabled: open && debouncedNama.length >= 1 }
    );

    const matches = matchData?.matches || [];

    // Reset state when modal opens/closes
    useEffect(() => {
        if (!open) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setStep("search");
            setNamaInput("");
            setDebouncedNama("");
            setSelectedItem(null);
        }
    }, [open]);

    const assignMethods = useForm<AssignCatalogFormValues>({
        defaultValues: {
            store_uid: activeStoreUid || "",
            harga_jual: null,
            harga_beli: null,
            stok: 0,
            margin: null,
            status: "active",
        },
    });

    const { handleSubmit, reset, control, setValue } = assignMethods;

    // Automatically select active store if available
    useEffect(() => {
        if (open && activeStoreUid) {
            setValue("store_uid", activeStoreUid);
        } else if (open && stores.length > 0) {
            setValue("store_uid", stores[0].uid);
        }
    }, [open, activeStoreUid, stores, setValue]);

    // Auto calculate margin on harga_beli / harga_jual / margin change using useWatch
    const watchHargaBeli = useWatch({ control, name: "harga_beli" });
    const watchHargaJual = useWatch({ control, name: "harga_jual" });
    const watchMargin = useWatch({ control, name: "margin" });

    useEffect(() => {
        const activeId = document.activeElement?.id;
        if (activeId === "harga_beli" || activeId === "harga_jual") {
            const hBeli = Number(watchHargaBeli) || 0;
            const hJual = Number(watchHargaJual) || 0;
            if (hBeli > 0) {
                const calculatedMargin = ((hJual - hBeli) / hBeli) * 100;
                setValue("margin", parseFloat(calculatedMargin.toFixed(2)));
            } else {
                setValue("margin", 0);
            }
        }
    }, [watchHargaBeli, watchHargaJual, setValue]);

    useEffect(() => {
        const activeId = document.activeElement?.id;
        if (activeId === "margin") {
            const hBeli = Number(watchHargaBeli) || 0;
            const mrg = Number(watchMargin) || 0;
            const calculatedHarga = hBeli * (1 + mrg / 100);
            setValue("harga_jual", Math.round(calculatedHarga));
        }
    }, [watchMargin, watchHargaBeli, setValue]);

    const handleSelectMatch = (item: CatalogMatchItem) => {
        setSelectedItem(item);
        const defaultBeli = item.harga_beli ?? null;
        const defaultJual = item.harga_jual ?? null;
        let initialMargin: number | null = null;
        if (defaultBeli && defaultJual && defaultBeli > 0) {
            initialMargin = parseFloat((((defaultJual - defaultBeli) / defaultBeli) * 100).toFixed(2));
        }

        reset({
            store_uid: activeStoreUid || stores[0]?.uid || "",
            harga_jual: defaultJual,
            harga_beli: defaultBeli,
            stok: 0,
            margin: initialMargin,
            status: "active",
        });
        setStep("assign");
    };

    const handleConfirmAssign = (data: AssignCatalogFormValues) => {
        if (!selectedItem) return;

        const targetStoreUid = activeStoreUid || data.store_uid;
        if (!targetStoreUid) {
            toast.error("Toko aktif tidak ditemukan. Silakan pilih toko aktif terlebih dahulu.");
            return;
        }

        if (data.harga_jual == null || data.harga_jual <= 0) {
            toast.error("Harga jual wajib diisi dan harus lebih dari 0.");
            return;
        }

        assignMutation.mutate(
            {
                productUid: selectedItem.uid,
                store_uid: targetStoreUid,
                harga_jual: data.harga_jual,
                harga_beli: data.harga_beli ?? undefined,
                stok: 0,
                margin: data.margin ?? undefined,
                status: data.status,
            },
            {
                onSuccess: () => {
                    toast.success(`Produk "${selectedItem.nama}" berhasil ditambahkan ke toko!`);
                    onOpenChange(false);
                },
                onError: (err) => {
                    toast.error(err.message || "Gagal menambahkan produk ke toko.");
                },
            }
        );
    };

    const handleProceedToCreateManual = () => {
        onOpenChange(false);
        onSelectNewProduct(namaInput.trim());
    };

    const profitPerUnit = (Number(watchHargaJual) || 0) - (Number(watchHargaBeli) || 0);

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={
                step === "assign" ? (
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setStep("search")}
                            className="h-8 w-8 p-0 rounded-lg text-slate-500 hover:text-slate-900 cursor-pointer"
                        >
                            <IconArrowLeft size={18} />
                        </Button>
                        <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                            <IconSparkles size={18} />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-slate-900 leading-tight">Atur Harga &amp; Tambahkan ke Toko</h4>
                            <p className="text-[11px] text-slate-400 font-medium">Penugasan produk dari Katalog Master ke Cabang</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                            <IconSparkles size={20} />
                        </div>
                        <span>Tambah Produk (Pencarian Katalog)</span>
                    </div>
                )
            }
            className="sm:max-w-lg"
        >

            {step === "search" ? (
                <div className="space-y-4 py-2">
                    {/* Input nama produk */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">
                            Nama Produk yang Ingin Ditambahkan
                        </label>
                        <div className="relative">
                            <Input
                                type="text"
                                value={namaInput}
                                onChange={(e) => setNamaInput(e.target.value)}
                                placeholder="Contoh: Indomie Goreng Spesial..."
                                className="h-10 text-xs pl-9 pr-9 rounded-xl border-slate-200 focus-visible:ring-emerald-600"
                                autoFocus
                            />
                            <IconSearch
                                size={16}
                                className="absolute left-3 top-3 text-slate-400"
                            />
                            {(isMatching || isFetching) && (
                                <IconLoader2
                                    size={16}
                                    className="absolute right-3 top-3 text-emerald-600 animate-spin"
                                />
                            )}
                        </div>
                        <p className="text-[11px] text-slate-400">
                            Sistem akan mengecek ketersediaan produk di Katalog Master secara otomatis.
                        </p>
                    </div>

                    {/* Hasil Katalog Match */}
                    <div className="space-y-2">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            Saran Produk Katalog
                        </span>

                        {debouncedNama.length === 0 ? (
                            <div className="p-6 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                                <IconPackage size={28} className="mx-auto text-slate-300 mb-1.5" />
                                <p className="text-xs font-medium text-slate-500">
                                    Ketikkan nama produk di atas untuk mencari kecocokan katalog.
                                </p>
                            </div>
                        ) : isMatching ? (
                            <div className="p-6 text-center border border-slate-100 rounded-2xl bg-slate-50/50 space-y-2">
                                <IconLoader2 size={24} className="mx-auto text-emerald-600 animate-spin" />
                                <p className="text-xs font-medium text-slate-500">
                                    Mengecek katalog master...
                                </p>
                            </div>
                        ) : matches.length > 0 ? (
                            <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 bg-white">
                                {matches.map((item) => (
                                    <div
                                        key={item.uid}
                                        className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                                    >
                                        <div className="flex-1 min-w-0 space-y-0.5">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-bold text-xs text-slate-900 truncate">
                                                    {item.nama}
                                                </span>
                                                <Badge className="text-[9px] px-1.5 py-0 bg-indigo-50 text-indigo-700 border-indigo-200 font-bold shrink-0">
                                                    {Math.round(item.similarity * 100)}% Match Katalog
                                                </Badge>
                                            </div>
                                            <p className="text-[11px] text-slate-400 font-mono">
                                                SKU: {item.barcode || "—"}
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={() => handleSelectMatch(item)}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-8 px-3 rounded-lg shrink-0 gap-1 cursor-pointer"
                                        >
                                            <IconCheck size={14} /> Pilih
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-5 border border-amber-200 bg-amber-50/60 rounded-2xl flex items-start gap-3">
                                <IconAlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-amber-900">
                                        Tidak ditemukan produk katalog yang cocok
                                    </p>
                                    <p className="text-[11px] text-amber-700 leading-relaxed">
                                        Belum ada produk master &quot;{debouncedNama}&quot; yang serupa di katalog. Anda dapat membuatnya sebagai produk baru secara manual.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Direct option to create new product manually */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-400">
                            Tidak ada saran yang sesuai?
                        </span>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleProceedToCreateManual}
                            className="h-9 px-3.5 text-xs font-bold text-slate-700 border-slate-200 rounded-xl gap-1.5 hover:bg-slate-100 cursor-pointer"
                        >
                            <IconPlus size={15} />
                            Ajukan Penambahan Produk Baru
                        </Button>
                    </div>
                </div>
            ) : (
                <FormProvider {...assignMethods}>
                    <form
                        onSubmit={handleSubmit(handleConfirmAssign)}
                        className="space-y-5 py-1"
                    >
                        {/* Catalog Match Summary Card (Restyled) */}
                        {selectedItem && (
                            <div className="bg-indigo-50/40 border border-indigo-100 rounded-2xl p-4 space-y-3">
                                <div className="flex items-start gap-3.5">
                                    <div className="w-12 h-12 rounded-2xl bg-white border border-indigo-100 flex items-center justify-center text-indigo-500 shrink-0 shadow-xs">
                                        <IconPackage size={24} />
                                    </div>
                                    <div className="flex-1 min-w-0 space-y-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-bold text-sm text-slate-900 leading-tight truncate">
                                                {selectedItem.nama}
                                            </span>
                                            <Badge className="text-[9px] px-2 py-0.5 bg-indigo-100 text-indigo-800 border-indigo-200 font-extrabold">
                                                {Math.round(selectedItem.similarity * 100)}% Match Katalog Master
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium flex-wrap">
                                            <span>Barcode / SKU: <strong className="text-slate-700 font-semibold">{selectedItem.barcode || "—"}</strong></span>
                                            {selectedItem.category && <span>Kategori: <strong className="text-slate-700 font-semibold">{selectedItem.category}</strong></span>}
                                            {selectedItem.brand && <span>Brand: <strong className="text-slate-700 font-semibold">{selectedItem.brand}</strong></span>}
                                        </div>
                                    </div>
                                </div>

                                {/* Info Banner on Stock Management */}
                                <div className="p-2.5 bg-white/90 border border-indigo-100 rounded-xl text-[11px] text-indigo-900/80 flex items-center gap-2 font-medium">
                                    <IconInfoCircle size={16} className="text-indigo-500 shrink-0" />
                                    <span>Stok awal akan diset ke 0 Pcs. Tambahkan stok fisik via <strong>Penerimaan / Opname Stok</strong>.</span>
                                </div>
                            </div>
                        )}

                        {/* Financial Inputs in 3 Columns (Matching StoreProductEditDialog) */}
                        <div className="grid grid-cols-3 gap-3 items-start">
                            <div>
                                <FormNominalInput<AssignCatalogFormValues>
                                    name="harga_beli"
                                    label="Harga Beli (Rp)"
                                    placeholder="Contoh: 8.500"
                                />
                                {selectedItem?.harga_beli != null && (
                                    <p className="text-[10px] text-slate-500 mt-1">
                                        Katalog:{" "}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setValue("harga_beli", selectedItem.harga_beli!, { shouldDirty: true });
                                                const hJual = Number(watchHargaJual) || 0;
                                                if (selectedItem.harga_beli! > 0) {
                                                    setValue("margin", parseFloat((((hJual - selectedItem.harga_beli!) / selectedItem.harga_beli!) * 100).toFixed(2)), { shouldDirty: true });
                                                }
                                            }}
                                            className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                                            title="Klik untuk gunakan harga ini"
                                        >
                                            {formatRupiah(selectedItem.harga_beli)}
                                        </button>
                                    </p>
                                )}
                            </div>

                            <div>
                                <FormNominalInput<AssignCatalogFormValues>
                                    name="harga_jual"
                                    label="Harga Jual (Rp) *"
                                    placeholder="Contoh: 11.000"
                                />
                                {selectedItem?.harga_jual != null && (
                                    <p className="text-[10px] text-slate-500 mt-1">
                                        Katalog:{" "}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setValue("harga_jual", selectedItem.harga_jual!, { shouldDirty: true });
                                                const hBeli = Number(watchHargaBeli) || 0;
                                                if (hBeli > 0) {
                                                    setValue("margin", parseFloat((((selectedItem.harga_jual! - hBeli) / hBeli) * 100).toFixed(2)), { shouldDirty: true });
                                                }
                                            }}
                                            className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                                            title="Klik untuk gunakan harga ini"
                                        >
                                            {formatRupiah(selectedItem.harga_jual)}
                                        </button>
                                    </p>
                                )}
                            </div>

                            <FormNumberInput<AssignCatalogFormValues>
                                name="margin"
                                label="Margin (%)"
                                placeholder="Contoh: 20"
                            />
                        </div>

                        {/* Live Profit Preview Box */}
                        <div className="p-3 bg-emerald-50/70 border border-emerald-200/70 rounded-2xl flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                                <IconTrendingUp size={16} className="text-emerald-600 shrink-0" />
                                <span>Estimasi Keuntungan Bersih:</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-extrabold text-emerald-900 text-sm">
                                    {formatRupiah(profitPerUnit > 0 ? profitPerUnit : 0)}
                                </span>
                                <span className="text-[11px] text-emerald-700 font-bold bg-emerald-100/80 px-1.5 py-0.5 rounded-md">
                                    / unit ({watchMargin || 0}%)
                                </span>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setStep("search")}
                                className="h-9 px-4 text-xs font-bold rounded-xl border-slate-200"
                                disabled={assignMutation.isPending}
                            >
                                Kembali ke Pencarian
                            </Button>
                            <Button
                                type="submit"
                                disabled={assignMutation.isPending}
                                className="h-9 px-4 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 cursor-pointer"
                            >
                                {assignMutation.isPending ? (
                                    <>
                                        <IconLoader2 size={16} className="animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <IconCheck size={16} />
                                        Simpan ke Toko
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </FormProvider>
            )}
        </BaseDialog>
    );
}
