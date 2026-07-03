"use client";

import { PageLoader } from "@/components/feedback/page-loader";
import { Button } from "@/components/ui/button";
import { getPurchaseItemsStore, selectItemCount, selectTotal, clearPurchaseItemsStore } from "@/stores/purchase-items-store";
import { IconArrowLeft, IconBarcode, IconCheck, IconEdit, IconInfoCircle, IconX } from "@tabler/icons-react";
import { useAppRouter } from "@/hooks/use-app-router";
import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, type ProductInput } from "@/features/products/schemas/product-schema";
import { ProductFormDialog } from "@/features/products/components/product-form-dialog";
import { toast } from "sonner";
import {
    useBulkReplaceReceivingItems,
    useReceivingDetail,
    useCompleteReceiving,
    usePurchaseOrderDetail,
    useScanReceivingProduct,
    useComparePrices,
    useUpdateReceiving,
    type ComparePricesResult
} from "../../../api/purchase-api";
import type { PurchaseItemLocal, Receiving } from "../../../types";
import type { Product } from "@/features/products/types";
import { BarcodeInput } from "@/components/shared/barcode-input";
import { BulkSubmitBar } from "../../shared/bulk-submit-bar";
import { ItemsTable } from "../../shared/items-table";
import { ReceivingHeaderDialog } from "../receiving-header-dialog";
import { ReceivingFinalizeDialog } from "../receiving-finalize-dialog";
import { RECEIVING_STATUS } from "@/constants/purchase";
import { PriceAlertDialog, type PriceAlertFormInput } from "./price-alert-dialog";
import { ReceivingInstructionPanel } from "./receiving-instruction-panel";

interface ReceivingItemsPageProps {
    receivingId: string;
}

export function ReceivingItemsPage({ receivingId }: ReceivingItemsPageProps) {
    const { data: receiving, isLoading: receivingLoading, error } = useReceivingDetail(receivingId);
    const router = useAppRouter();

    if (receivingLoading) {
        return <PageLoader message="Memuat detail Penerimaan..." />;
    }

    if (error || !receiving) {
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

    if (receiving.status !== RECEIVING_STATUS.DRAFT) {
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

    return <ReceivingItemsContainer receivingId={receivingId} receiving={receiving} />;
}

function ReceivingItemsContainer({ receivingId, receiving }: { receivingId: string; receiving: Receiving }) {
    const [isEditHeaderOpen, setIsEditHeaderOpen] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [notFoundQuery, setNotFoundQuery] = useState("");

    const dialogMethods = useForm<ProductInput>({
        resolver: zodResolver(productSchema) as Resolver<ProductInput>,
        defaultValues: {
            nama: "",
            merek: "Umum",
            barcode: "",
            harga: 0,
            stok: 0,
            harga_beli: 0,
            margin: 0,
            category_uid: null,
            brand_uid: null,
            image: null,
            is_jasa: false,
        },
    });

    const handleOpenCreateDialog = (query: string) => {
        const cleanQuery = query.trim();
        const isBarcode = /^\d+$/.test(cleanQuery);
        dialogMethods.reset({
            nama: isBarcode ? "" : cleanQuery,
            merek: "Umum",
            barcode: isBarcode ? cleanQuery : "",
            harga: 0,
            stok: 0,
            harga_beli: 0,
            margin: 0,
            category_uid: null,
            brand_uid: null,
            image: null,
            is_jasa: false,
        });
        setIsCreateDialogOpen(true);
    };
    const router = useAppRouter();
    const store = getPurchaseItemsStore(receivingId, "receiving");
    const items = store((state) => state.items);
    const addItem = store((state) => state.addItem);
    const clearAll = store((state) => state.clearAll);
    const updateItem = store((state) => state.updateItem);
    const removeItem = store((state) => state.removeItem);

    const itemCount = store(selectItemCount);
    const totalValue = store(selectTotal);

    const bulkReplace = useBulkReplaceReceivingItems();
    const updateReceiving = useUpdateReceiving();
    const completeReceiving = useCompleteReceiving();
    const comparePrices = useComparePrices();
    const scanMutation = useScanReceivingProduct();

    const poId = receiving.purchase_order_uid || null;
    const { data: poData } = usePurchaseOrderDetail(poId);

    const isFirstLoad = useRef(true);

    // Build PO sisa reference map for validation
    const poRemainingMap = useRef<Record<string, { sisa: number; nama: string }>>({});
    useEffect(() => {
        if (poData?.items) {
            const map: Record<string, { sisa: number; nama: string }> = {};
            poData.items.forEach((item) => {
                map[String(item.product_uid)] = {
                    sisa: item.sisa_belum_diterima,
                    nama: item.product?.nama || "Produk",
                };
            });
            poRemainingMap.current = map;
        }
    }, [poData]);

    const getProductInfo = (productId: string | number) => {
        const targetId = (productId);
        const recItem = receiving.items?.find((item) => item.product_uid === targetId);
        if (recItem?.product) return recItem.product;

        const poItem = poData?.items?.find((item) => item.product_uid === targetId);
        if (poItem?.product) return poItem.product;

        return null;
    };

    // Initialize items: load existing items from receiving draft or from PO sisa
    useEffect(() => {
        if (!isFirstLoad.current) return;

        if (store.getState().items.length > 0) {
            isFirstLoad.current = false;
            return;
        }

        // 1. If we have existing receiving items in draft, load them
        if (receiving.items && receiving.items.length > 0) {
            const dbItems: PurchaseItemLocal[] = receiving.items.map((item) => ({
                temp_uid: `${Date.now()}-${item.uid}-${Math.random().toString(36).substring(2, 5)}`,
                product_uid: String(item.product_uid),
                barcode: item.product?.barcode || null,
                nama: item.product?.nama || "Produk Tanpa Nama",
                kuantitas: item.kuantitas,
                harga_estimasi: item.product?.harga_beli ?? item.harga_beli,
            }));
            store.setState({ items: dbItems });
            isFirstLoad.current = false;
        }
        // 2. Else if it's linked to PO and PO has items, wait until PO data is loaded, then populate
        else if (poId) {
            if (poData?.items && poData.items.length > 0) {
                const poItems: PurchaseItemLocal[] = poData.items
                    .filter((item) => item.sisa_belum_diterima > 0)
                    .map((item) => ({
                        temp_uid: `${Date.now()}-${item.uid}-${Math.random().toString(36).substring(2, 5)}`,
                        product_uid: String(item.product_uid),
                        barcode: item.product?.barcode || null,
                        nama: item.product?.nama || "Produk Tanpa Nama",
                        kuantitas: item.sisa_belum_diterima,
                        harga_estimasi: item.product?.harga_beli ?? item.harga_estimasi, // default to product's current buy price, fallback to PO price
                    }));
                store.setState({ items: poItems });
                isFirstLoad.current = false;
            }
        }
        // 3. If no items in draft and no PO, we are done
        else {
            isFirstLoad.current = false;
        }
    }, [receiving.items, poId, poData, store]);

    const handleProductFound = async (product: Product) => {
        // If there is no PO: we bypass scan endpoint and add directly
        if (!poId) {
            addItem({
                product_uid: product.uid,
                barcode: product.barcode,
                nama: product.nama,
                harga_estimasi: product.harga_beli || 0,
            });
            toast.success(`Ditambahkan: ${product.nama}`);
            return;
        }

        // If from PO, use scan mutation for verification
        try {
            const res = await scanMutation.mutateAsync({
                receiving_uid: receivingId,
                barcode: product.barcode || "",
            });

            if (!res || !res.data || !res.data.product) {
                // Fallback: Add directly if valid product but scan endpoint didn't return product info
                addItem({
                    product_uid: product.uid,
                    barcode: product.barcode,
                    nama: product.nama,
                    harga_estimasi: product.harga_beli || 0,
                });
                toast.success(`Ditambahkan: ${product.nama} (Luar PO)`);
                return;
            }

            const scanResult = res.data;
            const poItem = scanResult.po_item;

            // If it is in the PO, perform the limit warning check
            if (poItem) {
                // Calculate current quantity in Zustand for this product
                const existingItem = items.find((i) => i.product_uid === product.uid);
                const currentQty = existingItem ? existingItem.kuantitas : 0;

                // Qty Limit check
                if (currentQty + 1 > poItem.sisa) {
                    toast.warning(`Peringatan: Kuantitas melebihi sisa PO (${poItem.sisa} pcs).`);
                }
            }

            addItem({
                product_uid: product.uid,
                barcode: product.barcode,
                nama: product.nama,
                harga_estimasi: product.harga_beli || scanResult.product.harga_beli || scanResult.product.harga_beli_terakhir || poItem?.harga_estimasi || 0,
            });
            toast.success(`Ditambahkan: ${product.nama}`);
        } catch {
            addItem({
                product_uid: product.uid,
                barcode: product.barcode,
                nama: product.nama,
                harga_estimasi: product.harga_beli || 0,
            });
            toast.success(`Ditambahkan: ${product.nama} (Luar PO)`);
        }
    };

    // Validation check before bulk submit
    const validateQuantities = () => {
        if (poId) {
            for (const item of items) {
                const poLimit = poRemainingMap.current[item.product_uid];
                if (poLimit && item.kuantitas > poLimit.sisa) {
                    return {
                        valid: false,
                        message: `Kuantitas untuk "${item.nama}" (${item.kuantitas} pcs) melebihi sisa PO yang belum diterima (${poLimit.sisa} pcs).`,
                    };
                }
            }
        }
        return { valid: true };
    };

    const handleBulkSubmit = () => {
        if (items.length === 0) {
            toast.error("Harap tambahkan minimal 1 barang sebelum menyimpan.");
            return;
        }

        const validation = validateQuantities();
        if (!validation.valid) {
            toast.error(validation.message);
            return;
        }

        // Format payload to match ReceivingBulkItemsInput: { items: [{ product_uid, kuantitas, harga_beli }] }
        const payload = {
            items: items.map((item) => ({
                product_uid: item.product_uid,
                kuantitas: item.kuantitas,
                harga_beli: item.harga_estimasi,
            })),
        };

        bulkReplace.mutate(
            { uid: receivingId, data: payload },
            {
                onSuccess: () => {
                    toast.success("Daftar barang penerimaan berhasil disimpan.");
                },
                onError: (err) => {
                    toast.error(err.message || "Gagal menyimpan daftar barang.");
                },
            }
        );
    };

    const handleReset = () => {
        if (confirm("Apakah Anda yakin ingin mengosongkan daftar barang di halaman ini? Perubahan lokal akan hilang.")) {
            clearAll();
            toast.info("Daftar barang lokal berhasil dikosongkan.");
        }
    };

    // ─── Price Comparison & Finalization Logic ───
    const [priceAlerts, setPriceAlerts] = useState<ComparePricesResult[]>([]);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [isFinalizeOpen, setIsFinalizeOpen] = useState(false);
    const [isFinalizing, setIsFinalizing] = useState(false);

    const handleFinalizeConfirm = async (formData: {
        nomor_faktur: string;
        nilai_faktur: number;
        catatan: string | null;
    }) => {
        setIsFinalizing(true);
        try {
            const itemsPayload = items.map((item) => ({
                product_uid: item.product_uid,
                kuantitas: item.kuantitas,
                harga_beli: item.harga_estimasi,
            }));

            const payload = {
                purchase_order_uid: receiving.purchase_order_uid ? Number(receiving.purchase_order_uid) : null,
                supplier_uid: receiving.supplier_uid ? Number(receiving.supplier_uid) : null,
                nomor_faktur: formData.nomor_faktur,
                nilai_faktur: Number(formData.nilai_faktur),
                tanggal_terima: receiving.tanggal_terima || (receiving.created_at ? receiving.created_at.split("T")[0] : ""),
                status_pembayaran: receiving.status_pembayaran,
                catatan: formData.catatan,
                status: receiving.status,
                items: itemsPayload,
            };

            // Save updated header + items to backend
            await updateReceiving.mutateAsync({ uid: receivingId, data: payload });

            // Finalize completion
            await completeReceiving.mutateAsync(receivingId);

            toast.success("Penerimaan barang telah diselesaikan & stok/harga telah diperbarui!");
            clearAll();
            clearPurchaseItemsStore(receivingId, "receiving");
            router.push("/admin/purchase/receiving");
        } catch (err: unknown) {
            const errorObj = err as { message?: string };
            toast.error(errorObj.message || "Gagal menyelesaikan penerimaan barang.");
        } finally {
            setIsFinalizing(false);
            setIsFinalizeOpen(false);
        }
    };

    const handleComplete = async () => {
        if (items.length === 0) {
            toast.error("Harap tambahkan minimal 1 barang sebelum menyelesaikan.");
            return;
        }

        const validation = validateQuantities();
        if (!validation.valid) {
            toast.error(validation.message);
            return;
        }

        // Save current items first before checking price changes
        const payload = {
            items: items.map((item) => ({
                product_uid: item.product_uid,
                kuantitas: item.kuantitas,
                harga_beli: item.harga_estimasi,
            })),
        };

        try {
            await bulkReplace.mutateAsync({ uid: receivingId, data: payload });

            // Call compare prices to check price alerts
            const res = await comparePrices.mutateAsync({
                items: items.map((i) => ({
                    product_uid: i.product_uid,
                    harga_beli: i.harga_estimasi,
                })),
            });

            const alerts = (res.data || []).filter((r) => r.perlu_alert);
            if (alerts.length > 0) {
                setPriceAlerts(alerts);
                setIsAlertOpen(true);
            } else {
                // No alerts, proceed to final confirmation directly
                setIsFinalizeOpen(true);
            }
        } catch (err: unknown) {
            const errorObj = err as { message?: string };
            toast.error(errorObj.message || "Gagal menyimpan items sebelum penyelesaian.");
        }
    };

    const handleCompleteWithoutPrices = () => {
        setIsAlertOpen(false);
        setIsFinalizeOpen(true);
    };

    const handleCompleteWithPrices = async (formValues: PriceAlertFormInput) => {
        const payload = {
            items: items.map((item) => {
                const pricing = formValues.items.find((fit) => fit.product_uid === item.product_uid);
                return {
                    product_uid: item.product_uid,
                    kuantitas: item.kuantitas,
                    harga_beli: item.harga_estimasi,
                    update_harga_jual: pricing ? pricing.update_harga_jual : false,
                    harga_jual_baru: pricing && pricing.update_harga_jual ? pricing.harga_jual_baru : null,
                    margin_baru: pricing && pricing.update_harga_jual ? pricing.margin_baru : null,
                };
            }),
        };
        try {
            await bulkReplace.mutateAsync({ uid: receivingId, data: payload });
            setIsAlertOpen(false);
            setIsFinalizeOpen(true);
        } catch (err: unknown) {
            const errorObj = err as { message?: string };
            toast.error(errorObj.message || "Gagal menyimpan update harga.");
        }
    };

    const uniqueProductCount = items.length;

    return (
        <FormProvider {...dialogMethods}>
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
                                <span>Input Barang Penerimaan — {receiving.nomor_penerimaan}</span>
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold border bg-amber-50 text-amber-700 border-amber-100">
                                    Draft
                                </span>
                            </h2>
                            <p className="text-xs text-slate-400">
                                Faktur: <span className="font-semibold text-slate-600">{receiving.nomor_faktur || "-"}</span> | Supplier: <span className="font-semibold text-slate-600">{receiving.supplier_relationship?.nama || receiving.supplier || "-"}</span>
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

                        <Button
                            onClick={() => setIsEditHeaderOpen(true)}
                            variant="outline"
                            className="border-slate-200 text-slate-700 hover:text-slate-900 bg-white font-bold text-xs h-10 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer shrink-0"
                        >
                            <IconEdit size={16} /> Edit Info
                        </Button>

                        <Button
                            onClick={handleComplete}
                            disabled={items.length === 0 || bulkReplace.isPending || completeReceiving.isPending || isFinalizing}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-10 px-5 shadow-sm rounded-xl flex items-center gap-1.5 cursor-pointer shrink-0 border-none"
                        >
                            {isFinalizing || completeReceiving.isPending ? "Memproses..." : (
                                <>
                                    <IconCheck size={16} /> Selesai & Tambah Stok
                                </>
                            )}
                        </Button>
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
                                disabled={bulkReplace.isPending}
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
                                onUpdateItem={(temp_uid, data) => {
                                    // Qty Limit warning check on adjustment
                                    const item = items.find((i) => i.temp_uid === temp_uid);
                                    if (item && data.kuantitas && poId) {
                                        const poLimit = poRemainingMap.current[item.product_uid];
                                        if (poLimit && data.kuantitas > poLimit.sisa) {
                                            toast.warning(`Peringatan: Kuantitas melebihi sisa PO (${poLimit.sisa} pcs).`);
                                        }
                                    }
                                    updateItem(temp_uid, data);
                                }}
                                onRemoveItem={removeItem}
                                disabled={bulkReplace.isPending}
                            />
                        </div>
                    </div>

                    {/* Sidebar Info/Instruction */}
                    <div className="lg:col-span-4 space-y-6">
                        <ReceivingInstructionPanel poId={poId} />
                    </div>
                </div>

                {/* Sticky Bottom Submit Bar */}
                <div className="sticky bottom-0 z-10">
                    <BulkSubmitBar
                        onSubmit={handleBulkSubmit}
                        onReset={handleReset}
                        isSubmitting={bulkReplace.isPending}
                        itemCount={itemCount}
                        total={totalValue}
                        productCount={uniqueProductCount}
                    />
                </div>

                <ReceivingHeaderDialog
                    open={isEditHeaderOpen}
                    onOpenChange={setIsEditHeaderOpen}
                    receiving={receiving}
                />

                {/* Finalize Dialog */}
                <ReceivingFinalizeDialog
                    open={isFinalizeOpen}
                    onOpenChange={setIsFinalizeOpen}
                    receiving={receiving}
                    items={items}
                    isPending={isFinalizing || updateReceiving.isPending || completeReceiving.isPending}
                    onConfirm={handleFinalizeConfirm}
                />

                {/* Price comparison alert dialog */}
                <PriceAlertDialog
                    open={isAlertOpen}
                    onOpenChange={setIsAlertOpen}
                    priceAlerts={priceAlerts}
                    isFinalizing={isFinalizing}
                    getProductInfo={getProductInfo}
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
            </div>
        </FormProvider>
    );
}
