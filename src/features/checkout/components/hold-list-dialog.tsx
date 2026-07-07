"use client";

import { BaseDialog } from "@/components/ui/base-dialog";
import { Button } from "@/components/ui/button";
import { IconPlayerPlay, IconTrash } from "@tabler/icons-react";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import type { HoldTransaction } from "../types";

interface HoldListDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    holdList: HoldTransaction[];
    onRecall: (uid: string) => void;
    onClearAll: () => void;
    isProcessing: boolean;
}

export function HoldListDialog({
    open,
    onOpenChange,
    holdList,
    onRecall,
    onClearAll,
    isProcessing,
}: HoldListDialogProps) {
    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={
                <>
                    <IconPlayerPlay size={20} className="text-emerald-500" />
                    <span>Daftar Transaksi Hold</span>
                </>
            }
            className="max-w-120"
        >
            {/* List with "Hapus Semua" button at top-right of content */}
            <div className="pt-4 relative">
                {holdList.length > 0 && (
                    <button
                        onClick={onClearAll}
                        disabled={isProcessing}
                        className="absolute top-0 right-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer border border-rose-200 hover:border-rose-300 bg-transparent flex items-center gap-1 active:scale-95 disabled:opacity-50"
                    >
                        <IconTrash size={13} />
                        Hapus Semua
                    </button>
                )}

                <div className="space-y-2 max-h-87.5 overflow-y-auto mt-8">
                    {holdList.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 text-xs">
                            Tidak ada transaksi yang di-hold.
                        </div>
                    ) : (
                        holdList.map((h) => (
                            <div
                                key={h.uid}
                                className="flex items-center justify-between border border-slate-100 rounded-xl p-4 bg-slate-50/50"
                            >
                                <div>
                                    <div className="font-bold text-slate-800 text-xs font-mono">
                                        TRX #{String(h.uid).slice(-8)}
                                    </div>
                                    {h.nama_transaksi && (
                                        <div className="text-slate-600 text-xs mt-0.5 truncate max-w-48 font-semibold" title={h.nama_transaksi}>
                                            {h.nama_transaksi}
                                        </div>
                                    )}
                                    <div className="text-[10px] text-slate-400 mt-1">
                                        {h.items_count} item ·{" "}
                                        {formatRupiah(h.subtotal)}
                                    </div>
                                </div>
                                <Button
                                    onClick={() => onRecall(h.uid)}
                                    disabled={isProcessing}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-8 rounded-lg px-3 cursor-pointer border-none"
                                >
                                    Recall
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </BaseDialog>
    );
}
