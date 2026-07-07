"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useAppRouter } from "@/hooks/use-app-router";
import { IconArrowLeft, IconChevronRight, IconPrinter, IconX } from "@tabler/icons-react";

interface TransactionDetailHeaderProps {
    transactionNumber: string;
    status: string;
    onPrint: () => void;
    onVoid?: () => void;
    namaTransaksi?: string | null;
}

export function TransactionDetailHeader({
    transactionNumber,
    status,
    onPrint,
    onVoid,
    namaTransaksi,
}: TransactionDetailHeaderProps) {
    const router = useAppRouter();

    const currentStatus = status?.toLowerCase() || "completed";

    // Status definitions
    const statusConfig: Record<
        string,
        { label: string; bg: string; text: string; border: string; dot: string }
    > = {
        completed: {
            label: "Selesai",
            bg: "bg-emerald-50/80 dark:bg-emerald-950/20",
            text: "text-emerald-700 dark:text-emerald-400",
            border: "border-emerald-200 dark:border-emerald-800/60",
            dot: "bg-emerald-500 shadow-emerald-400",
        },
        canceled: {
            label: "Void / Dibatalkan",
            bg: "bg-rose-50/80 dark:bg-rose-950/20",
            text: "text-rose-700 dark:text-rose-400",
            border: "border-rose-200 dark:border-rose-800/60",
            dot: "bg-rose-500 shadow-rose-400",
        },
        void: {
            label: "Void / Dibatalkan",
            bg: "bg-rose-50/80 dark:bg-rose-950/20",
            text: "text-rose-700 dark:text-rose-400",
            border: "border-rose-200 dark:border-rose-800/60",
            dot: "bg-rose-500 shadow-rose-400",
        },
        draft: {
            label: "Draft",
            bg: "bg-amber-50/80 dark:bg-amber-950/20",
            text: "text-amber-700 dark:text-amber-400",
            border: "border-amber-200 dark:border-amber-800/60",
            dot: "bg-amber-500 shadow-amber-400",
        },
    };

    const config = statusConfig[currentStatus] || {
        label: status || "Unknown",
        bg: "bg-slate-50 dark:bg-slate-900/40",
        text: "text-slate-700 dark:text-slate-400",
        border: "border-slate-200 dark:border-slate-800",
        dot: "bg-slate-400 shadow-slate-350",
    };

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Left side: Back Button & Title Info */}
            <div className="flex items-center gap-3.5">
                <Button
                    type="button"
                    onClick={() => router.push("/admin/transactions")}
                    variant="outline"
                    className="group p-2 h-10 w-10 rounded-2xl border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 bg-white dark:bg-slate-950 shadow-sm"
                >
                    <IconArrowLeft
                        size={18}
                    />
                </Button>
                <div>
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                        <span
                            className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer transition-colors"
                            onClick={() => router.push("/admin/transactions")}
                        >
                            Transaksi
                        </span>
                        <IconChevronRight size={10} className="stroke-[3] text-slate-300" />
                        <span className="text-slate-500 dark:text-slate-400">Detail</span>
                    </div>

                    {/* Header Title with animated badge */}
                    <div className="flex flex-wrap items-center gap-2.5 mt-1">
                        <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-slate-100">
                            Transaksi: <span className="text-indigo-650 dark:text-indigo-400">{transactionNumber}</span>
                            {namaTransaksi && (
                                <span className="text-slate-400 dark:text-slate-500 font-medium text-xs ml-2 italic">
                                    ({namaTransaksi})
                                </span>
                            )}
                        </h2>

                        <div
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border transition-all duration-300 shadow-sm ${config.bg} ${config.text} ${config.border}`}
                        >
                            <span className="relative flex h-1.5 w-1.5 shrink-0">
                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.dot}`}></span>
                                <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${config.dot}`}></span>
                            </span>
                            <span>{config.label}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right side: Actions */}
            <div className="flex gap-2.5 shrink-0">
                {currentStatus !== "void" && currentStatus !== "canceled" && onVoid && (
                    <Button
                        onClick={onVoid}
                        className="group text-white bg-rose-500 hover:bg-rose-600 font-extrabold text-xs h-10 px-5 rounded-2xl flex items-center gap-2 cursor-pointer"
                    >
                        <IconX
                            size={16}
                        />
                        <span>Batalkan Transaksi</span>
                    </Button>
                )}
                <Button
                    onClick={onPrint}
                    className="group bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-extrabold text-xs h-10 px-5 rounded-2xl flex items-center gap-2 cursor-pointer"
                >
                    <IconPrinter
                        size={16}
                    />
                    <span>Cetak Struk</span>
                </Button>
            </div>
        </div>
    );
}
