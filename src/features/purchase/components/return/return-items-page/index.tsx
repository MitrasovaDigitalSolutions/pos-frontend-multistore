"use client";

import { PageLoader } from "@/components/feedback/page-loader";
import { Button } from "@/components/ui/button";
import { getPurchaseItemsStore } from "@/stores/purchase-items-store";
import { IconArrowLeft, IconBarcode, IconEdit } from "@tabler/icons-react";
import { useAppRouter } from "@/hooks/use-app-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ReturnHeaderDialog } from "../return-header-dialog";
import { toast } from "sonner";
import {
    useBulkReplacePurchaseReturnItems,
    usePurchaseReturnDetail,
    useReturnableItems,
    useScanReturnProduct
} from "../../../api/purchase-api";
import type { PurchaseItemLocal, PurchaseReturn } from "../../../types";
import type { Product } from "@/features/products/types";
import { BarcodeInput } from "@/components/shared/barcode-input";
import { BulkSubmitBar } from "../../shared/bulk-submit-bar";
import { RETURN_STATUS } from "@/constants/purchase";
import { ReturnItemsTable } from "./return-items-table";
import { ReturnInstructionPanel } from "./return-instruction-panel";

interface ReturnItemsPageProps {
    returnId: number;
}

export function ReturnItemsPage({ returnId }: ReturnItemsPageProps) {
    const { data: returnObj, isLoading: returnLoading, error } = usePurchaseReturnDetail(returnId);
    const router = useAppRouter();

    if (returnLoading) {
        return <PageLoader message="Memuat detail Dokumen Retur..." />;
    }

    if (error || !returnObj) {
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

    if (returnObj.status !== RETURN_STATUS.DRAFT) {
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

function ReturnItemsContainer({ returnId, returnObj }: { returnId: number; returnObj: PurchaseReturn }) {
    const [isEditHeaderOpen, setIsEditHeaderOpen] = useState(false);
    const router = useAppRouter();
    const store = getPurchaseItemsStore(returnId, "return");
    const items = store((state) => state.items);
    const addItem = store((state) => state.addItem);
    const clearAll = store((state) => state.clearAll);
    const updateItem = store((state) => state.updateItem);

    const bulkReplace = useBulkReplacePurchaseReturnItems();
    const scanMutation = useScanReturnProduct();

    // Fetch returnable items for the linked receiving doc
    const { data: returnableItems = [] } = useReturnableItems(
        returnObj.stock_receiving_id
    );

    const isFirstLoad = useRef(true);

    // Build returnable limits map for validation
    const returnLimitsMap = useMemo(() => {
        const map: Record<number, { sisa: number; nama: string; harga: number }> = {};
        if (returnableItems) {
            returnableItems.forEach((item) => {
                map[item.product_id] = {
                    sisa: item.kuantitas_sisa,
                    nama: item.product?.nama || "Produk",
                    harga: item.harga_beli,
                };
            });
        }
        return map;
    }, [returnableItems]);

    // Initialize items: load existing from return draft DB OR pre-populate with returnable items from receiving (as 0 qty)
    useEffect(() => {
        if (!isFirstLoad.current) return;

        if (store.getState().items.length > 0) {
            isFirstLoad.current = false;
            return;
        }

        // 1. If we have existing return items in draft, load them
        if (returnObj.items && returnObj.items.length > 0) {
            const dbItems: PurchaseItemLocal[] = returnObj.items.map((item) => ({
                temp_id: `${Date.now()}-${item.id}-${Math.random().toString(36).substring(2, 5)}`,
                product_id: item.product_id,
                barcode: item.product?.barcode || null,
                nama: item.product?.nama || "Produk Tanpa Nama",
                kuantitas: item.kuantitas,
                harga_estimasi: item.harga_beli,
                alasan: item.alasan || "damaged",
            }));
            store.setState({ items: dbItems });
            isFirstLoad.current = false;
        }
        // 2. Else pre-populate items with returnable items from receiving (start with 0 qty)
        else if (returnObj.stock_receiving_id) {
            if (returnableItems && returnableItems.length > 0) {
                const initItems: PurchaseItemLocal[] = returnableItems.map((item) => ({
                    temp_id: `${Date.now()}-${item.product_id}-${Math.random().toString(36).substring(2, 5)}`,
                    product_id: item.product_id,
                    barcode: item.product?.barcode || null,
                    nama: item.product?.nama || "Produk Tanpa Nama",
                    kuantitas: 0,
                    harga_estimasi: item.harga_beli,
                    alasan: "damaged",
                }));
                store.setState({ items: initItems });
                isFirstLoad.current = false;
            }
        }
        // 3. Otherwise
        else {
            isFirstLoad.current = false;
        }
    }, [returnObj.items, returnObj.stock_receiving_id, returnableItems, store]);

    const handleProductFound = async (product: Product) => {
        if (!returnObj.stock_receiving_id) {
            toast.error("Referensi Penerimaan belum ditentukan.");
            return;
        }

        try {
            const res = await scanMutation.mutateAsync({
                receiving_id: returnObj.stock_receiving_id,
                barcode: product.barcode || "",
            });

            if (!res || !res.data || !res.data.product) {
                toast.error(`Produk "${product.nama}" tidak terdaftar atau tidak valid dalam Penerimaan terkait.`);
                return;
            }

            const scanResult = res.data;
            const maxLimit = scanResult.kuantitas_sisa;

            // Find item in Zustand store
            const existingItem = items.find((i) => i.product_id === product.id);
            const currentQty = existingItem ? existingItem.kuantitas : 0;

            if (currentQty >= maxLimit) {
                toast.error(`Kuantitas retur untuk "${product.nama}" mencapai batas sisa faktur penerimaan (${maxLimit} pcs).`);
                return;
            }

            if (existingItem) {
                updateItem(existingItem.temp_id, { kuantitas: currentQty + 1 });
                toast.success(`Menambahkan 1 pcs "${product.nama}".`);
            } else {
                addItem({
                    product_id: product.id,
                    barcode: product.barcode,
                    nama: product.nama,
                    harga_estimasi: product.harga_beli || 0,
                    alasan: "damaged"
                });
                toast.success(`"${product.nama}" berhasil ditambahkan ke keranjang retur.`);
            }
        } catch (err: unknown) {
            const errorObj = err as { message?: string };
            toast.error(errorObj.message || `Gagal memverifikasi produk "${product.nama}" pada Penerimaan.`);
        }
    };

    const handleSave = () => {
        // Filter out items that have 0 or less quantity (user hasn't returned them)
        const activeItems = items.filter((i) => i.kuantitas > 0);

        if (activeItems.length === 0) {
            toast.error("Harap isi kuantitas minimal 1 pcs pada salah satu barang yang ingin diretur.");
            return;
        }

        // Validate max return limits
        for (const item of activeItems) {
            const limit = returnLimitsMap[item.product_id];
            if (limit && item.kuantitas > limit.sisa) {
                toast.error(`Jumlah retur "${item.nama}" (${item.kuantitas} pcs) melebihi batas yang dapat diretur (${limit.sisa} pcs).`);
                return;
            }
            if (!item.alasan) {
                toast.error(`Harap pilih alasan retur untuk "${item.nama}".`);
                return;
            }
        }

        const payload = {
            items: activeItems.map((i) => ({
                product_id: i.product_id,
                kuantitas: i.kuantitas,
                harga_beli: i.harga_estimasi,
                alasan: i.alasan || "damaged",
            })),
        };

        bulkReplace.mutate(
            { id: returnId, data: payload },
            {
                onSuccess: () => {
                    toast.success("Daftar barang retur berhasil disimpan ke server!");
                    clearAll();
                    router.push("/admin/purchase/return");
                },
                onError: (err) => {
                    toast.error(err.message || "Gagal menyimpan barang retur ke server.");
                },
            }
        );
    };

    const reasons = [
        { value: "damaged", label: "Rusak / Cacat" },
        { value: "expired", label: "Kadaluarsa" },
        { value: "wrong_product", label: "Salah Kirim" },
        { value: "other", label: "Lainnya" },
    ];

    const isPending = bulkReplace.isPending;

    // Calculate sum of active return items (where quantity > 0)
    const activeItems = items.filter((i) => i.kuantitas > 0);
    const activeTotalValue = activeItems.reduce((sum, i) => sum + i.kuantitas * i.harga_estimasi, 0);

    return (
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
                            <span>Input Barang Retur — {returnObj.nomor_retur}</span>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold border bg-amber-50 text-amber-700 border-amber-100">
                                Draft
                            </span>
                        </h2>
                        <p className="text-xs text-slate-400 font-sans">
                            Faktur Penerimaan: <span className="font-semibold text-slate-600">{returnObj.stock_receiving?.nomor_penerimaan || "—"}</span> | Supplier: <span className="font-semibold text-slate-600">{returnObj.supplier?.nama || "—"}</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => setIsEditHeaderOpen(true)}
                        variant="outline"
                        className="border-slate-200 text-slate-700 hover:text-slate-900 bg-white font-bold text-xs h-10 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                        <IconEdit size={16} /> Edit Info
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
                            <div className="bg-emerald-50 text-emerald-600 p-1.5 rounded-lg">
                                <IconBarcode size={18} />
                            </div>
                            <h3 className="text-xs font-bold text-slate-900 font-sans">Scan Barcode Retur</h3>
                        </div>

                        <BarcodeInput
                            onProductFound={handleProductFound}
                            onError={(msg) => toast.error(msg)}
                            disabled={isPending}
                            placeholder="Scan barcode distributor atau masukkan kode produk..."
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
                <div className="lg:col-span-4 space-y-6 font-sans">
                    <ReturnInstructionPanel />
                </div>
            </div>

            {/* Sticky Bottom Bar */}
            <BulkSubmitBar
                itemCount={activeItems.reduce((acc, i) => acc + i.kuantitas, 0)}
                productCount={activeItems.length}
                total={activeTotalValue}
                onSubmit={handleSave}
                onReset={clearAll}
                isSubmitting={isPending}
            />

            <ReturnHeaderDialog
                open={isEditHeaderOpen}
                onOpenChange={setIsEditHeaderOpen}
                returnObj={returnObj}
            />
        </div>
    );
}
