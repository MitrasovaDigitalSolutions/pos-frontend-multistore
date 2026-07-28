"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
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

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            {/* Left side: Back Button & Title Info */}
            <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
                <Button
                    type="button"
                    onClick={() => router.push("/admin/transactions")}
                    variant="outline"
                    className="group p-2 h-9 w-9 sm:h-10 sm:w-10 rounded-xl sm:rounded-2xl border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 bg-white dark:bg-slate-950 shadow-sm shrink-0"
                >
                    <IconArrowLeft
                        size={18}
                    />
                </Button>
                <div className="min-w-0 flex-1">
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
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
                    <div className="flex items-center gap-2 flex-wrap mt-0.5 sm:mt-1">
                        <h2 className="text-sm sm:text-lg font-black tracking-tight text-slate-900 dark:text-slate-100 truncate">
                            Transaksi: <span className="text-indigo-650 dark:text-indigo-400">{transactionNumber}</span>
                            {namaTransaksi && (
                                <span className="text-slate-400 dark:text-slate-500 font-medium text-xs ml-2 italic hidden xs:inline">
                                    ({namaTransaksi})
                                </span>
                            )}
                        </h2>

                        <StatusBadge status={currentStatus} />
                    </div>
                </div>
            </div>

            {/* Right side: Actions */}
            {currentStatus !== "void" && currentStatus !== "canceled" && (
                <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 w-full sm:w-auto">
                    {onVoid && (
                        <Button
                            onClick={onVoid}
                            className="group text-white bg-rose-500 hover:bg-rose-600 font-extrabold text-xs h-9 sm:h-10 px-3.5 sm:px-5 rounded-xl sm:rounded-2xl flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer flex-1 sm:flex-initial"
                        >
                            <IconX
                                size={15}
                            />
                            <span>Batalkan</span>
                        </Button>
                    )}
                    <Button
                        onClick={onPrint}
                        className="group bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-extrabold text-xs h-9 sm:h-10 px-3.5 sm:px-5 rounded-xl sm:rounded-2xl flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer flex-1 sm:flex-initial"
                    >
                        <IconPrinter
                            size={15}
                        />
                        <span>Cetak Struk</span>
                    </Button>
                </div>
            )}
        </div>
    );
}
