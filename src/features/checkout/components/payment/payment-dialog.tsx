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
    IconCheck,
    IconAlertTriangle,
    IconArrowDown,
    IconReceipt,
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
            cardAmount: null as number | null,
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
    const cardAmountVal = useWatch({ control: methods.control, name: "cardAmount" });

    useEffect(() => {
        if (open) {
            const timer = setTimeout(() => {
                setPayMode("cash");
                methods.reset({
                    cashReceived: null,
                    cardAmount: null,
                    cardType: "debit",
                    cardLast4: "",
                    cardRef: "",
                });
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [open, methods]);

    const cashNum = cashReceivedVal || 0;
    const cardAmountNum = cardAmountVal || 0;
    const totalDp = cashNum + cardAmountNum;
    const changeValue = cashNum - grandTotal;
    const isCashValid = cashNum >= grandTotal && grandTotal > 0;
    const isCardValid = grandTotal > 0;
    const isDebtValid = !!selectedMember && grandTotal > 0 && totalDp < grandTotal;
    const isProcessing = bulkCheckout.isPending;

    // Determine if the submit button should be enabled
    const isSubmitEnabled = payMode === "cash"
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

    const handlePaySubmit = async () => {
        if (cartItems.length === 0) {
            toast.error("Keranjang belanja kosong.");
            return;
        }

        if (payMode === "debt" && !selectedMember) {
            toast.error("Harap pilih member terlebih dahulu untuk pembayaran hutang.");
            return;
        }

        const cardAmountNum = methods.getValues("cardAmount") || 0;
        const totalDp = cashNum + cardAmountNum;

        if (payMode === "debt" && totalDp >= grandTotal) {
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
            paid: payMode === "cash" ? cashNum : (payMode === "debt" ? cashNum : grandTotal),
            nominal_bayar: payMode === "cash" ? cashNum : (payMode === "debt" ? cashNum : grandTotal),
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
            payload.card_amount = cardAmountNum;
            if (cardAmountNum > 0) {
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
                card_amount: cardAmountNum,
                debt_amount: grandTotal - totalDp,
                ...(cardAmountNum > 0 && {
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
                    nominal_bayar: payMode === "cash" ? cashNum : (payMode === "debt" ? totalDp : 0),
                    kembalian: payMode === "cash" ? Math.max(0, changeValue) : 0,
                    cash_received: payMode === "debt" ? cashNum : (payMode === "cash" ? cashNum : 0),
                    cash_amount: payMode === "cash" ? cashNum : (payMode === "debt" ? cashNum : 0),
                    card_amount: payMode === "card" ? grandTotal : (payMode === "debt" ? cardAmountNum : 0),
                    debt_amount: payMode === "debt" ? (grandTotal - totalDp) : 0,
                    jenis_kartu: payMode === "card" ? cardType : (payMode === "debt" && cardAmountNum > 0 ? cardType : undefined),
                    nomor_kartu_akhir: payMode === "card" ? cardLast4 : (payMode === "debt" && cardAmountNum > 0 ? cardLast4 : undefined),
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
                            const newDebt = (selectedMember.hutang || 0) + (grandTotal - totalDp);
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

    // Payment mode tab config
    const payModes = [
        {
            key: "cash" as const,
            label: "Tunai",
            icon: IconCash,
            activeColor: "emerald",
        },
        {
            key: "card" as const,
            label: "Kartu / EDC",
            icon: IconCreditCard,
            activeColor: "indigo",
        },
        {
            key: "debt" as const,
            label: "Hutang",
            icon: IconNotebook,
            activeColor: "rose",
        },
    ];

    const getTabClass = (mode: typeof payMode, activeColor: string) => {
        if (payMode === mode) {
            return `bg-${activeColor}-50 border-${activeColor}-500 text-${activeColor}-700 shadow-sm shadow-${activeColor}-500/10`;
        }
        return "bg-white border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50/80 hover:border-slate-300";
    };

    // Summary card change status
    const renderCashSummary = () => {
        const isExact = cashNum === grandTotal && cashNum > 0;
        const isSufficient = cashNum >= grandTotal && cashNum > 0;
        const isInsufficient = cashNum > 0 && cashNum < grandTotal;

        return (
            <div className="space-y-3">
                {/* Dibayar */}
                {cashNum > 0 && (
                    <div className="flex justify-between items-center text-[11px] font-bold animate-in fade-in-0 duration-200">
                        <span className="text-slate-500">Dibayar</span>
                        <span className="text-slate-800 font-mono font-extrabold">{formatRupiah(cashNum)}</span>
                    </div>
                )}

                {/* Kembalian / Status */}
                {cashNum > 0 && (
                    <div
                        className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 animate-in fade-in-0 slide-in-from-bottom-1 ${
                            isExact
                                ? "bg-emerald-50 border border-emerald-200/80"
                                : isSufficient
                                    ? "bg-emerald-50 border border-emerald-200/80"
                                    : "bg-red-50 border border-red-200/80"
                        }`}
                    >
                        {isExact ? (
                            <>
                                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                                    <IconCheck size={13} strokeWidth={3} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-emerald-700 font-extrabold text-[11px]">Uang Pas</p>
                                    <p className="text-emerald-600/70 text-[9px] font-semibold">Tidak ada kembalian</p>
                                </div>
                            </>
                        ) : isSufficient ? (
                            <>
                                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                                    <IconArrowDown size={13} strokeWidth={2.5} className="text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-emerald-600/70 text-[9px] font-semibold">Kembalian</p>
                                    <p className="text-emerald-700 font-mono font-extrabold text-sm leading-none">{formatRupiah(changeValue)}</p>
                                </div>
                            </>
                        ) : isInsufficient ? (
                            <>
                                <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                                    <IconAlertTriangle size={13} strokeWidth={2.5} className="text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-red-500/70 text-[9px] font-semibold">Kurang</p>
                                    <p className="text-red-600 font-mono font-extrabold text-sm leading-none">{formatRupiah(Math.abs(changeValue))}</p>
                                </div>
                            </>
                        ) : null}
                    </div>
                )}
            </div>
        );
    };

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={
                <div className="flex items-center gap-2.5 select-none">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <IconReceipt size={16} className="text-emerald-600" />
                    </div>
                    <div>
                        <span className="text-sm font-extrabold tracking-tight text-slate-800 block leading-tight">Pembayaran</span>
                        <span className="text-[9px] font-bold text-slate-400 leading-none">{cartList.length} item · {formatRupiah(grandTotal)}</span>
                    </div>
                </div>
            }
            className="sm:max-w-3xl"
        >
            <div className="mt-3 animate-in fade-in-50 duration-200">
                <FormProvider {...methods}>
                    {/* Payment Mode Tabs */}
                    <div className="grid grid-cols-3 gap-2.5 mb-5 select-none">
                        {payModes.map((mode) => (
                            <button
                                key={mode.key}
                                type="button"
                                onClick={() => {
                                    setPayMode(mode.key);
                                    setValue("cashReceived", 0);
                                }}
                                className={`h-12 rounded-xl flex items-center justify-center gap-2.5 font-extrabold text-xs cursor-pointer border-2 transition-all duration-200 active:scale-[0.97] ${getTabClass(mode.key, mode.activeColor)}`}
                                disabled={isProcessing}
                            >
                                <mode.icon
                                    size={17}
                                    className={
                                        payMode === mode.key
                                            ? `text-${mode.activeColor}-600`
                                            : "text-slate-400"
                                    }
                                />
                                <span>{mode.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Main Content Split Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
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

                        {/* Right: Summary Card */}
                        <div className="md:col-span-5 bg-gradient-to-b from-slate-50 to-slate-100/30 border border-slate-200/60 p-5 rounded-2xl flex flex-col justify-between space-y-4 select-none relative overflow-hidden">
                            {/* Subtle decorative accent */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 rounded-t-2xl" />

                            <div className="space-y-4 flex-1">
                                {/* Grand Total */}
                                <div className="text-center pb-4 border-b border-dashed border-slate-200/80">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                                        Total Tagihan
                                    </span>
                                    <h2 className="text-3xl font-black text-slate-900 mt-1.5 leading-none tabular-nums tracking-tight font-mono">
                                        {formatRupiah(grandTotal)}
                                    </h2>
                                </div>

                                {/* Mini Breakdown */}
                                {(discount > 0 || tax > 0) && (
                                    <div className="space-y-2 text-[11px] text-slate-500 font-bold px-1 pb-3 border-b border-slate-200/60">
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

                                {/* Cash Mode Summary */}
                                {payMode === "cash" && renderCashSummary()}

                                {/* Card Mode Summary */}
                                {payMode === "card" && (
                                    <div className="text-center pt-1 space-y-2">
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

                                {/* Debt Mode Summary */}
                                {payMode === "debt" && selectedMember && (
                                    <div className="space-y-3">
                                        <div className="text-center">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                                                Member
                                            </span>
                                            <p className="text-xs font-extrabold text-slate-800 mt-1">{selectedMember.nama}</p>
                                        </div>
                                        <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-rose-50 border border-rose-200/80 animate-in fade-in-0 duration-200">
                                            <div className="w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center flex-shrink-0">
                                                <IconNotebook size={13} strokeWidth={2.5} className="text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-rose-500/70 text-[9px] font-semibold">Sisa Hutang Baru</p>
                                                <p className="text-rose-700 font-mono font-extrabold text-sm leading-none">{formatRupiah(grandTotal - totalDp)}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Submit Button */}
                            <Button
                                onClick={handlePaySubmit}
                                disabled={isProcessing || !isSubmitEnabled}
                                className={`w-full h-12 font-extrabold text-xs text-white rounded-xl flex items-center justify-center gap-2.5 cursor-pointer transition-all duration-200 active:scale-[0.98] border-none ${
                                    isProcessing || !isSubmitEnabled
                                        ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                                        : payMode === "debt"
                                            ? "bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-lg shadow-rose-500/20 hover:shadow-xl hover:shadow-rose-500/30"
                                            : "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30"
                                }`}
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
