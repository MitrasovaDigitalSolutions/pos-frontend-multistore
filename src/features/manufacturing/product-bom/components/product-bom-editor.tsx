"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FormProvider, useFieldArray, useForm, useWatch, type FieldPath, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { FormNumberInput } from "@/components/forms/form-number-input";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import type { CommandOption } from "@/components/ui/command-select";
import { BarcodeInput } from "@/components/shared/barcode-input";
import {
    IconAlertTriangle,
    IconArrowLeft,
    IconCheck,
    IconCopy,
    IconDeviceFloppy,
    IconLoader2,
    IconPackage,
    IconSparkles,
    IconTrash,
} from "@tabler/icons-react";
import type { Product } from "@/features/master/products/types";
import { useBomComponentTypes } from "../../bom-component-types/api/bom-component-types-api";
import { useProductBoms, useSaveProductBoms } from "../api/product-bom-api";
import {
    productBomBatchSchema,
    type ProductBomBatchInput,
} from "../schemas/product-bom-schema";
import { CopyBomDialog } from "./copy-bom-dialog";
import { BomEditorFloatingBar } from "./bom-editor-floating-bar";

interface ProductBomEditorProps {
    product: Product;
    onBack?: () => void;
}

export function ProductBomEditor({ product, onBack }: ProductBomEditorProps) {
    const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);
    const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false);
    const [scannedMaterialsMap, setScannedMaterialsMap] = useState<Record<string, Product>>({});
    const barcodeInputRef = useRef<HTMLInputElement>(null);

    const { data: bomRes, isLoading: isBomLoading, refetch } = useProductBoms(product.uid);
    const { data: componentTypesRes } = useBomComponentTypes({ all: true });
    const componentTypes = useMemo(() => componentTypesRes?.data || [], [componentTypesRes]);

    const componentTypeOptions = useMemo<CommandOption[]>(() => {
        return componentTypes.map((c) => ({
            value: c.uid,
            label: c.nama,
            description: c.is_main_driver ? "Bahan Baku Utama (Primary)" : "Bahan Pendukung (Supporting)",
        }));
    }, [componentTypes]);

    const saveMutation = useSaveProductBoms();

    const methods = useForm<ProductBomBatchInput>({
        resolver: zodResolver(productBomBatchSchema) as Resolver<ProductBomBatchInput>,
        defaultValues: {
            boms: [],
        },
    });

    const { control, handleSubmit, setValue, reset } = methods;

    const bomsArray = useFieldArray({
        control,
        name: "boms",
    });

    const watchedBomsRaw = useWatch({ control, name: "boms" });
    const watchedBoms = useMemo(() => watchedBomsRaw || [], [watchedBomsRaw]);

    const { utamaCount, pendukungCount } = useMemo(() => {
        let utama = 0;
        let pendukung = 0;
        for (const b of watchedBoms) {
            const type = componentTypes.find(
                (c) => c.uid === b.component_type_uid || c.kode === b.tipe_komponen
            );
            if (type?.is_main_driver) {
                utama++;
            } else {
                pendukung++;
            }
        }
        return { utamaCount: utama, pendukungCount: pendukung };
    }, [watchedBoms, componentTypes]);

    const rawMaterialsMap = useMemo(() => {
        const map: Record<string, Product> = { ...scannedMaterialsMap };
        if (bomRes?.data?.boms) {
            for (const b of bomRes.data.boms) {
                if (b.material_product) {
                    map[b.material_product_uid] = b.material_product;
                }
            }
        }
        return map;
    }, [scannedMaterialsMap, bomRes]);

    // Derive initial/last saved rows from server data
    const savedRows = useMemo<ProductBomBatchInput["boms"]>(() => {
        if (!bomRes?.data?.boms) return [];
        return bomRes.data.boms.map((b) => {
            const matchType = componentTypes.find(
                (c) => c.uid === b.component_type_uid || c.kode === b.tipe_komponen
            );
            return {
                material_product_uid: b.material_product_uid,
                component_type_uid: matchType?.uid || b.component_type_uid || null,
                kuantitas_standar: Number(b.kuantitas_standar) || 0.1,
                tipe_komponen: matchType?.kode || b.tipe_komponen || "",
                toleransi_waste_pct: Number(b.toleransi_waste_pct) || 0,
                catatan: b.catatan || "",
            };
        });
    }, [bomRes, componentTypes]);

    const initialBomsSnapshot = useMemo(() => {
        return JSON.stringify(
            savedRows.map((r) => ({
                uid: r.material_product_uid,
                type: r.component_type_uid,
                qty: Number(r.kuantitas_standar),
                waste: Number(r.toleransi_waste_pct),
                note: r.catatan,
            }))
        );
    }, [savedRows]);

    // Populate form with existing BoM rows when loaded
    useEffect(() => {
        if (bomRes?.data) {
            reset({ boms: savedRows });
        }
    }, [bomRes, savedRows, reset]);

    // Unsaved changes detection based on comparison with initial snapshot
    const hasUnsavedChanges = useMemo(() => {
        if (isBomLoading) return false;
        const currentSnapshot = JSON.stringify(
            watchedBoms.map((b) => ({
                uid: b.material_product_uid,
                type: b.component_type_uid || null,
                qty: Number(b.kuantitas_standar) || 0,
                waste: Number(b.toleransi_waste_pct) || 0,
                note: b.catatan || "",
            }))
        );
        return currentSnapshot !== initialBomsSnapshot;
    }, [watchedBoms, isBomLoading, initialBomsSnapshot]);

    // Browser beforeunload warning
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = "";
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [hasUnsavedChanges]);

    const handleRawMaterialFound = (material: Product) => {
        setScannedMaterialsMap((prev) => ({ ...prev, [material.uid]: material }));

        const existingIdx = watchedBoms.findIndex(
            (item) => item.material_product_uid === material.uid
        );

        if (existingIdx > -1) {
            toast.info(`Bahan "${material.nama}" sudah ada di dalam daftar resep.`);
        } else {
            // Default component type: kosong (null) agar user memilih sendiri
            bomsArray.append({
                material_product_uid: material.uid,
                component_type_uid: null,
                kuantitas_standar: 1,
                tipe_komponen: "",
                toleransi_waste_pct: 0,
                catatan: "",
            });
            toast.success(`Bahan baku "${material.nama}" ditambahkan ke resep.`);
        }
    };

    const onSubmit = (data: ProductBomBatchInput) => {
        saveMutation.mutate(
            {
                productUid: product.uid,
                data: {
                    boms: data.boms.map((b) => ({
                        material_product_uid: b.material_product_uid,
                        component_type_uid: b.component_type_uid || null,
                        kuantitas_standar: Number(b.kuantitas_standar) || 1,
                        tipe_komponen: b.tipe_komponen || null,
                        toleransi_waste_pct: Number(b.toleransi_waste_pct) || 0,
                        catatan: b.catatan || null,
                    })),
                },
            },
            {
                onSuccess: (res) => {
                    toast.success(res.message || "Resep BoM berhasil disimpan.");
                    reset(data);
                    refetch();
                },
                onError: (err) => {
                    toast.error(err.message || "Gagal menyimpan resep BoM.");
                },
            }
        );
    };

    // Reset list to last saved state
    const handleResetToLastSaved = () => {
        reset({ boms: savedRows });
        toast.info("Perubahan dibatalkan. Resep bahan baku dikembalikan ke kondisi terakhir disimpan.");
    };

    // Navigation back handlers with unsaved changes protection
    const handleBackClick = () => {
        if (hasUnsavedChanges) {
            setIsExitConfirmOpen(true);
        } else {
            onBack?.();
        }
    };

    const handleConfirmDiscard = () => {
        setIsExitConfirmOpen(false);
        onBack?.();
    };

    const handleSaveAndExit = () => {
        handleSubmit((data) => {
            saveMutation.mutate(
                {
                    productUid: product.uid,
                    data: {
                        boms: data.boms.map((b) => ({
                            material_product_uid: b.material_product_uid,
                            component_type_uid: b.component_type_uid || null,
                            kuantitas_standar: Number(b.kuantitas_standar) || 1,
                            tipe_komponen: b.tipe_komponen || null,
                            toleransi_waste_pct: Number(b.toleransi_waste_pct) || 0,
                            catatan: b.catatan || null,
                        })),
                    },
                },
                {
                    onSuccess: () => {
                        toast.success("Resep BoM berhasil disimpan.");
                        setIsExitConfirmOpen(false);
                        onBack?.();
                    },
                    onError: (err) => {
                        toast.error(err.message || "Gagal menyimpan resep BoM.");
                    },
                }
            );
        })();
    };

    return (
        <FormProvider {...methods}>
            <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 sm:p-6 space-y-4">
                {/* Header Terpadu */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3 min-w-0">
                        {onBack && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleBackClick}
                                className="h-9 w-9 p-0 rounded-xl text-slate-600 hover:bg-slate-100 shrink-0 cursor-pointer"
                                title="Kembali ke Daftar Produk BoM"
                            >
                                <IconArrowLeft size={18} />
                            </Button>
                        )}
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/80 shrink-0">
                            <IconPackage size={22} />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-sm font-bold text-slate-900 leading-tight">
                                    Resep BoM: {product.nama}
                                </h3>
                                {product.category && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-slate-100 text-slate-600">
                                        {product.category.nama}
                                    </span>
                                )}
                                {hasUnsavedChanges ? (
                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                                        </span>
                                        Belum Disimpan
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                                        <IconCheck size={11} className="text-emerald-600" />
                                        Tersimpan
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                                <span className="font-mono">Barcode: {product.barcode || "-"}</span>
                                {(product.unit?.simbol || product.satuan) && (
                                    <>
                                        <span>•</span>
                                        <span>Satuan: {product.unit?.simbol || product.satuan}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Header Actions: Hanya Tombol Salin dari Produk Lain */}
                    <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setIsCopyDialogOpen(true)}
                            className="h-9 px-3.5 text-xs font-semibold text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
                            title="Salin resep BoM dari produk barang jadi lain"
                        >
                            <IconCopy size={15} className="text-emerald-600 dark:text-emerald-400" />
                            <span>Salin dari Produk Lain</span>
                        </Button>
                    </div>
                </div>

                {/* Input Barcode Bahan Baku - Full Width */}
                <div className="w-full">
                    <BarcodeInput
                        ref={barcodeInputRef}
                        refocusOnFound={false}
                        isRawMaterial={true}
                        isJasa={false}
                        onProductFound={handleRawMaterialFound}
                        placeholder="Scan barcode SKU atau cari nama bahan baku untuk ditambahkan ke resep..."
                    />
                </div>

                {/* Info Bar Komposisi Bahan Baku */}
                <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 px-0.5 pt-0.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                        <span>Komposisi Bahan Baku (BoM Lines)</span>
                        <span className="text-[11px] font-medium text-slate-400">
                            ({bomsArray.fields.length} baris bahan)
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge variant="outline" className="text-[10px] px-2 py-0.5 font-bold bg-slate-50 text-slate-700 border-slate-200">
                            {bomsArray.fields.length} Bahan Terdaftar
                        </Badge>
                        {utamaCount > 0 && (
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200/90 text-[10px] font-semibold flex items-center gap-1 py-0.5 px-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span>{utamaCount} Utama</span>
                            </Badge>
                        )}
                        {pendukungCount > 0 && (
                            <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200/90 text-[10px] font-semibold flex items-center gap-1 py-0.5 px-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                                <span>{pendukungCount} Pendukung</span>
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Tabel Bahan Baku Resep */}
                <div className="border border-slate-200/80 rounded-xl overflow-hidden">
                    {isBomLoading ? (
                        <div className="p-10 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                            <IconLoader2 size={16} className="animate-spin text-emerald-600" />
                            <span>Memuat data resep BoM...</span>
                        </div>
                    ) : bomsArray.fields.length === 0 ? (
                        <div className="p-8 text-center space-y-1.5 bg-slate-50/50">
                            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                                <IconSparkles size={16} />
                            </div>
                            <p className="text-xs font-bold text-slate-800">
                                Belum ada resep BoM untuk produk ini
                            </p>
                            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                                Scan atau cari bahan baku pada input di atas, atau klik tombol <strong>Salin dari Produk Lain</strong> untuk menduplikasi resep yang sudah ada.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto w-full">
                            <table className="w-full text-left text-xs border-collapse min-w-[720px]">
                                <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                    <tr>
                                        <th className="py-2.5 px-3 min-w-[190px]">Bahan Baku</th>
                                        <th className="py-2.5 px-3 w-56 min-w-[200px]">Tipe Komponen</th>
                                        <th className="py-2.5 px-3 text-right w-36 min-w-[120px]">Kuantitas Standar</th>
                                        <th className="py-2.5 px-3 text-right w-28 min-w-[95px]">Toleransi Waste (%)</th>
                                        <th className="py-2.5 px-3 min-w-[150px]">Catatan</th>
                                        <th className="py-2.5 px-3 text-center w-12">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {bomsArray.fields.map((field, idx) => {
                                        const item = watchedBoms[idx];
                                        const matProd = rawMaterialsMap[item?.material_product_uid];

                                        return (
                                            <tr key={field.id} className="hover:bg-slate-50/50">
                                                {/* Bahan Baku Info */}
                                                <td className="py-2.5 px-3">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-900 text-xs">
                                                            {matProd?.nama || "Material"}
                                                        </span>
                                                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                                                            <span>{matProd?.barcode || "-"}</span>
                                                            <span>•</span>
                                                            <span className="text-slate-500">Stok: {matProd?.stok ?? 0}{matProd?.satuan ? ` ${matProd.satuan}` : ""}</span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Tipe Komponen Selector (Reusable FormSelect) */}
                                                <td className="py-1.5 px-3">
                                                    <FormSelect<ProductBomBatchInput>
                                                        name={`boms.${idx}.component_type_uid` as FieldPath<ProductBomBatchInput>}
                                                        options={componentTypeOptions}
                                                        placeholder="Pilih Tipe..."
                                                        searchPlaceholder="Cari tipe komponen..."
                                                        emptyMessage="Tipe tidak ditemukan"
                                                        size="sm"
                                                        className="h-8 text-xs bg-white border-slate-200"
                                                        wrapperClassName="w-full space-y-0"
                                                        onChange={(val) => {
                                                            const chosen = componentTypes.find((c) => c.uid === val);
                                                            setValue(`boms.${idx}.tipe_komponen`, chosen?.kode || "kain_utama", { shouldValidate: true });
                                                        }}
                                                    />
                                                </td>

                                                {/* Kuantitas Standar */}
                                                <td className="py-1.5 px-3">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <FormNumberInput<ProductBomBatchInput>
                                                            name={`boms.${idx}.kuantitas_standar` as FieldPath<ProductBomBatchInput>}
                                                            placeholder="0.0"
                                                            allowDecimal={true}
                                                            className="h-8 text-xs font-mono font-bold text-right w-24 bg-white"
                                                        />
                                                        {matProd?.satuan && (
                                                            <span className="text-[10px] text-slate-400 font-mono shrink-0">
                                                                {matProd.satuan}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Toleransi Waste % */}
                                                <td className="py-1.5 px-3">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <FormNumberInput<ProductBomBatchInput>
                                                            name={`boms.${idx}.toleransi_waste_pct` as FieldPath<ProductBomBatchInput>}
                                                            placeholder="0"
                                                            allowDecimal={true}
                                                            className="h-8 text-xs font-mono text-right w-16 bg-white"
                                                        />
                                                        <span className="text-[10px] text-slate-400 font-mono">%</span>
                                                    </div>
                                                </td>

                                                {/* Catatan */}
                                                <td className="py-1.5 px-3">
                                                    <FormInput<ProductBomBatchInput>
                                                        name={`boms.${idx}.catatan` as FieldPath<ProductBomBatchInput>}
                                                        placeholder="cth: Pola badan / kerah"
                                                        className="h-8 text-xs bg-white"
                                                    />
                                                </td>

                                                {/* Delete Button */}
                                                <td className="py-1.5 px-3 text-center">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => bomsArray.remove(idx)}
                                                        className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer mx-auto"
                                                        title="Hapus baris bahan"
                                                    >
                                                        <IconTrash size={14} />
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Floating Bulk-Style Action Bar (Satu-Satunya Tombol Simpan & Navigasi) */}
                <BomEditorFloatingBar
                    itemCount={bomsArray.fields.length}
                    utamaCount={utamaCount}
                    pendukungCount={pendukungCount}
                    hasUnsavedChanges={hasUnsavedChanges}
                    isSubmitting={saveMutation.isPending}
                    disabled={isBomLoading}
                    onSubmit={handleSubmit(onSubmit)}
                    onCancel={handleResetToLastSaved}
                />

                {/* Copy BoM Dialog */}
                <CopyBomDialog
                    open={isCopyDialogOpen}
                    onOpenChange={setIsCopyDialogOpen}
                    targetProduct={product}
                    onSuccess={() => refetch()}
                />

                {/* Konfirmasi Keluar dengan Perubahan Belum Disimpan */}
                <Dialog open={isExitConfirmOpen} onOpenChange={setIsExitConfirmOpen}>
                    <DialogContent
                        className="max-w-md bg-white rounded-2xl p-6 gap-0 border-slate-100 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100"
                        showCloseButton={false}
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-full border border-amber-200 bg-amber-50 text-amber-600 flex items-center justify-center mb-3.5">
                                <IconAlertTriangle size={24} stroke={2} />
                            </div>

                            <DialogHeader className="gap-1.5 mb-2">
                                <DialogTitle className="text-base font-bold text-slate-900">
                                    Perubahan Belum Disimpan
                                </DialogTitle>
                                <DialogDescription className="text-xs text-slate-500 leading-relaxed max-w-sm">
                                    Terdapat penambahan atau perubahan komposisi bahan baku pada resep BoM ini yang <strong>belum disimpan</strong>. Jika Anda kembali sekarang, perubahan tersebut akan hilang.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="flex flex-col sm:flex-row items-center justify-end gap-2 w-full mt-6 pt-3 border-t border-slate-100">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsExitConfirmOpen(false)}
                                    className="w-full sm:w-auto h-9 px-3.5 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleConfirmDiscard}
                                    className="w-full sm:w-auto h-9 px-3.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-xl cursor-pointer"
                                >
                                    Buang & Keluar
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    disabled={saveMutation.isPending}
                                    onClick={handleSaveAndExit}
                                    className="w-full sm:w-auto h-9 px-4 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm shadow-emerald-600/20 flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 transition-all"
                                >
                                    {saveMutation.isPending ? (
                                        <IconLoader2 size={14} className="animate-spin" />
                                    ) : (
                                        <IconDeviceFloppy size={14} />
                                    )}
                                    <span>Simpan & Keluar</span>
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </section>
        </FormProvider>
    );
}
