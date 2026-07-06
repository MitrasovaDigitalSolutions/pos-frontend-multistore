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

interface TransactionDetailPageProps {
    transactionId: string;
}

export function TransactionDetailPage({ transactionId }: TransactionDetailPageProps) {
    const router = useAppRouter();
    const queryClient = useQueryClient();
    const { data: transaction, isLoading, error } = useTransactionDetail(transactionId);
    const getSetting = useSettingsStore((state) => state.getSetting);
    
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
    
    const handleVoid = () => {
        const reason = window.prompt("Masukkan alasan void transaksi ini:");
        if (reason === null) return; // User cancelled
        if (!reason.trim()) {
            toast.error("Alasan void harus diisi");
            return;
        }
        
        voidMutation.mutate(
            { id: transaction.uid, void_reason: reason },
            {
                onSuccess: () => {
                    toast.success("Transaksi berhasil di-void");
                    queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
                },
                onError: (err: any) => {
                    toast.error(err?.response?.data?.message || "Gagal melakukan void transaksi");
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
                    onVoid={handleVoid}
                    namaTransaksi={transaction.nama_transaksi}
                />
                
                {transaction.status === "void" && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-4 flex flex-col gap-1 shadow-sm">
                        <div className="font-bold flex items-center gap-2">
                            <IconAlertTriangle size={18} />
                            <span>Transaksi ini telah divoid</span>
                        </div>
                        {transaction.catatan_void && (
                            <div className="text-sm">Alasan: {transaction.catatan_void}</div>
                        )}
                        {transaction.voided_at && (
                            <div className="text-sm text-rose-600">
                                Waktu: {format(new Date(transaction.voided_at), "dd MMMM yyyy, HH:mm", { locale: localeId })}
                            </div>
                        )}
                    </div>
                )}

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

