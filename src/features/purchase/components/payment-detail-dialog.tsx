"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { IconClipboardList, IconClock, IconFileDescription } from "@tabler/icons-react";
import { usePaymentDetail, useReceivingDetail, useCashAccounts } from "../api/purchase-api";
import { useActivityLogs } from "@/features/stock/api/stock-api";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { Scrollable } from "@/components/ui/scrollable";
import { Skeleton } from "@/components/ui/skeleton";

interface PaymentDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    paymentId: number | null;
}

export function PaymentDetailDialog({
    open,
    onOpenChange,
    paymentId,
}: PaymentDetailDialogProps) {
    const [activeTab, setActiveTab] = useState<"details" | "logs">("details");

    const { data: payment, isLoading: isDetailLoading } = usePaymentDetail(paymentId);
    const { data: cashAccounts = [] } = useCashAccounts();

    // Fetch the receiving invoice details associated with this payment
    const { data: receiving, isLoading: isReceivingLoading } = useReceivingDetail(
        payment ? payment.referensi_id : null
    );

    // Fetch activity logs related to this payment transaction number
    const { data: logsData, isLoading: isLogsLoading } = useActivityLogs({
        search: payment?.nomor_transaksi || undefined,
    });

    const logs = logsData?.data || [];

    const handleOpenChange = (val: boolean) => {
        onOpenChange(val);
        if (!val) {
            setActiveTab("details"); // Reset tab on close
        }
    };

    if (paymentId === null || !open) return null;

    const matchedCashAccount = cashAccounts.find(acc => acc.id === payment?.cash_account_id);

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-2xl bg-white rounded-2xl border-slate-100 p-6 flex flex-col max-h-[90vh]">
                <DialogHeader className="pb-4 border-b border-slate-100 flex-shrink-0">
                    <DialogTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <IconClipboardList size={20} className="text-emerald-500" />
                        <span>Detail Pembayaran Supplier</span>
                    </DialogTitle>
                </DialogHeader>

                {isDetailLoading || !payment ? (
                    <div className="space-y-5 pt-4 flex-1 flex flex-col min-h-0 overflow-hidden">
                        <div className="grid grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100 shrink-0">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <Skeleton className="h-3 w-16" />
                                    <Skeleton className="h-4 w-28" />
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-5 pt-4 flex-1 flex flex-col min-h-0 overflow-hidden">
                        {/* Header Invoice details */}
                        <div className="grid grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100 text-xs shrink-0">
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">No. Transaksi</span>
                                <p className="font-bold text-slate-900">{payment.nomor_transaksi}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Tanggal Bayar</span>
                                <p className="font-semibold text-slate-700">
                                    {new Date(payment.created_at).toLocaleString("id-ID", {
                                        dateStyle: "medium",
                                    })}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Faktur Penerimaan</span>
                                <p className="font-semibold text-slate-800">
                                    {isReceivingLoading
                                        ? "Memuat..."
                                        : receiving
                                            ? `${receiving.nomor_penerimaan} (${receiving.supplier_relationship?.nama || receiving.supplier || "Supplier"})`
                                            : `-`}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Akun Kas</span>
                                <p className="font-semibold text-slate-700">
                                    {matchedCashAccount ? matchedCashAccount.nama : `Akun ID: ${payment.cash_account_id}`}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Metode Pembayaran</span>
                                <p className="font-semibold text-slate-750">{payment.metode_pembayaran}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Nominal Pembayaran</span>
                                <p className="font-bold text-emerald-600 font-mono text-sm">
                                    {formatRupiah(payment.total)}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Dibuat Oleh</span>
                                <p className="font-semibold text-slate-700">{payment.user?.name || "-"}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Status</span>
                                <div>
                                    <span
                                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                            payment.status === "completed"
                                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                                : "bg-rose-50 text-rose-700 border-rose-100"
                                        }`}
                                    >
                                        {payment.status === "completed" ? "Selesai" : "Batal (Void)"}
                                    </span>
                                </div>
                            </div>

                            {/* Void Details */}
                            {payment.status === "void" && (
                                <div className="col-span-2 mt-2 p-3 bg-rose-50/50 border border-rose-100 rounded-lg text-rose-850 space-y-1">
                                    <span className="text-[9px] font-bold text-rose-500 uppercase tracking-wider block">
                                        Rincian Pembatalan (Void)
                                    </span>
                                    <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold">
                                        <div>
                                            <span className="text-slate-450 block font-normal">Dibatalkan Oleh ID:</span>
                                            {payment.void_by || "System"}
                                        </div>
                                        <div>
                                            <span className="text-slate-450 block font-normal">Tanggal Batal:</span>
                                            {payment.voided_at
                                                ? new Date(payment.voided_at).toLocaleString("id-ID")
                                                : "-"}
                                        </div>
                                        <div className="col-span-2">
                                            <span className="text-slate-450 block font-normal">Alasan Pembatalan:</span>
                                            <p className="font-medium text-rose-700 italic">
                                                "{payment.catatan_void || "Tidak ada alasan tertulis."}"
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Tabs Navigation */}
                        <div className="flex border-b border-slate-100 shrink-0">
                            <button
                                onClick={() => setActiveTab("details")}
                                className={`px-4 py-2 text-xs font-bold border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors ${
                                    activeTab === "details"
                                        ? "border-emerald-600 text-emerald-600"
                                        : "border-transparent text-slate-400 hover:text-slate-600"
                                }`}
                            >
                                <IconFileDescription size={16} />
                                Rincian / Catatan
                            </button>
                            <button
                                onClick={() => setActiveTab("logs")}
                                className={`px-4 py-2 text-xs font-bold border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors ${
                                    activeTab === "logs"
                                        ? "border-emerald-600 text-emerald-600"
                                        : "border-transparent text-slate-400 hover:text-slate-600"
                                }`}
                            >
                                <IconClock size={16} />
                                Log Aktivitas ({logs.length})
                            </button>
                        </div>

                        {/* Tab Content */}
                        <Scrollable className="flex-1 min-h-0 max-h-[300px] pr-1">
                            {activeTab === "details" ? (
                                <div className="p-3 bg-slate-50/30 border border-slate-100 rounded-xl text-xs space-y-2">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Catatan / Keterangan</span>
                                    <p className="text-slate-700 font-medium whitespace-pre-wrap">
                                        {payment.catatan_void && payment.status !== "void"
                                            ? payment.catatan_void
                                            : "Tidak ada catatan tambahan."}
                                    </p>
                                </div>
                            ) : isLogsLoading ? (
                                <div className="space-y-4 pl-3 pr-1 py-1">
                                    {[...Array(2)].map((_, i) => (
                                        <div key={i} className="relative flex gap-3 pb-4 last:pb-0 border-l border-slate-100 pl-4 animate-pulse">
                                            <div className="absolute -left-1.5 top-0.5 w-3 h-3 bg-slate-200 rounded-full border-2 border-white shadow-sm" />
                                            <div className="space-y-2 w-full">
                                                <Skeleton className="h-4 w-3/4" />
                                                <Skeleton className="h-3 w-1/2" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-4 pl-3 pr-1 py-1">
                                    {logs.map((log) => (
                                        <div key={log.id} className="relative flex gap-3 pb-4 last:pb-0 border-l border-slate-100 pl-4">
                                            <div className="absolute -left-1.5 top-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />
                                            <div className="space-y-0.5 text-xs">
                                                <p className="font-semibold text-slate-800">
                                                    {log.description}
                                                </p>
                                                <div className="flex gap-2 text-[10px] text-slate-400 font-mono">
                                                    <span>
                                                        {new Date(log.created_at).toLocaleString("id-ID")}
                                                    </span>
                                                    <span>•</span>
                                                    <span>Oleh: {log.user?.name || "System"}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {logs.length === 0 && (
                                        <p className="text-center py-8 text-slate-400 text-xs">
                                            Belum ada log aktivitas tercatat untuk transaksi pembayaran ini.
                                        </p>
                                    )}
                                </div>
                            )}
                        </Scrollable>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
