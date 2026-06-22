"use client";

import { lookupBarcode } from "@/features/checkout/api/checkout-api";
import type { CartItem, HoldTransaction, Receipt } from "@/features/checkout/types";
import { useProducts } from "@/features/products/api/products-api";
import type { Product } from "@/features/products/types";
import { useAppRouter } from "@/hooks/use-app-router";
import { useCheckoutStore } from "@/stores/checkout-store";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

export function useCheckoutState() {
    const router = useAppRouter();
    const { data: session, update } = useSession();
    const user = session?.user;

    // Products list from API for Catalog & Search
    const { data: productsData, refetch: refetchProducts } = useProducts({
        per_page: 1000,
    });
    const products = productsData?.data;

    // Connect to local checkout Zustand store
    const storeCart = useCheckoutStore((state) => state.cart);
    const storeHoldList = useCheckoutStore((state) => state.holdList);
    const storeSelectedMember = useCheckoutStore((state) => state.selectedMember);
    const addItem = useCheckoutStore((state) => state.addItem);
    const updateItemQty = useCheckoutStore((state) => state.updateItemQty);
    const removeItem = useCheckoutStore((state) => state.removeItem);
    const clearCart = useCheckoutStore((state) => state.clearCart);
    const addHoldTransaction = useCheckoutStore((state) => state.addHoldTransaction);
    const removeHoldTransaction = useCheckoutStore((state) => state.removeHoldTransaction);
    const clearHoldList = useCheckoutStore((state) => state.clearHoldList);
    const setSelectedMember = useCheckoutStore((state) => state.setSelectedMember);

    // Hydration check to prevent Next.js hydration mismatches
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
        setTimeout(() => barcodeInputRef.current?.focus(), 100);
    }, []);

    // Expose cart, holdList & selectedMember safely
    const cart = useMemo(() => (mounted ? storeCart : []), [mounted, storeCart]);
    const holdList = useMemo(() => (mounted ? storeHoldList : []), [mounted, storeHoldList]);
    const selectedMember = useMemo(() => (mounted ? storeSelectedMember : null), [mounted, storeSelectedMember]);

    // Recalled transaction reference ID (purely for local UI representation)
    const [activeRecallId, setActiveRecallId] = useState<number | null>(null);

    // UI state
    const [barcodeInput, setBarcodeInput] = useState("");
    const [isCatalogOpen, setIsCatalogOpen] = useState(false);
    const [isPayModalOpen, setIsPayModalOpen] = useState(false);
    const [isReceiptOpen, setIsReceiptOpen] = useState(false);
    const [isHoldListOpen, setIsHoldListOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Receipt data (after successful payment)
    const [receipt, setReceipt] = useState<Receipt | null>(null);
    const [lastTransactionId, setLastTransactionId] = useState<number | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem("lastTransactionId");
        if (stored) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setLastTransactionId(Number(stored));
        }
    }, []);

    const [trxTime, setTrxTime] = useState("");
    const barcodeInputRef = useRef<HTMLInputElement>(null);

    // ─── Calculations ─────────────────────────────────────────────────────────
    const subtotal = cart.reduce((acc, i) => acc + i.price * i.qty, 0);
    const ppn = Math.round(subtotal * 0.11);
    const grandTotal = subtotal + ppn;

    // ─── Handlers ─────────────────────────────────────────────────────────────

    const handleHold = useCallback(() => {
        if (cart.length === 0) return;
        try {
            setIsProcessing(true);
            const holdId = activeRecallId || Date.now();

            const newHold: HoldTransaction = {
                id: holdId,
                items_count: cart.reduce((acc, item) => acc + item.qty, 0),
                subtotal,
                created_at: new Date().toISOString(),
                items: cart,
                member: selectedMember,
            };

            addHoldTransaction(newHold);
            toast.info("Transaksi di-hold.");
            clearCart();
            setActiveRecallId(null);
        } catch {
            toast.error("Gagal hold transaksi.");
        } finally {
            setIsProcessing(false);
        }
    }, [cart, subtotal, addHoldTransaction, clearCart, activeRecallId, selectedMember]);

    const openHoldList = useCallback(() => {
        setIsHoldListOpen(true);
    }, []);

    const [isVoidConfirmOpen, setIsVoidConfirmOpen] = useState(false);

    const handleVoidDraft = useCallback(() => {
        if (cart.length === 0) return;
        setIsVoidConfirmOpen(true);
    }, [cart.length]);

    const handleConfirmVoid = useCallback(() => {
        clearCart();
        setActiveRecallId(null);
        setIsVoidConfirmOpen(false);
        toast.error("Transaksi dibatalkan.");
    }, [clearCart]);

    const handleAddProduct = async (product: Product) => {
        if (product.status !== "active") {
            toast.error("Produk ini tidak aktif.");
            return;
        }
        if (!product.is_jasa && product.stok <= 0) {
            toast.error(`Stok ${product.nama} habis!`);
            return;
        }

        const existing = cart.find((i) => i.product_id === product.id);
        if (!product.is_jasa && existing && existing.qty >= product.stok) {
            toast.error(`Stok ${product.nama} tidak mencukupi!`);
            return;
        }

        try {
            setIsProcessing(true);
            addItem({
                product_id: product.id,
                name: product.nama,
                price: product.harga,
                qty: 1,
                stock: product.stok,
                barcode: product.barcode || null,
                is_jasa: !!product.is_jasa,
            });
            toast.success(`${product.nama} ditambahkan.`);
            setTimeout(() => barcodeInputRef.current?.focus(), 50);
        } catch {
            toast.error("Gagal menambahkan item.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleUpdateQty = async (item: CartItem, newQty: number) => {
        if (newQty <= 0) {
            handleRemoveItem(item);
            return;
        }
        if (!item.is_jasa && newQty > item.stock) {
            toast.error(`Stok ${item.name} tidak mencukupi! Maksimal: ${item.stock}`);
            return;
        }
        updateItemQty(item.product_id, newQty);
    };

    const handleRemoveItem = async (item: CartItem) => {
        removeItem(item.product_id);
        toast.error(`${item.name} dihapus.`);
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

    const handleRecall = useCallback((holdTrxId: number) => {
        try {
            setIsProcessing(true);
            const held = storeHoldList.find((h) => h.id === holdTrxId);
            if (!held) {
                toast.error("Transaksi hold tidak ditemukan.");
                return;
            }

            // Auto-hold active cart if not empty
            const activeCart = useCheckoutStore.getState().cart;
            if (activeCart.length > 0) {
                const currentHoldId = activeRecallId || Date.now();
                const autoHoldItem: HoldTransaction = {
                    id: currentHoldId,
                    items_count: activeCart.reduce((acc, item) => acc + item.qty, 0),
                    subtotal: activeCart.reduce((acc, i) => acc + i.price * i.qty, 0),
                    created_at: new Date().toISOString(),
                    items: activeCart,
                    member: useCheckoutStore.getState().selectedMember,
                };
                addHoldTransaction(autoHoldItem);
                toast.info("Transaksi sebelumnya otomatis di-hold.");
            }

            // Load items into cart
            useCheckoutStore.getState().setCart(held.items);
            useCheckoutStore.getState().setSelectedMember(held.member || null);
            setActiveRecallId(held.id);
            // Remove from holdList
            removeHoldTransaction(holdTrxId);
            setIsHoldListOpen(false);
            toast.success("Transaksi di-recall.");
        } catch {
            toast.error("Gagal recall transaksi.");
        } finally {
            setIsProcessing(false);
        }
    }, [storeHoldList, removeHoldTransaction, activeRecallId, addHoldTransaction]);

    const handleNewTransaction = () => {
        clearCart();
        setActiveRecallId(null);
        setReceipt(null);
        setIsReceiptOpen(false);
        setTimeout(() => barcodeInputRef.current?.focus(), 100);
    };

    const handlePaymentSuccess = (receiptData: Receipt) => {
        setReceipt(receiptData);
        setIsReceiptOpen(true);
        refetchProducts();
        clearCart();
        setActiveRecallId(null);
        if (receiptData?.id) {
            localStorage.setItem("lastTransactionId", String(receiptData.id));
            setLastTransactionId(receiptData.id);
            window.open(`/api/proxy/v1/transactions-print/${receiptData.id}`, "_blank");
        }
    };

    const handleClearHoldList = useCallback(() => {
        clearHoldList();
        toast.error("Semua transaksi hold telah dihapus.");
    }, [clearHoldList]);

    const handleReprint = useCallback(() => {
        if (lastTransactionId) {
            window.open(`/api/proxy/v1/transactions-print/${lastTransactionId}`, "_blank");
            toast.success("Mencetak ulang struk terakhir...");
        } else {
            toast.error("Tidak ada transaksi terakhir yang dapat dicetak ulang.");
        }
    }, [lastTransactionId]);

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

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "F1") {
                e.preventDefault();
                if (cart.length > 0) setIsPayModalOpen(true);
            } else if (e.key === "F2") {
                e.preventDefault();
                setIsCatalogOpen((p) => !p);
            } else if (e.key === "F4") {
                e.preventDefault();
                handleReprint();
            } else if (e.key === "F5") {
                e.preventDefault();
                if (cart.length > 0) handleHold();
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
    }, [cart, handleHold, openHoldList, handleVoidDraft, handleReprint]);

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
        transactionId: activeRecallId,
        cart,
        holdList,
        selectedMember,
        setSelectedMember,
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
        isVoidConfirmOpen,
        setIsVoidConfirmOpen,
        handleConfirmVoid,
        handleHold,
        openHoldList,
        handleVoidDraft,
        handleAddProduct,
        handleUpdateQty,
        handleRemoveItem,
        handleBarcodeSubmit,
        handleRecall,
        handleNewTransaction,
        handlePaymentSuccess,
        handleClearHoldList,
        handleReprint,
        lastTransactionId,
    };
}
