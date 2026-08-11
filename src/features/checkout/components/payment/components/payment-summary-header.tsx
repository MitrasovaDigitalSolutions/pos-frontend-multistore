import React from "react";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import {
    IconPrinter,
    IconLoader2,
    IconCheck,
    IconArrowDown,
    IconAlertTriangle,
    IconNotebook,
} from "@tabler/icons-react";
import type { Member } from "@/features/master/members/types";
import type { PaymentMode } from "../types/payment-dialog.types";

interface PaymentSummaryHeaderProps {
    grandTotal: number;
    discount: number;
    tax: number;
    payMode: PaymentMode;
    cashNum: number;
    changeValue: number;
    cardType: string;
    cardLast4: string;
    selectedMember: Member | null;
    totalDp: number;
    isSubmitEnabled: boolean;
    isProcessing: boolean;
    onSubmit: () => void;
}

export function PaymentSummaryHeader({
    grandTotal,
    discount,
    tax,
    payMode,
    cashNum,
    changeValue,
    cardType,
    cardLast4,
    selectedMember,
    totalDp,
    isSubmitEnabled,
    isProcessing,
    onSubmit,
}: PaymentSummaryHeaderProps) {
    const renderCashSummary = () => {
        const isExact = cashNum === grandTotal && cashNum > 0;
        const isSufficient = cashNum >= grandTotal && cashNum > 0;
        const isInsufficient = cashNum > 0 && cashNum < grandTotal;

        return (
            <div className="space-y-3">
                {cashNum > 0 && (
                    <div className="flex justify-between items-center text-[11px] font-bold animate-in fade-in-0 duration-200">
                        <span className="text-slate-400">Dibayar</span>
                        <span className="text-slate-100 font-mono font-extrabold">{formatRupiah(cashNum)}</span>
                    </div>
                )}

                {cashNum > 0 && (
                    <div
                        className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 animate-in fade-in-0 slide-in-from-bottom-1 ${isExact
                            ? "bg-emerald-950/80 border border-emerald-600/80"
                            : isSufficient
                                ? "bg-emerald-950/80 border border-emerald-600/80"
                                : "bg-red-950/80 border border-red-800/80"
                            }`}
                    >
                        {isExact ? (
                            <>
                                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                                    <IconCheck size={13} strokeWidth={3} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-emerald-300 font-extrabold text-[11px]">Uang Pas</p>
                                    <p className="text-emerald-400/70 text-[9px] font-semibold">Tidak ada kembalian</p>
                                </div>
                            </>
                        ) : isSufficient ? (
                            <>
                                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                                    <IconArrowDown size={13} strokeWidth={2.5} className="text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-emerald-400/70 text-[9px] font-semibold">Kembalian</p>
                                    <p className="text-emerald-300 font-mono font-extrabold text-sm leading-none">{formatRupiah(changeValue)}</p>
                                </div>
                            </>
                        ) : isInsufficient ? (
                            <>
                                <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                                    <IconAlertTriangle size={13} strokeWidth={2.5} className="text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-red-400/70 text-[9px] font-semibold">Kurang</p>
                                    <p className="text-red-300 font-mono font-extrabold text-sm leading-none">{formatRupiah(Math.abs(changeValue))}</p>
                                </div>
                            </>
                        ) : null}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="bg-slate-900 text-white border border-slate-800 p-5 rounded-2xl flex flex-col justify-between space-y-4 select-none relative overflow-hidden shadow-xl">
            {/* Subtle decorative accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 rounded-t-2xl" />

            <div className="space-y-4 flex-1">
                {/* Grand Total Hero Card */}
                <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 rounded-xl p-4 text-center shadow-lg shadow-emerald-900/40 relative overflow-hidden border border-emerald-400/30">
                    <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full blur-lg pointer-events-none" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-100 flex items-center justify-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-200 animate-pulse" />
                        TOTAL TRANSAKSI
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-black text-white mt-1.5 leading-none tabular-nums tracking-tight font-mono drop-shadow-md">
                        {formatRupiah(grandTotal)}
                    </h2>
                </div>

                {/* Mini Breakdown */}
                {(discount > 0 || tax > 0) && (
                    <div className="space-y-2 text-[11px] text-slate-300 font-bold px-1 pb-3 border-b border-slate-800">
                        {discount > 0 && (
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400">Diskon</span>
                                <span className="text-rose-400 font-extrabold font-mono">-{formatRupiah(discount)}</span>
                            </div>
                        )}
                        {tax > 0 && (
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400">Pajak (PPN)</span>
                                <span className="text-emerald-400 font-extrabold font-mono">{formatRupiah(tax)}</span>
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
                        <h3 className="text-xs font-black text-indigo-400 uppercase tracking-wider">
                            EDC / {cardType.toUpperCase()}
                        </h3>
                        {cardLast4 && (
                            <p className="inline-block bg-indigo-950/80 text-indigo-300 px-2.5 py-0.5 rounded-md text-[9px] font-mono font-bold border border-indigo-800/60">
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
                            <p className="text-xs font-extrabold text-slate-200 mt-1">{selectedMember.nama}</p>
                        </div>
                        <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-rose-950/60 border border-rose-800/80 animate-in fade-in-0 duration-200">
                            <div className="w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center flex-shrink-0">
                                <IconNotebook size={13} strokeWidth={2.5} className="text-white" />
                            </div>
                            <div className="flex-1">
                                <p className="text-rose-300 text-[9px] font-semibold">Sisa Hutang Baru</p>
                                <p className="text-rose-400 font-mono font-extrabold text-sm leading-none">{formatRupiah(grandTotal - totalDp)}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Submit Button */}
            <Button
                onClick={onSubmit}
                disabled={isProcessing || !isSubmitEnabled}
                className={`w-full h-12 font-extrabold text-xs text-white rounded-xl flex items-center justify-center gap-2.5 cursor-pointer transition-all duration-200 active:scale-[0.98] border-none ${isProcessing || !isSubmitEnabled
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed shadow-none border border-slate-700"
                    : payMode === "debt"
                        ? "bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-lg shadow-rose-500/30 hover:shadow-xl hover:shadow-rose-500/40"
                        : "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40"
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
    );
}
