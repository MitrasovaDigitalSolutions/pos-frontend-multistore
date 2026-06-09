"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
import { apiGet, apiGetList } from "@/shared/api/api-client";
import type { CartItem, HoldTransaction, Receipt, TrxData } from "@/features/checkout/types";
import type { Product } from "@/features/products/types";
import type { ApiResponse } from "@/types/api";

export function useCheckoutState() {
    const router = useRouter();
    const { data: session, update } = useSession();
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

    // ─── Calculations ─────────────────────────────────────────────────────────
    const subtotal = cart.reduce((acc, i) => acc + i.price * i.qty, 0);
    const ppn = Math.round(subtotal * 0.11);
    const grandTotal = subtotal + ppn;

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
                { per_page: 105 },
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

    const handleAddProduct = async (product: Product) => {
        if (product.status !== "active") {
            toast.error("Produk ini tidak aktif.");
            return;
        }
        if (product.stok <= 0) {
            toast.error(`Stok ${product.nama} habis!`);
            return;
        }

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

    const handleBarcodeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const query = barcodeInput.trim();
        setBarcodeInput("");
        if (!query) return;

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

    const handleNewTransaction = () => {
        setCart([]);
        setTransactionId(null);
        setReceipt(null);
        setIsReceiptOpen(false);
        setTimeout(() => barcodeInputRef.current?.focus(), 100);
    };

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

    const hasAccessAdmin = !!(
        user?.roles?.includes("admin") ||
        user?.roles?.includes("manajer_toko") ||
        user?.roles?.includes("supervisor")
    );

    return {
        router,
        session,
        update,
        user,
        products,
        refetchProducts,
        transactionId,
        cart,
        holdList,
        barcodeInput,
        setBarcodeInput,
        isCatalogOpen,
        setIsCatalogOpen,
        isPayModalOpen,
        setIsPayModalOpen,
        isReceiptOpen,
        setIsReceiptOpen,
        isHoldListOpen,
        setIsHoldListOpen,
        isProcessing,
        receipt,
        setReceipt,
        trxTime,
        barcodeInputRef,
        subtotal,
        ppn,
        grandTotal,
        hasAccessAdmin,
        handleHold,
        openHoldList,
        handleVoidDraft,
        handleAddProduct,
        handleUpdateQty,
        handleRemoveItem,
        handleBarcodeSubmit,
        handleRecall,
        handleNewTransaction,
    };
}
