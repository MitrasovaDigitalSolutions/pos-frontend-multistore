"use client";

import { FormProvider } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { AccessDeniedState } from "@/components/ui/access-denied-state";
import { ROUTES } from "@/constants/routes";
import { IconArrowLeft, IconAssembly } from "@tabler/icons-react";
import { useProductionCreate } from "../../hooks/use-production-create";
import { ProductionGeneralSection } from "./production-general-section";
import { ProductionMaterialsSection } from "./production-materials-section";
import { ProductionOutputsSection } from "./production-outputs-section";
import { ProductionSummaryCard } from "./production-summary-card";

export function ProductionCreatePage() {
    const {
        methods,
        materialsArray,
        outputsArray,
        scannedProductsMap,
        watchedMaterials,
        watchedOutputs,
        totalBiayaBahan,
        totalOutputQty,
        totalAlokasiHpp,
        lastScannedMaterialUid,
        setLastScannedMaterialUid,
        lastScannedOutputUid,
        setLastScannedOutputUid,
        handleMaterialProductFound,
        handleOutputProductFound,
        onSubmit,
        onError,
        handleSubmit,
        isPending,
        hasManagePermission,
        router,
    } = useProductionCreate();

    if (!hasManagePermission) {
        return (
            <AccessDeniedState
                description="Anda tidak memiliki izin untuk mencatat transaksi produksi harian."
                requiredPermission="manage_production"
                showBackButton={true}
            />
        );
    }

    return (
        <FormProvider {...methods}>
            <div className="space-y-3.5 pb-24 sm:pb-6">
                {/* Header Navigation */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 px-4 bg-white border border-slate-200/80 rounded-2xl shadow-2xs">
                    <div className="flex items-center gap-2.5">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(ROUTES.ADMIN_PRODUCTION)}
                            className="h-8 w-8 p-0 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer shrink-0"
                            title="Kembali ke Riwayat"
                        >
                            <IconArrowLeft size={16} />
                        </Button>
                        <div>
                            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5 leading-tight">
                                <IconAssembly size={17} className="text-emerald-600" />
                                <span>Pencatatan Produksi Harian</span>
                            </h2>
                            <p className="text-[11px] text-slate-400 font-normal">
                                Scan barcode bahan baku &amp; barang jadi untuk pencatatan produksi dan alokasi HPP.
                            </p>
                        </div>
                    </div>
                </div>

                {/* 1. Informasi Umum Dokumen */}
                <ProductionGeneralSection disabled={isPending} />

                {/* 2. Side-by-Side 2-Column Split: Bahan Baku (Kiri) & Barang Jadi (Kanan) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 items-stretch">
                    {/* Kolom Kiri: Bahan Baku Terpakai */}
                    <ProductionMaterialsSection
                        productsMap={scannedProductsMap}
                        fields={materialsArray.fields}
                        watchedMaterials={watchedMaterials}
                        onProductFound={handleMaterialProductFound}
                        onRemoveItem={(idx) => materialsArray.remove(idx)}
                        disabled={isPending}
                        totalBiayaBahan={totalBiayaBahan}
                        lastScannedUid={lastScannedMaterialUid}
                        onClearScannedUid={() => setLastScannedMaterialUid(null)}
                    />

                    {/* Kolom Kanan: Hasil Barang Jadi & Alokasi HPP */}
                    <ProductionOutputsSection
                        productsMap={scannedProductsMap}
                        fields={outputsArray.fields}
                        watchedOutputs={watchedOutputs}
                        onProductFound={handleOutputProductFound}
                        onRemoveItem={(idx) => outputsArray.remove(idx)}
                        disabled={isPending}
                        totalOutputQty={totalOutputQty}
                        totalAlokasiHpp={totalAlokasiHpp}
                        lastScannedUid={lastScannedOutputUid}
                        onClearScannedUid={() => setLastScannedOutputUid(null)}
                    />
                </div>

                {/* 3. Sticky Bottom Summary Bar & Action Button */}
                <ProductionSummaryCard
                    totalBiayaBahan={totalBiayaBahan}
                    totalOutputQty={totalOutputQty}
                    totalAlokasiHpp={totalAlokasiHpp}
                    materialsCount={materialsArray.fields.length}
                    outputsCount={outputsArray.fields.length}
                    isPending={isPending}
                    onSubmit={handleSubmit(onSubmit, onError)}
                />
            </div>
        </FormProvider>
    );
}
