"use client";

import { useState, useEffect } from "react";
import { BaseDialog } from "@/components/ui/base-dialog";
import { Button } from "@/components/ui/button";
import {
    IconCash,
    IconCreditCard,
    IconLoader2,
    IconPrinter,
    IconNotebook,
} from "@tabler/icons-react";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { useBulkCheckout } from "@/features/checkout/api/checkout-api";
import { toast } from "sonner";
import type { Receipt, CartItem } from "@/features/checkout/types";
import type { Member } from "@/features/members/types";
import { db } from "@/lib/db";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { NetworkError } from "@/shared/errors/api-error";

import { useSession } from "next-auth/react";

// Sub-components
import { CashPaymentForm } from "./cash-payment-form";
import { CardPaymentForm } from "./card-payment-form";
import { DebtPaymentForm } from "./debt-payment-form";

interface PaymentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    grandTotal: number;
    cartItems: { product_uid: string; quantity: number }[];
    discount: number;
    tax: number;
    selectedMember: Member | null;
    onPaySuccess: (receipt: Receipt) => void;
    cartList: CartItem[];
    onLocalProductsReload?: () => void;
}

export function PaymentDialog({
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
}: PaymentDialogProps) {
    const bulkCheckout = useBulkCheckout();
    const isOnline = useNetworkStatus();
    const { data: session } = useSession();

    const [payMode, setPayMode] = useState<"cash" | "card" | "debt">("cash");
    const [cashReceived, setCashReceived] = useState("");
    const [cardType, setCardType] = useState("debit");
    const [cardLast4, setCardLast4] = useState("");
    const [cardRef, setCardRef] = useState("");

    useEffect(() => {
        if (open) {
            const timer = setTimeout(() => {
                setPayMode("cash");
                setCashReceived("");
                setCardLast4("");
                setCardRef("");
                setCardType("debit");
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [open]);

    const cashNum = parseFloat(cashReceived) || 0;
    const changeValue = cashNum - grandTotal;
    const isCashValid = cashNum >= grandTotal && grandTotal > 0;
    const isCardValid = cardLast4.length === 4 && grandTotal > 0;
    const isDebtValid = !!selectedMember && cashNum < grandTotal && grandTotal > 0;
    const isProcessing = bulkCheckout.isPending;

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

    const handlePaySubmit = async () => {
        if (cartItems.length === 0) {
            toast.error("Keranjang belanja kosong.");
            return;
        }

        if (payMode === "debt" && !selectedMember) {
            toast.error("Harap pilih member terlebih dahulu untuk pembayaran hutang.");
            return;
        }

        if (payMode === "debt" && cashNum >= grandTotal) {
            toast.error("Uang muka (DP) tidak boleh melebihi atau sama dengan total belanja. Gunakan pembayaran Tunai.");
            return;
        }

        const clientUid = crypto.randomUUID();
        const now = new Date().toISOString();

        const payload: Record<string, unknown> = {
            uid: clientUid,
            payment_method: payMode,
            metode_pembayaran: payMode,
            discount: discount,
            diskon: discount,
            tax: tax,
            pajak: tax,
            paid: payMode === "cash" ? cashNum : (payMode === "debt" ? cashNum : grandTotal),
            nominal_bayar: payMode === "cash" ? cashNum : (payMode === "debt" ? cashNum : grandTotal),
            cashier_name: session?.user?.name || "",
            member_uid: selectedMember?.uid || null,
            items: cartItems.map((item) => ({
                product_id: item.product_uid,
                product_uid: item.product_uid,
                quantity: item.quantity,
            })),
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
            payload.debt_details = {
                cash_received: cashNum,
                debt_amount: grandTotal - cashNum,
            };
        }

        const saveOffline = async (notice: string) => {
            try {
                const offlineReceiptUid = `OFFLINE-${clientUid}`;
                const subtotalVal = cartList.reduce((acc, item) => acc + item.price * item.qty, 0);

                const mockReceipt: Receipt = {
                    uid: offlineReceiptUid,
                    subtotal: subtotalVal,
                    diskon: discount,
                    pajak: tax,
                    total: grandTotal,
                    metode_pembayaran: payMode,
                    nominal_bayar: payMode === "cash" ? cashNum : 0,
                    kembalian: payMode === "cash" ? Math.max(0, changeValue) : 0,
                    cash_received: payMode === "debt" ? cashNum : (payMode === "cash" ? cashNum : 0),
                    debt_amount: payMode === "debt" ? (grandTotal - cashNum) : 0,
                    jenis_kartu: payMode === "card" ? cardType : undefined,
                    nomor_kartu_akhir: payMode === "card" ? cardLast4 : undefined,
                    member: selectedMember,
                    items: cartList.map((item) => ({
                        uid: item.product_uid,
                        nama_produk: item.name,
                        kuantitas: item.qty,
                        harga_satuan: item.price,
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

                    // Decrement local stock
                    await decrementLocalStock();

                    // Update local cash drawer active session & movements if offline
                    const activeSessionId = session?.cashDrawerSessionId;
                    if (activeSessionId) {
                        try {
                            const dbSession = await db.cashDrawerSessions.get(activeSessionId);
                            if (dbSession) {
                                const cashAdded = payMode === "cash" ? grandTotal : (payMode === "debt" ? cashNum : 0);
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
                            const newDebt = (selectedMember.hutang || 0) + (grandTotal - cashNum);
                            await db.members.update(selectedMember.uid, { hutang: newDebt });
                        } catch (debtErr) {
                            console.warn("Gagal memperbarui hutang member lokal:", debtErr);
                        }
                    }
                }

                toast.warning(notice);
                onPaySuccess(mockReceipt);
                onOpenChange(false);
            } catch (err) {
                const message = err instanceof Error ? err.message : String(err);
                toast.error(`Gagal menyimpan transaksi offline: ${message}`);
            }
        };

        if (isOnline) {
            bulkCheckout.mutate(payload, {
                onSuccess: async (res) => {
                    await decrementLocalStock();
                    if (res.data) onPaySuccess(res.data);
                    onOpenChange(false);
                },
                onError: (err) => {
                    if (err instanceof NetworkError) {
                        void saveOffline("Koneksi terputus saat memproses. Transaksi disimpan secara lokal.");
                        return;
                    }
                    toast.error(err.message || "Transaksi gagal diproses.");
                },
            });
        } else {
            await saveOffline("Koneksi offline. Transaksi disimpan secara lokal.");
        }
    };

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={
                <div className="flex items-center gap-2 select-none">
                    <IconCash size={20} className="text-emerald-500" />
                    <span>Metode Pembayaran</span>
                </div>
            }
            className="sm:max-w-2xl"
        >
            <div className="space-y-4 pt-3">
                {/* Mode toggle */}
                <div className="grid grid-cols-3 gap-2">
                    <Button
                        onClick={() => {
                            setPayMode("cash");
                            setCashReceived("");
                        }}
                        className={`h-10 font-bold text-[10px] rounded-xl flex gap-1 cursor-pointer border-none transition-all ${payMode === "cash"
                                ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/10"
                                : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100/70"
                            }`}
                        disabled={isProcessing}
                    >
                        <IconCash size={14} /> TUNAI (CASH)
                    </Button>
                    <Button
                        onClick={() => {
                            setPayMode("card");
                            setCashReceived("");
                        }}
                        className={`h-10 font-bold text-[10px] rounded-xl flex gap-1 cursor-pointer border transition-all ${payMode === "card"
                                ? "bg-slate-700 text-white border-slate-700 shadow-sm shadow-slate-700/10"
                                : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                            }`}
                        disabled={isProcessing}
                    >
                        <IconCreditCard size={14} /> KARTU / EDC
                    </Button>
                    <Button
                        onClick={() => {
                            setPayMode("debt");
                            setCashReceived("");
                        }}
                        className={`h-10 font-bold text-[10px] rounded-xl flex gap-1 cursor-pointer border-none transition-all ${payMode === "debt"
                                ? "bg-rose-600 text-white shadow-sm shadow-rose-600/10"
                                : "bg-rose-50 text-rose-600 hover:bg-rose-100/70"
                            }`}
                        disabled={isProcessing}
                    >
                        <IconNotebook size={14} /> HUTANG
                    </Button>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                    {/* Left Column: Form Fields */}
                    <div className="md:col-span-7">
                        {payMode === "cash" && (
                            <CashPaymentForm
                                cashReceived={cashReceived}
                                setCashReceived={setCashReceived}
                                grandTotal={grandTotal}
                                isProcessing={isProcessing}
                            />
                        )}

                        {payMode === "card" && (
                            <CardPaymentForm
                                cardType={cardType}
                                setCardType={setCardType}
                                cardLast4={cardLast4}
                                setCardLast4={setCardLast4}
                                cardRef={cardRef}
                                setCardRef={setCardRef}
                                isProcessing={isProcessing}
                            />
                        )}

                        {payMode === "debt" && (
                            <DebtPaymentForm
                                selectedMember={selectedMember}
                                cashReceived={cashReceived}
                                setCashReceived={setCashReceived}
                                grandTotal={grandTotal}
                                isProcessing={isProcessing}
                            />
                        )}
                    </div>

                    {/* Right Column: Checkout Summary Card */}
                    <div className="md:col-span-5 bg-slate-50 border border-slate-100 p-4 rounded-xl flex flex-col justify-between space-y-4">
                        <div className="space-y-4">
                            <div className="text-center pb-3 border-b border-slate-200">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    Total Tagihan
                                </span>
                                <h2 className="text-2xl font-extrabold text-slate-950 mt-1 leading-none tabular-nums">
                                    {formatRupiah(grandTotal)}
                                </h2>
                            </div>

                            {payMode === "cash" && (
                                <div className="text-center pt-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        Kembalian
                                    </span>
                                    <h3
                                        className={`text-2xl font-extrabold mt-1 tracking-tight tabular-nums ${changeValue < 0 ? "text-rose-500" : "text-emerald-500"
                                            }`}
                                    >
                                        {changeValue === 0
                                            ? "Rp 0"
                                            : changeValue < 0
                                                ? `Kurang ${formatRupiah(Math.abs(changeValue))}`
                                                : formatRupiah(changeValue)}
                                    </h3>
                                </div>
                            )}

                            {payMode === "card" && (
                                <div className="text-center pt-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        Metode Pembayaran
                                    </span>
                                    <h3 className="text-base font-bold text-slate-700 mt-1">
                                        EDC / {cardType.toUpperCase()}
                                    </h3>
                                    {cardLast4 && (
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            Kartu: **** **** **** {cardLast4}
                                        </p>
                                    )}
                                </div>
                            )}

                            {payMode === "debt" && selectedMember && (
                                <div className="text-center pt-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        Sisa Hutang Baru
                                    </span>
                                    <h3 className="text-2xl font-extrabold text-rose-500 mt-1 tabular-nums">
                                        {formatRupiah(grandTotal - cashNum)}
                                    </h3>
                                </div>
                            )}
                        </div>

                        <Button
                            onClick={handlePaySubmit}
                            disabled={
                                isProcessing ||
                                (payMode === "cash"
                                    ? !isCashValid
                                    : payMode === "card"
                                        ? !isCardValid
                                        : !isDebtValid)
                            }
                            className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-200 disabled:cursor-not-allowed font-bold text-xs text-white rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-600/10 border-none"
                        >
                            {isProcessing ? (
                                <IconLoader2 size={16} className="animate-spin" />
                            ) : (
                                <IconPrinter size={16} />
                            )}
                            <span>
                                {payMode === "debt" ? "SIMPAN & CETAK" : "SELESAI & CETAK"}
                            </span>
                        </Button>
                    </div>
                </div>
            </div>
        </BaseDialog>
    );
}
