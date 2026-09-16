"use client";

import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import React, { useState, useEffect } from "react";
import { BaseDialog } from "@/components/ui/base-dialog";
import { Scrollable } from "@/components/ui/scrollable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCashDrawerDetail } from "@/features/checkout/api/cash-drawer-api";
import { CloseShiftForm } from "@/features/checkout/components/cash-drawer/close-shift-form";
import { useSalesTutorialStore } from "@/stores/sales-tutorial-store";
import { DUMMY_CASH_DRAWER_DETAIL } from "@/features/sales-tutorial/constants/cash-drawer-tutorial-dummy";
import { cn } from "@/lib/utils";
import { IconCash, IconLoader2, IconCopy, IconCheck, IconDoorExit } from "@tabler/icons-react";
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
    const [isClosingShift, setIsClosingShift] = useState(false);
    const [copied, setCopied] = useState(false);

    const activeTutorial = useSalesTutorialStore((s) => s.activeTutorial);
    const stepIndex = useSalesTutorialStore((s) => s.stepIndex);
    const isTutorialRunning = useSalesTutorialStore((s) => s.isRunning);
    const isTutorialActive = isTutorialRunning && activeTutorial === "cash_drawer";
    const isDummySession = Boolean(sessionId && sessionId.startsWith("session-dummy"));

    const querySessionId = isTutorialActive || isDummySession ? null : sessionId;
    const { data: detailData, isLoading, refetch } = useCashDrawerDetail(querySessionId);

    // Provide complete dummy detail session during tutorial, revert on exit
    const session = isTutorialActive ? DUMMY_CASH_DRAWER_DETAIL : detailData?.data;

    // Synchronize active tab during tutorial steps
    // Step index 14 & 15: Tab 2 (Riwayat Arus Kas)
    // Step index 16 & 17: Tab 3 (Daftar Penjualan)
    // Other steps: Tab 1 (Ringkasan)
    const tutorialTab: TabType | null = isTutorialActive
        ? (stepIndex >= 16 ? "transactions" : stepIndex >= 14 ? "movements" : "summary")
        : null;
    const currentTab = tutorialTab ?? activeTab;

    // Reset tab and closing state when modal opens
    useEffect(() => {
        if (open) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setActiveTab("summary");
            setIsClosingShift(false);
            setCopied(false);
            if (!isTutorialActive && !isDummySession) {
                refetch();
            }
        }
    }, [open, refetch, isTutorialActive, isDummySession]);

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (session?.uid) {
            navigator.clipboard.writeText(session.uid);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (!open) {
        return null;
    }

    if (isLoading && !isTutorialActive && !isDummySession) {
        return (
            <BaseDialog open={open} onOpenChange={onOpenChange} className="max-w-lg sm:max-w-lg">
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                    <IconLoader2 size={32} className="animate-spin text-emerald-500" />
                    <span className="text-xs font-semibold">Memuat detail sesi...</span>
                </div>
            </BaseDialog>
        );
    }

    if (!session || (!isTutorialActive && isDummySession)) {
        return null;
    }

    const movements = session.movements || [];
    const transactions = session.transactions || [];

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={
                <div id="session-detail-header" className="flex items-center gap-2 sm:gap-2.5 min-w-0">
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
                    {session.status === "open" && !isClosingShift && (
                        <Button
                            type="button"
                            size="sm"
                            id="session-detail-btn-close-shift"
                            onClick={() => setIsClosingShift(true)}
                            className="h-7 px-2.5 text-xs font-bold gap-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-xs cursor-pointer border-none"
                            title="Tutup Sesi Shift Kasir"
                        >
                            <IconDoorExit size={13} />
                            <span>Tutup Sesi</span>
                        </Button>
                    )}
                </div>
            }
            className="w-[95vw] sm:w-full max-w-full sm:max-w-3xl flex flex-col max-h-[92vh] sm:max-h-[90vh]"
        >
            {isClosingShift ? (
                <div className="p-4 sm:p-6 overflow-y-auto">
                    <div className="mb-4 pb-3 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <h4 className="text-sm font-bold text-slate-900">Formulir Tutup Sesi Shift Kasir</h4>
                            <p className="text-xs text-slate-500">Hitung kas fisik dan laporkan saldo laci untuk mengakhiri shift.</p>
                        </div>
                    </div>
                    <CloseShiftForm
                        sessionId={session.uid}
                        expectedCash={session.expected_cash}
                        onSuccess={() => {
                            setIsClosingShift(false);
                            refetch();
                        }}
                        onCancel={() => setIsClosingShift(false)}
                    />
                </div>
            ) : (
                <Tabs value={currentTab} onValueChange={(val) => setActiveTab(val as TabType)} className="w-full flex-1 flex flex-col min-h-0">
                    <TabsList id="session-detail-tabs-nav" className="shrink-0 my-1 sm:my-2 border-b border-slate-100 dark:border-slate-800 rounded-none w-full justify-start bg-transparent gap-1.5 sm:gap-4 h-8 sm:h-9 p-0 overflow-x-auto no-scrollbar scrollbar-none whitespace-nowrap" variant="line">
                        <TabsTrigger
                            id="session-detail-tab-trigger-summary"
                            value="summary"
                            className="px-2.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold transition-all data-active:text-emerald-600 after:bg-emerald-600 rounded-none h-full bg-transparent shadow-none cursor-pointer shrink-0"
                        >
                            Ringkasan
                        </TabsTrigger>
                        <TabsTrigger
                            id="session-detail-tab-trigger-movements"
                            value="movements"
                            className="px-2.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold transition-all data-active:text-emerald-600 after:bg-emerald-600 rounded-none h-full bg-transparent shadow-none cursor-pointer shrink-0"
                        >
                            Riwayat Arus Kas ({movements.length})
                        </TabsTrigger>
                        <TabsTrigger
                            id="session-detail-tab-trigger-transactions"
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
            )}
        </BaseDialog>
    );
}
