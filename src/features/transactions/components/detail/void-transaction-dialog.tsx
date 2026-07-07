"use client";

import React, { useState } from "react";
import { BaseDialog } from "@/components/ui/base-dialog";
import { Button } from "@/components/ui/button";
import { IconAlertTriangle, IconLoader2, IconX } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface VoidTransactionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    transactionNumber: string;
    transactionName?: string | null;
    onConfirm: (reason: string) => void | Promise<void>;
    isLoading?: boolean;
}

export function VoidTransactionDialog({
    open,
    onOpenChange,
    transactionNumber,
    transactionName,
    onConfirm,
    isLoading = false,
}: VoidTransactionDialogProps) {
    const [reason, setReason] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!reason.trim()) {
            setError("Alasan void harus diisi");
            return;
        }

        setError("");
        try {
            await onConfirm(reason);
        } catch (err) {
            console.error(err);
        }
    };

    const titleContent = (
        <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-100 dark:border-rose-900/50">
                <IconAlertTriangle size={14} stroke={2.5} />
            </div>
            <span className="text-sm font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
                Batalkan Transaksi
            </span>
        </div>
    );

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={titleContent}
            className="sm:max-w-md bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-2xl p-6"
            showCloseButton={!isLoading}
        >
            <div className="flex flex-col items-start w-full">
                <form onSubmit={handleSubmit} className="w-full space-y-4">
                    {/* Warning Box */}
                    <div className="bg-rose-50/60 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-xl p-3 flex items-start gap-2.5">
                        <IconAlertTriangle size={16} stroke={2.2} className="text-rose-500 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                            <span className="text-xs font-bold text-rose-700 dark:text-rose-400 block">
                                Peringatan
                            </span>
                            <span className="text-[11px] text-rose-600/90 dark:text-rose-400/90 leading-relaxed block font-medium">
                                Tindakan ini tidak dapat dibatalkan! Seluruh stok barang dan jurnal keuangan akan dikembalikan.
                            </span>
                        </div>
                    </div>

                    {/* Transaction Detail Card */}
                    <div className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-4 space-y-2 text-xs">
                        <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                            <span>Nomor Transaksi:</span>
                            <span className="font-extrabold text-slate-800 dark:text-slate-200">{transactionNumber}</span>
                        </div>
                        {transactionName && (
                            <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                                <span>Nama Transaksi:</span>
                                <span className="font-semibold text-slate-800 dark:text-slate-200">{transactionName}</span>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="space-y-1.5 w-full">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-350">
                            Alasan Pembatalan <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => {
                                setReason(e.target.value);
                                if (e.target.value.trim()) setError("");
                            }}
                            placeholder="Contoh: Kesalahan input item / Pelanggan membatalkan pesanan"
                            disabled={isLoading}
                            className={cn(
                                "w-full min-h-[90px] text-sm rounded-xl border bg-transparent px-3.5 py-2.5 outline-none transition-all resize-none placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-800 dark:text-slate-100",
                                error
                                    ? "border-rose-500 focus:ring-3 focus:ring-rose-500/20"
                                    : "border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/10"
                            )}
                        />
                        {error && (
                            <p className="text-[11px] font-semibold text-rose-500">
                                {error}
                            </p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="w-full flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1 h-11 text-xs font-bold border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/80 rounded-2xl cursor-pointer"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                        >
                            Kembali
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 h-11 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 shadow-md shadow-rose-200/50 dark:shadow-none hover:shadow-lg focus:ring-3 focus:ring-rose-500/20"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <IconLoader2 size={16} className="animate-spin" />
                            ) : (
                                <IconX size={16} />
                            )}
                            <span>Lakukan Pembatalan</span>
                        </Button>
                    </div>
                </form>
            </div>
        </BaseDialog>
    );
}
