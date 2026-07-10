"use client";

import { formatRupiah } from "@/hooks/use-format-rupiah";
import { cn } from "@/lib/utils";
import { IconScale } from "@tabler/icons-react";

interface BalanceSheetStatusCardProps {
    isBalanced: boolean;
    totalAssets: number;
    totalLiabilitiesAndEquity: number;
    difference: number;
    leftLabel?: string;
    rightLabel?: string;
    leftLegend?: string;
    rightLegend?: string;
}

export function BalanceSheetStatusCard({
    isBalanced,
    totalAssets,
    totalLiabilitiesAndEquity,
    difference,
    leftLabel,
    rightLabel,
    leftLegend,
    rightLegend
}: BalanceSheetStatusCardProps) {
    return (
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">


            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
                {/* Status Message */}
                <div className="flex items-start gap-4">
                    <div className={cn(
                        "p-3.5 rounded-2xl shrink-0 shadow-sm",
                        isBalanced
                            ? "bg-emerald-50 text-emerald-600 ring-4 ring-emerald-50/50"
                            : "bg-rose-50 text-rose-600 ring-4 ring-rose-50/50"
                    )}>
                        <IconScale className="w-7 h-7" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-extrabold text-sm text-slate-800">
                                Status Persamaan Neraca
                            </h3>
                            <span className={cn(
                                "text-[9px] px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider shadow-sm",
                                isBalanced
                                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                    : "bg-rose-100 text-rose-800 border border-rose-200"
                            )}>
                                {isBalanced ? "Seimbang (Balanced)" : "Tidak Seimbang"}
                            </span>
                        </div>
                        <p className="text-slate-500 text-xs mt-2 max-w-xl leading-relaxed">
                            {isBalanced
                                ? "Sempurna! (Aset + Beban) tepat sama dengan (Kewajiban + Ekuitas + Pendapatan). Ini menunjukkan pencatatan keuangan Anda tercatat dengan benar."
                                : "Perhatian! (Aset + Beban) tidak sama dengan (Kewajiban + Ekuitas + Pendapatan). Mohon periksa kembali transaksi atau jurnal penyesuaian Anda."}
                            {!isBalanced && difference > 0 && (
                                <span className="block font-bold text-rose-600 mt-1.5">
                                    Selisih (Discrepancy): {formatRupiah(difference)}
                                </span>
                            )}
                        </p>
                    </div>
                </div>

                {/* Balance Bar & Metrics */}
                <div className="w-full lg:w-[420px] shrink-0 space-y-4">
                    <div className="flex justify-between items-end">
                        <div className="space-y-1">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                                {leftLabel || "Total Aset (A)"}
                            </span>
                            <span className="text-base font-extrabold text-emerald-600">
                                {formatRupiah(totalAssets)}
                            </span>
                        </div>
                        <div className="text-right space-y-1">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                                {rightLabel || "Kewajiban + Ekuitas (K + E)"}
                            </span>
                            <span className={cn(
                                "text-base font-extrabold",
                                isBalanced ? "text-indigo-600" : "text-rose-600"
                            )}>
                                {formatRupiah(totalLiabilitiesAndEquity)}
                            </span>
                        </div>
                    </div>

                    {/* Comparison Progress Bar */}
                    <div className="w-full bg-slate-100 rounded-full h-2.5 relative overflow-hidden">
                        {isBalanced ? (
                            <div className="bg-gradient-to-r from-emerald-500 to-indigo-500 h-full rounded-full w-full animate-pulse" />
                        ) : (
                            <div className="flex h-full rounded-full overflow-hidden w-full">
                                <div
                                    className="bg-emerald-500 h-full transition-all duration-500"
                                    style={{ width: `${(totalAssets / (totalAssets + totalLiabilitiesAndEquity || 1)) * 100}%` }}
                                />
                                <div
                                    className="bg-rose-500 h-full transition-all duration-500"
                                    style={{ width: `${(totalLiabilitiesAndEquity / (totalAssets + totalLiabilitiesAndEquity || 1)) * 100}%` }}
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between items-center text-[9px] font-bold text-slate-400">
                        <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full block" />
                            {leftLegend || "Aset"}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className={cn("w-2 h-2 rounded-full block", isBalanced ? "bg-indigo-500" : "bg-rose-500")} />
                            {rightLegend || "Kewajiban & Ekuitas"}
                        </span>
                    </div>

                    {/* Debit/Credit convention legend */}
                    <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                        Konvensi standar akuntansi: <span className="text-emerald-600 font-semibold">Beban bertambah di sisi Debit</span>,{" "}
                        <span className="text-rose-600 font-semibold">Pendapatan bertambah di sisi Credit</span>. Persamaan neraca:{" "}
                        <span className="text-slate-500 font-semibold">Aset + Beban = Kewajiban + Ekuitas + Pendapatan</span>.
                    </p>
                </div>
            </div>
        </div>
    );
}
