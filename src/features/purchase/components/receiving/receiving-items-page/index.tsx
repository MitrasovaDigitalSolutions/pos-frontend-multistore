"use client";

import { useState, useRef } from "react";
import { FormProvider } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AccessDeniedState } from "@/components/ui/access-denied-state";
import { IconArrowLeft, IconSparkles } from "@tabler/icons-react";
import { useAppRouter } from "@/hooks/use-app-router";
import { useReceivingDetail } from "../../../api/purchase-api";
import type { Receiving } from "../../../types";
import { BulkSubmitBar } from "../../shared/bulk-submit-bar";
import { ItemsTable } from "../../shared/items-table";
import { PurchaseBarcodeScannerCard } from "../../shared/purchase-barcode-scanner-card";
import { RECEIVING_STATUS } from "@/constants/purchase";
import { ReceivingInstructionPanel } from "./receiving-instruction-panel";
import { ReceivingHeaderCard } from "./receiving-header-card";
import { ReceivingPageSkeleton } from "./receiving-page-skeleton";
import { ReceivingItemsDialogs } from "./receiving-items-dialogs";
import { useAllSuppliers } from "@/features/master/suppliers/api/suppliers-api";
import { useReceivingFlow } from "@/features/purchase/hooks/use-receiving-flow";
import { usePurchaseTutorialStore } from "@/stores/purchase-tutorial-store";
import { MOCK_PRICE_ALERTS, MOCK_RECEIVING_ITEMS } from "@/features/purchase/tutorial/constants/purchase-tutorial-constants";
import { getPurchaseItemsStore } from "@/stores/purchase-items-store";
import { IconCheck, IconUpload } from "@tabler/icons-react";

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
            <AccessDeniedState
                title="Status Terkunci"
                description="Hanya Penerimaan Barang berstatus Draft yang dapat diubah daftar barangnya."
                showBackButton={true}
            />
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
    const barcodeInputRef = useRef<HTMLInputElement>(null);
    const [lastScannedUid, setLastScannedUid] = useState<string | null>(null);
    const [isContinuousScan, setIsContinuousScan] = useState(() => {
        if (typeof window !== "undefined") {
            try {
                return localStorage.getItem("pos_continuous_scan_mode") === "true";
            } catch {
                return false;
            }
        }
        return false;
    });

    const handleToggleContinuousScan = (checked: boolean) => {
        setIsContinuousScan(checked);
        try {
            localStorage.setItem("pos_continuous_scan_mode", String(checked));
        } catch {
            // ignore
        }
        barcodeInputRef.current?.focus();
    };

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

    const isTutorialRunning = usePurchaseTutorialStore((state) => state.isRunning);
    const activeTutorial = usePurchaseTutorialStore((state) => state.activeTutorial);
    const isReceivingTutorial = isTutorialRunning && activeTutorial === "receiving_create";
    const tutorialDialog = usePurchaseTutorialStore((state) => state.activeDialog);

    const effectiveAlertOpen = isReceivingTutorial ? tutorialDialog === "price_alert" : isAlertOpen;
    const effectiveFinalizeOpen = isReceivingTutorial ? tutorialDialog === "finalize" : isFinalizeOpen;
    const effectivePriceAlerts = isReceivingTutorial && tutorialDialog === "price_alert" ? MOCK_PRICE_ALERTS : priceAlerts;

    const supplierName = suppliers.find(
        (s) => s.uid === (headerForm.watch("supplier_uid") || receiving?.supplier_uid)
    )?.nama || "—";
    const purchaseOrderUid = headerForm.watch("purchase_order_uid") || receiving?.purchase_order_uid || null;
    const nomorFaktur = headerForm.watch("nomor_faktur") || "";
    const nilaiFaktur =
        headerForm.watch("nilai_faktur") != null && Number(headerForm.watch("nilai_faktur")) !== 0
            ? Number(headerForm.watch("nilai_faktur"))
            : totalValue;
    const catatan = headerForm.watch("catatan") || "";

    return (
        <FormProvider {...productForm}>
            <div className="space-y-6 pb-36 sm:pb-32">
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
                        <PurchaseBarcodeScannerCard
                            id="rec-barcode-box"
                            title="Scan Barcode Penerimaan"
                            inputRef={barcodeInputRef}
                            isContinuousScan={isContinuousScan}
                            onToggleContinuousScan={handleToggleContinuousScan}
                            onProductFound={(product) => {
                                setNotFoundQuery("");
                                if (!isContinuousScan) {
                                    setLastScannedUid(product.uid);
                                }
                                handleProductFound(product);
                            }}
                            onProductNotFound={(query) => {
                                setNotFoundQuery(query);
                                handleOpenCreateDialog(query);
                            }}
                            notFoundQuery={notFoundQuery}
                            onClearNotFoundQuery={() => setNotFoundQuery("")}
                            onOpenCreateDialog={handleOpenCreateDialog}
                            disabled={isSubmitting}
                            placeholder={
                                isContinuousScan
                                    ? "Scan barcode distributor berulang kali (mode cepat aktif)..."
                                    : "Scan barcode distributor atau masukkan kode produk..."
                            }
                            extraActions={
                                isTutorialRunning ? (
                                    <button
                                        type="button"
                                        id="btn-rec-seeder"
                                        onClick={() => {
                                            const recStore = getPurchaseItemsStore("new", "receiving");
                                            recStore.setState({
                                                items: [...MOCK_RECEIVING_ITEMS],
                                                lastUpdated: Date.now(),
                                            });
                                            toast.success("Seeder produk simulasi berhasil ditambahkan ke daftar Penerimaan!");
                                        }}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-[11px] font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                                        title="Klik untuk mengisi data seeder contoh penerimaan"
                                    >
                                        <IconSparkles size={13} className="text-emerald-600 animate-pulse" />
                                        <span>Seeder Demo Penerimaan</span>
                                    </button>
                                ) : null
                            }
                        />

                        {/* Table of items */}
                        <div id="rec-items-table" className="space-y-4">
                            <ItemsTable
                                items={items}
                                priceLabel="Harga Beli"
                                onUpdateItem={handleUpdateItem}
                                onRemoveItem={removeItem}
                                disabled={isSubmitting}
                                allowSubtotalInput={true}
                                lastScannedUid={lastScannedUid}
                                onClearLastScannedUid={() => setLastScannedUid(null)}
                                onEnterKey={() => {
                                    barcodeInputRef.current?.focus();
                                    barcodeInputRef.current?.select();
                                }}
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
                <div id="rec-submit-bar">
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

                <ReceivingItemsDialogs
                    receiving={currentReceiving}
                    isCurrentNew={isCurrentNew}
                    isReceivingTutorial={isReceivingTutorial}
                    effectiveFinalizeOpen={effectiveFinalizeOpen}
                    onFinalizeChange={handleFinalizeClose}
                    onFinalizeConfirm={handleFinalizeConfirm}
                    supplierName={supplierName}
                    purchaseOrderUid={purchaseOrderUid}
                    nomorFaktur={nomorFaktur}
                    nilaiFaktur={nilaiFaktur}
                    catatan={catatan}
                    items={items}
                    isSubmitting={isSubmitting}
                    isFinalizing={isFinalizing}
                    effectiveAlertOpen={effectiveAlertOpen}
                    effectivePriceAlerts={effectivePriceAlerts}
                    onAlertChange={handleAlertClose}
                    onCompleteWithoutPrices={handleCompleteWithoutPrices}
                    onCompleteWithPrices={handleCompleteWithPrices}
                    isCreateDialogOpen={isCreateDialogOpen}
                    setIsCreateDialogOpen={setIsCreateDialogOpen}
                    notFoundQuery={notFoundQuery}
                    onProductFound={(product) => {
                        setNotFoundQuery("");
                        handleProductFound(product);
                    }}
                    isResetDialogOpen={isResetDialogOpen}
                    setIsResetDialogOpen={setIsResetDialogOpen}
                    onResetConfirm={() => {
                        clearAll();
                        setIsResetDialogOpen(false);
                        toast.info("Seluruh data penerimaan lokal berhasil dikosongkan.");
                    }}
                />
            </div>
        </FormProvider>
    );
}
