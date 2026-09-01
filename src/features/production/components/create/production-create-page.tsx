"use client";

import { useMemo } from "react";
import { useFieldArray, useForm, FormProvider, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormDatePicker } from "@/components/forms/form-date-picker";
import { FormInput } from "@/components/forms/form-input";
import { AccessDeniedState } from "@/components/ui/access-denied-state";
import type { CommandOption } from "@/components/ui/command-select";
import { hasPermission, hasRole } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { useAppRouter } from "@/hooks/use-app-router";
import { useSession } from "next-auth/react";
import { useProducts } from "@/features/master/products/api/products-api";
import {
    IconArrowLeft,
    IconAssembly,
    IconBox,
    IconCheck,
    IconInfoCircle,
    IconPackage,
    IconPlus,
} from "@tabler/icons-react";
import { useCreateProduction } from "@/features/production/api/production-api";
import {
    productionCreateSchema,
    type ProductionCreateInput,
    type ProductionMaterialInput,
    type ProductionOutputInput,
} from "@/features/production/schemas/production-schema";
import { MaterialItemRow } from "./material-item-row";
import { OutputItemRow } from "./output-item-row";

export function ProductionCreatePage() {
    const router = useAppRouter();
    const { data: session } = useSession();
    const userRoles = session?.user?.roles || [];
    const userPermissions = session?.user?.permissions || [];

    const hasManagePermission =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "manage_production");

    const createMutation = useCreateProduction();

    // Fetch active products
    const { data: productsRes, isLoading: productsLoading } = useProducts({
        per_page: 2000,
        status: "active",
    });

    const productsDataList = productsRes?.data;

    // Filter raw materials vs finished goods
    const rawMaterialProducts = useMemo(
        () => (productsDataList || []).filter((p) => Boolean(p.is_raw_material)),
        [productsDataList]
    );

    const finishedGoodsProducts = useMemo(
        () => (productsDataList || []).filter((p) => !p.is_raw_material && !p.is_jasa),
        [productsDataList]
    );

    const rawMaterialOptions = useMemo<CommandOption[]>(
        () =>
            rawMaterialProducts.map((p) => ({
                value: p.uid,
                label: `${p.nama}${p.barcode ? ` (${p.barcode})` : ""} - Stok: ${p.stok}`,
            })),
        [rawMaterialProducts]
    );

    const finishedGoodOptions = useMemo<CommandOption[]>(
        () =>
            finishedGoodsProducts.map((p) => ({
                value: p.uid,
                label: `${p.nama}${p.barcode ? ` (${p.barcode})` : ""}`,
            })),
        [finishedGoodsProducts]
    );

    const todayDate = new Date().toISOString().split("T")[0];

    const methods = useForm<ProductionCreateInput>({
        resolver: zodResolver(productionCreateSchema) as Resolver<ProductionCreateInput>,
        defaultValues: {
            tanggal: todayDate,
            catatan: "",
            materials: [
                {
                    product_uid: "",
                    kuantitas: 1,
                    harga_satuan: 0,
                },
            ],
            outputs: [
                {
                    product_uid: "",
                    kuantitas: 1,
                    hpp_satuan: 0,
                    update_harga_jual: false,
                    harga_jual_baru: null,
                    margin_baru: null,
                },
            ],
        },
    });

    const { control, handleSubmit } = methods;

    const materialsArray = useFieldArray({
        control,
        name: "materials",
    });

    const outputsArray = useFieldArray({
        control,
        name: "outputs",
    });

    const rawWatchedMaterials = useWatch({ control, name: "materials" });
    const rawWatchedOutputs = useWatch({ control, name: "outputs" });

    // Live calculation: Total Biaya Bahan Baku
    const totalBiayaBahan = useMemo(() => {
        return (rawWatchedMaterials || []).reduce((sum: number, item: ProductionMaterialInput) => {
            const qty = Number(item?.kuantitas) || 0;
            const price = Number(item?.harga_satuan) || 0;
            return sum + qty * price;
        }, 0);
    }, [rawWatchedMaterials]);

    // Live calculation: Total Output Qty & Total HPP Alokasi
    const totalOutputQty = useMemo(() => {
        return (rawWatchedOutputs || []).reduce((sum: number, item: ProductionOutputInput) => sum + (Number(item?.kuantitas) || 0), 0);
    }, [rawWatchedOutputs]);

    const totalAlokasiHpp = useMemo(() => {
        return (rawWatchedOutputs || []).reduce((sum: number, item: ProductionOutputInput) => {
            const qty = Number(item?.kuantitas) || 0;
            const hpp = Number(item?.hpp_satuan) || 0;
            return sum + qty * hpp;
        }, 0);
    }, [rawWatchedOutputs]);

    // Recommended HPP per piece if distributed evenly
    const recommendedHppPerPiece = totalOutputQty > 0
        ? Math.round(totalBiayaBahan / totalOutputQty)
        : 0;

    const onSubmit = (data: ProductionCreateInput) => {
        // Validation: Stock sufficiency check
        for (const mat of data.materials) {
            const prod = rawMaterialProducts.find((p) => p.uid === mat.product_uid);
            if (prod && Number(mat.kuantitas) > prod.stok) {
                toast.error(`Stok bahan baku "${prod.nama}" tidak mencukupi (Tersedia: ${prod.stok}).`);
                return;
            }
        }

        createMutation.mutate(data, {
            onSuccess: (res: { message?: string }) => {
                toast.success(res?.message || "Produksi harian berhasil disimpan!");
                router.push(ROUTES.ADMIN_PRODUCTION);
            },
            onError: (err: Error) => {
                toast.error(err.message || "Gagal menyimpan transaksi produksi.");
            },
        });
    };

    const onError = () => {
        toast.error("Harap periksa kelengkapan form produksi sebelum menyimpan.");
    };

    if (!hasManagePermission) {
        return (
            <AccessDeniedState
                description="Anda tidak memiliki izin untuk mencatat transaksi produksi harian."
                requiredPermission="manage_production"
                showBackButton={true}
            />
        );
    }

    const isPending = createMutation.isPending || productsLoading;

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
                {/* Header Navigation */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white border border-slate-100 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(ROUTES.ADMIN_PRODUCTION)}
                            className="h-9 w-9 p-0 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
                            title="Kembali ke Riwayat"
                        >
                            <IconArrowLeft size={18} />
                        </Button>
                        <div>
                            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                                <IconAssembly size={20} className="text-emerald-600" />
                                Form Produksi Harian Baru
                            </h2>
                            <p className="text-xs text-slate-400">
                                Catat pemakaian bahan baku &amp; hasil konversi barang jadi.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left Column: Form Materials & Outputs */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* 1. Informasi Umum */}
                        <Card className="border-slate-200/80 rounded-2xl shadow-sm bg-white overflow-hidden py-0">
                            <CardHeader className="border-b border-slate-100 p-5 bg-slate-50/50">
                                <CardTitle className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                                    1. Informasi Umum Dokumen
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <FormDatePicker<ProductionCreateInput>
                                        name="tanggal"
                                        label="Tanggal Produksi *"
                                        placeholder="Pilih tanggal produksi"
                                        disabled={isPending}
                                    />
                                    <FormInput<ProductionCreateInput>
                                        name="catatan"
                                        label="Catatan / No. Batch (Opsional)"
                                        placeholder="Contoh: Batch 1 Kemeja Oxford Putih"
                                        disabled={isPending}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* 2. Bahan Baku Terpakai */}
                        <Card className="border-slate-200/80 rounded-2xl shadow-sm bg-white overflow-hidden py-0">
                            <CardHeader className="border-b border-slate-100 p-5 bg-amber-50/30 flex flex-row items-center justify-between">
                                <CardTitle className="text-xs font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider">
                                    <IconBox size={18} className="text-amber-600" />
                                    2. Bahan Baku Terpakai
                                </CardTitle>
                                <Button
                                    type="button"
                                    onClick={() =>
                                        materialsArray.append({
                                            product_uid: "",
                                            kuantitas: 1,
                                            harga_satuan: 0,
                                        })
                                    }
                                    disabled={isPending}
                                    className="h-8 px-3 text-xs bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                                >
                                    <IconPlus size={14} /> Tambah Bahan
                                </Button>
                            </CardHeader>
                            <CardContent className="p-5 space-y-4">
                                {rawMaterialProducts.length === 0 && (
                                    <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center gap-2">
                                        <IconInfoCircle size={16} className="shrink-0" />
                                        <span>
                                            Belum ada produk yang ditandai sebagai <strong>Bahan Baku</strong>.
                                            Aktifkan toggle &ldquo;Bahan Baku&rdquo; di menu Master Produk terlebih dahulu.
                                        </span>
                                    </div>
                                )}

                                {materialsArray.fields.map((field, idx) => (
                                    <MaterialItemRow
                                        key={field.id}
                                        index={idx}
                                        options={rawMaterialOptions}
                                        products={rawMaterialProducts}
                                        disabled={isPending}
                                        onRemove={(i) => materialsArray.remove(i)}
                                    />
                                ))}

                                <div className="flex justify-between items-center pt-2 px-2 text-xs font-semibold text-slate-700">
                                    <span>Total Jenis Bahan: {materialsArray.fields.length}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-400">Total Biaya Bahan:</span>
                                        <span className="font-extrabold text-sm text-slate-900 font-mono">
                                            {formatRupiah(totalBiayaBahan)}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 3. Hasil Barang Jadi */}
                        <Card className="border-slate-200/80 rounded-2xl shadow-sm bg-white overflow-hidden py-0">
                            <CardHeader className="border-b border-slate-100 p-5 bg-emerald-50/30 flex flex-row items-center justify-between">
                                <CardTitle className="text-xs font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider">
                                    <IconPackage size={18} className="text-emerald-600" />
                                    3. Hasil Barang Jadi &amp; Alokasi HPP
                                </CardTitle>
                                <Button
                                    type="button"
                                    onClick={() =>
                                        outputsArray.append({
                                            product_uid: "",
                                            kuantitas: 1,
                                            hpp_satuan: recommendedHppPerPiece,
                                            update_harga_jual: false,
                                            harga_jual_baru: null,
                                            margin_baru: null,
                                        })
                                    }
                                    disabled={isPending}
                                    className="h-8 px-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                                >
                                    <IconPlus size={14} /> Tambah Barang Jadi
                                </Button>
                            </CardHeader>
                            <CardContent className="p-5 space-y-4">
                                {outputsArray.fields.map((field, idx) => (
                                    <OutputItemRow
                                        key={field.id}
                                        index={idx}
                                        options={finishedGoodOptions}
                                        products={finishedGoodsProducts}
                                        disabled={isPending}
                                        onRemove={(i) => outputsArray.remove(i)}
                                        autoRecommendedHpp={recommendedHppPerPiece}
                                    />
                                ))}

                                <div className="flex justify-between items-center pt-2 px-2 text-xs font-semibold text-slate-700">
                                    <span>Total Qty Jadi: {totalOutputQty} Pcs</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-400">Total Alokasi HPP:</span>
                                        <span className="font-extrabold text-sm text-emerald-800 font-mono">
                                            {formatRupiah(totalAlokasiHpp)}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Sticky Summary & Action */}
                    <div className="lg:col-span-4 space-y-6">
                        <Card className="border-slate-200/80 rounded-2xl shadow-sm bg-white overflow-hidden sticky top-6 py-0">
                            <CardHeader className="border-b border-slate-100 p-5 bg-slate-50/50">
                                <CardTitle className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                                    Ringkasan Produksi
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-5 space-y-4 text-xs">
                                <div className="space-y-2.5 pb-4 border-b border-slate-100">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500">Total Biaya Bahan Baku</span>
                                        <span className="font-bold text-slate-900 font-mono">
                                            {formatRupiah(totalBiayaBahan)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500">Total Qty Barang Jadi</span>
                                        <span className="font-bold text-slate-900 font-mono">
                                            {totalOutputQty} Pcs
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500">Rekomendasi HPP Rata-rata</span>
                                        <span className="font-bold text-emerald-700 font-mono">
                                            {formatRupiah(recommendedHppPerPiece)} / pcs
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500">Total Alokasi HPP Output</span>
                                        <span className="font-bold text-slate-900 font-mono">
                                            {formatRupiah(totalAlokasiHpp)}
                                        </span>
                                    </div>
                                </div>

                                {/* Status Alokasi */}
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-1.5">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                        Status Alokasi Biaya
                                    </span>
                                    <div className="flex items-center gap-1.5 text-xs">
                                        {totalBiayaBahan === totalAlokasiHpp ? (
                                            <>
                                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                                <span className="font-bold text-emerald-700">
                                                    Seimbang (100% dialokasikan)
                                                </span>
                                            </>
                                        ) : totalAlokasiHpp === 0 ? (
                                            <>
                                                <span className="w-2 h-2 rounded-full bg-slate-400" />
                                                <span className="font-medium text-slate-500">
                                                    HPP otomatis dihitung sistem saat simpan
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="w-2 h-2 rounded-full bg-amber-500" />
                                                <span className="font-bold text-amber-700">
                                                    Override Manual ({formatRupiah(Math.abs(totalBiayaBahan - totalAlokasiHpp))} selisih)
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={
                                        isPending ||
                                        materialsArray.fields.length === 0 ||
                                        outputsArray.fields.length === 0
                                    }
                                    className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-600/20"
                                >
                                    <IconCheck size={18} />
                                    <span>{isPending ? "Menyimpan Produksi..." : "Selesaikan Produksi"}</span>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}
