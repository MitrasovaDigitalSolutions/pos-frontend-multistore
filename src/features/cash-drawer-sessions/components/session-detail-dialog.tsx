"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Scrollable } from "@/components/ui/scrollable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCashDrawerDetail } from "@/features/checkout/api/cash-drawer-api";
import { cn } from "@/lib/utils";
import { IconCash, IconLoader2 } from "@tabler/icons-react";
import { SessionSummaryTab } from "./session-summary-tab";
import { SessionMovementsTab } from "./session-movements-tab";
import { SessionTransactionsTab } from "./session-transactions-tab";

interface SessionDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    sessionId: number | null;
}

type TabType = "summary" | "movements" | "transactions";

export function SessionDetailDialog({
    open,
    onOpenChange,
    sessionId,
}: SessionDetailDialogProps) {
    const [activeTab, setActiveTab] = useState<TabType>("summary");

    const { data: detailData, isLoading, refetch } = useCashDrawerDetail(sessionId);
    const session = detailData?.data;

    // Reset tab when modal opens
    useEffect(() => {
        if (open) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setActiveTab("summary");
            refetch();
        }
    }, [open, refetch]);

    if (isLoading) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="bg-white rounded-2xl p-6 shadow-2xl max-w-lg sm:max-w-lg border-slate-100">
                    <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                        <IconLoader2 size={32} className="animate-spin text-emerald-500" />
                        <span className="text-xs font-semibold">Memuat detail sesi...</span>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    if (!session) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="bg-white rounded-2xl p-6 shadow-2xl max-w-lg sm:max-w-lg border-slate-100">
                    <div className="py-8 text-center text-slate-400 text-xs">
                        Sesi tidak ditemukan. Silakan muat ulang halaman.
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    const movements = session.movements || [];
    const transactions = session.transactions || [];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-white rounded-2xl border-slate-100 p-6 shadow-2xl max-w-3xl sm:max-w-3xl flex flex-col max-h-[90vh]">
                <DialogHeader className="pb-3 border-b border-slate-100 shrink-0">
                    <DialogTitle className="text-base font-extrabold text-slate-900 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className={cn(
                                "w-8 h-8 rounded-lg text-white flex items-center justify-center",
                                session.status === "open" ? "bg-emerald-500" : "bg-slate-500"
                            )}>
                                <IconCash size={18} />
                            </div>
                            <div className="text-left">
                                <span className="block text-sm font-extrabold">Detail Sesi Kasir #{session.id}</span>
                                <span className="block text-[11px] font-medium text-slate-400 mt-0.5">
                                    Kasir: <span className="text-slate-800 font-bold">{session.user?.name || "Kasir"}</span>
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mr-6">
                            {session.status === "open" ? (
                                <span className="bg-emerald-50 text-emerald-700 text-[9px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-100 uppercase tracking-wider">
                                    Terbuka
                                </span>
                            ) : (
                                <span className="bg-slate-100 text-slate-700 text-[9px] font-bold px-2.5 py-0.5 rounded-full border border-slate-200 uppercase tracking-wider">
                                    Ditutup
                                </span>
                            )}
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as TabType)} className="w-full flex-1 flex flex-col min-h-0">
                    <TabsList className="shrink-0 my-2 border-b border-slate-100 rounded-none w-full justify-start bg-transparent gap-4 h-9 p-0" variant="line">
                        <TabsTrigger
                            value="summary"
                            className="px-4 py-2 text-xs font-bold transition-all data-active:text-emerald-600 after:bg-emerald-600 rounded-none h-full bg-transparent shadow-none cursor-pointer"
                        >
                            Ringkasan
                        </TabsTrigger>
                        <TabsTrigger
                            value="movements"
                            className="px-4 py-2 text-xs font-bold transition-all data-active:text-emerald-600 after:bg-emerald-600 rounded-none h-full bg-transparent shadow-none cursor-pointer"
                        >
                            Riwayat Arus Kas ({movements.length})
                        </TabsTrigger>
                        <TabsTrigger
                            value="transactions"
                            className="px-4 py-2 text-xs font-bold transition-all data-active:text-emerald-600 after:bg-emerald-600 rounded-none h-full bg-transparent shadow-none cursor-pointer"
                        >
                            Daftar Penjualan ({transactions.length})
                        </TabsTrigger>
                    </TabsList>

                    {/* Tab content area - Scrollable */}
                    <Scrollable className="flex-1 pr-1 py-2">
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
            </DialogContent>
        </Dialog>
    );
}
