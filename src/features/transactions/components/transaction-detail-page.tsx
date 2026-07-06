"use client";

import React, { useState } from "react";
import { useAppRouter } from "@/hooks/use-app-router";
import { PageLoader } from "@/components/feedback/page-loader";
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

export function TransactionDetailPage({ transactionId }: TransactionDetailPageProps) {
    const router = useAppRouter();
    const queryClient = useQueryClient();
    const { data: transaction, isLoading, error } = useTransactionDetail(transactionId);
    const getSetting = useSettingsStore((state) => state.getSetting);
    const [isVoidDialogOpen, setIsVoidDialogOpen] = useState(false);
    
    const voidMutation = useVoidTransaction();

    if (isLoading) {
        return <PageLoader message="Memuat detail transaksi..." />;
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
            <div className="space-y-6 print:hidden">
                {/* Refactored Header Component */}
                <TransactionDetailHeader
                    transactionNumber={transaction.nomor_transaksi}
                    status={transaction.status}
                    onPrint={handlePrint}
                    onVoid={() => setIsVoidDialogOpen(true)}
                    namaTransaksi={transaction.nama_transaksi}
                />
                
                {transaction.status === "void" && (
                    <div className="bg-rose-50/60 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/40 rounded-2xl p-5 flex flex-col md:flex-row md:items-start justify-between gap-4 shadow-sm">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-200 dark:border-rose-800/30">
                                <IconAlertTriangle size={20} stroke={2.2} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-sm font-extrabold text-rose-850 dark:text-rose-400">
                                    Transaksi Telah Dibatalkan (Void)
                                </h4>
                                <p className="text-xs text-rose-600 dark:text-rose-400/80 leading-relaxed max-w-xl">
                                    Seluruh item penjualan di bawah ini telah dibatalkan dan pencatatan keuangan dibalikkan.
                                </p>
                                
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                    {transaction.voided_at && (
                                        <div className="flex items-center gap-1">
                                            <span className="text-slate-400 dark:text-slate-500">Waktu:</span>
                                            <span className="text-slate-700 dark:text-slate-350 font-bold">
                                                {format(new Date(transaction.voided_at), "dd MMMM yyyy, HH:mm", { locale: localeId })}
                                            </span>
                                        </div>
                                    )}
                                    {(transaction.void_by || transaction.voidBy) && (
                                        <div className="flex items-center gap-1">
                                            <span className="text-slate-400 dark:text-slate-500">Oleh:</span>
                                            <span className="text-slate-700 dark:text-slate-350 font-bold">
                                                {(transaction.void_by || transaction.voidBy)?.name}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {transaction.catatan_void && (
                            <div className="w-full md:w-auto md:max-w-xs shrink-0 self-stretch md:self-auto">
                                <div className="bg-white/85 dark:bg-slate-950/40 border border-rose-100 dark:border-slate-800/60 rounded-xl p-3 h-full flex flex-col justify-center">
                                    <span className="text-[10px] font-extrabold text-rose-600 dark:text-rose-400 uppercase tracking-wider block mb-1">
                                        Alasan Void:
                                    </span>
                                    <p className="text-xs italic text-slate-750 dark:text-slate-300 font-medium leading-normal break-words">
                                        &ldquo;{transaction.catatan_void}&rdquo;
                                    </p>
                                </div>
                            </div>
                        )}
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

