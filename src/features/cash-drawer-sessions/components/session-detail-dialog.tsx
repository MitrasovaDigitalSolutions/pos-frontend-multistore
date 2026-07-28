"use client";

import { StatusBadge } from "@/components/ui/status-badge";

import React, { useState, useEffect } from "react";
import { BaseDialog } from "@/components/ui/base-dialog";
import { Scrollable } from "@/components/ui/scrollable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCashDrawerDetail } from "@/features/checkout/api/cash-drawer-api";
import { cn } from "@/lib/utils";
import { IconCash, IconLoader2, IconCopy, IconCheck } from "@tabler/icons-react";
import { SessionSummaryTab } from "./session-summary-tab";
import { SessionMovementsTab } from "./session-movements-tab";
import { SessionTransactionsTab } from "./session-transactions-tab";

interface SessionDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    sessionId: string | null;
}

type TabType = "summary" | "movements" | "transactions";

export function SessionDetailDialog({
    open,
    onOpenChange,
    sessionId,
}: SessionDetailDialogProps) {
    const [activeTab, setActiveTab] = useState<TabType>("summary");
    const [copied, setCopied] = useState(false);

    const { data: detailData, isLoading, refetch } = useCashDrawerDetail(sessionId);
    const session = detailData?.data;

    // Reset tab when modal opens
    useEffect(() => {
        if (open) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setActiveTab("summary");
            setCopied(false);
            refetch();
        }
    }, [open, refetch]);

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (session?.uid) {
            navigator.clipboard.writeText(session.uid);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (isLoading) {
        return (
            <BaseDialog open={open} onOpenChange={onOpenChange} className="max-w-lg sm:max-w-lg">
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                    <IconLoader2 size={32} className="animate-spin text-emerald-500" />
                    <span className="text-xs font-semibold">Memuat detail sesi...</span>
                </div>
            </BaseDialog>
        );
    }

    if (!session) {
        return (
            <BaseDialog open={open} onOpenChange={onOpenChange} className="max-w-lg sm:max-w-lg">
                <div className="py-8 text-center text-slate-400 text-xs">
                    Sesi tidak ditemukan. Silakan muat ulang halaman.
                </div>
            </BaseDialog>
        );
    }

    const movements = session.movements || [];
    const transactions = session.transactions || [];

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={
                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                    <div className={cn(
                        "w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-white flex items-center justify-center shrink-0 shadow-sm transition-all duration-300",
                        session.status === "open" ? "bg-emerald-500 shadow-emerald-100 animate-pulse" : "bg-slate-500 shadow-slate-100"
                    )}>
                        <IconCash size={18} className="sm:hidden" />
                        <IconCash size={20} className="hidden sm:block" />
                    </div>
                    <div className="text-left min-w-0">
                        <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                            <span className="block text-xs sm:text-sm font-extrabold text-slate-900 leading-tight truncate">
                                Detail Sesi #{session.uid.slice(0, 8).toUpperCase()}
                            </span>
                            <button
                                onClick={handleCopy}
                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors text-slate-400 hover:text-slate-650 focus:outline-none border-none bg-transparent cursor-pointer flex items-center justify-center shrink-0"
                                title="Salin ID Sesi Lengkap"
                            >
                                {copied ? <IconCheck size={12} className="text-emerald-500" /> : <IconCopy size={12} />}
                            </button>
                        </div>
                        <span className="block text-[10px] sm:text-[11px] font-medium text-slate-400 mt-0.5 truncate">
                            Kasir: <span className="text-slate-800 font-bold">{session.user?.name || "Kasir"}</span>
                        </span>
                    </div>
                </div>
            }
            headerRight={
                <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge
                        status={session.status === "open" ? "open" : "closed"}
                        label={session.status === "open" ? "Terbuka" : "Ditutup"}
                    />
                </div>
            }
            className="w-[95vw] sm:w-full max-w-full sm:max-w-3xl flex flex-col max-h-[92vh] sm:max-h-[90vh]"
        >

            <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as TabType)} className="w-full flex-1 flex flex-col min-h-0">
                <TabsList className="shrink-0 my-1 sm:my-2 border-b border-slate-100 dark:border-slate-800 rounded-none w-full justify-start bg-transparent gap-1.5 sm:gap-4 h-8 sm:h-9 p-0 overflow-x-auto no-scrollbar scrollbar-none whitespace-nowrap" variant="line">
                    <TabsTrigger
                        value="summary"
                        className="px-2.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold transition-all data-active:text-emerald-600 after:bg-emerald-600 rounded-none h-full bg-transparent shadow-none cursor-pointer shrink-0"
                    >
                        Ringkasan
                    </TabsTrigger>
                    <TabsTrigger
                        value="movements"
                        className="px-2.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold transition-all data-active:text-emerald-600 after:bg-emerald-600 rounded-none h-full bg-transparent shadow-none cursor-pointer shrink-0"
                    >
                        Riwayat Arus Kas ({movements.length})
                    </TabsTrigger>
                    <TabsTrigger
                        value="transactions"
                        className="px-2.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold transition-all data-active:text-emerald-600 after:bg-emerald-600 rounded-none h-full bg-transparent shadow-none cursor-pointer shrink-0"
                    >
                        Daftar Penjualan ({transactions.length})
                    </TabsTrigger>
                </TabsList>

                {/* Tab content area - Scrollable */}
                <Scrollable className="flex-1 pr-1 py-1.5 sm:py-2">
                    <TabsContent value="summary" className="outline-none">
                        <SessionSummaryTab session={session} />
                    </TabsContent>

                    <TabsContent value="movements" className="outline-none">
                        <SessionMovementsTab movements={movements} />
                    </TabsContent>

                    <TabsContent value="transactions" className="outline-none">
                        <SessionTransactionsTab transactions={transactions} />
                    </TabsContent>
                </Scrollable>
            </Tabs>
        </BaseDialog>
    );
}
