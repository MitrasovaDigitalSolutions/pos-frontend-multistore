"use client";

import { PageLoader } from "@/components/feedback/page-loader";
import { Button } from "@/components/ui/button";
import { getPurchaseItemsStore, selectItemCount, selectTotal } from "@/stores/purchase-items-store";
import { IconArrowLeft, IconBarcode, IconInfoCircle, IconX } from "@tabler/icons-react";
import { useAppRouter } from "@/hooks/use-app-router";
import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, type ProductInput } from "@/features/products/schemas/product-schema";
import { ProductFormDialog } from "@/features/products/components/product-form-dialog";
import { toast } from "sonner";
import { useBulkReplacePurchaseOrderItems, usePurchaseOrderDetail } from "../../api/purchase-api";
import type { PurchaseItemLocal, PurchaseOrder } from "../../types";
import type { Product } from "@/features/products/types";
import { BarcodeInput } from "@/components/shared/barcode-input";
import { BulkSubmitBar } from "../shared/bulk-submit-bar";
import { ItemsTable } from "../shared/items-table";
import {
    PO_STATUS,
    PO_STATUS_LABELS,
    PO_STATUS_CLASSES,
    type POStatus,
} from "@/constants/purchase";
import { formatDate } from "@/lib/date-utils";

interface POItemsPageProps {
    poId: string;
}

export function POItemsPage({ poId }: POItemsPageProps) {
    const { data: order, isLoading: orderLoading, error } = usePurchaseOrderDetail(poId);
    const router = useAppRouter();

    if (orderLoading) {
        return <PageLoader message="Memuat detail Purchase Order..." />;
    }

    if (error || !order) {
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

    // Only allow editing items if status is draft
    if (order.status !== PO_STATUS.DRAFT) {
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

function POItemsContainer({ poId, order }: { poId: string; order: PurchaseOrder }) {
    const router = useAppRouter();
    const store = getPurchaseItemsStore(poId, "po");
    const items = store((state) => state.items);
    const addItem = store((state) => state.addItem);
    const clearAll = store((state) => state.clearAll);
    const updateItem = store((state) => state.updateItem);
    const removeItem = store((state) => state.removeItem);

    const itemCount = store(selectItemCount);
    const totalValue = store(selectTotal);

    const bulkReplace = useBulkReplacePurchaseOrderItems();
    const isFirstLoad = useRef(true);

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

    // Initialize from DB if Zustand store has items
    useEffect(() => {
        if (!isFirstLoad.current) return;

        if (store.getState().items.length > 0) {
            isFirstLoad.current = false;
            return;
        }

        if (order.items && order.items.length > 0) {
            const dbItems: PurchaseItemLocal[] = order.items.map((item) => ({
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
    }, [order.items, store]);

    const handleProductFound = (product: Product) => {
        addItem({
            product_uid: product.uid,
            barcode: product.barcode,
            nama: product.nama,
            harga_estimasi: product.harga_beli || 0, // default to buy price as estimation
        });
        toast.success(`Ditambahkan: ${product.nama}`);
    };

    const handleProductError = (errMessage: string) => {
        toast.error(errMessage);
    };

    const handleSubmit = () => {
        if (items.length === 0) {
            toast.error("Harap tambahkan minimal 1 barang sebelum menyimpan.");
            return;
        }

        const payload = store.getState().getSubmitPayload();

        bulkReplace.mutate(
            { uid: poId, data: payload },
            {
                onSuccess: () => {
                    toast.success("Daftar barang Purchase Order berhasil disimpan ke database!");
                    clearAll();
                    router.push(`/admin/purchase/order/${poId}`);
                },
                onError: (err) => {
                    toast.error(err.message || "Gagal menyimpan daftar barang ke database.");
                },
            }
        );
    };

    const handleReset = () => {
        if (confirm("Apakah Anda yakin ingin mengosongkan semua daftar barang di halaman ini? Perubahan lokal akan hilang.")) {
            clearAll();
            toast.info("Daftar barang lokal berhasil dikosongkan.");
        }
    };

    // Count unique products
    const uniqueProductCount = items.length;

    return (
        <FormProvider {...dialogMethods}>
            <div className="space-y-6">
                {/* Header info / Breadcrumb */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button
                            type="button"
                            onClick={() => router.push(`/admin/purchase/order/${poId}`)}
                            variant="outline"
                            className="p-2 h-9 w-9 rounded-xl border-slate-200 text-slate-500 hover:text-slate-900 bg-white"
                        >
                            <IconArrowLeft size={18} />
                        </Button>
                        <div>
                            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <span>Input Barang PO — {order.nomor_po}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${PO_STATUS_CLASSES[order.status as POStatus] || "bg-amber-50 text-amber-700 border-amber-100"}`}>
                                    {PO_STATUS_LABELS[order.status as POStatus] || "Draft"}
                                </span>
                            </h2>
                            <p className="text-xs text-slate-400">
                                Supplier: <span className="font-semibold text-slate-600">{order.supplier?.nama || order.supplier_name || "-"}</span> | Tanggal: {formatDate(order.tanggal_po, "dd MMM yyyy")}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Scanning and Info Info Panel */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    <div className="lg:col-span-8 space-y-6">
                        {/* Barcode scanner box */}
                        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                            <div className="flex items-center gap-2 pb-3 border-b border-slate-50">
                                <div className="bg-emerald-50 text-emerald-600 p-1.5 rounded-lg">
                                    <IconBarcode size={18} />
                                </div>
                                <h3 className="text-xs font-bold text-slate-900">Scan Barcode / Cari Produk</h3>
                            </div>

                            <BarcodeInput
                                onProductFound={(product) => {
                                    setNotFoundQuery("");
                                    handleProductFound(product);
                                }}
                                onError={handleProductError}
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
                                disabled={bulkReplace.isPending}
                                isPriceReadOnly={true}
                            />
                        </div>
                    </div>

                    {/* Sidebar Info/Instruction */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
                            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                <IconInfoCircle size={16} className="text-blue-500" />
                                <span>Petunjuk Penggunaan</span>
                            </h4>
                            <ul className="text-[11px] text-slate-500 space-y-2 list-disc pl-4 leading-relaxed">
                                <li>Setiap produk yang Anda <strong>scan</strong> atau pilih akan masuk ke daftar di sebelah kiri.</li>
                                <li>Jika produk sudah ada, kuantitas otomatis bertambah 1.</li>
                                <li>Anda dapat mengubah <strong>kuantitas</strong> langsung di dalam tabel. <strong>Harga estimasi</strong> hanya berupa informasi referensi (read-only).</li>
                                <li>Data disimpan secara otomatis di browser Anda (localStorage) dan aman meski halaman ditutup atau tidak sengaja ter-refresh.</li>
                                <li>Tekan tombol <strong>Submit Semua Items ke Server</strong> di bawah untuk menyimpan perubahan permanen ke database</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Sticky Bottom Submit Bar */}
                <BulkSubmitBar
                    onSubmit={handleSubmit}
                    onReset={handleReset}
                    isSubmitting={bulkReplace.isPending}
                    itemCount={itemCount}
                    total={totalValue}
                    productCount={uniqueProductCount}
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
