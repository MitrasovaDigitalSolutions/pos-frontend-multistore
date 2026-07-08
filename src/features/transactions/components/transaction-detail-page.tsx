"use client";

import React, { useState } from "react";
import { useAppRouter } from "@/hooks/use-app-router";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { IconAlertTriangle } from "@tabler/icons-react";
import { useTransactionDetail, useVoidTransaction } from "../api/transactions-api";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { toast } from "sonner";
import QZService from "@/services/qz.service";
import axios from "axios";
import { buildReceipt } from "@/utils/ReceiptFormatter";
import { useSettingsStore } from "@/stores/settings-store";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

// Import refactored subcomponents
import { TransactionDetailHeader } from "./detail/transaction-detail-header";
import { TransactionDetailItems } from "./detail/transaction-detail-items";
import { TransactionDetailSummary } from "./detail/transaction-detail-summary";
import { TransactionPrintReceipt } from "./detail/transaction-print-receipt";
import { VoidTransactionDialog } from "./detail/void-transaction-dialog";

interface TransactionDetailPageProps {
    transactionId: string;
}

function TransactionDetailSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-9 w-9 rounded-xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-64" />
                        <Skeleton className="h-3.5 w-48" />
                    </div>
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-32 rounded-xl" />
                    <Skeleton className="h-10 w-36 rounded-xl" />
                </div>
            </div>

            {/* Content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left column (Col-2) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                        <Skeleton className="h-4 w-32" />
                        <div className="border border-slate-100 dark:border-slate-800 rounded-xl p-4 space-y-4">
                            {Array.from({ length: 3 }).map((_, idx) => (
                                <div key={idx} className="flex justify-between items-center">
                                    <div className="space-y-1.5">
                                        <Skeleton className="h-4 w-48" />
                                        <Skeleton className="h-3 w-24" />
                                    </div>
                                    <Skeleton className="h-4 w-20" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right column (Col-1) */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                        <Skeleton className="h-4 w-28" />
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <Skeleton className="h-3.5 w-16" />
                                <Skeleton className="h-3.5 w-20" />
                            </div>
                            <div className="flex justify-between">
                                <Skeleton className="h-3.5 w-24" />
                                <Skeleton className="h-3.5 w-16" />
                            </div>
                            <div className="flex justify-between border-t pt-3 border-slate-100 dark:border-slate-800">
                                <Skeleton className="h-5 w-20" />
                                <Skeleton className="h-5 w-24" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function TransactionDetailPage({ transactionId }: TransactionDetailPageProps) {
    const router = useAppRouter();
    const queryClient = useQueryClient();
    const { data: transaction, isLoading, error } = useTransactionDetail(transactionId);
    const getSetting = useSettingsStore((state) => state.getSetting);
    const [isVoidDialogOpen, setIsVoidDialogOpen] = useState(false);

    const voidMutation = useVoidTransaction();

    if (isLoading) {
        return <TransactionDetailSkeleton />;
    }

    if (error || !transaction) {
        return (
            <div className="p-8 text-center bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm max-w-md mx-auto mt-12 transition-all duration-300 hover:shadow-md">
                <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/20 text-rose-500 flex items-center justify-center mx-auto mb-5 border border-rose-100 dark:border-rose-900/30 shadow-sm animate-bounce">
                    <IconAlertTriangle size={26} className="stroke-[2.2]" />
                </div>
                <h4 className="text-base font-extrabold text-slate-800 dark:text-slate-200">Terjadi Kesalahan</h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 leading-relaxed">
                    Transaksi tidak ditemukan atau terjadi masalah koneksi saat memuat detail transaksi. Silakan coba kembali.
                </p>
                <Button
                    onClick={() => router.push("/admin/transactions")}
                    className="mt-6 bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs h-10 px-5 rounded-2xl transition-all duration-200 shadow-sm shadow-slate-100 dark:shadow-none hover:shadow-md cursor-pointer"
                >
                    Kembali ke Daftar Transaksi
                </Button>
            </div>
        );
    }

    // Format transaction date
    const date = new Date(transaction.created_at);
    const formattedDate = format(date, "dd MMMM yyyy, HH:mm", { locale: localeId });

    const handlePrint = async () => {
        if (transaction?.uid) {
            const toastId = toast.success("Mencetak struk...");
            const { data } = await axios.get(`/api/proxy/v1/transactions-print/${transaction.uid}`);

            const receipt = buildReceipt(data);
            const printerName = getSetting("printer_id") || "EPSON LX-310 ESC/P";
            await QZService.print(printerName, receipt);

            setTimeout(() => {
                toast.dismiss(toastId);
            }, 3000);
        } else {
            toast.error("Gagal mencetak struk: ID transaksi tidak ditemukan.");
        }
    };

    const handleVoid = (reason: string) => {
        voidMutation.mutate(
            { id: transaction.uid, void_reason: reason },
            {
                onSuccess: () => {
                    toast.success("Transaksi berhasil di-void");
                    queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
                    setIsVoidDialogOpen(false);
                },
                onError: (err: unknown) => {
                    let errMsg = "Gagal melakukan void transaksi";
                    if (axios.isAxiosError(err)) {
                        errMsg = err.response?.data?.message || errMsg;
                    } else if (err instanceof Error) {
                        errMsg = err.message;
                    }
                    toast.error(errMsg);
                }
            }
        );
    };

    return (
        <>
            {/* ─── PRINT-ONLY SECTION (Hidden in Web View) ─── */}
            <TransactionPrintReceipt transaction={transaction} formattedDate={formattedDate} />

            {/* ─── WEB-VIEW DISPLAY SECTION (Hidden when printing) ─── */}
            <div className="space-y-4 print:hidden">
                {/* Refactored Header Component */}
                <TransactionDetailHeader
                    transactionNumber={transaction.nomor_transaksi}
                    status={transaction.status}
                    onPrint={handlePrint}
                    onVoid={() => setIsVoidDialogOpen(true)}
                    namaTransaksi={transaction.nama_transaksi}
                />

                {transaction.status === "void" && (
                    <div className="group relative overflow-hidden bg-gradient-to-br from-rose-50 via-rose-50/70 to-white dark:from-rose-950/20 dark:via-rose-950/10 dark:to-slate-950 border-l-4 border-l-rose-500 border border-rose-100 dark:border-rose-900/30 rounded-2xl p-4.5 shadow-sm hover:shadow-md transition-all duration-300 space-y-3.5">
                        {/* Header Section */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-100/50 dark:border-rose-900/20 pb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-rose-200 dark:shadow-none animate-pulse">
                                    <IconAlertTriangle size={18} stroke={2.5} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-rose-850 dark:text-rose-455 tracking-tight uppercase">
                                        Transaksi Telah Dibatalkan
                                    </h4>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                                        ID REFERENSI: <span className="text-slate-600 dark:text-slate-350">{transaction.uid}</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Content Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">

                            {/* Left Side: General description & inline metadata */}
                            <div className="md:col-span-7 space-y-3">
                                <p className="text-xs text-rose-600 dark:text-rose-400/80 leading-relaxed font-medium">
                                    Seluruh item penjualan di bawah ini telah dibatalkan dan pencatatan keuangan dikembalikan. Transaksi ini tidak valid lagi untuk pelaporan kasir.
                                </p>

                                {/* Metadata Info Row (Horizontal list) */}
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-rose-100/30 dark:border-rose-900/10 pt-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                    {transaction.voided_at && (
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-slate-400 dark:text-slate-500">Dibatalkan pada:</span>
                                            <span className="text-slate-800 dark:text-slate-200 font-extrabold">
                                                {format(new Date(transaction.voided_at), "dd MMMM yyyy, HH:mm", { locale: localeId })}
                                            </span>
                                        </div>
                                    )}
                                    {(transaction.void_by || transaction.voidBy) && (
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-slate-400 dark:text-slate-500">Otorisator:</span>
                                            <span className="text-slate-800 dark:text-slate-200 font-extrabold">
                                                {(transaction.void_by || transaction.voidBy)?.name}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Side: Reason box */}
                            {transaction.catatan_void && (
                                <div className="md:col-span-5 flex h-full">
                                    <div className="w-full bg-rose-100/25 dark:bg-rose-950/15 border border-rose-250/40 dark:border-rose-900/30 rounded-xl p-3.5 flex flex-col justify-between hover:border-rose-300 dark:hover:border-rose-800 hover:shadow-xs transition-all duration-300">
                                        <div className="space-y-1.5">
                                            <span className="text-[10px] font-extrabold text-rose-650 dark:text-rose-400 uppercase tracking-wider block">
                                                Alasan Pembatalan:
                                            </span>
                                            <p className="text-xs italic text-slate-800 dark:text-slate-250 font-semibold leading-relaxed break-words font-sans">
                                                &ldquo;{transaction.catatan_void}&rdquo;
                                            </p>
                                        </div>

                                        <span className="text-[9px] font-bold text-rose-600/60 dark:text-rose-400/60 text-right block mt-2">
                                            * tercatat otomatis pada sistem audit log
                                        </span>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                )}

                <VoidTransactionDialog
                    key={`${transaction.uid}-${isVoidDialogOpen}`}
                    open={isVoidDialogOpen}
                    onOpenChange={setIsVoidDialogOpen}
                    transactionNumber={transaction.nomor_transaksi}
                    transactionName={transaction.nama_transaksi}
                    onConfirm={handleVoid}
                    isLoading={voidMutation.isPending}
                />

                {/* Main content grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left: Table details */}
                    <div className="lg:col-span-8">
                        <TransactionDetailItems items={transaction.items} />
                    </div>

                    {/* Right: Summary details panels */}
                    <div className="lg:col-span-4">
                        <TransactionDetailSummary
                            transaction={transaction}
                            formattedDate={formattedDate}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}

export default TransactionDetailPage;

