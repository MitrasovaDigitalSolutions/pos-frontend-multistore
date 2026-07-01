"use client";

import { useState, useEffect } from "react";
import { BaseDialog } from "@/components/ui/base-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconPlayerPlay, IconTrash, IconEdit, IconCheck, IconX } from "@tabler/icons-react";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import type { HoldTransaction } from "../types";

interface HoldListDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    holdList: HoldTransaction[];
    onRecall: (uid: string) => void;
    onClearAll: () => void;
    isProcessing: boolean;
    onRenameHold?: (uid: string, name: string) => void;
}

export function HoldListDialog({
    open,
    onOpenChange,
    holdList,
    onRecall,
    onClearAll,
    isProcessing,
    onRenameHold,
}: HoldListDialogProps) {
    const [editingUid, setEditingUid] = useState<string | null>(null);
    const [editingName, setEditingName] = useState("");

    useEffect(() => {
        if (!open) {
            setEditingUid(null);
            setEditingName("");
        }
    }, [open]);
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
                        holdList.map((h) => {
                            const isEditing = editingUid === h.uid;
                            return (
                                <div
                                    key={h.uid}
                                    className="flex items-center justify-between border border-slate-100 rounded-xl p-4 bg-slate-50/50 gap-4"
                                >
                                    <div className="flex-1 min-w-0">
                                        {isEditing ? (
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    value={editingName}
                                                    onChange={(e) => setEditingName(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") {
                                                            if (editingName.trim()) {
                                                                onRenameHold?.(h.uid, editingName.trim());
                                                                setEditingUid(null);
                                                            }
                                                        } else if (e.key === "Escape") {
                                                            setEditingUid(null);
                                                        }
                                                    }}
                                                    className="h-8 text-xs font-bold flex-1"
                                                    autoFocus
                                                    placeholder="Nama Hold..."
                                                />
                                                <button
                                                    onClick={() => {
                                                        if (editingName.trim()) {
                                                            onRenameHold?.(h.uid, editingName.trim());
                                                            setEditingUid(null);
                                                        }
                                                    }}
                                                    className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer border-none bg-transparent shrink-0"
                                                >
                                                    <IconCheck size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setEditingUid(null)}
                                                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer border-none bg-transparent shrink-0"
                                                >
                                                    <IconX size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <div className="font-bold text-slate-800 text-xs font-mono truncate max-w-[170px]" title={h.name || `TRX #${String(h.uid).slice(-8)}`}>
                                                    {h.name || `TRX #${String(h.uid).slice(-8)}`}
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        setEditingUid(h.uid);
                                                        setEditingName(h.name || `TRX #${String(h.uid).slice(-8)}`);
                                                    }}
                                                    className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer border-none bg-transparent shrink-0"
                                                    title="Ubah Nama"
                                                >
                                                    <IconEdit size={14} />
                                                </button>
                                            </div>
                                        )}
                                        <div className="text-[10px] text-slate-400 mt-1 select-none">
                                            {h.items_count} item ·{" "}
                                            {formatRupiah(h.subtotal)}
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => onRecall(h.uid)}
                                        disabled={isProcessing}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-8 rounded-lg px-3 cursor-pointer border-none shrink-0"
                                    >
                                        Recall
                                    </Button>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </BaseDialog>
    );
}
