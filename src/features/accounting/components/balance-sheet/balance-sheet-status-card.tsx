"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { cn } from "@/lib/utils";
import { IconAlertCircle, IconArrowRight, IconCircleCheck, IconScale } from "@tabler/icons-react";

interface BalanceSheetStatusCardProps {
    isBalanced: boolean;
    totalAssets: number;
    totalLiabilitiesAndEquity: number;
    difference: number;
    leftLabel?: string;
    rightLabel?: string;
    leftLegend?: string;
    rightLegend?: string;
    hideUnbalancedButton?: boolean;
}

export function BalanceSheetStatusCard({
    isBalanced,
    totalAssets,
    totalLiabilitiesAndEquity,
    difference,
    leftLabel,
    rightLabel,
    hideUnbalancedButton = false,
}: BalanceSheetStatusCardProps) {
    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-2.5 sm:p-3 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
                {/* Left: Status Indicator & Short Natural Copy */}
                <div className="flex items-center gap-2 min-w-0">
                    <div
                        className={cn(
                            "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-xs",
                            isBalanced
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                                : "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400"
                        )}
                    >
                        {isBalanced ? (
                            <IconCircleCheck className="w-4 h-4" />
                        ) : (
                            <IconAlertCircle className="w-4 h-4 animate-pulse" />
                        )}
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-extrabold text-xs text-slate-800 dark:text-slate-100">
                                {isBalanced ? "Jurnal Seimbang (Balanced)" : "Jurnal Belum Seimbang"}
                            </span>
                            <span
                                className={cn(
                                    "text-[9px] px-1.5 py-0.2 rounded-md font-extrabold uppercase tracking-wider border",
                                    isBalanced
                                        ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40"
                                        : "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/40"
                                )}
                            >
                                {isBalanced ? "Sinkron" : `Selisih: ${formatRupiah(difference)}`}
                            </span>
                        </div>
                        <p className="text-slate-400 dark:text-slate-500 text-[11px] leading-tight mt-0.5 truncate">
                            {isBalanced
                                ? "Total nilai debit dan kredit telah seimbang tanpa selisih."
                                : "Terdapat selisih saldo antara sisi debit dan kredit yang perlu diperiksa."}
                        </p>
                    </div>
                </div>

                {/* Right: Compact Metrics Comparison */}
                <div className="flex items-center gap-3 sm:gap-4 justify-between lg:justify-end shrink-0 border-t lg:border-t-0 pt-1.5 lg:pt-0 border-slate-100 dark:border-slate-800">
                    <div className="text-left lg:text-right">
                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block leading-none mb-0.5">
                            {leftLabel || "Total Aset (A)"}
                        </span>
                        <span className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono tabular-nums leading-tight">
                            {formatRupiah(totalAssets)}
                        </span>
                    </div>

                    <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 hidden sm:block" />

                    <div className="text-right">
                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block leading-none mb-0.5">
                            {rightLabel || "Liabilitas + Ekuitas"}
                        </span>
                        <span
                            className={cn(
                                "text-xs sm:text-sm font-black font-mono tabular-nums leading-tight",
                                isBalanced
                                    ? "text-indigo-600 dark:text-indigo-400"
                                    : "text-rose-600 dark:text-rose-400"
                            )}
                        >
                            {formatRupiah(totalLiabilitiesAndEquity)}
                        </span>
                    </div>

                    {!isBalanced && !hideUnbalancedButton && (
                        <Link href={ROUTES.ADMIN_ACCOUNTING_UNBALANCED}>
                            <Button
                                size="sm"
                                className="bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold rounded-lg h-6 px-2 shadow-xs inline-flex items-center gap-1 cursor-pointer"
                            >
                                <IconScale className="w-3 h-3" />
                                <span>Perbaiki</span>
                                <IconArrowRight className="w-2.5 h-2.5" />
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
