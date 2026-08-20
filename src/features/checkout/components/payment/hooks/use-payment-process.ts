import { useState, useEffect, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useBulkCheckout } from "@/features/checkout/api/checkout-api";
import { useSettingsStore } from "@/stores/settings-store";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import axios from "axios";
import PrinterService from "@/services/printer.service";
import { buildReceipt58 } from "@/utils/ReceiptFormatter58";
import { db } from "@/lib/db";
import { NetworkError } from "@/shared/errors/api-error";
import { toUTC7String } from "@/lib/date-utils";
import type { Receipt, CartItem } from "@/features/checkout/types";
import type { Member } from "@/features/master/members/types";
import type { PaymentMode, PaymentFormValues } from "../types/payment-dialog.types";

interface UsePaymentProcessParams {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    grandTotal: number;
    cartItems: { product_uid: string; quantity: number; harga_satuan?: number }[];
    discount: number;
    tax: number;
    selectedMember: Member | null;
    onPaySuccess: (receipt: Receipt) => void;
    cartList: CartItem[];
    onLocalProductsReload?: () => void;
    namaTransaksi: string;
}

export function usePaymentProcess({
    open,
    onOpenChange,
    grandTotal,
    cartItems,
    discount,
    tax,
    selectedMember,
    onPaySuccess,
    cartList,
    onLocalProductsReload,
    namaTransaksi,
}: UsePaymentProcessParams) {
    const bulkCheckout = useBulkCheckout();
    const isOnline = useNetworkStatus();
    const { data: session } = useSession();
    const getSetting = useSettingsStore((state) => state.getSetting);

    const [payMode, setPayMode] = useState<PaymentMode>("cash");

    const methods = useForm<PaymentFormValues>({
        defaultValues: {
            cashReceived: null,
            cardAmount: null,
            cardType: "debit",
            cardLast4: "",
            cardRef: "",
        },
    });

    const { control, reset, setValue } = methods;

    const cardType = useWatch({ control, name: "cardType" });
    const cardLast4 = useWatch({ control, name: "cardLast4" });
    const cardRef = useWatch({ control, name: "cardRef" });
    const cashReceivedVal = useWatch({ control, name: "cashReceived" });
    const cardAmountVal = useWatch({ control, name: "cardAmount" });

    // Reset form when dialog opens
    useEffect(() => {
        if (open) {
            const timer = setTimeout(() => {
                setPayMode("cash");
                reset({
                    cashReceived: null,
                    cardAmount: null,
                    cardType: "debit",
                    cardLast4: "",
                    cardRef: "",
                });
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [open, reset]);

    const cashNum = cashReceivedVal || 0;
    const cardAmountNum = cardAmountVal || 0;
    const totalDp = cashNum + cardAmountNum;
    const changeValue = cashNum - grandTotal;
    const isCashValid = cashNum >= grandTotal && grandTotal > 0;
    const isCardValid = grandTotal > 0;
    const isDebtValid = !!selectedMember && grandTotal > 0 && totalDp < grandTotal;
    const isProcessing = bulkCheckout.isPending;

    const isSubmitEnabled =
        payMode === "cash"
            ? isCashValid
            : payMode === "card"
                ? isCardValid
                : isDebtValid;

    const decrementLocalStock = async () => {
        for (const item of cartList) {
            if (item.is_jasa) continue;
            try {
                const product = await db.products.get(item.product_uid);
                if (product) {
                    const newStock = Math.max(0, product.stok - item.qty);
                    await db.products.update(item.product_uid, { stok: newStock });
                }
            } catch (stockErr) {
                console.warn(`Gagal mengurangi stok produk ${item.product_uid}:`, stockErr);
            }
        }
        onLocalProductsReload?.();
    };

    const printReceipt = async (receiptText: string) => {
        const printerName = getSetting("printer_id") || "EPSON LX-310 ESC/P";
        const toastId = toast.success("Mencetak struk...");
        try {
            await PrinterService.print(printerName, receiptText);
        } catch (err) {
            console.error("Gagal mencetak struk:", err);
            toast.error("Gagal mencetak struk. Pastikan local printer service aktif.");
        } finally {
            setTimeout(() => toast.dismiss(toastId), 3000);
        }
    };

    const handlePaySubmit = async () => {
        if (cartItems.length === 0) {
            toast.error("Keranjang belanja kosong.");
            return;
        }

        if (!session?.cashDrawerSessionId) {
            toast.warning("Silakan buka shift laci kasir terlebih dahulu untuk melakukan transaksi.");
            onOpenChange(false);
            return;
        }

        if (payMode === "debt" && !selectedMember) {
            toast.error("Harap pilih member terlebih dahulu untuk pembayaran hutang.");
            return;
        }

        const currentCardAmount = cardAmountVal || 0;
        const currentTotalDp = cashNum + currentCardAmount;

        if (payMode === "debt" && currentTotalDp >= grandTotal) {
            toast.error("Total uang muka (DP) tidak boleh melebihi atau sama dengan total tagihan.");
            return;
        }

        const clientUid = crypto.randomUUID();
        const now = toUTC7String();

        const payload: Record<string, unknown> = {
            uid: clientUid,
            nama_transaksi: namaTransaksi || null,
            payment_method: payMode,
            metode_pembayaran: payMode,
            discount: discount,
            diskon: discount,
            tax: tax,
            pajak: tax,
            paid: payMode === "cash" ? cashNum : payMode === "debt" ? cashNum : grandTotal,
            nominal_bayar: payMode === "cash" ? cashNum : payMode === "debt" ? cashNum : grandTotal,
            cashier_name: session?.user?.name || "",
            member_uid: selectedMember?.uid || null,
            items: cartItems.map((item) => {
                const itemPayload: Record<string, unknown> = {
                    product_id: item.product_uid,
                    product_uid: item.product_uid,
                    quantity: item.quantity,
                };
                if (item.harga_satuan !== undefined) {
                    itemPayload.harga_satuan = item.harga_satuan;
                }
                return itemPayload;
            }),
        };

        if (payMode === "cash") {
            payload.cash_received = cashNum;
            payload.cash_details = {
                cash_received: cashNum,
                nominal_bayar: cashNum,
            };
        } else if (payMode === "card") {
            const finalCardRef = cardRef || `EDC-${Date.now()}`;
            payload.card_type = cardType;
            payload.jenis_kartu = cardType;
            payload.last_four = cardLast4;
            payload.nomor_kartu_akhir = cardLast4;
            payload.reference_number = finalCardRef;
            payload.referensi_edc = finalCardRef;
            payload.card_details = {
                card_type: cardType,
                jenis_kartu: cardType,
                last_four: cardLast4,
                nomor_kartu_akhir: cardLast4,
                reference_number: finalCardRef,
                referensi_edc: finalCardRef,
            };
        } else if (payMode === "debt") {
            payload.cash_received = cashNum;
            payload.cash_amount = cashNum;
            payload.card_amount = currentCardAmount;
            if (currentCardAmount > 0) {
                const finalCardRef = cardRef || `EDC-${Date.now()}`;
                payload.card_type = cardType;
                payload.jenis_kartu = cardType;
                payload.last_four = cardLast4;
                payload.nomor_kartu_akhir = cardLast4;
                payload.reference_number = finalCardRef;
                payload.referensi_edc = finalCardRef;
            }
            payload.debt_details = {
                cash_received: cashNum,
                cash_amount: cashNum,
                card_amount: currentCardAmount,
                debt_amount: grandTotal - currentTotalDp,
                ...(currentCardAmount > 0 && {
                    jenis_kartu: cardType,
                    nomor_kartu_akhir: cardLast4,
                    referensi_edc: cardRef || `EDC-${Date.now()}`,
                }),
            };
        }

        const saveOffline = async (notice: string) => {
            try {
                const offlineReceiptUid = `OFFLINE-${clientUid}`;
                const subtotalVal = cartList.reduce((acc, item) => acc + item.price * item.qty, 0);

                const mockReceipt: Receipt = {
                    uid: offlineReceiptUid,
                    nama_transaksi: namaTransaksi || undefined,
                    subtotal: subtotalVal,
                    diskon: discount,
                    pajak: tax,
                    total: grandTotal,
                    metode_pembayaran: payMode,
                    nominal_bayar: payMode === "cash" ? cashNum : payMode === "debt" ? currentTotalDp : 0,
                    kembalian: payMode === "cash" ? Math.max(0, changeValue) : 0,
                    cash_received: payMode === "debt" ? cashNum : payMode === "cash" ? cashNum : 0,
                    cash_amount: payMode === "cash" ? cashNum : payMode === "debt" ? cashNum : 0,
                    card_amount: payMode === "card" ? grandTotal : payMode === "debt" ? currentCardAmount : 0,
                    debt_amount: payMode === "debt" ? grandTotal - currentTotalDp : 0,
                    jenis_kartu: payMode === "card" ? cardType : payMode === "debt" && currentCardAmount > 0 ? cardType : undefined,
                    nomor_kartu_akhir: payMode === "card" ? cardLast4 : payMode === "debt" && currentCardAmount > 0 ? cardLast4 : undefined,
                    member: selectedMember,
                    items: cartList.map((item) => ({
                        uid: item.product_uid,
                        nama_produk: item.name,
                        kuantitas: item.qty,
                        harga_satuan: item.price,
                        harga_grosir: item.harga_grosir ?? null,
                        min_qty_grosir: item.min_qty_grosir ?? null,
                    })),
                };

                const existing = await db.offlineQueue.where("uid").equals(clientUid).count();
                if (existing === 0) {
                    await db.offlineQueue.add({
                        uid: clientUid,
                        payload: {
                            ...payload,
                            created_at: now,
                            updated_at: now,
                        },
                        timestamp: now,
                        status: "pending",
                    });

                    await db.offlineTransactions.add({
                        uid: clientUid,
                        payload: {
                            ...payload,
                            created_at: now,
                            updated_at: now,
                        },
                        receiptData: mockReceipt,
                        status: "pending",
                        timestamp: now,
                    });

                    await decrementLocalStock();

                    const activeSessionId = session?.cashDrawerSessionId;
                    if (activeSessionId) {
                        try {
                            const dbSession = await db.cashDrawerSessions.get(activeSessionId);
                            if (dbSession) {
                                const cashAdded = payMode === "cash" ? grandTotal : payMode === "debt" ? cashNum : 0;
                                if (cashAdded > 0) {
                                    const newExpectedCash = (dbSession.expected_cash || 0) + cashAdded;
                                    const newCashSalesTotal = (dbSession.cash_sales_total || 0) + cashAdded;

                                    await db.cashDrawerSessions.update(activeSessionId, {
                                        expected_cash: newExpectedCash,
                                        cash_sales_total: newCashSalesTotal,
                                        updated_at: now,
                                    });

                                    const movementUid = `OFFLINE-MOV-${crypto.randomUUID()}`;
                                    const newMovement = {
                                        uid: movementUid,
                                        cash_drawer_session_uid: activeSessionId,
                                        user_uid: dbSession.user_uid,
                                        type: "cash_sale",
                                        amount: cashAdded,
                                        balance_before: dbSession.expected_cash,
                                        balance_after: newExpectedCash,
                                        reference_uid: offlineReceiptUid,
                                        reference_type: "transaction",
                                        note: `Penjualan Offline (${payMode === "cash" ? "Tunai" : "Hutang"})`,
                                        created_at: now,
                                        updated_at: now,
                                    };
                                    await db.cashDrawerMovements.add(newMovement);
                                }
                            }
                        } catch (drawerErr) {
                            console.warn("Gagal memperbarui laci kasir lokal:", drawerErr);
                        }
                    }

                    if (payMode === "debt" && selectedMember) {
                        try {
                            const newDebt = (selectedMember.hutang || 0) + (grandTotal - currentTotalDp);
                            await db.members.update(selectedMember.uid, { hutang: newDebt });
                        } catch (debtErr) {
                            console.warn("Gagal memperbarui hutang member lokal:", debtErr);
                        }
                    }
                }

                toast.warning(notice);
                onPaySuccess(mockReceipt);
                onOpenChange(false);

                void printReceipt(
                    buildReceipt58({
                        sale: {
                            ...mockReceipt,
                            nomor_transaksi: mockReceipt.uid,
                            created_at: now,
                            user: { name: session?.user?.name || "Kasir Offline" },
                            items: cartList.map((item) => ({
                                nama_produk: item.name,
                                kuantitas: item.qty,
                                harga_satuan: item.price,
                                subtotal: item.price * item.qty,
                            })),
                        },
                        setting: {
                            app_name: getSetting("app_name", "Mitrasova POS"),
                            app_address: getSetting("app_address", "Indonesia"),
                            app_phone: getSetting("app_phone", ""),
                        },
                    })
                );
            } catch (err) {
                const message = err instanceof Error ? err.message : String(err);
                toast.error(`Gagal menyimpan transaksi offline: ${message}`);
            }
        };

        if (isOnline) {
            bulkCheckout.mutate(
                {
                    payload,
                    grandTotal,
                    memberUid: selectedMember?.uid || null,
                },
                {
                    onSuccess: async (res) => {
                        await decrementLocalStock();
                        if (res.data) onPaySuccess(res.data);
                        onOpenChange(false);
                        if (res.data?.uid) {
                            try {
                                const { data } = await axios.get(`/api/proxy/v1/transactions-print/${res.data.uid}`);
                                void printReceipt(buildReceipt58(data));
                            } catch (err) {
                                console.error("Gagal mengambil data struk:", err);
                                toast.error("Gagal mencetak struk.");
                            }
                        }
                    },
                    onError: (err) => {
                        if (err instanceof NetworkError) {
                            void saveOffline("Koneksi terputus saat memproses. Transaksi disimpan secara lokal.");
                            return;
                        }
                        toast.error(err.message || "Transaksi gagal diproses.");
                    },
                }
            );
        } else {
            await saveOffline("Koneksi offline. Transaksi disimpan secara lokal.");
        }
    };

    const handlePaySubmitRef = useRef(handlePaySubmit);
    useEffect(() => {
        handlePaySubmitRef.current = handlePaySubmit;
    });

    // Keyboard shortcut Enter handler
    useEffect(() => {
        if (!open) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Enter" && !e.shiftKey) {
                const target = e.target as HTMLElement | null;
                const isTextArea = target?.tagName === "TEXTAREA";
                if (isTextArea) return;

                if (isSubmitEnabled && !isProcessing) {
                    e.preventDefault();
                    handlePaySubmitRef.current();
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [open, isSubmitEnabled, isProcessing]);

    return {
        methods,
        payMode,
        setPayMode,
        cashNum,
        cardAmountNum,
        totalDp,
        changeValue,
        cardType,
        cardLast4,
        isProcessing,
        isSubmitEnabled,
        handlePaySubmit,
        setValue,
    };
}
