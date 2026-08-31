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
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3 sm:p-3.5 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                {/* Left: Compact Status Indicator */}
                <div className="flex items-center gap-2.5 min-w-0">
                    <div
                        className={cn(
                            "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs",
                            isBalanced
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                                : "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400"
                        )}
                    >
                        {isBalanced ? (
                            <IconCircleCheck className="w-4.5 h-4.5" />
                        ) : (
                            <IconAlertCircle className="w-4.5 h-4.5 animate-pulse" />
                        )}
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-xs text-slate-800 dark:text-slate-100">
                                {isBalanced ? "Neraca Seimbang (Balanced)" : "Neraca Belum Seimbang"}
                            </span>
                            <span
                                className={cn(
                                    "text-[9px] px-2 py-0.5 rounded-md font-extrabold uppercase tracking-wider border",
                                    isBalanced
                                        ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40"
                                        : "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/40"
                                )}
                            >
                                {isBalanced ? "Sinkron" : `Selisih: ${formatRupiah(difference)}`}
                            </span>
                        </div>
                        <p className="text-slate-400 dark:text-slate-500 text-[11px] truncate">
                            {isBalanced
                                ? "Pencatatan posisi Aset, Kewajiban, dan Ekuitas tepat seimbang."
                                : "Terdapat perbedaan saldo antara sisi Debit dan Kredit."}
                        </p>
                    </div>
                </div>

                {/* Right: Compact Metrics Comparison */}
                <div className="flex items-center gap-4 sm:gap-6 justify-between lg:justify-end shrink-0 border-t lg:border-t-0 pt-2 lg:pt-0 border-slate-100 dark:border-slate-800">
                    <div className="text-left lg:text-right space-y-0.5">
                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                            {leftLabel || "Total Aset (A)"}
                        </span>
                        <span className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                            {formatRupiah(totalAssets)}
                        </span>
                    </div>

                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 hidden sm:block" />

                    <div className="text-right space-y-0.5">
                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                            {rightLabel || "Liabilitas + Ekuitas"}
                        </span>
                        <span
                            className={cn(
                                "text-xs sm:text-sm font-black font-mono tabular-nums",
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
                                className="bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold rounded-xl h-7 px-2.5 shadow-xs inline-flex items-center gap-1 cursor-pointer"
                            >
                                <IconScale className="w-3.5 h-3.5" />
                                <span>Perbaiki</span>
                                <IconArrowRight className="w-3 h-3" />
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
