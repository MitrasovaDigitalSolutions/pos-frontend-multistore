"use client";

import { useState, useEffect } from "react";
import { BaseDialog } from "@/components/ui/base-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CommandSelect } from "@/components/ui/command-select";
import {
    IconCash,
    IconCreditCard,
    IconLoader2,
    IconPrinter,
    IconNotebook,
} from "@tabler/icons-react";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { useBulkCheckout } from "../api/checkout-api";
import { toast } from "sonner";
import type { Receipt, CartItem } from "../types";
import type { Member } from "@/features/members/types";
import { db } from "@/lib/db";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { NetworkError } from "@/shared/errors/api-error";

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

        // Generate client-side transaction UID
        const clientUid = crypto.randomUUID();
        const now = new Date().toISOString();

        const payload: Record<string, unknown> = {
            uid: clientUid,
            metode_pembayaran: payMode,
            items: cartItems,
            diskon: discount,
            pajak: tax,
            member_uid: selectedMember?.uid || null,
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

        // Persist the transaction locally (offline path). Used both when the app
        // already knows it is offline AND as a fallback when an online checkout
        // fails due to a network error (connection dropped at submit time).
        const saveOffline = async (notice: string) => {
            try {
                // Build mock receipt — uid uses OFFLINE- prefix for easy identification
                const offlineReceiptUid = `OFFLINE-${clientUid}`;

                const mockReceipt: Receipt = {
                    uid: offlineReceiptUid,
                    subtotal: grandTotal - tax,
                    pajak: tax,
                    total: grandTotal,
                    metode_pembayaran: payMode,
                    // FIX: nominal_bayar & cash_received correctly set for each mode
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

                // Guard against duplicates if this UID was already queued.
                const existing = await db.offlineQueue.where("uid").equals(clientUid).count();
                if (existing === 0) {
                    // Save to offlineQueue (for future sync to server)
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

                    // Save to offlineTransactions (permanent history for monitoring)
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

                    // Deduct stock quantities locally inside IndexedDB products table
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

                    // Reload local products so the updated stock is reflected in the UI
                    onLocalProductsReload?.();

                    // Update member debt locally in IndexedDB if debt transaction
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
                onSuccess: (res) => {
                    if (res.data) onPaySuccess(res.data);
                    onOpenChange(false);
                },
                onError: (err) => {
                    // If the failure is a connectivity problem (backend unreachable),
                    // fall back to saving the transaction offline instead of losing it.
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
                <div className="flex items-center gap-2">
                    <IconCash size={20} className="text-emerald-500" />
                    <span>Metode Pembayaran</span>
                </div>
            }
            className="max-w-135"
        >
            <div className="space-y-5 pt-4">
                {/* Grand total display */}
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Total Tagihan
                    </span>
                    <h2 className="text-3xl font-extrabold text-slate-950 mt-1 leading-none tabular-nums">
                        {formatRupiah(grandTotal)}
                    </h2>
                </div>

                {/* Mode toggle */}
                <div className="grid grid-cols-3 gap-2">
                    <Button
                        onClick={() => {
                            setPayMode("cash");
                            setCashReceived("");
                        }}
                        className={`h-11 font-bold text-[10px] rounded-xl flex gap-1 cursor-pointer border-none ${payMode === "cash"
                            ? "bg-emerald-600 text-white"
                            : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
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
                        className={`h-11 font-bold text-[10px] rounded-xl flex gap-1 cursor-pointer border ${payMode === "card"
                            ? "bg-slate-700 text-white border-slate-700"
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
                        className={`h-11 font-bold text-[10px] rounded-xl flex gap-1 cursor-pointer border-none ${payMode === "debt"
                            ? "bg-rose-600 text-white"
                            : "bg-rose-50 text-rose-600 hover:bg-rose-100"
                            }`}
                        disabled={isProcessing}
                    >
                        <IconNotebook size={14} /> HUTANG
                    </Button>
                </div>

                {/* Cash fields */}
                {payMode === "cash" && (
                    <>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                Nominal Uang Diterima
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg select-none">
                                    Rp
                                </span>
                                <Input
                                    type="text"
                                    placeholder="0"
                                    className="h-14 pl-12 pr-4 text-2xl font-extrabold text-slate-950 bg-white border-2 border-emerald-500 focus-visible:ring-emerald-600 rounded-xl"
                                    value={
                                        cashReceived
                                            ? new Intl.NumberFormat("id-ID").format(Number(cashReceived))
                                            : ""
                                    }
                                    onChange={(e) => {
                                        const clean = e.target.value.replace(/\D/g, "");
                                        setCashReceived(clean);
                                    }}
                                    disabled={isProcessing}
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {[10000, 20000, 50000, 100000, 200000].map((val) => (
                                <button
                                    key={val}
                                    onClick={() => setCashReceived(val.toString())}
                                    className="bg-slate-50 hover:bg-emerald-50 hover:border-emerald-400 border border-slate-200 text-slate-800 py-2.5 text-xs font-bold rounded-xl transition-all tabular-nums cursor-pointer"
                                    disabled={isProcessing}
                                >
                                    {val.toLocaleString("id-ID")}
                                </button>
                            ))}
                            <button
                                onClick={() => setCashReceived(grandTotal.toString())}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer border-none"
                                disabled={isProcessing}
                            >
                                Uang Pas
                            </button>
                        </div>
                        <div className="border-t border-dashed border-slate-200 pt-4 text-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Kembalian
                            </span>
                            <h2
                                className={`text-3xl font-extrabold mt-1 tracking-tight tabular-nums ${changeValue < 0 ? "text-rose-500" : "text-emerald-500"
                                    }`}
                            >
                                {changeValue === 0
                                    ? "Rp 0"
                                    : changeValue < 0
                                        ? `Kurang ${formatRupiah(Math.abs(changeValue))}`
                                        : formatRupiah(changeValue)}
                            </h2>
                        </div>
                    </>
                )}

                {/* Card fields */}
                {payMode === "card" && (
                    <div className="space-y-3">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                Jenis Kartu
                            </label>
                            <CommandSelect
                                options={[
                                    { value: "debit", label: "Debit" },
                                    { value: "credit", label: "Kredit" },
                                ]}
                                value={cardType}
                                onChange={(val) => setCardType(val)}
                                disabled={isProcessing}
                                className="h-10"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                4 Digit Terakhir Kartu
                            </label>
                            <Input
                                type="text"
                                maxLength={4}
                                placeholder="XXXX"
                                className="h-10 border-slate-200 focus-visible:ring-emerald-600 rounded-xl tracking-[0.5rem] text-center font-mono text-lg"
                                value={cardLast4}
                                onChange={(e) =>
                                    setCardLast4(e.target.value.replace(/\D/g, "").slice(0, 4))
                                }
                                disabled={isProcessing}
                                autoFocus
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                No. Referensi EDC (Opsional)
                            </label>
                            <Input
                                type="text"
                                placeholder="Nomor referensi EDC..."
                                className="h-10 text-xs border-slate-200 focus-visible:ring-emerald-600 rounded-xl"
                                value={cardRef}
                                onChange={(e) => setCardRef(e.target.value)}
                                disabled={isProcessing}
                            />
                        </div>
                    </div>
                )}

                {/* Debt fields */}
                {payMode === "debt" && (
                    <div className="space-y-4">
                        {!selectedMember ? (
                            <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl text-center">
                                <p className="text-xs font-bold text-rose-800">Member Belum Dipilih</p>
                                <p className="text-[10px] text-rose-500 mt-1">
                                    Metode pembayaran hutang hanya tersedia untuk member terdaftar. Silakan pilih member terlebih dahulu di layar kasir.
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Selected Member Info Card */}
                                <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl flex items-center justify-between text-xs">
                                    <div>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Member</span>
                                        <h4 className="font-bold text-slate-800 mt-0.5">{selectedMember.nama}</h4>
                                        <span className="text-[10px] text-slate-500">{selectedMember.kode}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Hutang Aktif</span>
                                        <h4 className="font-bold text-rose-600 mt-0.5">{formatRupiah(selectedMember.hutang || 0)}</h4>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                        Uang Muka / DP (Tunai) - Opsional
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg select-none">
                                            Rp
                                        </span>
                                        <Input
                                            type="text"
                                            placeholder="0"
                                            className="h-14 pl-12 pr-4 text-2xl font-extrabold text-slate-950 bg-white border-2 border-emerald-500 focus-visible:ring-emerald-600 rounded-xl"
                                            value={
                                                cashReceived
                                                    ? new Intl.NumberFormat("id-ID").format(Number(cashReceived))
                                                    : ""
                                            }
                                            onChange={(e) => {
                                                const clean = e.target.value.replace(/\D/g, "");
                                                if (Number(clean) >= grandTotal) {
                                                    toast.warning("Uang muka harus kurang dari total tagihan.");
                                                    return;
                                                }
                                                setCashReceived(clean);
                                            }}
                                            disabled={isProcessing}
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <div className="border-t border-dashed border-slate-200 pt-3.5 text-center">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        Sisa Hutang Baru Yang Dicatat
                                    </span>
                                    <h2 className="text-3xl font-extrabold mt-1 tracking-tight tabular-nums text-rose-500">
                                        {formatRupiah(grandTotal - cashNum)}
                                    </h2>
                                </div>
                            </>
                        )}
                    </div>
                )}

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
                    className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-200 disabled:cursor-not-allowed font-bold text-sm text-white rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-600/10 border-none"
                >
                    {isProcessing ? (
                        <IconLoader2 size={18} className="animate-spin" />
                    ) : (
                        <IconPrinter size={18} />
                    )}
                    <span>
                        {payMode === "debt" ? "SIMPAN HUTANG & CETAK STRUK" : "SELESAI & CETAK STRUK"}
                    </span>
                </Button>
            </div>
        </BaseDialog>
    );
}
