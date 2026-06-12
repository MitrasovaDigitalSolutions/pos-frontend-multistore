"use client";

import { PageLoader } from "@/components/feedback/page-loader";
import { Button } from "@/components/ui/button";
import { getPurchaseItemsStore, selectItemCount, selectTotal } from "@/stores/purchase-items-store";
import { IconArrowLeft, IconBarcode, IconInfoCircle, IconAlertTriangle, IconCheck, IconEdit } from "@tabler/icons-react";
import { useAppRouter } from "@/hooks/use-app-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
    useBulkReplaceReceivingItems,
    useReceivingDetail,
    useCompleteReceiving,
    usePurchaseOrderDetail,
    useScanReceivingProduct,
    useComparePrices,
    type ComparePricesResult
} from "../api/purchase-api";
import type { PurchaseItemLocal, Receiving } from "../types";
import type { Product } from "@/features/products/types";
import { BarcodeInput } from "@/components/shared/barcode-input";
import { BulkSubmitBar } from "./shared/bulk-submit-bar";
import { ItemsTable } from "./shared/items-table";
import { BaseDialog } from "@/components/ui/base-dialog";
import { FormNumberInput } from "@/components/forms/form-number-input";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { ReceivingHeaderDialog } from "./receiving-header-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface ReceivingItemsPageProps {
    receivingId: number;
}

export function ReceivingItemsPage({ receivingId }: ReceivingItemsPageProps) {
    const { data: receiving, isLoading: receivingLoading, error } = useReceivingDetail(receivingId);
    const router = useAppRouter();

    if (receivingLoading) {
        return <PageLoader message="Memuat detail Penerimaan Barang..." />;
    }

    if (error || !receiving) {
        return (
            <div className="p-8 text-center bg-white border border-slate-100 rounded-2xl shadow-sm max-w-md mx-auto mt-12">
                <p className="text-sm font-bold text-slate-800">Error</p>
                <p className="text-xs text-slate-400 mt-1">
                    Penerimaan Barang tidak ditemukan atau terjadi kesalahan saat memuat data.
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

    if (receiving.status !== "draft") {
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

function ReceivingItemsContainer({ receivingId, receiving }: { receivingId: number; receiving: Receiving }) {
    const [isEditHeaderOpen, setIsEditHeaderOpen] = useState(false);
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
    const completeReceiving = useCompleteReceiving();
    const comparePrices = useComparePrices();
    const scanMutation = useScanReceivingProduct();

    // Wait, the PO ID is stored in purchase_order_id. Let's see if our Receiving type has purchase_order_id.
    // In src/features/purchase/types/index.ts, Receiving doesn't explicitly declare purchase_order_id?
    // Wait, let's verify if receiving has purchase_order_id:
    // Yes, the database schema has a purchase_order_id or purchase_order reference. Let's check how the JSON response is structured, or we can just safely cast/read from receiving as any since we might have missed it in typescript definition.
    // Let's check:
    const poId = (receiving as { purchase_order_id?: number | null }).purchase_order_id || null;
    const { data: poData } = usePurchaseOrderDetail(poId);

    const isFirstLoad = useRef(true);

    // Build PO sisa reference map for validation
    const poRemainingMap = useRef<Record<number, { sisa: number; nama: string }>>({});
    useEffect(() => {
        if (poData?.items) {
            const map: Record<number, { sisa: number; nama: string }> = {};
            poData.items.forEach((item) => {
                map[item.product_id] = {
                    sisa: item.sisa_belum_diterima,
                    nama: item.product?.nama || "Produk",
                };
            });
            poRemainingMap.current = map;
        }
    }, [poData]);

    // Initialize items: load existing items from receiving draft or from PO sisa
    useEffect(() => {
        if (isFirstLoad.current) {
            isFirstLoad.current = false;

            // 1. If we have existing receiving items in draft, load them
            if (items.length === 0 && receiving.items && receiving.items.length > 0) {
                const dbItems: PurchaseItemLocal[] = receiving.items.map((item) => ({
                    temp_id: `${Date.now()}-${item.id}-${Math.random().toString(36).substring(2, 5)}`,
                    product_id: item.product_id,
                    barcode: item.product?.barcode || null,
                    nama: item.product?.nama || "Produk Tanpa Nama",
                    kuantitas: item.kuantitas,
                    harga_estimasi: item.harga_beli,
                }));
                store.setState({ items: dbItems });
            }
            // 2. Else if it's linked to PO and PO has items, pre-populate with remaining quantities
            else if (items.length === 0 && poData?.items && poData.items.length > 0) {
                const poItems: PurchaseItemLocal[] = poData.items
                    .filter((item) => item.sisa_belum_diterima > 0)
                    .map((item) => ({
                        temp_id: `${Date.now()}-${item.id}-${Math.random().toString(36).substring(2, 5)}`,
                        product_id: item.product_id,
                        barcode: item.product?.barcode || null,
                        nama: item.product?.nama || "Produk Tanpa Nama",
                        kuantitas: item.sisa_belum_diterima,
                        harga_estimasi: item.harga_estimasi, // default to PO price
                    }));
                store.setState({ items: poItems });
            }
        }
    }, [receiving.items, poData?.items, items.length, store]);

    const handleProductFound = async (product: Product) => {
        // If there is no PO: we bypass scan endpoint and add directly
        if (!poId) {
            addItem({
                product_id: product.id,
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
                receiving_id: receivingId,
                barcode: product.barcode || "",
            });

            if (!res || !res.data || !res.data.product) {
                toast.error(`Produk "${product.nama}" tidak terdaftar.`);
                return;
            }

            const scanResult = res.data;
            const poItem = scanResult.po_item;

            // If it is in the PO, perform the limit warning check
            if (poItem) {
                // Calculate current quantity in Zustand for this product
                const existingItem = items.find((i) => i.product_id === product.id);
                const currentQty = existingItem ? existingItem.kuantitas : 0;

                // Qty Limit check
                if (currentQty + 1 > poItem.sisa) {
                    toast.warning(`Peringatan: Kuantitas melebihi sisa PO (${poItem.sisa} pcs).`);
                }
            }

            addItem({
                product_id: product.id,
                barcode: product.barcode,
                nama: product.nama,
                harga_estimasi: poItem?.harga_estimasi || scanResult.product.harga_beli_terakhir || product.harga_beli || 0,
            });
            toast.success(`Ditambahkan: ${product.nama}`);
        } catch (err: unknown) {
            const errorObj = err as { message?: string };
            toast.error(errorObj.message || "Produk tidak ditemukan atau tidak valid.");
        }
    };

    // Validation check before bulk submit
    const validateQuantities = () => {
        if (poId) {
            for (const item of items) {
                const poLimit = poRemainingMap.current[item.product_id];
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

        // Format payload to match ReceivingBulkItemsInput: { items: [{ product_id, kuantitas, harga_beli }] }
        const payload = {
            items: items.map((item) => ({
                product_id: item.product_id,
                kuantitas: item.kuantitas,
                harga_beli: item.harga_estimasi,
            })),
        };

        bulkReplace.mutate(
            { id: receivingId, data: payload },
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
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isFinalizing, setIsFinalizing] = useState(false);

    interface PriceAlertFormInput {
        items: {
            product_id: number;
            update_harga_jual: boolean;
            margin_baru: number;
            harga_jual_baru: number;
        }[];
    }

    const alertFormMethods = useForm<PriceAlertFormInput>({
        defaultValues: {
            items: [],
        },
    });

    const formItems = useWatch({ name: "items", control: alertFormMethods.control });
    const prevItemsRef = useRef<PriceAlertFormInput["items"]>([]);

    useEffect(() => {
        if (!formItems || formItems.length === 0) return;

        formItems.forEach((item, idx) => {
            const prev = prevItemsRef.current[idx];
            if (!prev) return;

            const alert = priceAlerts.find((a) => a.product_id === item.product_id);
            if (!alert) return;

            const buyPrice = alert.harga_beli_baru;

            // If margin changed
            if (item.margin_baru !== prev.margin_baru) {
                const calculatedHargaJual = Math.round(buyPrice * (1 + (item.margin_baru || 0) / 100));
                if (item.harga_jual_baru !== calculatedHargaJual) {
                    alertFormMethods.setValue(`items.${idx}.harga_jual_baru`, calculatedHargaJual);
                }
            }
            // If harga jual changed
            else if (item.harga_jual_baru !== prev.harga_jual_baru) {
                const calculatedMargin = buyPrice > 0 ? (((item.harga_jual_baru || 0) / buyPrice) - 1) * 100 : 0;
                const roundedMargin = Math.round(calculatedMargin * 100) / 100;
                if (item.margin_baru !== roundedMargin) {
                    alertFormMethods.setValue(`items.${idx}.margin_baru`, roundedMargin);
                }
            }
        });

        prevItemsRef.current = JSON.parse(JSON.stringify(formItems));
    }, [formItems, priceAlerts, alertFormMethods]);

    const handleUseSaran = (idx: number, alert: ComparePricesResult) => {
        alertFormMethods.setValue(`items.${idx}.margin_baru`, alert.margin_lama);
        alertFormMethods.setValue(`items.${idx}.harga_jual_baru`, alert.harga_jual_saran);
        alertFormMethods.setValue(`items.${idx}.update_harga_jual`, true);
    };

    const executeFinalizeComplete = async (payload?: {
        items: Array<{
            product_id: number;
            kuantitas: number;
            harga_beli: number;
            update_harga_jual: boolean;
            harga_jual_baru: number | null;
            margin_baru: number | null;
        }>;
    }) => {
        setIsFinalizing(true);
        try {
            if (payload) {
                // If we have custom pricing parameters to apply, update them first
                await bulkReplace.mutateAsync({ id: receivingId, data: payload });
            }

            // Finalize completion
            await completeReceiving.mutateAsync(receivingId);

            toast.success("Penerimaan barang telah diselesaikan & stok/harga telah diperbarui!");
            clearAll();
            router.push("/admin/purchase/receiving");
        } catch (err: unknown) {
            const errorObj = err as { message?: string };
            toast.error(errorObj.message || "Gagal menyelesaikan penerimaan barang.");
        } finally {
            setIsFinalizing(false);
            setIsAlertOpen(false);
            setIsConfirmOpen(false);
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
                product_id: item.product_id,
                kuantitas: item.kuantitas,
                harga_beli: item.harga_estimasi,
            })),
        };

        try {
            await bulkReplace.mutateAsync({ id: receivingId, data: payload });

            // Call compare prices to check price alerts
            const res = await comparePrices.mutateAsync({
                items: items.map((i) => ({
                    product_id: i.product_id,
                    harga_beli: i.harga_estimasi,
                })),
            });

            const alerts = (res.data || []).filter((r) => r.perlu_alert);
            if (alerts.length > 0) {
                const initialItems = alerts.map((alert) => ({
                    product_id: alert.product_id,
                    update_harga_jual: false,
                    margin_baru: alert.margin_lama,
                    harga_jual_baru: alert.harga_jual_saran,
                }));
                prevItemsRef.current = JSON.parse(JSON.stringify(initialItems));
                alertFormMethods.reset({ items: initialItems });
                setPriceAlerts(alerts);
                setIsAlertOpen(true);
            } else {
                // No alerts, proceed to final confirmation directly
                setIsConfirmOpen(true);
            }
        } catch (err: unknown) {
            const errorObj = err as { message?: string };
            toast.error(errorObj.message || "Gagal menyimpan items sebelum penyelesaian.");
        }
    };

    const handleCompleteWithoutPrices = () => {
        executeFinalizeComplete();
    };

    const handleCompleteWithPrices = () => {
        const formValues = alertFormMethods.getValues();
        const payload = {
            items: items.map((item) => {
                const pricing = formValues.items.find((fit) => fit.product_id === item.product_id);
                return {
                    product_id: item.product_id,
                    kuantitas: item.kuantitas,
                    harga_beli: item.harga_estimasi,
                    update_harga_jual: pricing ? pricing.update_harga_jual : false,
                    harga_jual_baru: pricing && pricing.update_harga_jual ? pricing.harga_jual_baru : null,
                    margin_baru: pricing && pricing.update_harga_jual ? pricing.margin_baru : null,
                };
            }),
        };
        executeFinalizeComplete(payload);
    };

    const uniqueProductCount = items.length;

    return (
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
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-10 px-5 shadow-sm rounded-xl flex items-center gap-1.5 cursor-pointer shrink-0"
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
                            onProductFound={handleProductFound}
                            onError={(msg) => toast.error(msg)}
                            disabled={bulkReplace.isPending}
                            placeholder="Scan barcode distributor atau masukkan kode produk..."
                        />
                    </div>

                    {/* Table of items */}
                    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden pb-24">
                        <ItemsTable
                            items={items}
                            priceLabel="Harga Beli"
                            onUpdateItem={(temp_id, data) => {
                                // Qty Limit warning check on adjustment
                                const item = items.find((i) => i.temp_id === temp_id);
                                if (item && data.kuantitas && poId) {
                                    const poLimit = poRemainingMap.current[item.product_id];
                                    if (poLimit && data.kuantitas > poLimit.sisa) {
                                        toast.warning(`Peringatan: Kuantitas melebihi sisa PO (${poLimit.sisa} pcs).`);
                                    }
                                }
                                updateItem(temp_id, data);
                            }}
                            onRemoveItem={removeItem}
                            disabled={bulkReplace.isPending}
                        />
                    </div>
                </div>

                {/* Sidebar Info/Instruction */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
                        <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <IconInfoCircle size={16} className="text-blue-500" />
                            <span>Petunjuk Penerimaan</span>
                        </h4>
                        <ul className="text-[11px] text-slate-500 space-y-2 list-disc pl-4 leading-relaxed">
                            <li>Scan barcode barang yang datang dari supplier.</li>
                            <li>Pastikan harga beli disesuaikan dengan faktur fisik.</li>
                            <li>Gunakan tombol <strong>Simpan Semua Items ke Server</strong> sewaktu-waktu untuk menyimpan progres draft Anda.</li>
                            <li>Klik tombol <strong>Selesai & Tambah Stok</strong> jika semua item faktur sudah terinput lengkap dan sesuai.</li>
                            {poId && <li>Kuantitas yang diinput tidak boleh melebihi sisa kuantitas barang yang dipesan di PO.</li>}
                        </ul>
                    </div>
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

            {/* Confirm Dialog */}
            <ConfirmDialog
                open={isConfirmOpen}
                onOpenChange={setIsConfirmOpen}
                title="Selesaikan Penerimaan"
                description="Apakah Anda yakin ingin menyelesaikan penerimaan ini? Stok produk akan langsung ditambahkan ke inventori dan tidak dapat diubah lagi."
                confirmText="Ya, Selesaikan"
                cancelText="Batal"
                variant="warning"
                onConfirm={() => executeFinalizeComplete()}
                isLoading={isFinalizing}
            />

            {/* Price comparison alert dialog */}
            <BaseDialog
                open={isAlertOpen}
                onOpenChange={setIsAlertOpen}
                title={
                    <span className="flex items-center gap-2">
                        <IconAlertTriangle className="text-amber-500" size={20} />
                        <span>Peringatan Perubahan Harga Beli</span>
                    </span>
                }
                className="sm:max-w-4xl"
            >
                <FormProvider {...alertFormMethods}>
                    <div className="space-y-4 my-4">
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Sistem mendeteksi adanya perubahan harga beli dari supplier dibandingkan dengan harga beli master/PO. Silakan tinjau perubahan berikut dan Anda dapat memperbarui harga jual atau margin produk secara langsung:
                        </p>

                        <div className="border border-slate-100 rounded-xl overflow-x-auto overflow-y-auto max-h-[350px]">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        <th className="p-3">Nama Produk</th>
                                        <th className="p-3 text-right">Harga Beli</th>
                                        <th className="p-3 text-center w-36">Update Harga Jual?</th>
                                        <th className="p-3 text-left w-64">Margin & Harga Jual Baru</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 font-medium">
                                    {priceAlerts.map((alert, idx) => {
                                        const isUpdateActive = formItems && formItems[idx]?.update_harga_jual;
                                        return (
                                            <tr key={alert.product_id} className="hover:bg-slate-50/50">
                                                <td className="p-3">
                                                    <p className="font-semibold text-slate-900">{alert.nama}</p>
                                                    <p className="text-[10px] text-slate-400 mt-0.5">
                                                        Jual Lama: {formatRupiah(alert.harga_jual_lama)} (Margin: {alert.margin_lama}%)
                                                    </p>
                                                </td>
                                                <td className="p-3 text-right whitespace-nowrap">
                                                    <div className="font-mono text-slate-400 line-through text-[10px]">
                                                        {formatRupiah(alert.harga_beli_lama)}
                                                    </div>
                                                    <div className="font-mono font-bold text-amber-700">
                                                        {formatRupiah(alert.harga_beli_baru)}
                                                    </div>
                                                    <div className="text-[10px] text-rose-600 font-bold font-mono">
                                                        +{formatRupiah(alert.selisih_harga_beli)}
                                                    </div>
                                                </td>
                                                <td className="p-3 text-center">
                                                    <input
                                                        type="checkbox"
                                                        id={`update-price-${alert.product_id}`}
                                                        {...alertFormMethods.register(`items.${idx}.update_harga_jual`)}
                                                        className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                                    />
                                                </td>
                                                <td className="p-3">
                                                    {isUpdateActive ? (
                                                        <div className="space-y-1.5">
                                                            <div className="flex gap-2 items-center">
                                                                <div className="space-y-0.5">
                                                                    <span className="text-[9px] text-slate-400 font-bold block">Margin %</span>
                                                                    <FormNumberInput<PriceAlertFormInput>
                                                                        name={`items.${idx}.margin_baru`}
                                                                        className="w-16 h-8 text-center"
                                                                    />
                                                                </div>
                                                                <div className="space-y-0.5">
                                                                    <span className="text-[9px] text-slate-400 font-bold block">Harga Jual (Rp)</span>
                                                                    <FormNumberInput<PriceAlertFormInput>
                                                                        name={`items.${idx}.harga_jual_baru`}
                                                                        className="w-28 h-8 px-2 text-right"
                                                                    />
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleUseSaran(idx, alert)}
                                                                    className="px-2 h-8 text-[9px] font-bold bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg self-end cursor-pointer border border-slate-200"
                                                                >
                                                                    Saran
                                                                </button>
                                                            </div>
                                                            <div className="text-[10px] text-emerald-600 font-semibold">
                                                                Saran: {formatRupiah(alert.harga_jual_saran)} (Margin {alert.margin_lama}%)
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                alertFormMethods.setValue(`items.${idx}.update_harga_jual`, true);
                                                            }}
                                                            className="px-3 py-1.5 text-[10px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-colors cursor-pointer border border-emerald-100/50"
                                                        >
                                                            Ubah Harga Jual
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t border-slate-100 shrink-0 bg-white">
                        <Button
                            variant="outline"
                            onClick={() => setIsAlertOpen(false)}
                            disabled={isFinalizing}
                            className="px-5 h-10 border-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer bg-white"
                        >
                            Batal & Sesuaikan
                        </Button>
                        <Button
                            onClick={handleCompleteWithoutPrices}
                            disabled={isFinalizing}
                            className="px-5 h-10 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                        >
                            {isFinalizing ? "Memproses..." : "Tetap Selesaikan (Tanpa Update Harga Jual)"}
                        </Button>
                        <Button
                            onClick={handleCompleteWithPrices}
                            disabled={isFinalizing}
                            className="px-5 h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                        >
                            {isFinalizing ? "Memproses..." : "Selesaikan & Terapkan Harga Baru"}
                        </Button>
                    </div>
                </FormProvider>
            </BaseDialog>
        </div>
    );
}
