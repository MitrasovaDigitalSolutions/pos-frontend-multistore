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
} from "@tabler/icons-react";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { useBulkCheckout } from "../api/checkout-api";
import { toast } from "sonner";
import type { Receipt } from "../types";

interface PaymentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    grandTotal: number;
    cartItems: { product_id: number; quantity: number }[];
    discount: number;
    tax: number;
    onPaySuccess: (receipt: Receipt) => void;
}

export function PaymentDialog({
    open,
    onOpenChange,
    grandTotal,
    cartItems,
    discount,
    tax,
    onPaySuccess,
}: PaymentDialogProps) {
    const bulkCheckout = useBulkCheckout();

    const [payMode, setPayMode] = useState<"cash" | "card">("cash");
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
    const isProcessing = bulkCheckout.isPending;

    const handlePaySubmit = () => {
        if (cartItems.length === 0) {
            toast.error("Keranjang belanja kosong.");
            return;
        }

        const payload: any = {
            metode_pembayaran: payMode,
            items: cartItems,
            diskon: discount,
            pajak: tax,
        };

        if (payMode === "cash") {
            payload.cash_received = cashNum;
        } else {
            payload.card_type = cardType;
            payload.last_four = cardLast4;
            payload.reference_number = cardRef || `EDC-${Date.now()}`;
        }

        bulkCheckout.mutate(payload, {
            onSuccess: (res) => {
                if (res.data) onPaySuccess(res.data);
                onOpenChange(false);
            },
            onError: (err) => {
                toast.error(err.message || "Transaksi gagal diproses.");
            },
        });
    };

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={
                <>
                    <IconCash size={20} className="text-emerald-500" />
                    <span>Metode Pembayaran</span>
                </>
            }
            className="max-w-125"
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
                <div className="grid grid-cols-2 gap-3">
                    <Button
                        onClick={() => setPayMode("cash")}
                        className={`h-11 font-bold text-xs rounded-xl flex gap-1.5 cursor-pointer border-none ${
                            payMode === "cash"
                                ? "bg-emerald-600 text-white"
                                : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                        }`}
                        disabled={isProcessing}
                    >
                        <IconCash size={16} /> TUNAI (CASH)
                    </Button>
                    <Button
                        onClick={() => setPayMode("card")}
                        className={`h-11 font-bold text-xs rounded-xl flex gap-1.5 cursor-pointer border ${
                            payMode === "card"
                                ? "bg-slate-700 text-white border-slate-700"
                                : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                        }`}
                        disabled={isProcessing}
                    >
                        <IconCreditCard size={16} /> KARTU / EDC
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
                                className={`text-3xl font-extrabold mt-1 tracking-tight tabular-nums ${
                                    changeValue < 0 ? "text-rose-500" : "text-emerald-500"
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

                <Button
                    onClick={handlePaySubmit}
                    disabled={
                        isProcessing ||
                        (payMode === "cash" ? !isCashValid : !isCardValid)
                    }
                    className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-200 disabled:cursor-not-allowed font-bold text-sm text-white rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-600/10 border-none"
                >
                    {isProcessing ? (
                        <IconLoader2 size={18} className="animate-spin" />
                    ) : (
                        <IconPrinter size={18} />
                    )}
                    <span>SELESAI &amp; CETAK STRUK</span>
                </Button>
            </div>
        </BaseDialog>
    );
}
