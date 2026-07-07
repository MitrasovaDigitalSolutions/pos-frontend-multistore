"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { IconArrowLeft, IconBarcode, IconCheck, IconInfoCircle, IconX } from "@tabler/icons-react";
import { useAppRouter } from "@/hooks/use-app-router";
import { useEffect, useRef, useState } from "react";
import { FormProvider } from "react-hook-form";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ProductFormDialog } from "@/features/products/components/product-form-dialog";
import { toast } from "sonner";
import { usePurchaseOrderDetail } from "../../../api/purchase-api";
import type { PurchaseItemLocal, PurchaseOrder } from "../../../types";
import { BarcodeInput } from "@/components/shared/barcode-input";
import { BulkSubmitBar } from "../../shared/bulk-submit-bar";
import { ItemsTable } from "../../shared/items-table";
import { PO_STATUS } from "@/constants/purchase";
import { usePoFlow } from "@/features/purchase/hooks/use-po-flow";
import { POHeaderCard } from "./po-header-card";
import { POInstructionPanel } from "./po-instruction-panel";
import { getPurchaseItemsStore } from "@/stores/purchase-items-store";

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
            <div className="p-8 text-center bg-white border border-slate-100 rounded-2xl shadow-sm max-w-md mx-auto mt-12">
                <p className="text-sm font-bold text-slate-800">Akses Ditolak</p>
                <p className="text-xs text-slate-400 mt-1">
                    Hanya Purchase Order berstatus **Draft** yang dapat diubah daftar barangnya.
                </p>
                <Button
                    onClick={() => router.push(`/admin/purchase/order/${poId}`)}
                    className="mt-4 bg-slate-800 hover:bg-slate-900 text-white text-xs rounded-xl"
                >
                    Lihat Detail PO
                </Button>
            </div>
        );
    }

    return <POItemsContainer poId={poId} order={order} />;
}

function POItemsContainer({ poId, order }: { poId: string; order?: PurchaseOrder }) {
    const router = useAppRouter();
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
        isSubmitting,
        isConfirmOpen,
        setIsConfirmOpen,
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
            <div className="space-y-6">
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
                        {/* Barcode scanner box */}
                        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                            <div className="flex items-center gap-2 pb-3 border-b border-slate-50">
                                <div className="bg-emerald-50 text-emerald-600 p-1.5 rounded-lg border border-emerald-100/30">
                                    <IconBarcode size={18} />
                                </div>
                                <h3 className="text-xs font-bold text-slate-900">Scan Barcode / Cari Produk</h3>
                            </div>

                            <BarcodeInput
                                onProductFound={(product) => {
                                    setNotFoundQuery("");
                                    handleProductFound(product);
                                }}
                                onError={(err) => toast.error(err)}
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
                                placeholder="Arahkan scanner ke barcode atau ketik nama produk..."
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
                                onUpdateItem={updateItem}
                                onRemoveItem={removeItem}
                                disabled={isSubmitting}
                                isPriceReadOnly={false}
                            />
                        </div>
                    </div>

                    {/* Sidebar Info/Instruction */}
                    <div className="lg:col-span-4 space-y-6">
                        <POHeaderCard
                            form={headerForm}
                            supplierOptions={supplierOptions}
                            suppliersLoading={suppliersLoading}
                            disabled={isSubmitting}
                        />
                        <POInstructionPanel />
                    </div>
                </div>

                {/* Sticky Bottom Submit Bar */}
                <BulkSubmitBar
                    onSubmit={onProcessClick}
                    onSecondarySubmit={handleSaveClick}
                    onReset={handleReset}
                    isSubmitting={isSubmitting}
                    itemCount={itemCount}
                    total={totalValue}
                    productCount={uniqueProductCount}
                    submitLabel="Proses PO"
                    submitIcon={<IconCheck size={16} />}
                    secondarySubmitLabel="Simpan PO"
                    secondarySubmitIcon={<IconCheck size={16} />}
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
                    onOpenChange={setIsConfirmOpen}
                    title="Proses Purchase Order?"
                    description="Apakah Anda yakin ingin memproses Purchase Order ini? Status akan berubah menjadi ordered dan data tidak dapat diubah lagi."
                    confirmText="Ya, Proses"
                    cancelText="Batal"
                    variant="success"
                    onConfirm={handleFinalizeConfirm}
                    isLoading={isSubmitting}
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

function POPageSkeleton() {
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


