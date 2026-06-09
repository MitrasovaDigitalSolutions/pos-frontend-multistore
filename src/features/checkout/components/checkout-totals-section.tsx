"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { toast } from "sonner";
import {
    IconPlayerPause,
    IconPlayerPlay,
    IconTrash,
    IconPrinter,
    IconLoader2,
    IconCash,
} from "@tabler/icons-react";

interface CheckoutTotalsSectionProps {
    transactionId: number | null;
    cashierName: string;
    trxTime: string;
    subtotal: number;
    ppn: number;
    grandTotal: number;
    cartLength: number;
    isProcessing: boolean;
    onHold: () => void;
    onRecallOpen: () => void;
    onVoid: () => void;
    onPayOpen: () => void;
}

export function CheckoutTotalsSection({
    transactionId,
    cashierName,
    trxTime,
    subtotal,
    ppn,
    grandTotal,
    cartLength,
    isProcessing,
    onHold,
    onRecallOpen,
    onVoid,
    onPayOpen,
}: CheckoutTotalsSectionProps) {
    return (
        <div className="bg-emerald-50/30 p-6 flex flex-col justify-between h-full">
            <div>
                {/* Trx Info */}
                <div className="bg-white border border-slate-100 rounded-xl p-4 space-y-2.5 shadow-sm mb-4">
                    <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                        <span>No. Transaksi</span>
                        <span className="text-slate-800 font-bold">
                            {transactionId ? `TRX-${transactionId}` : "Belum mulai"}
                        </span>
                    </div>
                    <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                        <span>Kasir Aktif</span>
                        <span className="text-slate-800 font-bold">
                            {cashierName}
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
                        onClick={onHold}
                        disabled={cartLength === 0 || isProcessing}
                        className="bg-white hover:bg-slate-50 border-slate-200 text-slate-700 h-10 font-bold text-xs rounded-xl flex gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                        <IconPlayerPause size={16} /> Hold (F5)
                    </Button>
                    <Button
                        variant="outline"
                        onClick={onRecallOpen}
                        className="bg-white hover:bg-slate-50 border-slate-200 text-slate-700 h-10 font-bold text-xs rounded-xl flex gap-1.5 cursor-pointer"
                    >
                        <IconPlayerPlay size={16} /> Recall (F6)
                    </Button>
                    <Button
                        variant="outline"
                        onClick={onVoid}
                        disabled={cartLength === 0 || isProcessing}
                        className="bg-white hover:bg-rose-50 border-slate-200 hover:border-rose-200 text-rose-600 h-10 font-bold text-xs rounded-xl flex gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                        <IconTrash size={16} /> Void (F10)
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => toast.success("Mencetak ulang struk terakhir...")}
                        className="bg-white hover:bg-slate-50 border-slate-200 text-slate-700 h-10 font-bold text-xs rounded-xl flex gap-1.5 cursor-pointer"
                    >
                        <IconPrinter size={16} /> Re-print (F4)
                    </Button>
                </div>

                <Button
                    onClick={onPayOpen}
                    disabled={cartLength === 0 || isProcessing}
                    className="w-full h-16 bg-emerald-600 hover:bg-emerald-700 font-extrabold text-base rounded-xl flex items-center justify-center gap-3 cursor-pointer shadow-lg shadow-emerald-600/10 transition-all active:scale-[0.99] disabled:opacity-50 border-none text-white"
                >
                    {isProcessing ? (
                        <IconLoader2 size={24} className="animate-spin" />
                    ) : (
                        <IconCash size={24} />
                    )}
                    <span>PROSES BAYAR (F1)</span>
                </Button>
            </div>
        </div>
    );
}
