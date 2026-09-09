"use client";

import { useState } from "react";
import { FormProvider } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AccessDeniedState } from "@/components/ui/access-denied-state";
import { ROUTES } from "@/constants/routes";
import { IconAlertTriangle, IconArrowLeft, IconAssembly } from "@tabler/icons-react";
import { useProductionCreate } from "../../hooks/use-production-create";
import { ProductionGeneralSection } from "./production-general-section";
import { ProductionMaterialsSection } from "./production-materials-section";
import { ProductionOutputsSection } from "./production-outputs-section";
import { ProductionSummaryCard } from "./production-summary-card";

interface ProductionCreatePageProps {
    productionUid?: string;
}

export function ProductionCreatePage({ productionUid }: ProductionCreatePageProps = {}) {
    const [isConfirmCompleteOpen, setIsConfirmCompleteOpen] = useState(false);

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
        handleSaveDraft,
        handleComplete,
        isPending,
        isEdit,
        isDetailLoading,
        hasManagePermission,
        router,
    } = useProductionCreate({ productionUid });

    if (!hasManagePermission) {
        return (
            <AccessDeniedState
                description="Anda tidak memiliki izin untuk mencatat transaksi produksi harian."
                requiredPermission="manage_production"
                showBackButton={true}
            />
        );
    }

    const handleRequestComplete = async () => {
        const isValid = await methods.trigger();
        if (isValid) {
            setIsConfirmCompleteOpen(true);
        } else {
            toast.error("Harap periksa kelengkapan formulir produksi sebelum menyelesaikan.");
        }
    };

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
                                <span>{isEdit ? "Edit Draft Produksi" : "Pencatatan Produksi Harian"}</span>
                            </h2>
                            <p className="text-[11px] text-slate-400 font-normal">
                                {isEdit
                                    ? "Perbarui rincian bahan baku dan alokasi HPP pada draft produksi ini."
                                    : "Scan barcode bahan baku & barang jadi untuk pencatatan produksi dan alokasi HPP."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 1. Informasi Umum Dokumen */}
                <ProductionGeneralSection disabled={isPending || isDetailLoading} />

                {/* 2. Side-by-Side 2-Column Split: Bahan Baku (Kiri) & Barang Jadi (Kanan) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 items-stretch">
                    {/* Kolom Kiri: Bahan Baku Terpakai */}
                    <ProductionMaterialsSection
                        productsMap={scannedProductsMap}
                        fields={materialsArray.fields}
                        watchedMaterials={watchedMaterials}
                        onProductFound={handleMaterialProductFound}
                        onRemoveItem={(idx) => materialsArray.remove(idx)}
                        disabled={isPending || isDetailLoading}
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
                        disabled={isPending || isDetailLoading}
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
                    isPending={isPending || isDetailLoading}
                    isEdit={isEdit}
                    onSaveDraft={handleSaveDraft}
                    onComplete={handleRequestComplete}
                />

                {/* Warning Confirmation Dialog for Completing Production */}
                <ConfirmDialog
                    open={isConfirmCompleteOpen}
                    onOpenChange={setIsConfirmCompleteOpen}
                    title="Selesaikan Transaksi Produksi?"
                    variant="warning"
                    description={
                        <div className="space-y-2 text-left">
                            <p>
                                Apakah Anda yakin ingin menyelesaikan transaksi produksi ini?
                            </p>
                            <div className="flex items-start gap-1.5 p-2.5 bg-amber-50 border border-amber-200/70 rounded-xl text-amber-900 text-[11px] leading-relaxed">
                                <IconAlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                                <span>
                                    Tindakan ini akan <strong>memotong stok bahan baku</strong>, <strong>menambah stok barang jadi</strong>, menghitung HPP aktual, dan <strong>mencatat jurnal transaksi</strong> ke sistem akuntansi. Transaksi yang telah selesai tidak dapat diedit kembali sebagai draft.
                                </span>
                            </div>
                        </div>
                    }
                    confirmText="Ya, Selesaikan Produksi"
                    cancelText="Periksa Kembali"
                    isLoading={isPending}
                    onConfirm={async () => {
                        setIsConfirmCompleteOpen(false);
                        handleComplete();
                    }}
                />
            </div>
        </FormProvider>
    );
}
