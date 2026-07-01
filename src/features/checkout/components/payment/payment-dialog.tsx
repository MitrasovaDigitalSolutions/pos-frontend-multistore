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
import { toUTC7String } from "@/lib/date-utils";

import { useSession } from "next-auth/react";
import { useForm, FormProvider, useWatch } from "react-hook-form";

// Sub-components
import { CashPaymentForm } from "./cash-payment-form";
import { CardPaymentForm } from "./card-payment-form";
import { DebtPaymentForm } from "./debt-payment-form";

interface PaymentDialogProps {
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
    namaTransaksi,
}: PaymentDialogProps) {
    const bulkCheckout = useBulkCheckout();
    const isOnline = useNetworkStatus();
    const { data: session } = useSession();

    const [payMode, setPayMode] = useState<"cash" | "card" | "debt">("cash");

    const methods = useForm({
        defaultValues: {
            cashReceived: null as number | null,
            cardType: "debit",
            cardLast4: "",
            cardRef: "",
        }
    });

    const { setValue } = methods;

    const cardType = useWatch({ control: methods.control, name: "cardType" });
    const cardLast4 = useWatch({ control: methods.control, name: "cardLast4" });
    const cardRef = useWatch({ control: methods.control, name: "cardRef" });
    const cashReceivedVal = useWatch({ control: methods.control, name: "cashReceived" });

    useEffect(() => {
        if (open) {
            const timer = setTimeout(() => {
                setPayMode("cash");
                methods.reset({
                    cashReceived: null,
                    cardType: "debit",
                    cardLast4: "",
                    cardRef: "",
                });
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [open, methods]);

    const cashNum = cashReceivedVal || 0;
    const changeValue = cashNum - grandTotal;
    const isCashValid = cashNum >= grandTotal && grandTotal > 0;
    const isCardValid = grandTotal > 0;
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
                    nama_transaksi: namaTransaksi || undefined,
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

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={
                <div className="flex items-center gap-2 select-none">
                    <IconCash size={20} className="text-emerald-600" />
                    <span className="text-sm font-extrabold tracking-tight text-slate-800">Metode Pembayaran</span>
                </div>
            }
            className="sm:max-w-3xl"
        >
            <div className="mt-2 animate-in fade-in-50 duration-200">
                <FormProvider {...methods}>
                    {/* Top Segmented Tabs */}
                    <div className="grid grid-cols-3 gap-3 mb-6 select-none">
                        <button
                            type="button"
                            onClick={() => {
                                setPayMode("cash");
                                setValue("cashReceived", 0);
                            }}
                            className={`h-14 rounded-xl flex items-center justify-center gap-3 font-extrabold text-xs cursor-pointer border-2 transition-all duration-200 ${
                                payMode === "cash"
                                    ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm shadow-emerald-500/5"
                                    : "bg-white border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50/50"
                            }`}
                            disabled={isProcessing}
                        >
                            <IconCash size={18} className={payMode === "cash" ? "text-emerald-600" : "text-slate-400"} />
                            <span>Tunai (Cash)</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setPayMode("card");
                                setValue("cashReceived", 0);
                            }}
                            className={`h-14 rounded-xl flex items-center justify-center gap-3 font-extrabold text-xs cursor-pointer border-2 transition-all duration-200 ${
                                payMode === "card"
                                    ? "bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm shadow-indigo-500/5"
                                    : "bg-white border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50/50"
                            }`}
                            disabled={isProcessing}
                        >
                            <IconCreditCard size={18} className={payMode === "card" ? "text-indigo-600" : "text-slate-400"} />
                            <span>Kartu / EDC</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setPayMode("debt");
                                setValue("cashReceived", 0);
                            }}
                            className={`h-14 rounded-xl flex items-center justify-center gap-3 font-extrabold text-xs cursor-pointer border-2 transition-all duration-200 ${
                                payMode === "debt"
                                    ? "bg-rose-50 border-rose-500 text-rose-700 shadow-sm shadow-rose-500/5"
                                    : "bg-white border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50/50"
                            }`}
                            disabled={isProcessing}
                        >
                            <IconNotebook size={18} className={payMode === "debt" ? "text-rose-600" : "text-slate-400"} />
                            <span>Hutang</span>
                        </button>
                    </div>

                    {/* Bottom Split Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                        {/* Left: Input Form Area */}
                        <div className="md:col-span-7 space-y-4">
                            {payMode === "cash" && (
                                <CashPaymentForm
                                    grandTotal={grandTotal}
                                    isProcessing={isProcessing}
                                />
                            )}

                            {payMode === "card" && (
                                <CardPaymentForm
                                    isProcessing={isProcessing}
                                />
                            )}

                            {payMode === "debt" && (
                                <DebtPaymentForm
                                    selectedMember={selectedMember}
                                    grandTotal={grandTotal}
                                    isProcessing={isProcessing}
                                />
                            )}
                        </div>

                        {/* Right: Premium Summary Invoice Card */}
                        <div className="md:col-span-5 bg-slate-50 border border-slate-200/60 p-5 rounded-2xl flex flex-col justify-between space-y-5 select-none relative overflow-hidden">
                            <div className="space-y-4 flex-1">
                                <div className="text-center pb-4 border-b border-dashed border-slate-200">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                                        Total Tagihan
                                    </span>
                                    <h2 className="text-2xl font-black text-slate-900 mt-1 leading-none tabular-nums tracking-tight font-mono">
                                        {formatRupiah(grandTotal)}
                                    </h2>
                                </div>

                                {/* Mini Breakdown */}
                                {(discount > 0 || tax > 0) && (
                                    <div className="space-y-2 text-[10px] text-slate-550 font-bold px-1 pb-3 border-b border-slate-200/60">
                                        {discount > 0 && (
                                            <div className="flex justify-between items-center">
                                                <span>Diskon</span>
                                                <span className="text-rose-600 font-extrabold font-mono">-{formatRupiah(discount)}</span>
                                            </div>
                                        )}
                                        {tax > 0 && (
                                            <div className="flex justify-between items-center">
                                                <span>Pajak (PPN)</span>
                                                <span className="text-slate-800 font-extrabold font-mono">{formatRupiah(tax)}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {payMode === "cash" && (
                                    <div className="text-center pt-1">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                                            Kembalian
                                        </span>
                                        <h3
                                            className={`text-xl font-black mt-1.5 tracking-tight tabular-nums font-mono ${
                                                changeValue < 0 ? "text-rose-600" : "text-emerald-600"
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
                                    <div className="text-center pt-1 space-y-1.5">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                                            Metode Pembayaran
                                        </span>
                                        <h3 className="text-xs font-black text-indigo-750 uppercase tracking-wider">
                                            EDC / {cardType.toUpperCase()}
                                        </h3>
                                        {cardLast4 && (
                                            <p className="inline-block bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-md text-[9px] font-mono font-bold border border-indigo-100/60">
                                                Kartu: **** {cardLast4}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {payMode === "debt" && selectedMember && (
                                    <div className="text-center pt-1">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                                            Sisa Hutang Baru
                                        </span>
                                        <h3 className="text-xl font-black text-rose-600 mt-1.5 tabular-nums font-mono">
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
                                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-450 disabled:border-transparent disabled:cursor-not-allowed font-extrabold text-xs text-white rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg active:scale-[0.98] transition-all border-none"
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
                </FormProvider>
            </div>
        </BaseDialog>
    );
}
