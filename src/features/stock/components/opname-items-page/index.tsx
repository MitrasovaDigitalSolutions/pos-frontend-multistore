"use client";

import { FormInput } from "@/components/forms/form-input";
import { FormNumberInput } from "@/components/forms/form-number-input";
import { BarcodeInput } from "@/components/shared/barcode-input";
import { BaseDialog } from "@/components/ui/base-dialog";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ROUTES } from "@/constants/routes";
import { OPNAME_STATUS, OPNAME_STATUS_CLASSES, OPNAME_STATUS_LABELS } from "@/constants/stock";
import { useProducts } from "@/features/products/api/products-api";
import type { Product } from "@/features/products/types";
import { useAppRouter } from "@/hooks/use-app-router";
import { cn } from "@/lib/utils";
import { clearOpnameItemsStore, getOpnameItemsStore, type OpnameItemLocal } from "@/stores/opname-items-store";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    IconArrowLeft,
    IconArrowUp,
    IconBarcode,
    IconCheck,
    IconClipboard,
    IconDeviceFloppy,
    IconEdit,
    IconInfoCircle,
    IconPlus,
    IconTrash,
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { toast } from "sonner";
import {
    useFinalizeOpname,
    useOpnameDetail,
    useOpnameItems,
    useUpdateOpname,
    useUpdateOpnameItems,
} from "../../api/stock-api";
import { opnameHeaderSchema, type OpnameHeaderInput } from "../../schemas/opname-schema";
import type { Opname, OpnameItem } from "../../types";

interface OpnameItemsPageProps {
    opnameId: string;
}

function OpnameItemsSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Header Area Skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-9 w-9 rounded-xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-64" />
                        <Skeleton className="h-3.5 w-80" />
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-36 rounded-xl" />
                    <Skeleton className="h-10 w-28 rounded-xl" />
                    <Skeleton className="h-10 w-28 rounded-xl" />
                    <Skeleton className="h-10 w-44 rounded-xl" />
                </div>
            </div>

            {/* Statistics Cards Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                        <div className="space-y-2">
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-6 w-16" />
                        </div>
                        <Skeleton className="h-8 w-8 rounded-lg" />
                    </div>
                ))}
            </div>

            {/* Scanner & Input Bar Skeleton */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-3 w-28" />
                        <Skeleton className="h-10 w-full rounded-xl" />
                    </div>
                    <div className="w-full md:w-32 space-y-2">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-10 w-full rounded-xl" />
                    </div>
                    <div className="w-full md:w-48 space-y-2">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-10 w-full rounded-xl" />
                    </div>
                    <Skeleton className="h-10 w-24 rounded-xl" />
                </div>
            </div>

            {/* Table List Skeleton */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                <Skeleton className="h-4 w-40" />
                <div className="border border-slate-100 rounded-2xl p-4 space-y-4 bg-slate-50/10">
                    <div className="flex justify-between border-b pb-3 border-slate-100">
                        <Skeleton className="h-4 w-8" />
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-4 w-12" />
                    </div>
                    {Array.from({ length: 4 }).map((_, idx) => (
                        <div key={idx} className="flex justify-between pt-1">
                            <Skeleton className="h-4 w-4" />
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-8" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export function OpnameItemsPage({ opnameId }: OpnameItemsPageProps) {
    const { data: opname, isLoading: opnameLoading, error } = useOpnameDetail(opnameId);
    const router = useAppRouter();

    if (opnameLoading) {
        return <OpnameItemsSkeleton />;
    }

    if (error || !opname) {
        return (
            <div className="p-8 text-center bg-white border border-slate-100 rounded-2xl shadow-sm max-w-md mx-auto mt-12">
                <p className="text-sm font-bold text-slate-800">Error</p>
                <p className="text-xs text-slate-400 mt-1">
                    Stock opname tidak ditemukan atau terjadi kesalahan saat memuat data.
                </p>
                <Button
                    onClick={() => router.push(ROUTES.ADMIN_STOCK)}
                    className="mt-4 bg-slate-800 hover:bg-slate-900 text-white text-xs rounded-xl"
                >
                    Kembali ke Daftar Stock
                </Button>
            </div>
        );
    }

    if (opname.status !== OPNAME_STATUS.DRAFT) {
        return (
            <div className="p-8 text-center bg-white border border-slate-100 rounded-2xl shadow-sm max-w-md mx-auto mt-12">
                <p className="text-sm font-bold text-slate-800">Akses Ditolak</p>
                <p className="text-xs text-slate-400 mt-1">
                    Hanya Stock Opname berstatus **Draft** yang dapat diubah daftar barangnya.
                </p>
                <Button
                    onClick={() => router.push(ROUTES.ADMIN_STOCK)}
                    className="mt-4 bg-slate-800 hover:bg-slate-900 text-white text-xs rounded-xl"
                >
                    Kembali ke Daftar Stock
                </Button>
            </div>
        );
    }

    return <OpnameItemsContainer opnameId={opnameId} opname={opname} />;
}

function OpnameItemsContainer({ opnameId, opname }: { opnameId: string; opname: Opname }) {
    const router = useAppRouter();
    const store = getOpnameItemsStore(opnameId);
    const items = store((state) => state.items);
    const addItem = store((state) => state.addItem);
    const updateItem = store((state) => state.updateItem);
    const removeItem = store((state) => state.removeItem);
    const clearAll = store((state) => state.clearAll);

    const updateOpnameItems = useUpdateOpnameItems();
    const finalizeOpname = useFinalizeOpname();

    const { data: itemsData, isLoading: itemsLoading } = useOpnameItems(
        opnameId,
        opname.status === OPNAME_STATUS.DRAFT ? { per_page: 1000 } : undefined
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const dbItems = itemsData?.data || [];

    // Fetch products for local search autocompletion
    const { data: productsData, isLoading: productsLoading } = useProducts({
        per_page: 1000,
    });
    const products = productsData?.data || [];

    const isFirstLoad = useRef(true);
    const [isEditHeaderOpen, setIsEditHeaderOpen] = useState(false);
    const [isConfirmFinalizeOpen, setIsConfirmFinalizeOpen] = useState(false);
    const [isInstructionsOpen, setIsInstructionsOpen] = useState(true);
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 200) {
                setShowScrollTop(true);
            } else {
                setShowScrollTop(false);
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToInput = () => {
        const element = document.getElementById("barcode-scanner-section");
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
            setTimeout(() => {
                const inputEl = element.querySelector("input");
                if (inputEl) {
                    inputEl.focus();
                }
            }, 300);
        }
    };

    // Load initial items from database draft on mount
    useEffect(() => {
        if (!isFirstLoad.current || itemsLoading) return;

        if (store.getState().items.length > 0) {
            isFirstLoad.current = false;
            return;
        }

        if (dbItems && dbItems.length > 0) {
            const initialItems: OpnameItemLocal[] = dbItems.map((item: OpnameItem) => ({
                temp_uid: `${Date.now()}-${item.uid}-${Math.random().toString(36).substring(2, 5)}`,
                product_uid: String(item.product_uid),
                barcode: item.product?.barcode || null,
                nama: item.product?.nama || "Produk Tanpa Nama",
                stok_sistem: item.stok_sistem,
                stok_fisik: item.stok_fisik,
                alasan: item.alasan || "Opname rutin",
            }));
            store.setState({ items: initialItems });
            isFirstLoad.current = false;
        } else {
            isFirstLoad.current = false;
        }
    }, [dbItems, itemsLoading, store]);

    if (itemsLoading) {
        return <OpnameItemsSkeleton />;
    }

    const handleProductFound = (product: Product) => {
        addItem({
            product_uid: product.uid,
            barcode: product.barcode,
            nama: product.nama,
            stok_sistem: product.stok,
            alasan: "Opname rutin",
        });
        toast.success(`Ditambahkan: ${product.nama}`);

        // Scroll and highlight the added product
        setTimeout(() => {
            const rowElement = document.getElementById(`opname-row-${product.uid}`);
            if (rowElement) {
                rowElement.scrollIntoView({ behavior: "smooth", block: "center" });

                // Add a dynamic glowing effect
                rowElement.classList.add("bg-emerald-50/80", "ring-2", "ring-emerald-500/20");
                setTimeout(() => {
                    rowElement.classList.remove("bg-emerald-50/80", "ring-2", "ring-emerald-500/20");
                }, 1500);
            }
        }, 150);
    };

    const handleSaveDraft = async (showToast = true) => {
        if (items.length === 0) {
            if (showToast) toast.error("Daftar barang opname masih kosong.");
            return false;
        }

        const payload = {
            items: items.map((item) => ({
                product_uid: item.product_uid,
                stok_fisik: item.stok_fisik,
                alasan: item.alasan || "Opname rutin",
            })),
        };

        try {
            await updateOpnameItems.mutateAsync({
                uid: opnameId,
                data: payload,
            });
            if (showToast) toast.success("Daftar barang stock opname berhasil disimpan sebagai draf.");
            return true;
        } catch (err: unknown) {
            const error = err as { message?: string };
            if (showToast) toast.error(error.message || "Gagal menyimpan draf barang.");
            return false;
        }
    };

    const handleFinalize = async () => {
        if (items.length === 0) {
            toast.error("Harap tambahkan minimal 1 barang sebelum finalisasi.");
            return;
        }

        // First, save current items to ensure database is in sync
        const saveSuccess = await handleSaveDraft(false);
        if (!saveSuccess) {
            toast.error("Gagal menyimpan items sebelum finalisasi.");
            return;
        }

        try {
            await finalizeOpname.mutateAsync(opnameId);
            toast.success("Proses finalisasi stock opname dimulai di latar belakang!");
            clearAll();
            clearOpnameItemsStore(opnameId);
            router.push(ROUTES.ADMIN_STOCK);
        } catch (err: unknown) {
            const error = err as { message?: string };
            toast.error(error.message || "Gagal memfinalisasi stock opname.");
        } finally {
            setIsConfirmFinalizeOpen(false);
        }
    };

    const handleReset = () => {
        if (confirm("Apakah Anda yakin ingin mengosongkan draf barang lokal? Perubahan yang belum disimpan akan hilang.")) {
            clearAll();
            toast.info("Daftar barang lokal dikosongkan.");
        }
    };

    // Calculate discrepancies statistics
    const stats = items.reduce(
        (acc, item) => {
            const diff = item.stok_fisik - item.stok_sistem;
            if (diff > 0) acc.positive++;
            else if (diff < 0) acc.negative++;
            else acc.match++;
            return acc;
        },
        { positive: 0, negative: 0, match: 0 }
    );

    return (
        <div className="space-y-6">
            {/* Header / Breadcrumb */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-4">
                    <Button
                        type="button"
                        onClick={() => router.push(ROUTES.ADMIN_STOCK)}
                        variant="outline"
                        className="p-2 h-9 w-9 rounded-xl border-slate-200 text-slate-500 hover:text-slate-900 bg-white"
                    >
                        <IconArrowLeft size={18} />
                    </Button>
                    <div>
                        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <span>Input Barang Stock Opname — {opname.nomor_opname}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${OPNAME_STATUS_CLASSES[opname.status] || "bg-amber-50 text-amber-700 border-amber-100"}`}>
                                {OPNAME_STATUS_LABELS[opname.status]}
                            </span>
                        </h2>
                        <p className="text-xs text-slate-400">
                            Catatan: <span className="font-semibold text-slate-600">{opname.catatan || "-"}</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => setIsInstructionsOpen(!isInstructionsOpen)}
                        variant="outline"
                        className="border-slate-200 text-slate-700 hover:text-slate-900 bg-white font-bold text-xs h-10 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                        <IconInfoCircle size={16} />
                        {isInstructionsOpen ? "Sembunyikan Petunjuk" : "Tampilkan Petunjuk"}
                    </Button>

                    <Button
                        onClick={() => setIsEditHeaderOpen(true)}
                        variant="outline"
                        className="border-slate-200 text-slate-700 hover:text-slate-900 bg-white font-bold text-xs h-10 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                        <IconEdit size={16} /> Edit Catatan
                    </Button>

                    <Button
                        onClick={() => handleSaveDraft(true)}
                        disabled={items.length === 0 || updateOpnameItems.isPending}
                        variant="outline"
                        className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-white font-bold text-xs h-10 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                        <IconDeviceFloppy size={16} />
                        {updateOpnameItems.isPending ? "Menyimpan..." : "Simpan Draf"}
                    </Button>

                    <Button
                        onClick={() => setIsConfirmFinalizeOpen(true)}
                        disabled={items.length === 0 || updateOpnameItems.isPending || finalizeOpname.isPending}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 px-5 shadow-sm rounded-xl flex items-center gap-1.5 cursor-pointer shrink-0 border-none"
                    >
                        <IconCheck size={16} /> Finalisasi & Update Stok
                    </Button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Scanned</span>
                        <p className="text-xl font-bold text-slate-900 mt-1">{items.length} Barang</p>
                    </div>
                    <div className="bg-slate-50 text-slate-600 p-2.5 rounded-xl">
                        <IconClipboard size={20} />
                    </div>
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sesuai Sistem</span>
                        <p className="text-xl font-bold text-emerald-600 mt-1">{stats.match} Barang</p>
                    </div>
                    <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-xl">
                        <IconCheck size={20} />
                    </div>
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Selisih Lebih (+)</span>
                        <p className="text-xl font-bold text-blue-600 mt-1">{stats.positive} Barang</p>
                    </div>
                    <div className="bg-blue-50 text-blue-600 p-2.5 rounded-xl">
                        <IconPlus size={20} />
                    </div>
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Selisih Kurang (-)</span>
                        <p className="text-xl font-bold text-rose-600 mt-1">{stats.negative} Barang</p>
                    </div>
                    <div className="bg-rose-50 text-rose-600 p-2.5 rounded-xl">
                        <IconTrash size={20} />
                    </div>
                </div>
            </div>

            {/* Core Interaction Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className={cn(
                    "transition-all duration-300 space-y-6",
                    isInstructionsOpen ? "lg:col-span-8" : "lg:col-span-12"
                )}>
                    {/* Barcode / Product Scanner */}
                    <div id="barcode-scanner-section" className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 pb-3 border-b border-slate-50">
                            <div className="bg-emerald-50 text-emerald-600 p-1.5 rounded-lg">
                                <IconBarcode size={18} />
                            </div>
                            <h3 className="text-xs font-bold text-slate-900">Scan Barcode / Cari Produk</h3>
                        </div>

                        <BarcodeInput
                            onProductFound={handleProductFound}
                            onError={(msg) => toast.error(msg)}
                            disabled={productsLoading || updateOpnameItems.isPending}
                            products={products}
                            placeholder="Scan barcode produk atau ketik nama untuk autocomplete..."
                        />
                    </div>

                    {/* Items Table Card */}
                    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/10">
                            <div className="flex items-center gap-2">
                                <h3 className="text-xs font-bold text-slate-900">Daftar Perhitungan Fisik</h3>
                                {!isInstructionsOpen && (
                                    <button
                                        type="button"
                                        onClick={() => setIsInstructionsOpen(true)}
                                        className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-lg border-none cursor-pointer transition-colors"
                                    >
                                        <IconInfoCircle size={12} />
                                        Tampilkan Petunjuk
                                    </button>
                                )}
                            </div>
                            {items.length > 0 && (
                                <button
                                    onClick={handleReset}
                                    className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-transparent border-none cursor-pointer hover:underline"
                                >
                                    Kosongkan List
                                </button>
                            )}
                        </div>

                        <div className="overflow-x-auto">
                            <Table className="w-full text-left border-collapse">
                                <TableHeader className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider hover:bg-transparent">
                                    <TableRow className="hover:bg-transparent border-b border-slate-100">
                                        <TableHead className="p-4 font-bold text-slate-500 uppercase tracking-wider">Nama Produk</TableHead>
                                        <TableHead className="p-4 text-right font-bold text-slate-500 uppercase tracking-wider">Stok Sistem</TableHead>
                                        <TableHead className="p-4 text-center w-36 font-bold text-slate-500 uppercase tracking-wider">Stok Fisik</TableHead>
                                        <TableHead className="p-4 text-right font-bold text-slate-500 uppercase tracking-wider">Selisih</TableHead>
                                        <TableHead className="p-4 font-bold text-slate-500 uppercase tracking-wider sm:min-w-60">Alasan Selisih</TableHead>
                                        <TableHead className="p-4 text-center w-16 font-bold text-slate-500 uppercase tracking-wider">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-slate-100">
                                    {items.map((item) => (
                                        <OpnameItemRow
                                            key={item.temp_uid}
                                            item={item}
                                            updateItem={updateItem}
                                            removeItem={removeItem}
                                        />
                                    ))}
                                    {items.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-12 text-slate-400 font-semibold text-xs">
                                                Belum ada barang yang ditambahkan. Gunakan scanner atau autocomplete di atas.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>

                {/* Instructions / Right Column */}
                {isInstructionsOpen && (
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                                <h3 className="text-xs font-bold text-slate-900">Petunjuk Stock Opname</h3>
                                <button
                                    type="button"
                                    onClick={() => setIsInstructionsOpen(false)}
                                    className="text-[10px] font-bold text-slate-400 hover:text-rose-500 transition-colors bg-transparent border-none cursor-pointer hover:underline"
                                >
                                    Sembunyikan
                                </button>
                            </div>
                            <div className="space-y-3.5 text-slate-500 text-xs">
                                <div className="flex gap-2.5">
                                    <span className="bg-emerald-50 text-emerald-600 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                                    <p>Cari produk yang ingin diselisih menggunakan kolom scanner/autofill di sebelah kiri.</p>
                                </div>
                                <div className="flex gap-2.5">
                                    <span className="bg-emerald-50 text-emerald-600 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                                    <p>Secara default, stok fisik disamakan dengan stok sistem. Sesuaikan jumlah fisik sesuai hasil perhitungan lapangan.</p>
                                </div>
                                <div className="flex gap-2.5">
                                    <span className="bg-emerald-50 text-emerald-600 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                                    <p>Jika terdapat selisih, masukkan alasan penyesuaian (misal: &quot;barang rusak&quot;, &quot;selisih saji&quot;, dll).</p>
                                </div>
                                <div className="flex gap-2.5">
                                    <span className="bg-emerald-50 text-emerald-600 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">4</span>
                                    <p>Gunakan tombol <strong>Simpan Draf</strong> untuk menyimpan pekerjaan sementara. Halaman dapat dimuat kembali nanti.</p>
                                </div>
                                <div className="flex gap-2.5">
                                    <span className="bg-emerald-50 text-emerald-600 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">5</span>
                                    <p>Klik <strong>Finalisasi & Update Stok</strong> untuk memulai proses sinkronisasi permanen ke database inventory.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Scroll Up Button / Floating Scan Button */}
            {showScrollTop && (
                <Button
                    type="button"
                    onClick={scrollToInput}
                    className="fixed bottom-6 right-6 z-50 h-12 px-5 rounded-full shadow-xl bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2 border-none cursor-pointer font-bold text-xs"
                    title="Kembali ke Input Barcode"
                >
                    <IconBarcode size={18} className="animate-pulse" />
                    <span>Input Barcode</span>
                    <IconArrowUp size={14} className="ml-0.5" />
                </Button>
            )}

            {/* Edit Header / Notes Dialog */}
            <EditHeaderDialog
                open={isEditHeaderOpen}
                onOpenChange={setIsEditHeaderOpen}
                opnameId={opnameId}
                initialCatatan={opname.catatan || ""}
            />

            {/* Confirm Finalize Dialog */}
            <ConfirmDialog
                open={isConfirmFinalizeOpen}
                onOpenChange={setIsConfirmFinalizeOpen}
                title="Finalisasi Perhitungan Fisik"
                description="Apakah Anda yakin ingin menyelesaikan stock opname ini? Stok produk di sistem akan secara otomatis disesuaikan secara permanen dengan stok fisik lapangan."
                confirmText="Ya, Selesaikan"
                cancelText="Batal"
                variant="warning"
                onConfirm={handleFinalize}
                isLoading={updateOpnameItems.isPending || finalizeOpname.isPending}
            />
        </div>
    );
}

function EditHeaderDialog({
    open,
    onOpenChange,
    opnameId,
    initialCatatan,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    opnameId: string;
    initialCatatan: string;
}) {
    const updateOpname = useUpdateOpname();

    const methods = useForm<OpnameHeaderInput>({
        resolver: zodResolver(opnameHeaderSchema) as Resolver<OpnameHeaderInput>,
        defaultValues: {
            catatan: initialCatatan || "",
        },
    });

    const {
        handleSubmit,
        reset,
    } = methods;

    useEffect(() => {
        if (open) {
            reset({ catatan: initialCatatan || "" });
        }
    }, [open, initialCatatan, reset]);

    const onSubmit = (data: OpnameHeaderInput) => {
        updateOpname.mutate(
            { uid: opnameId, data },
            {
                onSuccess: () => {
                    toast.success("Catatan stock opname berhasil diperbarui.");
                    onOpenChange(false);
                },
                onError: (err) => {
                    toast.error(err.message || "Gagal memperbarui catatan.");
                },
            }
        );
    };

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={
                <>
                    <IconClipboard size={20} className="text-emerald-500" />
                    <span>Ubah Catatan Stock Opname</span>
                </>
            }
            className="max-w-md flex flex-col max-h-[90vh]"
        >
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden min-h-0 pt-4">
                    <div className="flex-1 overflow-y-auto pr-1 space-y-4 pb-4">
                        <FormInput<OpnameHeaderInput>
                            name="catatan"
                            label="Catatan Opname"
                            placeholder="Masukkan catatan baru..."
                            disabled={updateOpname.isPending}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 shrink-0 bg-white">
                        <Button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            variant="outline"
                            className="px-5 h-10 border-slate-200 text-slate-700 font-bold text-xs rounded-xl bg-white"
                            disabled={updateOpname.isPending}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            className="px-5 h-10 bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white rounded-xl"
                            disabled={updateOpname.isPending}
                        >
                            {updateOpname.isPending ? "Menyimpan..." : "Simpan Perubahan"}
                        </Button>
                    </div>
                </form>
            </FormProvider>
        </BaseDialog>
    );
}

type RowInput = {
    stok_fisik: number;
    alasan: string;
};

function OpnameItemRow({
    item,
    updateItem,
    removeItem,
}: {
    item: OpnameItemLocal;
    updateItem: (temp_uid: string, data: Partial<Pick<OpnameItemLocal, "stok_fisik" | "alasan">>) => void;
    removeItem: (temp_uid: string) => void;
}) {
    const methods = useForm<RowInput>({
        defaultValues: {
            stok_fisik: item.stok_fisik,
            alasan: item.alasan || "Opname rutin",
        },
    });

    const { reset } = methods;

    // Sync form state with Zustand changes (e.g. from barcode scans)
    useEffect(() => {
        reset({
            stok_fisik: item.stok_fisik,
            alasan: item.alasan || "Opname rutin",
        });
    }, [item.stok_fisik, item.alasan, reset]);

    return (
        <FormProvider {...methods}>
            <TableRow
                id={`opname-row-${item.product_uid}`}
                className="hover:bg-slate-50/30 transition-all duration-500 text-xs font-medium text-slate-700"
            >
                <TableCell className="p-4">
                    <p className="font-bold text-slate-900">{item.nama}</p>
                    {item.barcode && (
                        <span className="font-mono text-[10px] text-slate-400 flex items-center gap-0.5 mt-0.5">
                            <IconBarcode size={12} className="opacity-70" />
                            {item.barcode}
                        </span>
                    )}
                </TableCell>
                <TableCell className="p-4 text-right font-mono text-slate-500">
                    {item.stok_sistem} pcs
                </TableCell>
                <TableCell className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                        <button
                            type="button"
                            onClick={() => updateItem(item.temp_uid, { stok_fisik: Math.max(0, item.stok_fisik - 1) })}
                            className="w-7 h-7 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg cursor-pointer border-none font-bold animate-transition"
                        >
                            -
                        </button>
                        <div className="w-20">
                            <FormNumberInput<RowInput>
                                name="stok_fisik"
                                onValueChange={(val) => {
                                    updateItem(item.temp_uid, { stok_fisik: val || 0 });
                                }}
                                className="h-8 text-center rounded-lg border-slate-200 p-0 text-xs font-bold"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => updateItem(item.temp_uid, { stok_fisik: item.stok_fisik + 1 })}
                            className="w-7 h-7 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg cursor-pointer border-none font-bold animate-transition"
                        >
                            +
                        </button>
                    </div>
                </TableCell>
                <TableCell className={`p-4 text-right font-bold font-mono ${(item.stok_fisik - item.stok_sistem) === 0
                    ? "text-slate-400"
                    : (item.stok_fisik - item.stok_sistem) > 0
                        ? "text-blue-600"
                        : "text-rose-500"
                    }`}>
                    {(item.stok_fisik - item.stok_sistem) > 0 ? `+${item.stok_fisik - item.stok_sistem}` : item.stok_fisik - item.stok_sistem} pcs
                </TableCell>
                <TableCell className="p-4 w-80">
                    <FormInput<RowInput>
                        name="alasan"
                        placeholder="Alasan selisih..."
                        onChange={(e) => {
                            updateItem(item.temp_uid, { alasan: e.target.value });
                        }}
                        className="h-8 border-slate-200 focus-visible:ring-emerald-600 rounded-lg text-xs"
                    />
                </TableCell>
                <TableCell className="p-4 text-center">
                    <button
                        type="button"
                        onClick={() => removeItem(item.temp_uid)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
                    >
                        <IconTrash size={16} />
                    </button>
                </TableCell>
            </TableRow>
        </FormProvider>
    );
}

