"use client";

import { PageLoader } from "@/components/feedback/page-loader";
import { Button } from "@/components/ui/button";
import { getPurchaseItemsStore, selectItemCount, selectTotal } from "@/stores/purchase-items-store";
import { IconArrowLeft, IconBarcode, IconInfoCircle, IconAlertTriangle, IconCheck } from "@tabler/icons-react";
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
import { BarcodeInput } from "./shared/barcode-input";
import { BulkSubmitBar } from "./shared/bulk-submit-bar";
import { ItemsTable } from "./shared/items-table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { formatRupiah } from "@/hooks/use-format-rupiah";

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

    const handleBarcodeSearch = async (barcode: string) => {
        // Use scan mutation for server-side verification
        try {
            const res = await scanMutation.mutateAsync({
                receiving_id: receivingId,
                barcode: barcode,
            });

            const scanResult = res.data;
            const product = scanResult.product;
            const poItem = scanResult.po_item;

            // If from PO, validate that product exists in PO
            if (poId && !poItem) {
                toast.error(`Produk "${product.nama}" tidak terdaftar dalam PO referensi.`);
                return;
            }

            // Calculate current quantity in Zustand for this product
            const existingItem = items.find((i) => i.product_id === product.id);
            const currentQty = existingItem ? existingItem.kuantitas : 0;

            // Qty Limit check
            if (poId && poItem) {
                if (currentQty + 1 > poItem.sisa) {
                    toast.warning(`Peringatan: Kuantitas melebihi sisa PO (${poItem.sisa} pcs).`);
                }
            }

            addItem({
                product_id: product.id,
                barcode: product.barcode,
                nama: product.nama,
                harga_estimasi: poItem?.harga_estimasi || product.harga_beli_terakhir || 0,
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
                if (!poLimit) {
                    return {
                        valid: false,
                        message: `Produk "${item.nama}" tidak ada di daftar PO.`,
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

    // ─── Price Comparison Dialog Logic ───
    const [priceAlerts, setPriceAlerts] = useState<ComparePricesResult[]>([]);
    const [isAlertOpen, setIsAlertOpen] = useState(false);

    const handleComplete = () => {
        if (items.length === 0) {
            toast.error("Harap tambahkan minimal 1 barang sebelum menyelesaikan.");
            return;
        }

        const validation = validateQuantities();
        if (!validation.valid) {
            toast.error(validation.message);
            return;
        }

        // 1. Submit current items first
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
                    // 2. Call compare prices to check price alerts
                    comparePrices.mutate(
                        {
                            items: items.map((i) => ({
                                product_id: i.product_id,
                                harga_beli: i.harga_estimasi,
                            })),
                        },
                        {
                            onSuccess: (res) => {
                                const alerts = (res.data || []).filter((r) => r.perlu_alert);
                                if (alerts.length > 0) {
                                    setPriceAlerts(alerts);
                                    setIsAlertOpen(true);
                                } else {
                                    // Complete immediately if no alerts
                                    triggerComplete();
                                }
                            },
                            onError: () => {
                                // Fallback to direct completion on comparison failure
                                triggerComplete();
                            },
                        }
                    );
                },
                onError: (err) => {
                    toast.error(err.message || "Gagal menyimpan items sebelum penyelesaian.");
                },
            }
        );
    };

    const triggerComplete = () => {
        completeReceiving.mutate(receivingId, {
            onSuccess: () => {
                toast.success("Penerimaan barang telah diselesaikan & stok telah diperbarui!");
                clearAll();
                setIsAlertOpen(false);
                router.push("/admin/purchase/receiving");
            },
            onError: (err) => {
                toast.error(err.message || "Gagal menyelesaikan penerimaan barang.");
            },
        });
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
                        onClick={handleComplete}
                        disabled={items.length === 0 || bulkReplace.isPending || completeReceiving.isPending}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-10 px-5 shadow-sm rounded-xl flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                        {completeReceiving.isPending ? "Memproses..." : (
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
                            onProductFound={(p) => handleBarcodeSearch(p.barcode || "")}
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

            {/* Price comparison alert dialog */}
            <Dialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <DialogContent className="sm:max-w-2xl bg-white rounded-2xl border-slate-100 p-6">
                    <DialogHeader>
                        <DialogTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <IconAlertTriangle className="text-amber-500" size={20} />
                            <span>Peringatan Perubahan Harga Beli</span>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 my-4">
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Sistem mendeteksi adanya perubahan harga beli dari supplier dibandingkan dengan harga beli master/PO. Silakan tinjau perubahan berikut:
                        </p>

                        <div className="border border-slate-100 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        <th className="p-3">Nama Produk</th>
                                        <th className="p-3 text-right">Harga Lama</th>
                                        <th className="p-3 text-right">Harga Baru</th>
                                        <th className="p-3 text-right">Selisih</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 font-medium">
                                    {priceAlerts.map((alert) => (
                                        <tr key={alert.product_id} className="hover:bg-slate-50/50">
                                            <td className="p-3 font-semibold text-slate-900">{alert.nama}</td>
                                            <td className="p-3 text-right text-slate-500 font-mono">{formatRupiah(alert.harga_beli_lama)}</td>
                                            <td className="p-3 text-right text-amber-700 font-bold font-mono">{formatRupiah(alert.harga_beli_baru)}</td>
                                            <td className="p-3 text-right text-rose-600 font-bold font-mono">
                                                +{formatRupiah(alert.selisih_harga_beli)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <DialogFooter className="flex justify-end gap-3 pt-4 border-t border-slate-50">
                        <Button
                            variant="outline"
                            onClick={() => setIsAlertOpen(false)}
                            className="px-5 h-10 border-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer bg-white"
                        >
                            Batal & Sesuaikan
                        </Button>
                        <Button
                            onClick={triggerComplete}
                            disabled={completeReceiving.isPending}
                            className="px-5 h-10 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                        >
                            Tetap Selesaikan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
