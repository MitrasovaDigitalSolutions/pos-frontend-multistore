"use client";

import { lookupBarcode } from "@/features/checkout/api/checkout-api";
import type { CartItem, HoldTransaction, Receipt, ReceiptItem } from "@/features/checkout/types";
import { useProducts } from "@/features/products/api/products-api";
import type { Product } from "@/features/products/types";
import { useAppRouter } from "@/hooks/use-app-router";
import { useCheckoutStore } from "@/stores/checkout-store";
import { useSession } from "next-auth/react";
import { useSettingsStore } from "@/stores/settings-store";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { db } from "@/lib/db";
import { useNetworkStatus } from "@/hooks/use-network-status";
import axios from "axios";
import { buildReceipt } from "@/utils/ReceiptFormatter";
import QZService from "@/services/qz.service";
import { formatDate } from "@/lib/date-utils";

export function useCheckoutState() {
    const router = useAppRouter();
    const { data: session, update } = useSession();
    const user = session?.user;
    const getSetting = useSettingsStore((state) => state.getSetting);

    const isOnline = useNetworkStatus();
    // Products list from API for Catalog & Search
    const { data: productsData, refetch: refetchProducts } = useProducts({
        per_page: 9,
    });

    const [localProducts, setLocalProducts] = useState<Product[]>([]);

    const reloadLocalProducts = useCallback(async () => {
        try {
            const items = await db.products.toArray();
            setLocalProducts(items.filter((item) => item.status === "active"));
        } catch (err) {
            console.error("Gagal load produk lokal:", err);
        }
    }, []);

    useEffect(() => {
        let isMounted = true;
        if (productsData?.data) {
            db.products.bulkPut(productsData.data).then(() => {
                if (isMounted) {
                    reloadLocalProducts();
                }
            });
        } else {
            Promise.resolve().then(() => {
                if (isMounted) {
                    reloadLocalProducts();
                }
            });
        }
        return () => {
            isMounted = false;
        };
    }, [productsData, reloadLocalProducts]);

    useEffect(() => {
        const handleCatalogSynced = () => {
            reloadLocalProducts();
        };

        window.addEventListener("pos_catalog_synced", handleCatalogSynced);
        return () => {
            window.removeEventListener("pos_catalog_synced", handleCatalogSynced);
        };
    }, [reloadLocalProducts]);

    const products = localProducts;

    // Connect to local checkout Zustand store
    const storeCart = useCheckoutStore((state) => state.cart);
    const storeHoldList = useCheckoutStore((state) => state.holdList);
    const storeSelectedMember = useCheckoutStore((state) => state.selectedMember);
    const addItem = useCheckoutStore((state) => state.addItem);
    const updateItemQty = useCheckoutStore((state) => state.updateItemQty);
    const updateItemPrice = useCheckoutStore((state) => state.updateItemPrice);
    const removeItem = useCheckoutStore((state) => state.removeItem);
    const clearCart = useCheckoutStore((state) => state.clearCart);
    const addHoldTransaction = useCheckoutStore((state) => state.addHoldTransaction);
    const removeHoldTransaction = useCheckoutStore((state) => state.removeHoldTransaction);
    const clearHoldList = useCheckoutStore((state) => state.clearHoldList);
    const setSelectedMember = useCheckoutStore((state) => state.setSelectedMember);
    const discountType = useCheckoutStore((state) => state.discountType);
    const discountValue = useCheckoutStore((state) => state.discountValue);
    const setDiscountType = useCheckoutStore((state) => state.setDiscountType);
    const setDiscountValue = useCheckoutStore((state) => state.setDiscountValue);
    const namaTransaksiStore = useCheckoutStore((state) => state.namaTransaksi);
    const setNamaTransaksi = useCheckoutStore((state) => state.setNamaTransaksi);

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
    const namaTransaksi = useMemo(() => (mounted ? namaTransaksiStore : ""), [mounted, namaTransaksiStore]);

    // Recalled transaction reference ID (purely for local UI representation)
    const [activeRecallId, setActiveRecallId] = useState<string | null>(null);

    // UI state
    const [barcodeInput, setBarcodeInput] = useState("");
    const [isPayModalOpen, setIsPayModalOpen] = useState(false);
    const [isReceiptOpen, setIsReceiptOpen] = useState(false);
    const [isHoldListOpen, setIsHoldListOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Receipt data (after successful payment)
    const [receipt, setReceipt] = useState<Receipt | null>(null);
    const [lastTransactionId, setLastTransactionId] = useState<string | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem("lastTransactionId");
        if (stored) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setLastTransactionId(stored);
        }
    }, []);

    const [trxTime, setTrxTime] = useState("");
    const barcodeInputRef = useRef<HTMLInputElement>(null);

    // ─── Calculations ─────────────────────────────────────────────────────────
    const subtotal = cart.reduce((acc, i) => acc + i.price * i.qty, 0);
    const getTaxRate = useSettingsStore((state) => state.getTaxRate);
    const taxRate = getTaxRate() / 100;
    const discountAmount = useMemo(() => {
        if (discountType === "percent") {
            return Math.min(subtotal, Math.floor((discountValue / 100) * subtotal));
        }
        return Math.min(subtotal, discountValue);
    }, [discountType, discountValue, subtotal]);
    const ppn = Math.floor((subtotal - discountAmount) * taxRate);
    const grandTotal = Math.max(0, subtotal - discountAmount + ppn);

    // ─── Handlers ─────────────────────────────────────────────────────────────

    const handleHold = useCallback(() => {
        if (cart.length === 0) return;
        try {
            setIsProcessing(true);
            const holdId = activeRecallId || Date.now().toString();
            const defaultName = `TRX #${String(holdId).slice(-8)}`;

            const newHold: HoldTransaction = {
                uid: holdId,
                nama_transaksi: namaTransaksi || defaultName,
                items_count: cart.reduce((acc, item) => acc + item.qty, 0),
                subtotal,
                discountType,
                discountValue,
                created_at: new Date().toISOString(),
                items: cart,
                member: selectedMember,
            };

            addHoldTransaction(newHold);
            toast.info("Transaksi di-hold.");
            clearCart();
            setActiveRecallId(null);
            setNamaTransaksi("");
        } catch {
            toast.error("Gagal hold transaksi.");
        } finally {
            setIsProcessing(false);
        }
    }, [cart, subtotal, discountType, discountValue, addHoldTransaction, clearCart, activeRecallId, selectedMember, namaTransaksi, setNamaTransaksi]);

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
        setNamaTransaksi("");
        setIsVoidConfirmOpen(false);
        toast.error("Transaksi dibatalkan.");
    }, [clearCart, setNamaTransaksi]);

    const handleAddProduct = async (product: Product) => {
        if (product.status !== "active") {
            toast.error("Produk ini tidak aktif.");
            return;
        }
        if (!product.is_jasa && product.stok <= 0) {
            toast.error(`Stok ${product.nama} habis!`);
            return;
        }

        const existing = cart.find((i) => i.product_uid === product.uid);
        if (!product.is_jasa && existing && existing.qty >= product.stok) {
            toast.error(`Stok ${product.nama} tidak mencukupi!`);
            return;
        }

        try {
            setIsProcessing(true);
            addItem({
                product_uid: product.uid,
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
        updateItemQty(item.product_uid, newQty);
    };

    const handleUpdatePrice = async (item: CartItem, newPrice: number) => {
        if (newPrice < 0) return;
        updateItemPrice(item.product_uid, newPrice);
    };

    const handleRemoveItem = async (item: CartItem) => {
        removeItem(item.product_uid);
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
        if (!found) {
            const queryWords = query.toLowerCase().split(/\s+/);
            found = products?.find((p) =>
                queryWords.every((word) => p.nama.toLowerCase().includes(word))
            );
        }

        // Search full IndexedDB table if not found in memory state
        if (!found) {
            try {
                const dbProduct = await db.products
                    .where("barcode")
                    .equalsIgnoreCase(query)
                    .first();
                if (dbProduct) {
                    found = dbProduct;
                } else {
                    const dbProductByName = await db.products
                        .where("nama")
                        .equalsIgnoreCase(query)
                        .first();
                    if (dbProductByName) found = dbProductByName;
                }
            } catch (err) {
                console.error("Error mencari produk di IndexedDB:", err);
            }
        }

        if (found) {
            await handleAddProduct(found);
        } else if (isOnline) {
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
        } else {
            toast.error(`Produk "${query}" tidak ditemukan secara offline!`);
        }
    };

    const handleRecall = useCallback((holdTrxId: string) => {
        try {
            setIsProcessing(true);
            const held = storeHoldList.find((h) => h.uid === holdTrxId);
            if (!held) {
                toast.error("Transaksi hold tidak ditemukan.");
                return;
            }

            // Auto-hold active cart if not empty
            const activeCart = useCheckoutStore.getState().cart;
            if (activeCart.length > 0) {
                const currentHoldId = activeRecallId || Date.now().toString();
                const defaultName = `TRX #${String(currentHoldId).slice(-8)}`;
                const autoHoldItem: HoldTransaction = {
                    uid: currentHoldId,
                    nama_transaksi: namaTransaksi || defaultName,
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
            useCheckoutStore.getState().setDiscountType(held.discountType || "nominal");
            useCheckoutStore.getState().setDiscountValue(held.discountValue || 0);
            useCheckoutStore.getState().setNamaTransaksi(held.nama_transaksi || "");
            setActiveRecallId(held.uid);
            // Remove from holdList
            removeHoldTransaction(holdTrxId);
            setIsHoldListOpen(false);
            toast.success("Transaksi di-recall.");
        } catch {
            toast.error("Gagal recall transaksi.");
        } finally {
            setIsProcessing(false);
        }
    }, [storeHoldList, removeHoldTransaction, activeRecallId, addHoldTransaction, namaTransaksi]);

    const printOnlineReceipt = useCallback(async (uid: string) => {
        const printerName = getSetting("printer_id");
        if (!printerName) {
            toast.warning("Printer belum dikonfigurasi! Membuka menu Pengaturan...");
            setIsSettingsOpen(true);
            return;
        }

        const toastId = toast.success("Mencetak struk...");
        try {
            const { data } = await axios.get(`/api/proxy/v1/transactions-print/${uid}`);
            const receiptText = buildReceipt(data);
            await QZService.print(printerName, receiptText);
        } catch (err) {
            console.error("Gagal mencetak struk:", err);
            toast.error("Gagal mencetak struk. Pastikan QZ Tray aktif.");
        } finally {
            setTimeout(() => {
                toast.dismiss(toastId);
            }, 3000);
        }
    }, [getSetting]);

    const printOfflineReceipt = useCallback(async (uid: string) => {
        const printerName = getSetting("printer_id");
        if (!printerName) {
            toast.warning("Printer belum dikonfigurasi! Membuka menu Pengaturan...");
            setIsSettingsOpen(true);
            return;
        }

        const toastId = toast.success("Mencetak struk offline...");
        try {
            const clientUid = uid.startsWith("OFFLINE-") ? uid.replace("OFFLINE-", "") : uid;
            const record = await db.offlineTransactions.get(clientUid);
            if (!record || !record.receiptData) {
                toast.error("Data transaksi offline tidak ditemukan.");
                return;
            }

            const receiptData = record.receiptData;

            // Prepare items with subtotal computed (since buildReceipt expects item.subtotal)
            const formattedItems = (receiptData.items || []).map((item: ReceiptItem) => ({
                ...item,
                subtotal: item.harga_satuan * item.kuantitas,
            }));

            // Prepare the sale object matching ReceiptData.sale
            const sale = {
                uid: receiptData.uid,
                nomor_transaksi: receiptData.uid,
                nama_transaksi: receiptData.nama_transaksi,
                created_at: record.timestamp || new Date().toISOString(),
                user: {
                    name: user?.name || "Kasir Offline",
                },
                member: receiptData.member,
                metode_pembayaran: receiptData.metode_pembayaran,
                subtotal: receiptData.subtotal,
                diskon: receiptData.diskon || 0,
                total: receiptData.total,
                nominal_bayar: receiptData.nominal_bayar || 0,
                kembalian: receiptData.kembalian || 0,
                cash_received: receiptData.cash_received || 0,
                debt_amount: receiptData.debt_amount || 0,
                items: formattedItems,
            };

            const setting = {
                app_name: getSetting("app_name", "Mitrasova POS"),
                app_address: getSetting("app_address", "Indonesia"),
                app_phone: getSetting("app_phone", ""),
            };

            const receiptText = buildReceipt({ sale, setting });
            await QZService.print(printerName, receiptText);
        } catch (err) {
            console.error("Gagal mencetak struk offline:", err);
            toast.error("Gagal mencetak struk offline. Pastikan QZ Tray aktif.");
        } finally {
            setTimeout(() => {
                toast.dismiss(toastId);
            }, 3000);
        }
    }, [getSetting, user]);

    const handleNewTransaction = () => {
        clearCart();
        setActiveRecallId(null);
        setNamaTransaksi("");
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
        if (receiptData?.uid) {
            localStorage.setItem("lastTransactionId", String(receiptData.uid));
            setLastTransactionId(String(receiptData.uid));
        }
    };

    const handleClearHoldList = useCallback(() => {
        clearHoldList();
        toast.error("Semua transaksi hold telah dihapus.");
    }, [clearHoldList]);



    const handleReprint = useCallback((uid?: string) => {
        const targetId = uid || lastTransactionId;
        if (targetId) {
            const isOfflineTx = String(targetId).startsWith("OFFLINE-");
            if (isOfflineTx) {
                printOfflineReceipt(String(targetId));
            } else {
                printOnlineReceipt(String(targetId));
            }
        } else {
            toast.error("Tidak ada transaksi yang dapat dicetak ulang.");
        }
    }, [lastTransactionId, printOfflineReceipt, printOnlineReceipt]);

    // ─── Clock & Keyboard Shortcuts ───────────────────────────────────────────
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setTrxTime(formatDate(now, "dd MMM yyyy, HH:mm"));
        };
        updateTime();
        const timer = setInterval(updateTime, 60000);

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "F1") {
                e.preventDefault();
                if (cart.length > 0) setIsPayModalOpen(true);
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
                // setIsCatalogOpen(false);
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
        reloadLocalProducts,
        transactionId: activeRecallId,
        cart,
        holdList,
        selectedMember,
        setSelectedMember,
        barcodeInput,
        setBarcodeInput,
        isPayModalOpen,
        setIsPayModalOpen,
        isReceiptOpen,
        setIsReceiptOpen,
        isHoldListOpen,
        setIsHoldListOpen,
        isSettingsOpen,
        setIsSettingsOpen,
        namaTransaksi,
        setNamaTransaksi,
        isProcessing,
        receipt,
        setReceipt,
        trxTime,
        barcodeInputRef,
        subtotal,
        ppn,
        discountType,
        discountValue,
        discountAmount,
        setDiscountType,
        setDiscountValue,
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
        handleUpdatePrice,
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
