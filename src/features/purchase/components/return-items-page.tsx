"use client";

import { PageLoader } from "@/components/feedback/page-loader";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { getPurchaseItemsStore } from "@/stores/purchase-items-store";
import { IconArrowLeft, IconBarcode, IconDeviceFloppy, IconInfoCircle, IconTrash } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import {
    useBulkReplacePurchaseReturnItems,
    usePurchaseReturnDetail,
    useReturnableItems,
    useScanReturnProduct
} from "../api/purchase-api";
import type { PurchaseItemLocal, PurchaseReturn } from "../types";
import { BarcodeInput } from "./shared/barcode-input";
import { BulkSubmitBar } from "./shared/bulk-submit-bar";

interface ReturnItemsPageProps {
    returnId: number;
}

export function ReturnItemsPage({ returnId }: ReturnItemsPageProps) {
    const { data: returnObj, isLoading: returnLoading, error } = usePurchaseReturnDetail(returnId);
    const router = useRouter();

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

    if (returnObj.status !== "draft") {
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
    const router = useRouter();
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
        if (isFirstLoad.current) {
            isFirstLoad.current = false;

            // 1. If we have existing return items in draft, load them
            if (items.length === 0 && returnObj.items && returnObj.items.length > 0) {
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
            }
            // 2. Else pre-populate items with returnable items from receiving (start with 0 qty)
            else if (items.length === 0 && returnableItems && returnableItems.length > 0) {
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
            }
        }
    }, [returnObj.items, returnableItems, items.length, store]);

    const handleBarcodeSearch = async (barcode: string) => {
        if (!returnObj.stock_receiving_id) return;

        try {
            const res = await scanMutation.mutateAsync({
                receiving_id: returnObj.stock_receiving_id,
                barcode: barcode,
            });

            const scanResult = res.data;
            const product = scanResult.product;

            // Find item in Zustand store
            const existingItem = items.find((i) => i.product_id === product.id);
            const currentQty = existingItem ? existingItem.kuantitas : 0;
            const maxLimit = scanResult.kuantitas_sisa;

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
                    harga_estimasi: product.harga_beli,
                    alasan: "damaged"
                });
                toast.success(`"${product.nama}" berhasil ditambahkan ke keranjang retur.`);
            }
        } catch (err: unknown) {
            const errMsg = err instanceof Error ? err.message : "Produk tidak ditemukan dalam penerimaan barang ini.";
            toast.error(errMsg);
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
                        <p className="text-xs text-slate-400">
                            Faktur Penerimaan: <span className="font-semibold text-slate-600">{returnObj.stock_receiving?.nomor_penerimaan || "—"}</span> | Supplier: <span className="font-semibold text-slate-600">{returnObj.supplier?.nama || "—"}</span>
                        </p>
                    </div>
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
                            <h3 className="text-xs font-bold text-slate-900">Scan Barcode Retur</h3>
                        </div>

                        <BarcodeInput
                            onProductFound={(p) => handleBarcodeSearch(p.barcode || "")}
                            onError={(msg) => toast.error(msg)}
                            disabled={isPending}
                            placeholder="Scan barcode distributor atau masukkan kode produk..."
                        />
                    </div>

                    {/* Table of items */}
                    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden pb-24">
                        {items.length === 0 ? (
                            <div className="border border-dashed border-slate-200 rounded-2xl p-8 text-center m-6">
                                <div className="w-16 h-16 mx-auto mb-4 bg-slate-50 rounded-2xl flex items-center justify-center">
                                    <IconDeviceFloppy size={28} className="text-slate-300" />
                                </div>
                                <p className="text-sm font-bold text-slate-500">Tidak ada barang terdaftar</p>
                                <p className="text-xs text-slate-400 mt-1">
                                    Penerimaan barang referensi tidak memiliki item untuk diretur.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                <th className="p-3 w-10">No</th>
                                                <th className="p-3">Barcode</th>
                                                <th className="p-3">Nama Produk</th>
                                                <th className="p-3 text-center w-24">Sisa Penerimaan</th>
                                                <th className="p-3 text-center w-24">Qty Retur</th>
                                                <th className="p-3 text-right w-32">Harga Beli</th>
                                                <th className="p-3 text-right w-32">Subtotal</th>
                                                <th className="p-3 w-40">Alasan Retur</th>
                                                <th className="p-3 w-12"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {items.map((item, idx) => {
                                                const limit = returnLimitsMap[item.product_id];
                                                const maxReturnable = limit ? limit.sisa : 0;
                                                const subtotal = item.kuantitas * item.harga_estimasi;

                                                return (
                                                    <tr key={item.temp_id} className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="p-3 text-slate-400 font-mono font-bold">{idx + 1}</td>
                                                        <td className="p-3">
                                                            <span className="font-mono text-slate-500 text-[11px]">
                                                                {item.barcode || "—"}
                                                            </span>
                                                        </td>
                                                        <td className="p-3">
                                                            <span className="font-semibold text-slate-800">{item.nama}</span>
                                                        </td>
                                                        <td className="p-3 text-center text-slate-600 font-semibold">{maxReturnable} pcs</td>
                                                        <td className="p-3">
                                                            <input
                                                                type="number"
                                                                min={0}
                                                                max={maxReturnable}
                                                                value={item.kuantitas}
                                                                onChange={(e) => {
                                                                    const val = parseInt(e.target.value) || 0;
                                                                    const checkedVal = Math.min(maxReturnable, Math.max(0, val));
                                                                    updateItem(item.temp_id, { kuantitas: checkedVal });
                                                                }}
                                                                disabled={isPending}
                                                                className="w-full h-8 text-center text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-lg focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/20 outline-none transition-colors disabled:opacity-50"
                                                            />
                                                        </td>
                                                        <td className="p-3 text-right font-semibold text-slate-700 font-mono">
                                                            {formatRupiah(item.harga_estimasi)}
                                                        </td>
                                                        <td className="p-3 text-right font-bold text-slate-900 font-mono">
                                                            {formatRupiah(subtotal)}
                                                        </td>
                                                        <td className="p-3">
                                                            <select
                                                                value={item.alasan || "damaged"}
                                                                onChange={(e) => {
                                                                    updateItem(item.temp_id, { alasan: e.target.value });
                                                                }}
                                                                disabled={isPending || item.kuantitas === 0}
                                                                className="w-full h-8 text-xs bg-white border border-slate-200 rounded-lg px-2 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/20 outline-none disabled:opacity-50"
                                                            >
                                                                {reasons.map((r) => (
                                                                    <option key={r.value} value={r.value}>
                                                                        {r.label}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                        <td className="p-3">
                                                            {item.kuantitas > 0 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => updateItem(item.temp_id, { kuantitas: 0 })}
                                                                    disabled={isPending}
                                                                    className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                                                    title="Kosongkan item"
                                                                >
                                                                    <IconTrash size={16} />
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Table Totals */}
                                <div className="bg-slate-50/80 border-t border-slate-100 px-4 py-3 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                            Total Barang Retur
                                        </span>
                                        <span className="text-sm font-extrabold text-slate-800">
                                            {activeItems.reduce((acc, i) => acc + i.kuantitas, 0)} pcs
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                            Total Nominal Retur
                                        </span>
                                        <span className="text-base font-extrabold text-emerald-600 font-mono">
                                            {formatRupiah(activeTotalValue)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Info/Instruction */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
                        <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <IconInfoCircle size={16} className="text-blue-500" />
                            <span>Petunjuk Retur Barang</span>
                        </h4>
                        <ul className="text-[11px] text-slate-500 space-y-2.5 list-disc pl-4 leading-relaxed">
                            <li>Isi kuantitas pada baris barang yang ingin dikembalikan.</li>
                            <li>Kuantitas retur dibatasi maksimal sesuai sisa barang yang diterima.</li>
                            <li>Tentukan alasan pengembalian untuk setiap barang yang Anda retur.</li>
                            <li>Scan barcode produk penerimaan untuk secara otomatis menambahkan item retur.</li>
                            <li>Klik tombol <strong>Simpan Semua Items ke Server</strong> di bagian bawah untuk menyimpan progres retur.</li>
                        </ul>
                    </div>
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
        </div>
    );
}
