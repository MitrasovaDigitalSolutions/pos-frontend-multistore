"use client";

import React, { useState } from "react";
import { CreateMemberDialog } from "./create-member-dialog";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { toast } from "sonner";
import {
    IconPlayerPause,
    IconPlayerPlay,
    IconTrash,
    IconPrinter,
    IconLoader2,
    IconCash,
    IconUser,
    IconX,
} from "@tabler/icons-react";
import { useAllMembers } from "@/features/members/api/members-api";
import { CommandSelect } from "@/components/ui/command-select";
import type { Member } from "@/features/members/types";

interface CheckoutTotalsSectionProps {
    transactionId: number | null;
    cashierName: string;
    trxTime: string;
    subtotal: number;
    ppn: number;
    grandTotal: number;
    cartLength: number;
    isProcessing: boolean;
    selectedMember: Member | null;
    onMemberChange: (member: Member | null) => void;
    onHold: () => void;
    onRecallOpen: () => void;
    onVoid: () => void;
    onPayOpen: () => void;
}

export function CheckoutTotalsSection({
    transactionId,
    cashierName,
    trxTime,
    subtotal,
    ppn,
    grandTotal,
    cartLength,
    isProcessing,
    selectedMember,
    onMemberChange,
    onHold,
    onRecallOpen,
    onVoid,
    onPayOpen,
}: CheckoutTotalsSectionProps) {
    const { data: members = [], isLoading: isMembersLoading } = useAllMembers();
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

    const memberOptions = members
        .filter((m) => m.status === "active")
        .map((m) => ({
            value: String(m.id),
            label: `${m.nama} (${m.kode}) - ${m.poin} Poin`,
        }));

    return (
        <div className="bg-slate-50/70 border-l border-slate-200 flex flex-col h-full overflow-hidden">
            {/* Scrollable Top Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                {/* Header */}
                <div className="flex items-center gap-2 pb-1 select-none">
                    <div className="w-1 h-3.5 bg-emerald-600 rounded-full" />
                    <h3 className="text-[10px] font-black text-slate-700 uppercase tracking-widest leading-none">
                        Ringkasan Penjualan
                    </h3>
                </div>

                {/* Trx Info - Combined 1-row info */}
                <div className="bg-white border border-slate-150 rounded-xl p-3 flex justify-between items-center gap-2 text-[10px] font-bold text-slate-500 shadow-sm leading-none select-none">
                    <div className="truncate">
                        No: <span className="text-slate-800">{transactionId ? `TRX-${transactionId}` : "Belum mulai"}</span>
                    </div>
                    <div className="w-px h-3.5 bg-slate-200 shrink-0" />
                    <div className="truncate">
                        Kasir: <span className="text-slate-800">{cashierName}</span>
                    </div>
                    <div className="w-px h-3.5 bg-slate-200 shrink-0" />
                    <div className="truncate text-slate-800">
                        {trxTime.split(" ").slice(-1)[0] || trxTime}
                    </div>
                </div>

                {/* Member Info */}
                <div className="bg-white border border-slate-100 rounded-xl p-3.5 shadow-sm space-y-2">
                    <div className="flex justify-between items-center text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
                        <span>Pelanggan / Member</span>
                        <div className="flex items-center gap-1.5 select-none">
                            {!selectedMember && (
                                <button
                                    type="button"
                                    onClick={() => setIsAddMemberOpen(true)}
                                    className="text-emerald-750 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-800 px-2.5 py-1 rounded-lg transition-colors cursor-pointer border border-emerald-200 font-black text-[10px] flex items-center gap-0.5 leading-none shadow-sm"
                                >
                                    + Buat Member Baru
                                </button>
                            )}
                            {selectedMember && (
                                <button
                                    onClick={() => onMemberChange(null)}
                                    className="text-rose-550 hover:bg-rose-50 p-1 rounded-md transition-colors cursor-pointer border-none bg-transparent"
                                    title="Hapus Member"
                                >
                                    <IconX size={12} />
                                </button>
                            )}
                        </div>
                    </div>
                    {selectedMember ? (
                        <div className="flex items-center gap-2.5 bg-emerald-50/50 border border-emerald-100 p-2 rounded-xl">
                            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                <IconUser size={14} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="text-xs font-bold text-slate-900 truncate leading-tight">
                                    {selectedMember.nama}
                                </div>
                                <div className="text-[9px] font-bold text-slate-500 truncate leading-none mt-0.5">
                                    {selectedMember.kode} • <span className="text-emerald-600">{selectedMember.poin} Poin</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <CommandSelect
                            options={memberOptions}
                            value=""
                            onChange={(val) => {
                                const found = members.find((m) => String(m.id) === val);
                                if (found) onMemberChange(found);
                            }}
                            placeholder="Pilih member loyalitas..."
                            searchPlaceholder="Cari nama atau kode member..."
                            isLoading={isMembersLoading}
                            size="sm"
                        />
                    )}
                </div>

                {/* Detail Keranjang & Benefit */}
                <div className="bg-white border border-slate-100 rounded-xl p-3.5 shadow-sm space-y-2.5 select-none">
                    <div className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
                        Status Keranjang & Loyalti
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="space-y-0.5">
                            <span className="text-[10px] font-medium text-slate-455">Total Item</span>
                            <div className="font-extrabold text-slate-800">{cartLength} Jenis Produk</div>
                        </div>
                        <div className="space-y-0.5">
                            <span className="text-[10px] font-medium text-slate-455">Loyalty Poin</span>
                            <div className="font-extrabold text-emerald-600 flex items-center gap-1">
                                {selectedMember ? (
                                    <>
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                        <span>+{Math.floor(grandTotal / 10000)} Poin</span>
                                    </>
                                ) : (
                                    <span className="text-slate-400 font-bold">Non-Member</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons Grid - Combined 1-row layout */}
                <div className="grid grid-cols-4 gap-2">
                    <Button
                        variant="outline"
                        onClick={onHold}
                        disabled={cartLength === 0 || isProcessing}
                        className="bg-white hover:bg-slate-50 border-slate-200 text-slate-700 h-10 font-bold text-[9px] rounded-xl flex flex-col justify-center items-center gap-0.5 cursor-pointer disabled:opacity-50 px-1 py-1"
                        title="Hold Transaksi (F5)"
                    >
                        <IconPlayerPause size={14} className="shrink-0 text-slate-500" />
                        <span>Hold</span>
                    </Button>
                    <Button
                        variant="outline"
                        onClick={onRecallOpen}
                        className="bg-white hover:bg-slate-50 border-slate-200 text-slate-700 h-10 font-bold text-[9px] rounded-xl flex flex-col justify-center items-center gap-0.5 cursor-pointer px-1 py-1"
                        title="Recall Transaksi (F6)"
                    >
                        <IconPlayerPlay size={14} className="shrink-0 text-slate-500" />
                        <span>Recall</span>
                    </Button>
                    <Button
                        variant="outline"
                        onClick={onVoid}
                        disabled={cartLength === 0 || isProcessing}
                        className="bg-white hover:bg-rose-50 border-slate-200 hover:border-rose-200 text-rose-600 h-10 font-bold text-[9px] rounded-xl flex flex-col justify-center items-center gap-0.5 cursor-pointer disabled:opacity-50 px-1 py-1"
                        title="Batal Transaksi (F10)"
                    >
                        <IconTrash size={14} className="shrink-0" />
                        <span>Void</span>
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => toast.success("Mencetak ulang struk terakhir...")}
                        className="bg-white hover:bg-slate-50 border-slate-200 text-slate-700 h-10 font-bold text-[9px] rounded-xl flex flex-col justify-center items-center gap-0.5 cursor-pointer px-1 py-1"
                        title="Cetak Ulang Struk (F4)"
                    >
                        <IconPrinter size={14} className="shrink-0 text-slate-500" />
                        <span>Reprint</span>
                    </Button>
                </div>
            </div>

            {/* Fixed Bottom Area (Totals & Pay Button) */}
            <div className="bg-white border-t border-slate-200 p-4 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] shrink-0 space-y-3">
                <div className="space-y-1.5 text-[11px] font-semibold text-slate-400 select-none">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span className="text-slate-800 tabular-nums font-bold">
                            {formatRupiah(subtotal)}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span>Diskon Belanja</span>
                        <span className="text-rose-500 font-bold">
                            - Rp 0
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span>PPN (11%)</span>
                        <span className="text-slate-800 tabular-nums font-bold">
                            {formatRupiah(ppn)}
                        </span>
                    </div>
                </div>

                <div className="border-t border-dashed border-slate-200 pt-3 flex justify-between items-center gap-3">
                    <div className="flex flex-col min-w-0">
                        <span className="text-[9px] font-extrabold text-slate-450 uppercase tracking-widest leading-none">
                            Total Belanja
                        </span>
                        <span className="text-2xl font-extrabold text-emerald-600 tracking-tight tabular-nums mt-1 leading-none truncate">
                            {formatRupiah(grandTotal)}
                        </span>
                    </div>
                    <Button
                        onClick={onPayOpen}
                        disabled={cartLength === 0 || isProcessing}
                        className="h-12 bg-emerald-600 hover:bg-emerald-700 font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-600/10 transition-all active:scale-[0.99] disabled:opacity-50 border-none text-white px-5 shrink-0"
                    >
                        {isProcessing ? (
                            <IconLoader2 size={16} className="animate-spin" />
                        ) : (
                            <IconCash size={16} />
                        )}
                        <span>BAYAR (F1)</span>
                    </Button>
                </div>
            </div>
            <CreateMemberDialog
                open={isAddMemberOpen}
                onOpenChange={setIsAddMemberOpen}
                onSuccess={(newMember) => {
                    onMemberChange(newMember);
                }}
            />
        </div>
    );
}
