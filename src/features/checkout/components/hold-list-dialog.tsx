"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IconPlayerPlay } from "@tabler/icons-react";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import type { HoldTransaction } from "../types";

interface HoldListDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    holdList: HoldTransaction[];
    onRecall: (id: number) => void;
    isProcessing: boolean;
}

export function HoldListDialog({
    open,
    onOpenChange,
    holdList,
    onRecall,
    isProcessing,
}: HoldListDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-120 bg-white rounded-2xl border-slate-100 p-6">
                <DialogHeader className="pb-4 border-b border-slate-100">
                    <DialogTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <IconPlayerPlay
                            size={20}
                            className="text-emerald-500"
                        />
                        <span>Daftar Transaksi Hold</span>
                    </DialogTitle>
                </DialogHeader>
                <div className="pt-4 space-y-2 max-h-87.5 overflow-y-auto">
                    {holdList.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 text-xs">
                            Tidak ada transaksi yang di-hold.
                        </div>
                    ) : (
                        holdList.map((h) => (
                            <div
                                key={h.id}
                                className="flex items-center justify-between border border-slate-100 rounded-xl p-4 bg-slate-50/50"
                            >
                                <div>
                                    <div className="font-bold text-slate-800 text-xs font-mono">
                                        TRX #{h.id}
                                    </div>
                                    <div className="text-[10px] text-slate-400 mt-1">
                                        {h.items_count} item ·{" "}
                                        {formatRupiah(h.subtotal)}
                                    </div>
                                </div>
                                <Button
                                    onClick={() => onRecall(h.id)}
                                    disabled={isProcessing}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-8 rounded-lg px-3 cursor-pointer border-none"
                                >
                                    Recall
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
