"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
    IconScan,
    IconCategory,
    IconPlayerPause,
    IconPlayerPlay,
    IconTrash,
    IconPrinter,
    IconCash,
    IconWifi,
    IconSearch,
    IconHome,
    IconLogout,
    IconLoader2,
} from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { useProducts } from "@/features/products/api/products-api";
import {
    useCreateTransaction,
    useAddTransactionItem,
    useUpdateTransactionItem,
    useDeleteTransactionItem,
    useHoldTransaction,
    useRecallTransaction,
    lookupBarcode,
} from "@/features/checkout/api/checkout-api";
import { apiGet, apiGetData, apiGetList } from "@/shared/api/api-client";
import { CatalogDialog } from "@/features/checkout/components/catalog-dialog";
import { PaymentDialog } from "@/features/checkout/components/payment-dialog";
import { HoldListDialog } from "@/features/checkout/components/hold-list-dialog";
import { ReceiptDialog } from "@/features/checkout/components/receipt-dialog";
import type {
    CartItem,
    HoldTransaction,
    Receipt,
} from "@/features/checkout/types";
import type { Product } from "@/features/products/types";
import type { ApiResponse } from "@/types/api";

interface TrxItem {
    id: number;
    product_id: number;
    nama_produk: string;
    harga_satuan: number;
    kuantitas: number;
    product?: {
        stok?: number;
        barcode?: string | null;
    };
    barcode?: string | null;
}

interface TrxData {
    items?: TrxItem[];
}

export default function CheckoutPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const user = session?.user;

    // Products from API
    const { data: productsData, refetch: refetchProducts } = useProducts({
        per_page: 1000,
    });
    const products = productsData?.data;

    // Active draft transaction
    const [transactionId, setTransactionId] = useState<number | null>(null);
    const [cart, setCart] = useState<CartItem[]>([]);

    // On-hold list
    const [holdList, setHoldList] = useState<HoldTransaction[]>([]);

    // UI state
    const [barcodeInput, setBarcodeInput] = useState("");
    const [isCatalogOpen, setIsCatalogOpen] = useState(false);
    const [isPayModalOpen, setIsPayModalOpen] = useState(false);
    const [isReceiptOpen, setIsReceiptOpen] = useState(false);
    const [isHoldListOpen, setIsHoldListOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Receipt data (after successful payment)
    const [receipt, setReceipt] = useState<Receipt | null>(null);

    const [trxTime, setTrxTime] = useState("");
    const barcodeInputRef = useRef<HTMLInputElement>(null);

    // Mutations
    const createTransaction = useCreateTransaction();
    const addTransactionItem = useAddTransactionItem();
    const updateTransactionItem = useUpdateTransactionItem();
    const deleteTransactionItem = useDeleteTransactionItem();
    const holdTransaction = useHoldTransaction();
    const recallTransaction = useRecallTransaction();

    // ─── Handlers ─────────────────────────────────────────────────────────────

    const handleHold = useCallback(async () => {
        if (!transactionId || cart.length === 0) return;
        try {
            setIsProcessing(true);
            await holdTransaction.mutateAsync(transactionId);
            toast.info("Transaksi di-hold.");
            setTransactionId(null);
            setCart([]);
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Gagal hold transaksi.";
            toast.error(message);
        } finally {
            setIsProcessing(false);
        }
    }, [transactionId, cart.length, holdTransaction]);

    const openHoldList = useCallback(async () => {
        try {
            const res = await apiGetList<HoldTransaction>(
                "/v1/transactions/on-hold",
                { per_page: 100 },
            );
            setHoldList(res.data);
            setIsHoldListOpen(true);
        } catch {
            toast.error("Gagal memuat daftar hold.");
        }
    }, []);

    const handleVoidDraft = useCallback(async () => {
        if (cart.length === 0) return;
        if (!confirm("Batalkan seluruh transaksi ini?")) return;
        setCart([]);
        setTransactionId(null);
        toast.error("Transaksi dibatalkan.");
    }, [cart.length]);

    // ─── Clock & Keyboard Shortcuts ───────────────────────────────────────────

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setTrxTime(
                `${now.toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                })} ${now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false })}`,
            );
        };
        updateTime();
        const timer = setInterval(updateTime, 60000);
        barcodeInputRef.current?.focus();

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "F1") {
                e.preventDefault();
                if (cart.length > 0) setIsPayModalOpen(true);
            } else if (e.key === "F2") {
                e.preventDefault();
                setIsCatalogOpen((p) => !p);
            } else if (e.key === "F5") {
                e.preventDefault();
                if (transactionId) handleHold();
            } else if (e.key === "F6") {
                e.preventDefault();
                openHoldList();
            } else if (e.key === "F10") {
                e.preventDefault();
                handleVoidDraft();
            } else if (e.key === "Escape") {
                setIsPayModalOpen(false);
                setIsCatalogOpen(false);
                setIsReceiptOpen(false);
                setIsHoldListOpen(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            clearInterval(timer);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [cart, transactionId, handleHold, openHoldList, handleVoidDraft]);

    // ─── Calculations ─────────────────────────────────────────────────────────

    const subtotal = cart.reduce((acc, i) => acc + i.price * i.qty, 0);
    const ppn = Math.round(subtotal * 0.11);
    const grandTotal = subtotal + ppn;

    // ─── Cart Helpers ─────────────────────────────────────────────────────────

    const buildCartFromTransaction = (trxData?: TrxData) => {
        if (!trxData) return;
        const items: CartItem[] = (trxData.items || []).map((item) => ({
            product_id: item.product_id,
            itemId: item.id,
            name: item.nama_produk,
            price: item.harga_satuan,
            qty: item.kuantitas,
            stock: item.product?.stok ?? 999,
            barcode: item.product?.barcode ?? item.barcode ?? null,
        }));
        setCart(items);
    };

    const ensureDraftTransaction = async (): Promise<number | null> => {
        if (transactionId) return transactionId;
        try {
            const res = await createTransaction.mutateAsync();
            if (res?.data?.id) {
                setTransactionId(res.data.id);
                return res.data.id;
            }
            toast.error(res?.message || "Gagal membuat transaksi.");
            return null;
        } catch {
            toast.error("Koneksi gagal.");
            return null;
        }
    };

    const fetchTransactionDetails = async (id: number) => {
        try {
            const res = await apiGet<ApiResponse<TrxData>>(
                `/v1/transactions/${id}`,
            );
            if (res?.data) {
                buildCartFromTransaction(res.data);
            }
        } catch {
            toast.error("Gagal sinkronisasi transaksi dengan server.");
        }
    };

    // ─── Add Item to Cart ──────────────────────────────────────────────────────

    const handleAddProduct = async (product: Product) => {
        if (product.status !== "active") {
            toast.error("Produk ini tidak aktif.");
            return;
        }
        if (product.stok <= 0) {
            toast.error(`Stok ${product.nama} habis!`);
            return;
        }

        // Check if already in cart
        const existing = cart.find((i) => i.product_id === product.id);
        if (existing && existing.qty >= product.stok) {
            toast.error(`Stok ${product.nama} tidak mencukupi!`);
            return;
        }

        const trxId = await ensureDraftTransaction();
        if (!trxId) return;

        try {
            setIsProcessing(true);
            await addTransactionItem.mutateAsync({
                transactionId: trxId,
                product_id: product.id,
                quantity: 1,
            });

            await fetchTransactionDetails(trxId);
            toast.success(`${product.nama} ditambahkan.`);
            setTimeout(() => barcodeInputRef.current?.focus(), 50);
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Gagal menambahkan item.";
            toast.error(message);
        } finally {
            setIsProcessing(false);
        }
    };

    // ─── Update Item Quantity ──────────────────────────────────────────────────

    const handleUpdateQty = async (item: CartItem, newQty: number) => {
        if (!transactionId || !item.itemId) return;
        if (newQty <= 0) {
            handleRemoveItem(item);
            return;
        }

        try {
            setIsProcessing(true);
            await updateTransactionItem.mutateAsync({
                transactionId,
                itemId: item.itemId,
                quantity: newQty,
            });
            setCart((prev) =>
                prev.map((i) =>
                    i.itemId === item.itemId ? { ...i, qty: newQty } : i,
                ),
            );
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Gagal update kuantitas.";
            toast.error(message);
        } finally {
            setIsProcessing(false);
        }
    };

    // ─── Remove Item ───────────────────────────────────────────────────────────

    const handleRemoveItem = async (item: CartItem) => {
        if (!transactionId || !item.itemId) return;
        try {
            setIsProcessing(true);
            await deleteTransactionItem.mutateAsync({
                transactionId,
                itemId: item.itemId,
            });
            setCart((prev) => prev.filter((i) => i.itemId !== item.itemId));
            toast.error(`${item.name} dihapus.`);
        } catch {
            toast.error("Gagal menghapus item.");
        } finally {
            setIsProcessing(false);
        }
    };

    // ─── Barcode / Name Search ─────────────────────────────────────────────────

    const handleBarcodeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const query = barcodeInput.trim();
        setBarcodeInput("");
        if (!query) return;

        // Search by barcode first, then by name
        let found = products?.find(
            (p) => p.barcode?.toLowerCase() === query.toLowerCase(),
        );
        if (!found) {
            found = products?.find((p) =>
                p.nama.toLowerCase().includes(query.toLowerCase()),
            );
        }

        if (found) {
            await handleAddProduct(found);
        } else {
            // Try API barcode lookup
            try {
                const prod = await lookupBarcode(query);
                if (prod) {
                    await handleAddProduct(prod);
                } else {
                    toast.error(`Produk "${query}" tidak ditemukan!`);
                }
            } catch {
                toast.error(`Produk "${query}" tidak ditemukan!`);
            }
        }
    };

    // ─── Hold List & Recall ────────────────────────────────────────────────────

    const handleRecall = async (holdTrxId: number) => {
        try {
            setIsProcessing(true);
            const res = await recallTransaction.mutateAsync(holdTrxId);
            setTransactionId(holdTrxId);
            buildCartFromTransaction(res.data);
            setIsHoldListOpen(false);
            toast.success("Transaksi di-recall.");
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Gagal recall.";
            toast.error(message);
        } finally {
            setIsProcessing(false);
        }
    };

    // ─── New Transaction ───────────────────────────────────────────────────────

    const handleNewTransaction = () => {
        setCart([]);
        setTransactionId(null);
        setReceipt(null);
        setIsReceiptOpen(false);
        setTimeout(() => barcodeInputRef.current?.focus(), 100);
    };

    const handleLogout = async () => {
        await signOut({ callbackUrl: "/login" });
    };

    const hasAccessAdmin =
        user?.roles?.includes("admin") ||
        user?.roles?.includes("manajer_toko") ||
        user?.roles?.includes("supervisor");

    return (
        <div className="grow flex flex-col h-screen overflow-hidden bg-slate-100 relative pb-8">
            {/* Top Bar */}
            <div className="bg-slate-900 text-white h-12 px-6 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-3">
                    <IconScan size={20} className="text-emerald-400" />
                    <span className="font-bold text-[13px] tracking-wide">
                        MSG POS — Cashier Terminal
                    </span>
                    {transactionId && (
                        <span className="bg-emerald-700 text-emerald-100 text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wider">
                            TRX #{transactionId}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    {hasAccessAdmin && (
                        <>
                            <Button
                                variant="ghost"
                                onClick={() => router.push("/admin")}
                                className="text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 h-8 px-3 rounded-lg flex items-center gap-1.5 cursor-pointer bg-transparent border-none"
                            >
                                <IconHome size={15} />
                                <span>Dashboard Admin</span>
                            </Button>
                            <div className="w-px h-4 bg-slate-800" />
                        </>
                    )}
                    <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 h-8 px-3 rounded-lg flex items-center gap-1.5 cursor-pointer bg-transparent border-none"
                    >
                        <IconLogout size={15} />
                        <span>Logout</span>
                    </Button>
                </div>

                <div className="flex items-center gap-6 text-xs font-semibold text-slate-400">
                    <div className="flex items-center gap-1.5 text-emerald-400">
                        <IconWifi size={16} />
                        <span>Sistem Online</span>
                    </div>
                    <div>Terminal: POS-01</div>
                </div>
            </div>

            <div className="grid grid-cols-[65%_35%] h-[calc(100vh-80px)] overflow-hidden">
                {/* Left: Cart */}
                <div className="bg-white border-r border-slate-200 flex flex-col h-full overflow-hidden">
                    {/* Scanner */}
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex gap-3 items-center">
                        <form
                            onSubmit={handleBarcodeSubmit}
                            className="grow relative"
                        >
                            <IconSearch
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-500"
                                size={18}
                            />
                            <Input
                                ref={barcodeInputRef}
                                type="text"
                                placeholder="Scan Barcode atau ketik nama produk... (Enter)"
                                className="w-full h-11 pl-10 pr-4 text-[13px] font-semibold bg-white border-2 border-emerald-500 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-emerald-600 rounded-xl"
                                value={barcodeInput}
                                onChange={(e) =>
                                    setBarcodeInput(e.target.value)
                                }
                                disabled={isProcessing}
                            />
                        </form>
                        <Button
                            variant="outline"
                            onClick={() => setIsCatalogOpen(true)}
                            className="h-11 border-dashed border-emerald-500 hover:bg-emerald-50 text-emerald-600 font-bold px-4 rounded-xl flex gap-2 cursor-pointer"
                        >
                            <IconCategory size={18} />
                            <span>Katalog (F2)</span>
                        </Button>
                    </div>

                    {/* Cart Table */}
                    <div className="grow overflow-y-auto p-4">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                                <IconScan
                                    size={48}
                                    className="text-slate-200 mb-3"
                                />
                                <h4 className="text-[13px] font-bold text-slate-700">
                                    Belum Ada Item Belanja
                                </h4>
                                <p className="text-xs text-slate-400 mt-1 max-w-70">
                                    Pindai barcode atau gunakan Katalog untuk
                                    menambahkan item.
                                </p>
                            </div>
                        ) : (
                            <Table className="w-full border-collapse">
                                <TableHeader className="bg-slate-50 border-b border-slate-100">
                                    <TableRow>
                                        <TableHead className="w-12 text-center text-[10px] font-bold text-slate-500">
                                            #
                                        </TableHead>
                                        <TableHead className="text-[10px] font-bold text-slate-500">
                                            Nama Produk
                                        </TableHead>
                                        <TableHead className="text-center w-28 text-[10px] font-bold text-slate-500">
                                            Qty
                                        </TableHead>
                                        <TableHead className="text-right w-24 text-[10px] font-bold text-slate-500">
                                            Harga
                                        </TableHead>
                                        <TableHead className="text-right w-28 text-[10px] font-bold text-slate-500">
                                            Total
                                        </TableHead>
                                        <TableHead className="text-center w-12 text-[10px] font-bold text-slate-500" />
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {cart.map((item, idx) => (
                                        <TableRow
                                            key={item.itemId ?? item.product_id}
                                            className="hover:bg-slate-50/50 transition-colors"
                                        >
                                            <TableCell className="text-center text-slate-400 font-medium">
                                                {idx + 1}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-bold text-slate-800 text-[12px]">
                                                    {item.name}
                                                </div>
                                                {item.barcode && (
                                                    <div className="text-[10px] text-slate-400 font-medium">
                                                        Barcode: {item.barcode}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        onClick={() =>
                                                            handleUpdateQty(
                                                                item,
                                                                item.qty - 1,
                                                            )
                                                        }
                                                        disabled={isProcessing}
                                                        className="w-6 h-6 border border-slate-200 rounded flex items-center justify-center hover:bg-emerald-50 text-emerald-600 font-bold disabled:opacity-40 cursor-pointer"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="w-8 text-center text-xs font-bold text-slate-800">
                                                        {item.qty}
                                                    </span>
                                                    <button
                                                        onClick={() =>
                                                            handleUpdateQty(
                                                                item,
                                                                item.qty + 1,
                                                            )
                                                        }
                                                        disabled={isProcessing}
                                                        className="w-6 h-6 border border-slate-200 rounded flex items-center justify-center hover:bg-emerald-50 text-emerald-600 font-bold disabled:opacity-40 cursor-pointer"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right text-slate-700 font-medium tabular-nums">
                                                {formatRupiah(item.price)}
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-slate-900 tabular-nums">
                                                {formatRupiah(
                                                    item.price * item.qty,
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <button
                                                    onClick={() =>
                                                        handleRemoveItem(item)
                                                    }
                                                    disabled={isProcessing}
                                                    className="text-rose-500 hover:bg-rose-50 p-1.5 rounded transition-colors disabled:opacity-40 cursor-pointer border-none bg-transparent"
                                                >
                                                    <IconTrash size={16} />
                                                </button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </div>

                {/* Right: Totals & Actions */}
                <div className="bg-emerald-50/30 p-6 flex flex-col justify-between h-full">
                    <div>
                        {/* Trx Info */}
                        <div className="bg-white border border-slate-100 rounded-xl p-4 space-y-2.5 shadow-sm mb-4">
                            <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                                <span>No. Transaksi</span>
                                <span className="text-slate-800 font-bold">
                                    {transactionId
                                        ? `TRX-${transactionId}`
                                        : "Belum mulai"}
                                </span>
                            </div>
                            <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                                <span>Kasir Aktif</span>
                                <span className="text-slate-800 font-bold">
                                    {user?.name}
                                </span>
                            </div>
                            <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                                <span>Tanggal / Waktu</span>
                                <span className="text-slate-800 font-bold">
                                    {trxTime}
                                </span>
                            </div>
                        </div>

                        {/* Totals */}
                        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                            <div className="flex justify-between text-xs text-slate-400 font-semibold">
                                <span>Subtotal</span>
                                <span className="text-slate-800 tabular-nums font-bold">
                                    {formatRupiah(subtotal)}
                                </span>
                            </div>
                            <div className="flex justify-between text-xs text-slate-400 font-semibold">
                                <span>Diskon Belanja</span>
                                <span className="text-rose-500 font-bold">
                                    - Rp 0
                                </span>
                            </div>
                            <div className="flex justify-between text-xs text-slate-400 font-semibold">
                                <span>PPN (11%)</span>
                                <span className="text-slate-800 tabular-nums font-bold">
                                    {formatRupiah(ppn)}
                                </span>
                            </div>
                            <div className="border-t border-dashed border-slate-150 pt-4 flex flex-col gap-1">
                                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                                    Total Belanja
                                </span>
                                <span className="text-[38px] font-extrabold text-emerald-600 leading-none tracking-tight tabular-nums">
                                    {formatRupiah(grandTotal)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3 mt-4">
                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                variant="outline"
                                onClick={handleHold}
                                disabled={cart.length === 0 || isProcessing}
                                className="bg-white hover:bg-slate-50 border-slate-200 text-slate-700 h-10 font-bold text-xs rounded-xl flex gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                                <IconPlayerPause size={16} /> Hold (F5)
                            </Button>
                            <Button
                                variant="outline"
                                onClick={openHoldList}
                                className="bg-white hover:bg-slate-50 border-slate-200 text-slate-700 h-10 font-bold text-xs rounded-xl flex gap-1.5 cursor-pointer"
                            >
                                <IconPlayerPlay size={16} /> Recall (F6)
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleVoidDraft}
                                disabled={cart.length === 0 || isProcessing}
                                className="bg-white hover:bg-rose-50 border-slate-200 hover:border-rose-200 text-rose-600 h-10 font-bold text-xs rounded-xl flex gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                                <IconTrash size={16} /> Void (F10)
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() =>
                                    toast.success(
                                        "Mencetak ulang struk terakhir...",
                                    )
                                }
                                className="bg-white hover:bg-slate-50 border-slate-200 text-slate-700 h-10 font-bold text-xs rounded-xl flex gap-1.5 cursor-pointer"
                            >
                                <IconPrinter size={16} /> Re-print (F4)
                            </Button>
                        </div>

                        <Button
                            onClick={() => setIsPayModalOpen(true)}
                            disabled={cart.length === 0 || isProcessing}
                            className="w-full h-16 bg-emerald-600 hover:bg-emerald-700 font-extrabold text-base rounded-xl flex items-center justify-center gap-3 cursor-pointer shadow-lg shadow-emerald-600/10 transition-all active:scale-[0.99] disabled:opacity-50 border-none text-white"
                        >
                            {isProcessing ? (
                                <IconLoader2
                                    size={24}
                                    className="animate-spin"
                                />
                            ) : (
                                <IconCash size={24} />
                            )}
                            <span>PROSES BAYAR (F1)</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Shortcuts Bar */}
            <div className="absolute left-0 right-0 bottom-0 h-8 bg-slate-900 text-slate-400 flex items-center px-6 text-[10px] gap-6 font-semibold select-none z-10">
                <div className="flex gap-1">
                    <span className="bg-slate-800 text-white px-1.5 py-0.5 rounded font-bold">
                        F1
                    </span>{" "}
                    Bayar
                </div>
                <div className="flex gap-1">
                    <span className="bg-slate-800 text-white px-1.5 py-0.5 rounded font-bold">
                        F2
                    </span>{" "}
                    Katalog
                </div>
                <div className="flex gap-1">
                    <span className="bg-slate-800 text-white px-1.5 py-0.5 rounded font-bold">
                        F5
                    </span>{" "}
                    Hold
                </div>
                <div className="flex gap-1">
                    <span className="bg-slate-800 text-white px-1.5 py-0.5 rounded font-bold">
                        F6
                    </span>{" "}
                    Recall
                </div>
                <div className="flex gap-1">
                    <span className="bg-slate-800 text-white px-1.5 py-0.5 rounded font-bold">
                        F10
                    </span>{" "}
                    Void
                </div>
                <div className="flex gap-1">
                    <span className="bg-slate-800 text-white px-1.5 py-0.5 rounded font-bold">
                        Esc
                    </span>{" "}
                    Tutup
                </div>
            </div>

            {/* dialogs */}
            <CatalogDialog
                open={isCatalogOpen}
                onOpenChange={setIsCatalogOpen}
                products={products || []}
                onAddProduct={handleAddProduct}
            />

            <PaymentDialog
                open={isPayModalOpen}
                onOpenChange={setIsPayModalOpen}
                grandTotal={grandTotal}
                transactionId={transactionId}
                onPaySuccess={(receiptData) => {
                    setReceipt(receiptData);
                    setIsReceiptOpen(true);
                    refetchProducts();
                }}
            />

            <HoldListDialog
                open={isHoldListOpen}
                onOpenChange={setIsHoldListOpen}
                holdList={holdList}
                onRecall={handleRecall}
                isProcessing={isProcessing}
            />

            <ReceiptDialog
                open={isReceiptOpen}
                onOpenChange={setIsReceiptOpen}
                receipt={receipt}
                cashierName={user?.name || ""}
                onNewTransaction={handleNewTransaction}
            />
        </div>
    );
}
