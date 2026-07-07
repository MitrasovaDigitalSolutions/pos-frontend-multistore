"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { IconArrowLeft, IconBarcode, IconCircleCheck, IconCheck } from "@tabler/icons-react";
import { useAppRouter } from "@/hooks/use-app-router";
import { useState } from "react";
import { FormProvider } from "react-hook-form";
import { ReturnFinalizeDialog } from "../return-finalize-dialog";
import { toast } from "sonner";
import { usePurchaseReturnDetail } from "../../../api/purchase-api";
import type { PurchaseReturn } from "../../../types";
import { BarcodeInput } from "@/components/shared/barcode-input";
import { BulkSubmitBar } from "../../shared/bulk-submit-bar";
import { RETURN_STATUS } from "@/constants/purchase";
import { ReturnItemsTable } from "./return-items-table";
import { ReturnInstructionPanel } from "./return-instruction-panel";
import { useReturnFlow } from "@/features/purchase/hooks/use-return-flow";
import { ReturnHeaderCard } from "./return-header-card";

interface ReturnItemsPageProps {
    returnId: string;
}

export function ReturnItemsPage({ returnId }: ReturnItemsPageProps) {
    const isNew = !returnId || returnId === "new";
    const { data: returnObj, isLoading: returnLoading, error } = usePurchaseReturnDetail(
        isNew ? null : returnId
    );
    const router = useAppRouter();

    if (returnLoading) {
        return <ReturnPageSkeleton />;
    }

    if (error || (!isNew && !returnObj)) {
        return (
            <div className="p-8 text-center bg-white border border-slate-100 rounded-2xl shadow-sm max-w-md mx-auto mt-12">
                <p className="text-sm font-bold text-slate-800">Error</p>
                <p className="text-xs text-slate-400 mt-1">
                    Dokumen Retur tidak ditemukan atau terjadi kesalahan saat memuat data.
                </p>
                <Button
                    onClick={() => router.push("/admin/purchase/return")}
                    className="mt-4 bg-slate-800 hover:bg-slate-900 text-white text-xs rounded-xl"
                >
                    Kembali ke Daftar Retur
                </Button>
            </div>
        );
    }

    if (returnObj && returnObj.status !== RETURN_STATUS.DRAFT) {
        return (
            <div className="p-8 text-center bg-white border border-slate-100 rounded-2xl shadow-sm max-w-md mx-auto mt-12">
                <p className="text-sm font-bold text-slate-800">Akses Ditolak</p>
                <p className="text-xs text-slate-400 mt-1">
                    Hanya Dokumen Retur berstatus **Draft** yang dapat diubah daftar barangnya.
                </p>
                <Button
                    onClick={() => router.push(`/admin/purchase/return`)}
                    className="mt-4 bg-slate-800 hover:bg-slate-900 text-white text-xs rounded-xl"
                >
                    Kembali ke Daftar Retur
                </Button>
            </div>
        );
    }

    return <ReturnItemsContainer returnId={returnId} returnObj={returnObj} />;
}

function ReturnItemsContainer({ returnId, returnObj }: { returnId: string; returnObj?: PurchaseReturn }) {
    const router = useAppRouter();
    const [activeId, setActiveId] = useState(returnId);
    const [activeReturn, setActiveReturn] = useState<PurchaseReturn | undefined>(returnObj);

    const handleSaveSuccess = (uid: string, responseData?: PurchaseReturn) => {
        setActiveId(uid);
        if (responseData) {
            setActiveReturn(responseData);
        }
    };

    const {
        isCurrentNew,
        items,
        activeItems,
        activeTotalValue,
        returnLimitsMap,
        suppliersLoading,
        supplierOptions,
        receivingsLoading,
        receivingOptions,
        receivingId,
        isFinalizeOpen,
        setIsFinalizeOpen,
        isSavingForFinalize,
        isPending,
        headerForm,
        handleProductFound,
        handleSaveClick,
        handleFinalizeClick,
        clearAll,
        updateItem,
    } = useReturnFlow({
        returnId: activeId,
        returnObj: activeReturn,
        onSaveSuccess: handleSaveSuccess,
    });



    const reasons = [
        { value: "damaged", label: "Rusak / Cacat" },
        { value: "expired", label: "Kadaluarsa" },
        { value: "wrong_product", label: "Salah Kirim" },
        { value: "other", label: "Lainnya" },
    ];

    return (
        <FormProvider {...headerForm}>
            <div className="space-y-6">
                {/* Header info / Breadcrumb */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-4">
                        <Button
                            type="button"
                            onClick={() => router.push("/admin/purchase/return")}
                            variant="outline"
                            className="p-2 h-9 w-9 rounded-xl border-slate-200 text-slate-500 hover:text-slate-900 bg-white cursor-pointer"
                        >
                            <IconArrowLeft size={18} />
                        </Button>
                        <div>
                            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <span>{isCurrentNew ? "Buat Retur Pembelian Baru" : `Input Barang Retur — ${activeReturn?.nomor_retur}`}</span>
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold border bg-amber-50 text-amber-700 border-amber-100">
                                    Draft
                                </span>
                            </h2>
                            <p className="text-xs text-slate-400 font-sans">
                                Lengkapi referensi faktur penerimaan dan barang yang ingin dikembalikan.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            onClick={handleFinalizeClick}
                            disabled={activeItems.length === 0 || isPending}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 px-5 shadow-md shadow-emerald-600/10 rounded-xl flex items-center gap-1.5 cursor-pointer shrink-0 border-none transition-all hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {isSavingForFinalize ? "Memproses..." : (
                                <>
                                    <IconCircleCheck size={16} /> Finalisasi Retur
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Scanning and Info Panel */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Scanner and Items Table */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Barcode scanner box */}
                        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                            <div className="flex items-center gap-2 pb-3 border-b border-slate-50">
                                <div className="bg-emerald-50 text-emerald-600 p-1.5 rounded-lg border border-emerald-100/30">
                                    <IconBarcode size={18} />
                                </div>
                                <h3 className="text-xs font-bold text-slate-900 font-sans">Scan Barcode Retur</h3>
                            </div>

                            <BarcodeInput
                                onProductFound={handleProductFound}
                                onError={(msg) => toast.error(msg)}
                                disabled={isPending || !receivingId}
                                placeholder={receivingId ? "Scan barcode distributor atau masukkan kode produk..." : "Harap pilih referensi faktur penerimaan terlebih dahulu..."}
                            />
                        </div>

                        {/* Table of items */}
                        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden pb-24">
                            <ReturnItemsTable
                                items={items}
                                isPending={isPending}
                                updateItem={updateItem}
                                returnLimitsMap={returnLimitsMap}
                                reasons={reasons}
                                activeItems={activeItems}
                                activeTotalValue={activeTotalValue}
                            />
                        </div>
                    </div>

                    {/* Sidebar Info/Instruction */}
                    <div className="lg:col-span-4 space-y-6">
                        <ReturnHeaderCard
                            form={headerForm}
                            supplierOptions={supplierOptions}
                            suppliersLoading={suppliersLoading}
                            receivingOptions={receivingOptions}
                            receivingsLoading={receivingsLoading}
                            receivingId={receivingId}
                            disabled={isPending}
                        />
                        <ReturnInstructionPanel />
                    </div>
                </div>

                {/* Sticky Bottom Bar */}
                <BulkSubmitBar
                    itemCount={activeItems.reduce((acc, i) => acc + i.kuantitas, 0)}
                    productCount={activeItems.length}
                    total={activeTotalValue}
                    onSubmit={handleSaveClick}
                    onReset={() => {
                        clearAll();
                        toast.info("Daftar retur lokal berhasil dikosongkan.");
                    }}
                    isSubmitting={isPending}
                    submitLabel="Simpan Retur"
                    submitIcon={<IconCheck size={16} />}
                />

                {/* Return Finalize Dialog */}
                {activeReturn && (
                    <ReturnFinalizeDialog
                        open={isFinalizeOpen}
                        onOpenChange={setIsFinalizeOpen}
                        returnObj={activeReturn}
                        onSuccess={() => {
                            clearAll();
                            router.push("/admin/purchase/return");
                        }}
                    />
                )}
            </div>
        </FormProvider>
    );
}

function ReturnPageSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Skeleton className="h-9 w-9 rounded-xl" />
                <div className="space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-3 w-72" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 space-y-6">
                    {/* Header card skeleton */}
                    <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-4">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-10 rounded-xl" />
                        <div className="grid grid-cols-2 gap-4">
                            <Skeleton className="h-10 rounded-xl" />
                            <Skeleton className="h-10 rounded-xl" />
                        </div>
                        <Skeleton className="h-10 rounded-xl" />
                    </div>

                    {/* Scanner skeleton */}
                    <div className="bg-white border border-slate-100 rounded-2xl p-5">
                        <Skeleton className="h-10 rounded-xl" />
                    </div>

                    {/* Table skeleton */}
                    <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-2">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                </div>
                <div className="lg:col-span-4">
                    <Skeleton className="h-44 rounded-2xl" />
                </div>
            </div>
        </div>
    );
}
