"use client";

import { Button } from "@/components/ui/button";
import { CommandSelect } from "@/components/ui/command-select";
import { useAllMembers } from "@/features/members/api/members-api";
import type { Member } from "@/features/members/types";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import {
    IconCash,
    IconLoader2,
    IconPlayerPause,
    IconPlayerPlay,
    IconPrinter,
    IconTrash,
    IconUser,
    IconX,
} from "@tabler/icons-react";
import { useState, useEffect, useCallback } from "react";
import { CreateMemberDialog } from "./create-member-dialog";
import { PayDebtDialog } from "@/features/debts/components/pay-debt-dialog";
import { db } from "@/lib/db";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/stores/settings-store";


interface CheckoutTotalsSectionProps {
    transactionId: string | null;
    cashierName: string;
    trxTime: string;
    subtotal: number;
    ppn: number;
    discountType: "nominal" | "percent";
    discountValue: number;
    discountAmount: number;
    setDiscountType: (type: "nominal" | "percent") => void;
    setDiscountValue: (val: number) => void;
    grandTotal: number;
    cartLength: number;
    isProcessing: boolean;
    selectedMember: Member | null;
    onMemberChange: (member: Member | null) => void;
    onHold: () => void;
    onRecallOpen: () => void;
    onVoid: () => void;
    onPayOpen: () => void;
    onReprint: () => void;
    namaTransaksi: string;
    onNamaTransaksiChange: (name: string) => void;
}

export function CheckoutTotalsSection({
    transactionId,
    cashierName,
    trxTime,
    subtotal,
    ppn,
    discountType,
    discountValue,
    discountAmount,
    setDiscountType,
    setDiscountValue,
    grandTotal,
    cartLength,
    isProcessing,
    selectedMember,
    onMemberChange,
    onHold,
    onRecallOpen,
    onVoid,
    onPayOpen,
    onReprint,
    namaTransaksi,
    onNamaTransaksiChange,
}: CheckoutTotalsSectionProps) {
    const isOnline = useNetworkStatus();
    const { data: membersData = [], isLoading: isMembersLoading } = useAllMembers();
    const [localMembers, setLocalMembers] = useState<Member[]>([]);
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
    const [isPayDebtOpen, setIsPayDebtOpen] = useState(false);
    const getTaxRate = useSettingsStore((state) => state.getTaxRate);
    const ppnRate = getTaxRate();
    const getSetting = useSettingsStore((state) => state.getSetting);
    const pointRate = parseFloat(getSetting("point_rate", "1000")) || 1000;
    const pointSystemEnabled = getSetting("point_system_enabled", "true") === "true";

    const [prevNama, setPrevNama] = useState(namaTransaksi);
    const [localNama, setLocalNama] = useState(namaTransaksi);

    if (namaTransaksi !== prevNama) {
        setPrevNama(namaTransaksi);
        setLocalNama(namaTransaksi);
    }

    const handleParentChange = useCallback((val: string) => {
        if (val !== namaTransaksi) {
            onNamaTransaksiChange(val);
        }
    }, [namaTransaksi, onNamaTransaksiChange]);

    // Debounce updating the parent store when typing
    useEffect(() => {
        const timer = setTimeout(() => {
            handleParentChange(localNama);
        }, 300);
        return () => clearTimeout(timer);
    }, [localNama, handleParentChange]);

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        // If F-keys or Enter are pressed, update immediately before event bubbles/executes parent hotkey
        if (e.key.startsWith("F") || e.key === "Enter") {
            handleParentChange(localNama);
        }
    };

    useEffect(() => {
        let isMounted = true;
        if (!isOnline || membersData.length === 0) {
            db.members.toArray().then((items) => {
                if (isMounted) {
                    setLocalMembers(items);
                }
            });
        }
        return () => {
            isMounted = false;
        };
    }, [membersData, isOnline]);

    const members = isOnline && membersData.length > 0 ? membersData : localMembers;

    const activeMember = selectedMember
        ? (members.find((m) => m.uid === selectedMember.uid) || selectedMember)
        : null;

    const memberOptions = members
        .filter((m) => m.status === "active")
        .map((m) => ({
            value: m.uid,
            label: pointSystemEnabled
                ? `${m.nama} (${m.kode}) - ${m.poin} Poin`
                : `${m.nama} (${m.kode})`,
        }));

    return (
        <div className="bg-slate-50/70 border-l border-slate-200 flex flex-col h-full overflow-hidden">
            {/* Scrollable Top Area */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
                {/* Header */}
                <div className="flex items-center gap-1.5 pb-0.5 select-none">
                    <div className="w-1 h-3 bg-emerald-600 rounded-full" />
                    <h3 className="text-[9px] font-black text-slate-700 uppercase tracking-widest leading-none">
                        Ringkasan Penjualan
                    </h3>
                </div>

                {/* Trx Info - Combined 1-row info */}
                <div className="bg-white border border-slate-150 rounded-xl px-2.5 py-2 flex justify-between items-center gap-2 text-[9px] font-bold text-slate-500 shadow-sm leading-none select-none">
                    <div className="truncate">
                        No: <span className="text-slate-800">{transactionId ? `TRX-${transactionId}` : "Belum mulai"}</span>
                    </div>
                    <div className="w-px h-3 bg-slate-200 shrink-0" />
                    <div className="truncate">
                        Kasir: <span className="text-slate-800">{cashierName}</span>
                    </div>
                    <div className="w-px h-3 bg-slate-200 shrink-0" />
                    <div className="truncate text-slate-800">
                        {trxTime.split(" ").slice(-1)[0] || trxTime}
                    </div>
                </div>

                {/* Nama Transaksi Input */}
                <div className="bg-white border border-slate-100 rounded-xl p-2.5 shadow-sm space-y-1.5">
                    <label htmlFor="nama-transaksi-input" className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block select-none">
                        Nama Transaksi (Opsional)
                    </label>
                    <input
                        id="nama-transaksi-input"
                        type="text"
                        value={localNama}
                        onChange={(e) => setLocalNama(e.target.value)}
                        onBlur={() => handleParentChange(localNama)}
                        onKeyDown={handleInputKeyDown}
                        placeholder="Misal: Meja 5, Pak Budi..."
                        className="w-full h-7 px-2.5 rounded-lg border border-slate-200 bg-transparent text-[11px] font-bold transition-all outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 text-slate-800"
                    />
                </div>

                {/* Member Info */}
                <div className="bg-white border border-slate-100 rounded-xl p-2.5 shadow-sm space-y-1.5">
                    <div className="flex justify-between items-center text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
                        <span>Pelanggan / Member</span>
                        <div className="flex items-center gap-1.5 select-none">
                            {!selectedMember && (
                                <button
                                    type="button"
                                    onClick={() => setIsAddMemberOpen(true)}
                                    className="text-emerald-750 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-800 px-2 py-0.5 rounded-md transition-colors cursor-pointer border border-emerald-200 font-extrabold text-[9px] flex items-center gap-0.5 leading-none shadow-sm"
                                >
                                    + Member Baru
                                </button>
                            )}
                            {selectedMember && (
                                <button
                                    onClick={() => onMemberChange(null)}
                                    className="text-rose-550 hover:bg-rose-50 p-0.5 rounded transition-colors cursor-pointer border-none bg-transparent"
                                    title="Hapus Member"
                                >
                                    <IconX size={12} />
                                </button>
                            )}
                        </div>
                    </div>
                    {selectedMember ? (
                        <div className="space-y-2 animate-in fade-in duration-300">
                            {/* Member basic info card */}
                            <div className="flex items-center gap-3 bg-white border border-slate-200/80 p-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100/50">
                                    <IconUser size={16} className="stroke-[2.2]" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="text-[12px] font-black text-slate-800 truncate leading-tight">
                                        {selectedMember.nama}
                                    </div>
                                    <div className="text-[10px] font-bold text-slate-400 truncate leading-none mt-1">
                                        {selectedMember.kode}{pointSystemEnabled && ` • `}{pointSystemEnabled && <span className="text-emerald-600 font-extrabold">{selectedMember.poin} Poin</span>}
                                    </div>
                                </div>
                            </div>

                            {/* Highly interactive debt notification banner */}
                            {activeMember && (activeMember.hutang || 0) > 0 && (
                                <div className="bg-gradient-to-r from-rose-50 to-rose-100/50 border border-rose-200/80 p-3 rounded-xl flex items-center justify-between gap-3 shadow-sm shadow-rose-100 animate-in slide-in-from-top-2 duration-300">
                                    <div className="space-y-0.5">
                                        <span className="text-[9px] font-black text-rose-500 uppercase tracking-wider block">
                                            Ada Tunggakan Hutang
                                        </span>
                                        <span className="text-[14px] font-black text-rose-700 font-mono tracking-tight block leading-none">
                                            {formatRupiah(activeMember.hutang || 0)}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsPayDebtOpen(true)}
                                        className="h-8 px-3 bg-rose-600 hover:bg-rose-700 active:scale-[0.96] text-white border-none rounded-lg text-[10px] font-black flex items-center gap-1.5 cursor-pointer transition-all duration-200 shadow-md shadow-rose-600/20 hover:shadow-lg hover:shadow-rose-650/30"
                                    >
                                        <IconCash size={14} className="stroke-[2.2]" />
                                        <span>BAYAR HUTANG</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <CommandSelect
                            options={memberOptions}
                            value=""
                            onChange={(val) => {
                                const found = members.find((m) => m.uid === val);
                                if (found) onMemberChange(found);
                            }}
                            placeholder="Pilih member loyalitas..."
                            searchPlaceholder="Cari nama atau kode member..."
                            isLoading={isMembersLoading}
                            size="sm"
                        />
                    )}
                </div>

                <div className="bg-white border border-slate-100 rounded-xl p-2.5 shadow-sm space-y-1.5 select-none">
                    <div className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
                        Status Keranjang & Loyalti
                    </div>
                    <div className={cn("grid gap-2 text-[11px]", pointSystemEnabled ? "grid-cols-2" : "grid-cols-1")}>
                        <div className="space-y-0.5">
                            <span className="text-[9px] font-medium text-slate-455">Total Item</span>
                            <div className="font-extrabold text-slate-800">{cartLength} Jenis Produk</div>
                        </div>
                        {pointSystemEnabled && (
                            <div className="space-y-0.5 animate-in fade-in duration-200">
                                <span className="text-[9px] font-medium text-slate-455">Loyalty Poin</span>
                                <div className="font-extrabold text-emerald-600 flex items-center gap-1">
                                    {selectedMember ? (
                                        <>
                                            <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                                            <span>+{Math.floor(grandTotal / pointRate)} Poin</span>
                                        </>
                                    ) : (
                                        <span className="text-slate-400 font-bold">Non-Member</span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Diskon Transaksi */}
                <div className="bg-white border border-slate-100 rounded-xl p-2.5 shadow-sm space-y-1.5">
                    <div className="flex justify-between items-center text-[9px] font-extrabold text-slate-400 uppercase tracking-wider select-none">
                        <span>Diskon Transaksi</span>
                        {discountAmount > 0 && (
                            <span className="text-emerald-600 font-bold normal-case">
                                Terpasang: -{formatRupiah(discountAmount)}
                            </span>
                        )}
                    </div>

                    <div className="flex gap-2">
                        {/* Toggle Button Group */}
                        <div className="flex bg-slate-100 p-0.5 rounded-lg shrink-0 select-none">
                            <button
                                type="button"
                                onClick={() => {
                                    setDiscountType("nominal");
                                    setDiscountValue(0);
                                }}
                                className={cn(
                                    "px-2 py-0.5 text-[9px] font-black rounded-md transition-all cursor-pointer border-none outline-none",
                                    discountType === "nominal"
                                        ? "bg-white text-slate-800 shadow-sm"
                                        : "text-slate-500 hover:text-slate-700 bg-transparent"
                                )}
                            >
                                Rp
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setDiscountType("percent");
                                    setDiscountValue(0);
                                }}
                                className={cn(
                                    "px-2 py-0.5 text-[9px] font-black rounded-md transition-all cursor-pointer border-none outline-none",
                                    discountType === "percent"
                                        ? "bg-white text-slate-800 shadow-sm"
                                        : "text-slate-500 hover:text-slate-700 bg-transparent"
                                )}
                            >
                                %
                            </button>
                        </div>

                        {/* Input Field */}
                        <div className="relative flex-1">
                            {discountType === "nominal" ? (
                                <input
                                    type="text"
                                    value={discountValue > 0 ? new Intl.NumberFormat("id-ID").format(discountValue) : ""}
                                    onChange={(e) => {
                                        const cleanValue = e.target.value.replace(/\D/g, "");
                                        const val = cleanValue === "" ? 0 : Number(cleanValue);
                                        if (val > subtotal) {
                                            setDiscountValue(subtotal);
                                        } else {
                                            setDiscountValue(val);
                                        }
                                    }}
                                    placeholder="Contoh: 50.000"
                                    className="w-full h-7 pl-2.5 pr-8 rounded-lg border border-slate-200 bg-transparent text-[11px] font-bold transition-all outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50"
                                />
                            ) : (
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={discountValue || ""}
                                    onChange={(e) => {
                                        const val = parseFloat(e.target.value) || 0;
                                        if (val < 0) return;
                                        if (val > 100) {
                                            setDiscountValue(100);
                                        } else {
                                            setDiscountValue(val);
                                        }
                                    }}
                                    placeholder="Contoh: 10"
                                    className="w-full h-7 pl-2.5 pr-8 rounded-lg border border-slate-200 bg-transparent text-[11px] font-bold transition-all outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                            )}
                            {discountValue > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setDiscountValue(0)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 p-0.5 rounded transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center"
                                >
                                    <IconX size={12} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Action Buttons Grid - Compact height */}
                <div className="grid grid-cols-4 gap-1.5">
                    <Button
                        variant="outline"
                        onClick={onHold}
                        disabled={cartLength === 0 || isProcessing}
                        className="bg-white hover:bg-slate-50 border-slate-205 text-slate-700 h-8 font-bold text-[8.5px] rounded-xl flex flex-col justify-center items-center gap-0 leading-none cursor-pointer disabled:opacity-50 px-1"
                        title="Hold Transaksi (F5)"
                    >
                        <IconPlayerPause size={12} className="shrink-0 text-slate-550 mb-0.5" />
                        <span>Hold (F5)</span>
                    </Button>
                    <Button
                        variant="outline"
                        onClick={onRecallOpen}
                        className="bg-white hover:bg-slate-50 border-slate-205 text-slate-700 h-8 font-bold text-[8.5px] rounded-xl flex flex-col justify-center items-center gap-0 leading-none cursor-pointer px-1"
                        title="Recall Transaksi (F6)"
                    >
                        <IconPlayerPlay size={12} className="shrink-0 text-slate-550 mb-0.5" />
                        <span>Recall (F6)</span>
                    </Button>
                    <Button
                        variant="outline"
                        onClick={onVoid}
                        disabled={cartLength === 0 || isProcessing}
                        className="bg-white hover:bg-rose-50 border-slate-205 hover:border-rose-200 text-rose-600 h-8 font-bold text-[8.5px] rounded-xl flex flex-col justify-center items-center gap-0 leading-none cursor-pointer disabled:opacity-50 px-1"
                        title="Batal Transaksi (F10)"
                    >
                        <IconTrash size={12} className="shrink-0 mb-0.5" />
                        <span>Void (F10)</span>
                    </Button>
                    <Button
                        variant="outline"
                        onClick={onReprint}
                        className="bg-white hover:bg-slate-50 border-slate-205 text-slate-750 h-8 font-bold text-[8.5px] rounded-xl flex flex-col justify-center items-center gap-0 leading-none cursor-pointer px-1"
                        title="Cetak Ulang Struk"
                    >
                        <IconPrinter size={12} className="shrink-0 text-slate-550 mb-0.5" />
                        <span>Reprint</span>
                    </Button>
                </div>
            </div>

            {/* Fixed Bottom Area (Totals & Pay Button) */}
            <div className="bg-white border-t border-slate-200 p-3 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] shrink-0 space-y-2">
                <div className="space-y-1 text-[10px] font-semibold text-slate-400 select-none">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span className="text-slate-800 tabular-nums font-bold">
                            {formatRupiah(subtotal)}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span>Diskon Belanja</span>
                        <span className={cn("font-bold", discountAmount > 0 ? "text-rose-550" : "text-slate-800")}>
                            - {formatRupiah(discountAmount)}
                        </span>
                    </div>
                    {ppn > 0 && (
                        <div className="flex justify-between">
                            <span>Pajak (PPN {ppnRate}%)</span>
                            <span className="text-slate-800 tabular-nums font-bold">
                                {formatRupiah(ppn)}
                            </span>
                        </div>
                    )}
                </div>

                <div className="border-t border-dashed border-slate-200 pt-2 flex justify-between items-center gap-3">
                    <div className="flex flex-col min-w-0">
                        <span className="text-[9px] font-extrabold text-slate-450 uppercase tracking-widest leading-none">
                            Total Belanja
                        </span>
                        <span className="text-2xl font-black text-emerald-600 tracking-tight tabular-nums mt-0.5 leading-none truncate font-mono">
                            {formatRupiah(grandTotal)}
                        </span>
                    </div>
                    <Button
                        onClick={onPayOpen}
                        disabled={cartLength === 0 || isProcessing}
                        className="h-11 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 transition-all active:scale-[0.98] disabled:opacity-50 border-none text-white px-5 shrink-0"
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
            <PayDebtDialog
                open={isPayDebtOpen}
                onOpenChange={setIsPayDebtOpen}
                member={activeMember}
                onSuccess={(updatedMember) => {
                    onMemberChange(updatedMember);
                }}
            />
        </div>
    );
}