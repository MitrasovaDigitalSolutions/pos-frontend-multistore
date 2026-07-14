"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { IconArrowLeft, IconBarcode, IconCheck, IconInfoCircle, IconUpload, IconX } from "@tabler/icons-react";
import { useAppRouter } from "@/hooks/use-app-router";
import { useState } from "react";
import { FormProvider } from "react-hook-form";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ProductFormDialog } from "@/features/products/components/product-form-dialog";
import { toast } from "sonner";
import {
    useReceivingDetail,
} from "../../../api/purchase-api";
import type { Receiving } from "../../../types";
import { BarcodeInput } from "@/components/shared/barcode-input";
import { BulkSubmitBar } from "../../shared/bulk-submit-bar";
import { ItemsTable } from "../../shared/items-table";
import { ReceivingFinalizeDialog } from "../receiving-finalize-dialog";
import { RECEIVING_STATUS } from "@/constants/purchase";
import { PriceAlertDialog } from "./price-alert-dialog";
import { ReceivingInstructionPanel } from "./receiving-instruction-panel";
import { ReceivingHeaderCard } from "./receiving-header-card";
import { useAllSuppliers } from "@/features/suppliers/api/suppliers-api";
import { useReceivingFlow } from "@/features/purchase/hooks/use-receiving-flow";

interface ReceivingItemsPageProps {
    receivingId: string;
}

export function ReceivingItemsPage({ receivingId }: ReceivingItemsPageProps) {
    const router = useAppRouter();
    const [activeId, setActiveId] = useState(receivingId);

    const isNew = !activeId || activeId === "new";
    const { data: receiving, isLoading: receivingLoading, error } = useReceivingDetail(
        isNew ? null : activeId
    );

    if (receivingLoading) {
        return (
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <ReceivingPageSkeleton />
            </div>
        );
    }

    if (!isNew && (error || !receiving)) {
        return (
            <div className="p-8 text-center bg-white border border-slate-100 rounded-2xl shadow-sm max-w-md mx-auto mt-12">
                <p className="text-sm font-bold text-slate-800">Error</p>
                <p className="text-xs text-slate-400 mt-1">
                    Penerimaan tidak ditemukan atau terjadi kesalahan saat memuat data.
                </p>
                <Button
                    onClick={() => router.push("/admin/purchase/receiving")}
                    className="mt-4 bg-slate-800 hover:bg-slate-900 text-white text-xs rounded-xl"
                >
                    Kembali ke Daftar Penerimaan
                </Button>
            </div>
        );
    }

    if (!isNew && receiving && receiving.status !== RECEIVING_STATUS.DRAFT) {
        return (
            <div className="p-8 text-center bg-white border border-slate-100 rounded-2xl shadow-sm max-w-md mx-auto mt-12">
                <p className="text-sm font-bold text-slate-800">Akses Ditolak</p>
                <p className="text-xs text-slate-400 mt-1">
                    Hanya Penerimaan Barang berstatus **Draft** yang dapat diubah daftar barangnya.
                </p>
                <Button
                    onClick={() => router.push(`/admin/purchase/receiving`)}
                    className="mt-4 bg-slate-800 hover:bg-slate-900 text-white text-xs rounded-xl"
                >
                    Kembali ke Daftar Penerimaan
                </Button>
            </div>
        );
    }

    const handleSaveSuccess = (uid: string, _responseData?: Receiving) => {
        window.history.replaceState(null, "", `/admin/purchase/receiving/${uid}/items`);
        setActiveId(uid);
    };

    return (
        <ReceivingItemsContainer
            receivingId={activeId}
            receiving={receiving}
            onSaveSuccess={handleSaveSuccess}
        />
    );
}

interface ReceivingItemsContainerProps {
    receivingId: string;
    receiving?: Receiving;
    onSaveSuccess: (uid: string, responseData?: Receiving) => void;
}

function ReceivingItemsContainer({
    receivingId,
    receiving,
    onSaveSuccess,
}: ReceivingItemsContainerProps) {
    const router = useAppRouter();
    const { data: suppliers = [] } = useAllSuppliers();

    const {
        currentReceiving,
        isCurrentNew,
        items,
        itemCount,
        totalValue,
        uniqueProductCount,
        poId,
        poData,
        notFoundQuery,
        setNotFoundQuery,
        isCreateDialogOpen,
        setIsCreateDialogOpen,
        isResetDialogOpen,
        setIsResetDialogOpen,
        priceAlerts,
        isAlertOpen,
        isFinalizeOpen,
        isFinalizing,
        isSubmitting,
        productForm,
        headerForm,
        handleProductFound,
        handleOpenCreateDialog,
        handleReset,
        handleSaveClick,
        onProcessClick,
        handleCompleteWithoutPrices,
        handleCompleteWithPrices,
        handleFinalizeConfirm,
        handleFinalizeClose,
        handleAlertClose,
        clearAll,
        handleUpdateItem,
        removeItem,
        suppliersLoading,
        supplierOptions,
        posLoading,
        poOptions,
    } = useReceivingFlow({
        receivingId,
        receiving,
        onSaveSuccess,
    });

    return (
        <FormProvider {...productForm}>
            <div className="space-y-6">
                {/* Header info / Breadcrumb */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-4">
                        <Button
                            type="button"
                            onClick={() => router.push("/admin/purchase/receiving")}
                            variant="outline"
                            className="p-2 h-9 w-9 rounded-xl border-slate-200 text-slate-500 hover:text-slate-900 bg-white"
                        >
                            <IconArrowLeft size={18} />
                        </Button>
                        <div>
                            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <span>
                                    {isCurrentNew
                                        ? "Buat Penerimaan Baru"
                                        : `Input Barang Penerimaan — ${currentReceiving?.nomor_penerimaan}`}
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold border bg-amber-50 text-amber-700 border-amber-100">
                                    Draft
                                </span>
                            </h2>
                            <p className="text-xs text-slate-400">
                                {isCurrentNew ? (
                                    "Tambahkan barang penerimaan terlebih dahulu, lalu lengkapi & simpan header di panel kanan."
                                ) : (
                                    <>
                                        Faktur: <span className="font-semibold text-slate-600">{currentReceiving?.nomor_faktur || "-"}</span> | Supplier: <span className="font-semibold text-slate-600">{currentReceiving?.supplier_relationship?.nama || currentReceiving?.supplier || "-"}</span>
                                    </>
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {poData && (
                            <div className="bg-emerald-50 border border-emerald-100/50 rounded-xl px-4 py-1.5 text-xs text-left">
                                <p className="font-bold text-emerald-800 leading-tight">PO: {poData.nomor_po}</p>
                                <p className="text-[9px] text-emerald-600 leading-none mt-0.5">Batas qty sesuai sisa PO</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Scanning and Info Panel */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    <div className="lg:col-span-8 space-y-6">
                        {/* Barcode scanner box */}
                        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                            <div className="flex items-center gap-2 pb-3 border-b border-slate-50">
                                <div className="bg-emerald-50 text-emerald-600 p-1.5 rounded-lg">
                                    <IconBarcode size={18} />
                                </div>
                                <h3 className="text-xs font-bold text-slate-900">Scan Barcode Penerimaan</h3>
                            </div>

                            <BarcodeInput
                                onProductFound={(product) => {
                                    setNotFoundQuery("");
                                    handleProductFound(product);
                                }}
                                onError={(msg) => toast.error(msg)}
                                onProductNotFound={(query) => {
                                    setNotFoundQuery(query);
                                    handleOpenCreateDialog(query);
                                }}
                                onInputChange={(__value) => {
                                    if (notFoundQuery) {
                                        setNotFoundQuery("");
                                    }
                                }}
                                disabled={isSubmitting}
                                placeholder="Scan barcode distributor atau masukkan kode produk..."
                            />

                            {notFoundQuery && (
                                <div className="flex items-center justify-between p-3.5 bg-rose-50/50 border border-rose-100 rounded-xl text-rose-900 text-xs">
                                    <div className="flex items-center gap-2">
                                        <IconInfoCircle size={16} className="text-rose-500 shrink-0" />
                                        <span>
                                            Produk <strong>&quot;{notFoundQuery}&quot;</strong> tidak ditemukan.
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <Button
                                            type="button"
                                            onClick={() => handleOpenCreateDialog(notFoundQuery)}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold h-8 px-3 rounded-lg border-none cursor-pointer"
                                        >
                                            Tambah Produk
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => setNotFoundQuery("")}
                                            className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-rose-100/50 cursor-pointer border-none flex items-center justify-center shrink-0"
                                        >
                                            <IconX size={16} />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Table of items */}
                        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden pb-24">
                            <ItemsTable
                                items={items}
                                priceLabel="Harga Beli"
                                onUpdateItem={handleUpdateItem}
                                onRemoveItem={removeItem}
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    {/* Sidebar Info/Instruction */}
                    <div className="lg:col-span-4 space-y-6">
                        <ReceivingHeaderCard
                            form={headerForm}
                            suppliersLoading={suppliersLoading}
                            supplierOptions={supplierOptions}
                            posLoading={posLoading}
                            poOptions={poOptions}
                            isPending={isSubmitting}
                        />
                        <ReceivingInstructionPanel poId={poId} />
                    </div>
                </div>

                {/* Sticky Bottom Submit Bar */}
                <div className="sticky bottom-0 z-10">
                    <BulkSubmitBar
                        onSubmit={onProcessClick}
                        onSecondarySubmit={handleSaveClick}
                        onReset={handleReset}
                        isSubmitting={isSubmitting}
                        itemCount={itemCount}
                        total={totalValue}
                        productCount={uniqueProductCount}
                        submitLabel="Proses Penerimaan"
                        submitIcon={<IconCheck size={16} />}
                        secondarySubmitLabel="Simpan Penerimaan"
                        secondarySubmitIcon={<IconUpload size={16} />}
                    />
                </div>

                {/* Finalize Dialog */}
                {(currentReceiving || (isCurrentNew && isFinalizeOpen)) && (
                    <ReceivingFinalizeDialog
                        open={isFinalizeOpen}
                        onOpenChange={handleFinalizeClose}
                        receiving={currentReceiving || ({
                            nomor_penerimaan: "Akan Dibuat Otomatis",
                            supplier: suppliers.find(s => s.uid === (headerForm.watch("supplier_uid") || receiving?.supplier_uid))?.nama || "—",
                            purchase_order_uid: headerForm.watch("purchase_order_uid") || receiving?.purchase_order_uid || null,
                            nomor_faktur: headerForm.watch("nomor_faktur") || "",
                            nilai_faktur: (headerForm.watch("nilai_faktur") != null && Number(headerForm.watch("nilai_faktur")) !== 0)
                                ? Number(headerForm.watch("nilai_faktur"))
                                : totalValue,
                            catatan: headerForm.watch("catatan") || "",
                        } as unknown as Receiving)}
                        items={items}
                        isPending={isSubmitting}
                        onConfirm={handleFinalizeConfirm}
                    />
                )}

                {/* Price comparison alert dialog */}
                <PriceAlertDialog
                    open={isAlertOpen}
                    onOpenChange={handleAlertClose}
                    priceAlerts={priceAlerts}
                    isFinalizing={isFinalizing}
                    onCompleteWithoutPrices={handleCompleteWithoutPrices}
                    onCompleteWithPrices={handleCompleteWithPrices}
                />

                <ProductFormDialog
                    open={isCreateDialogOpen}
                    onOpenChange={setIsCreateDialogOpen}
                    editingProduct={null}
                    onSuccess={(product) => {
                        setNotFoundQuery("");
                        handleProductFound(product);
                    }}
                    infoMessage={notFoundQuery ? `Produk "${notFoundQuery}" tidak ditemukan. Silakan buat baru.` : undefined}
                />

                <ConfirmDialog
                    open={isResetDialogOpen}
                    onOpenChange={setIsResetDialogOpen}
                    title="Kosongkan Penerimaan"
                    description="Apakah Anda yakin ingin mengosongkan seluruh data penerimaan? Semua barang yang telah dipindai dan informasi header yang telah diisi akan hilang."
                    confirmText="Ya, Kosongkan"
                    cancelText="Batal"
                    variant="warning"
                    onConfirm={() => {
                        clearAll();
                        setIsResetDialogOpen(false);
                        toast.info("Seluruh data penerimaan lokal berhasil dikosongkan.");
                    }}
                />
            </div>
        </FormProvider>
    );
}

function ReceivingPageSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header info / Breadcrumb */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-9 w-9 rounded-xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-48 rounded" />
                        <Skeleton className="h-3 w-72 rounded" />
                    </div>
                </div>
            </div>

            {/* Scanning and Info Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-8 space-y-6">
                    {/* Barcode scanner box */}
                    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 pb-3 border-b border-slate-50">
                            <Skeleton className="h-5 w-5 rounded" />
                            <Skeleton className="h-4 w-36 rounded" />
                        </div>
                        <Skeleton className="h-10 w-full rounded-xl" />
                    </div>

                    {/* Table of items */}
                    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4 space-y-3">
                        <Skeleton className="h-8 w-full rounded" />
                        <Skeleton className="h-12 w-full rounded" />
                        <Skeleton className="h-12 w-full rounded" />
                        <Skeleton className="h-12 w-full rounded" />
                    </div>
                </div>

                {/* Sidebar Info/Instruction */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                        <Skeleton className="h-4 w-32 rounded" />
                        <Skeleton className="h-8 w-full rounded" />
                        <Skeleton className="h-8 w-full rounded" />
                        <Skeleton className="h-8 w-full rounded" />
                    </div>
                    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                        <Skeleton className="h-4 w-24 rounded" />
                        <Skeleton className="h-16 w-full rounded" />
                    </div>
                </div>
            </div>
        </div>
    );
}
