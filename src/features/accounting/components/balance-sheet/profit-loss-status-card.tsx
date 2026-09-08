"use client";

import { useMemo } from "react";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { cn } from "@/lib/utils";
import {
    IconTrendingUp,
    IconTrendingDown,
    IconCoin,
    IconReceipt2,
} from "@tabler/icons-react";

interface ProfitLossStatusCardProps {
    totalRevenue: number;
    totalExpense: number;
    netIncome?: number;
    title?: string;
    description?: string;
}

export function ProfitLossStatusCard({
    totalRevenue,
    totalExpense,
    netIncome: customNetIncome,
    title,
    description,
}: ProfitLossStatusCardProps) {
    const netIncome = customNetIncome !== undefined ? customNetIncome : totalRevenue - totalExpense;
    const isProfit = netIncome >= 0;

    const profitMargin = useMemo(() => {
        if (totalRevenue <= 0) return 0;
        return (netIncome / totalRevenue) * 100;
    }, [netIncome, totalRevenue]);

    const formattedMargin = useMemo(() => {
        const absMargin = Math.abs(profitMargin);
        if (absMargin > 0 && absMargin < 0.1) return "< 0.1%";
        return `${absMargin.toFixed(absMargin % 1 === 0 ? 0 : 1)}%`;
    }, [profitMargin]);

    const displayTitle =
        title || (isProfit ? "Laba Bersih Operasional (Surplus)" : "Defisit Operasional (Rugi)");
    const displayDescription =
        description ||
        (isProfit
            ? "Pendapatan usaha melampaui seluruh beban operasional dan HPP."
            : "Beban usaha dan pengeluaran melebihi total pendapatan yang diperoleh.");

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-2.5 sm:p-3 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
                {/* Left: Status Indicator & Info */}
                <div className="flex items-center gap-2 min-w-0">
                    <div
                        className={cn(
                            "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-xs",
                            isProfit
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                                : "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400"
                        )}
                    >
                        {isProfit ? (
                            <IconTrendingUp className="w-4 h-4" />
                        ) : (
                            <IconTrendingDown className="w-4 h-4 animate-pulse" />
                        )}
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-extrabold text-xs text-slate-800 dark:text-slate-100">
                                {displayTitle}
                            </span>
                            <span
                                className={cn(
                                    "text-[9px] px-1.5 py-0.2 rounded-md font-extrabold uppercase tracking-wider border",
                                    isProfit
                                        ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40"
                                        : "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/40"
                                )}
                            >
                                {isProfit ? `Laba: ${formatRupiah(netIncome)}` : `Rugi: ${formatRupiah(Math.abs(netIncome))}`}
                            </span>
                            {totalRevenue > 0 && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded-md font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                    Margin: {isProfit ? "+" : "-"}{formattedMargin}
                                </span>
                            )}
                        </div>
                        <p className="text-slate-400 dark:text-slate-500 text-[11px] leading-tight mt-0.5 truncate">
                            {displayDescription}
                        </p>
                    </div>
                </div>

                {/* Right: Metrics Comparison */}
                <div className="flex items-center gap-3 sm:gap-4 justify-between lg:justify-end shrink-0 border-t lg:border-t-0 pt-1.5 lg:pt-0 border-slate-100 dark:border-slate-800">
                    {/* Total Pendapatan */}
                    <div className="text-left lg:text-right">
                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1 leading-none mb-0.5 justify-start lg:justify-end">
                            <IconCoin className="w-3 h-3 text-emerald-500" />
                            <span>Pendapatan</span>
                        </span>
                        <span className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono tabular-nums leading-tight">
                            {formatRupiah(totalRevenue)}
                        </span>
                    </div>

                    <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 hidden sm:block" />

                    {/* Total Beban */}
                    <div className="text-left lg:text-right">
                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1 leading-none mb-0.5 justify-start lg:justify-end">
                            <IconReceipt2 className="w-3 h-3 text-amber-500" />
                            <span>Beban & HPP</span>
                        </span>
                        <span className="text-xs sm:text-sm font-black text-amber-600 dark:text-amber-400 font-mono tabular-nums leading-tight">
                            {formatRupiah(totalExpense)}
                        </span>
                    </div>

                    <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 hidden sm:block" />

                    {/* Laba Bersih */}
                    <div className="text-right">
                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block leading-none mb-0.5">
                            Laba Bersih
                        </span>
                        <span
                            className={cn(
                                "text-xs sm:text-sm font-black font-mono tabular-nums leading-tight",
                                isProfit
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : "text-rose-600 dark:text-rose-400"
                            )}
                        >
                            {formatRupiah(netIncome)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
