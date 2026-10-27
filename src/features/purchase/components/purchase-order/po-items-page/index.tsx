"use client";

import { useEffect, useRef, useState } from "react";
import { FormProvider } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AccessDeniedState } from "@/components/ui/access-denied-state";
import { IconArrowLeft, IconCheck, IconSparkles } from "@tabler/icons-react";
import { useAppRouter } from "@/hooks/use-app-router";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ProductFormDialog } from "@/features/master/products/components/product-form-dialog";
import { usePurchaseOrderDetail } from "../../../api/purchase-api";
import type { PurchaseItemLocal, PurchaseOrder } from "../../../types";
import { BulkSubmitBar } from "../../shared/bulk-submit-bar";
import { ItemsTable } from "../../shared/items-table";
import { PurchaseBarcodeScannerCard } from "../../shared/purchase-barcode-scanner-card";
import { PO_STATUS } from "@/constants/purchase";
import { usePoFlow } from "@/features/purchase/hooks/use-po-flow";
import { POHeaderCard } from "./po-header-card";
import { POInstructionPanel } from "./po-instruction-panel";
import { POPageSkeleton } from "./po-page-skeleton";
import { getPurchaseItemsStore } from "@/stores/purchase-items-store";
import { usePurchaseTutorialStore } from "@/stores/purchase-tutorial-store";
import { MOCK_PO_ITEMS } from "@/features/purchase/tutorial/constants/purchase-tutorial-constants";

interface POItemsPageProps {
    poId: string;
}

export function POItemsPage({ poId }: POItemsPageProps) {
    const isNew = !poId || poId === "new";
    const { data: order, isLoading: orderLoading, error } = usePurchaseOrderDetail(
        isNew ? null : poId
    );
    const router = useAppRouter();

    if (orderLoading) {
        return <POPageSkeleton />;
    }

    if (error || (!isNew && !order)) {
        return (
            <div className="p-8 text-center bg-white border border-slate-100 rounded-2xl shadow-sm max-w-md mx-auto mt-12">
                <p className="text-sm font-bold text-slate-800">Error</p>
                <p className="text-xs text-slate-400 mt-1">
                    Purchase Order tidak ditemukan atau terjadi kesalahan saat memuat data.
                </p>
                <Button
                    onClick={() => router.push("/admin/purchase/order")}
                    className="mt-4 bg-slate-800 hover:bg-slate-900 text-white text-xs rounded-xl"
                >
                    Kembali ke Daftar PO
                </Button>
            </div>
        );
    }

    if (order && order.status !== PO_STATUS.DRAFT) {
        return (
            <AccessDeniedState
                title="Status Terkunci"
                description="Hanya Purchase Order berstatus Draft yang dapat diubah daftar barangnya."
                showBackButton={true}
            />
        );
    }

    return <POItemsContainer poId={poId} order={order} />;
}

function POItemsContainer({ poId, order }: { poId: string; order?: PurchaseOrder }) {
    const router = useAppRouter();
    const isTutorialRunning = usePurchaseTutorialStore((state) => state.isRunning);
    const [activeId, setActiveId] = useState(poId);
    const [activeOrder, setActiveOrder] = useState<PurchaseOrder | undefined>(order);

    const handleSaveSuccess = (uid: string, responseData?: PurchaseOrder) => {
        window.history.replaceState(null, "", `/admin/purchase/order/${uid}/items`);
        setActiveId(uid);
        if (responseData) {
            setActiveOrder(responseData);
        }
    };

    const {
        currentId,
        isCurrentNew,
        items,
        itemCount,
        totalValue,
        uniqueProductCount,
        isResetDialogOpen,
        setIsResetDialogOpen,
        notFoundQuery,
        setNotFoundQuery,
        isCreateDialogOpen,
        setIsCreateDialogOpen,
        suppliersLoading,
        supplierOptions,
        supplierSelectProps,
        isSubmitting,
        isConfirmLoading,
        isSaving,
        isConfirmOpen,
        handleConfirmClose,
        onProcessClick,
        handleFinalizeConfirm,
        productForm,
        headerForm,
        handleProductFound,
        handleOpenCreateDialog,
        handleReset,
        handleSaveClick,
        clearAll,
        updateItem,
        removeItem,
    } = usePoFlow({
        poId: activeId,
        order: activeOrder,
        onSaveSuccess: handleSaveSuccess,
    });

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

    const isFirstLoad = useRef(true);
    const store = getPurchaseItemsStore(currentId, "po");

    // Prepopulate Zustand items from DB order items if existing draft PO
    useEffect(() => {
        if (!isFirstLoad.current || isCurrentNew) return;

        if (store.getState().items.length > 0) {
            isFirstLoad.current = false;
            return;
        }

        if (activeOrder?.items && activeOrder.items.length > 0) {
            const dbItems: PurchaseItemLocal[] = activeOrder.items.map((item) => ({
                temp_uid: `${Date.now()}-${item.uid}-${Math.random().toString(36).substring(2, 5)}`,
                product_uid: item.product_uid,
                barcode: item.product?.barcode || null,
                nama: item.product?.nama || "Produk Tanpa Nama",
                kuantitas: item.kuantitas,
                harga_estimasi: item.harga_estimasi,
            }));
            store.setState({ items: dbItems });
            isFirstLoad.current = false;
        } else {
            isFirstLoad.current = false;
        }
    }, [activeOrder, isCurrentNew, store]);

    return (
        <FormProvider {...productForm}>
            <div className="space-y-6 pb-36 sm:pb-32">
                {/* Header info / Breadcrumb */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button
                            type="button"
                            onClick={() => router.push(isCurrentNew ? "/admin/purchase/order" : `/admin/purchase/order/${currentId}`)}
                            variant="outline"
                            className="p-2 h-9 w-9 rounded-xl border-slate-200 text-slate-500 hover:text-slate-900 bg-white"
                        >
                            <IconArrowLeft size={18} />
                        </Button>
                        <div>
                            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <span>{isCurrentNew ? "Buat Purchase Order Baru" : `Edit Barang PO — ${activeOrder?.nomor_po}`}</span>
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold border bg-amber-50 text-amber-700 border-amber-100">
                                    Draft
                                </span>
                            </h2>
                            <p className="text-xs text-slate-400">
                                Masukkan detail vendor supplier dan daftar barang pesanan.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Content Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    <div className="lg:col-span-8 space-y-6">
                        <PurchaseBarcodeScannerCard
                            id="po-barcode-box"
                            title="Scan Barcode / Cari Produk"
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
                                    ? "Scan barcode berulang kali (mode cepat aktif)..."
                                    : "Arahkan scanner ke barcode atau ketik nama produk..."
                            }
                            extraActions={
                                isTutorialRunning ? (
                                    <button
                                        type="button"
                                        id="btn-po-seeder"
                                        onClick={() => {
                                            const poStore = getPurchaseItemsStore("new", "po");
                                            poStore.setState({
                                                items: [...MOCK_PO_ITEMS],
                                                lastUpdated: Date.now(),
                                            });
                                            toast.success("Seeder produk simulasi berhasil ditambahkan ke daftar PO!");
                                        }}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-[11px] font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                                        title="Klik untuk mengisi data seeder contoh pesanan"
                                    >
                                        <IconSparkles size={13} className="text-emerald-600 animate-pulse" />
                                        <span>Seeder Demo PO</span>
                                    </button>
                                ) : null
                            }
                        />

                        {/* Table of items */}
                        <div id="po-items-table" className="space-y-4">
                            <ItemsTable
                                items={items}
                                onUpdateItem={updateItem}
                                onRemoveItem={removeItem}
                                disabled={isSubmitting}
                                isPriceReadOnly={false}
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
                        <POHeaderCard
                            form={headerForm}
                            supplierOptions={supplierOptions}
                            suppliersLoading={suppliersLoading}
                            supplierSelectProps={supplierSelectProps}
                            disabled={isSubmitting}
                        />
                        <POInstructionPanel />
                    </div>
                </div>

                {/* Sticky Bottom Submit Bar */}
                <BulkSubmitBar
                    id="po-submit-bar"
                    onSubmit={onProcessClick}
                    onSecondarySubmit={handleSaveClick}
                    onReset={handleReset}
                    isSubmitting={isSubmitting}
                    isSecondarySubmitting={isSaving}
                    disabled={isConfirmOpen}
                    itemCount={itemCount}
                    total={totalValue}
                    productCount={uniqueProductCount}
                    submitLabel="Proses PO"
                    submitIcon={<IconCheck size={16} />}
                    submitLoadingText="Memproses..."
                    secondarySubmitLabel="Simpan PO"
                    secondarySubmitIcon={<IconCheck size={16} />}
                    secondarySubmitLoadingText="Menyimpan..."
                />

                {/* Create Product Dialog */}
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

                {/* Process Confirmation Dialog */}
                <ConfirmDialog
                    open={isConfirmOpen}
                    onOpenChange={handleConfirmClose}
                    title="Proses Purchase Order?"
                    description="Apakah Anda yakin ingin memproses Purchase Order ini? Status akan berubah menjadi ordered dan data tidak dapat diubah lagi."
                    confirmText="Ya, Proses"
                    cancelText="Batal"
                    variant="success"
                    onConfirm={handleFinalizeConfirm}
                    isLoading={isConfirmLoading}
                />

                {/* Reset Confirmation Dialog */}
                <ConfirmDialog
                    open={isResetDialogOpen}
                    onOpenChange={setIsResetDialogOpen}
                    title="Kosongkan Form PO?"
                    description="Apakah Anda yakin ingin mengosongkan seluruh daftar barang dan input form PO di halaman ini? Semua data belum tersimpan akan hilang."
                    confirmText="Ya, Kosongkan"
                    cancelText="Batal"
                    variant="danger"
                    onConfirm={() => {
                        clearAll();
                        setIsResetDialogOpen(false);
                        toast.info("Daftar barang PO lokal berhasil dikosongkan.");
                    }}
                />
            </div>
        </FormProvider>
    );
}
