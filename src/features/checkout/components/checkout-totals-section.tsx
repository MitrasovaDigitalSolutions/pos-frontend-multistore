"use client";

import { AppButton } from "@/components/shared/app-button";
import { CommandSelect } from "@/components/ui/command-select";
import { PayDebtDialog } from "@/features/debts/components/pay-debt-dialog";
import { useAllMembers } from "@/features/master/members/api/members-api";
import type { Member } from "@/features/master/members/types";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/stores/settings-store";
import {
    IconCash,
    IconPlayerPause,
    IconPlayerPlay,
    IconPrinter,
    IconTrash,
    IconUser,
    IconX
} from "@tabler/icons-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CreateMemberDialog } from "./create-member-dialog";


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

    const [pendingDebtMap, setPendingDebtMap] = useState<Record<string, number>>({});

    const loadPendingDebts = useCallback(async () => {
        try {
            const pending = await db.offlineDebtPayments
                .where("status")
                .equals("pending")
                .toArray();
            const map: Record<string, number> = {};
            for (const p of pending) {
                map[p.member_uid] = (map[p.member_uid] || 0) + (p.amount || 0);
            }
            setPendingDebtMap(map);
        } catch (err) {
            console.error("Gagal membaca pending debt payments:", err);
        }
    }, []);

    const reloadLocalMembers = useCallback(() => {
        db.members.toArray().then((items) => {
            setLocalMembers(items);
        });
        loadPendingDebts();
    }, [loadPendingDebts]);

    useEffect(() => {
        let isMounted = true;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadPendingDebts();
        if (!isOnline || membersData.length === 0) {
            db.members.toArray().then((items) => {
                if (isMounted) {
                    setLocalMembers(items);
                }
            });
        }

        const handleMemberUpdated = () => {
            if (isMounted) {
                reloadLocalMembers();
            }
        };

        if (typeof window !== "undefined") {
            window.addEventListener("pos_member_updated", handleMemberUpdated);
            window.addEventListener("pos_catalog_synced", handleMemberUpdated);
        }

        return () => {
            isMounted = false;
            if (typeof window !== "undefined") {
                window.removeEventListener("pos_member_updated", handleMemberUpdated);
                window.removeEventListener("pos_catalog_synced", handleMemberUpdated);
            }
        };
    }, [membersData, isOnline, reloadLocalMembers, loadPendingDebts]);

    const members = useMemo(() => {
        if (isOnline && membersData.length > 0) {
            return membersData.map((m) => {
                const pendingDeduction = pendingDebtMap[m.uid] || 0;
                if (pendingDeduction > 0) {
                    return {
                        ...m,
                        hutang: Math.max(0, (m.hutang || 0) - pendingDeduction),
                    };
                }
                return m;
            });
        }
        return localMembers;
    }, [isOnline, membersData, localMembers, pendingDebtMap]);

    const activeMember = useMemo(() => {
        if (!selectedMember) return null;
        const match = members.find((m) => m.uid === selectedMember.uid);
        if (!match) return selectedMember;

        return {
            ...match,
            ...selectedMember,
            hutang: match.hutang,
        };
    }, [selectedMember, members]);

    const memberOptions = members
        .filter((m) => m.status === "active")
        .map((m) => ({
            value: m.uid,
            label: pointSystemEnabled
                ? `${m.nama} (${m.kode}) - ${m.poin} Poin`
                : `${m.nama} (${m.kode})`,
        }));

    return (
        <div className="bg-slate-50/80 border-l border-slate-200 flex flex-col h-full overflow-hidden select-none">
            {/* Top Header & Live Customer Total Display */}
            <div className="p-3.5 bg-white border-b border-slate-200/80 shrink-0 space-y-3 shadow-xs">
                {/* Cashier & Trx Header Info */}
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                    <div className="flex items-center gap-1.5 truncate">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-slate-800 font-extrabold truncate">
                            {transactionId ? `TRX-${transactionId}` : "Transaksi Baru"}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[10px] font-bold">
                            {cashierName || "Kasir"}
                        </span>
                        <span className="text-slate-400 text-[10px]">
                            {trxTime.split(" ").slice(-1)[0] || trxTime}
                        </span>
                    </div>
                </div>

                {/* High-Visibility Hero Total Display Card */}
                <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white rounded-2xl p-4 shadow-lg shadow-emerald-600/20 relative overflow-hidden border border-emerald-500/30">
                    <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />
                    <div className="flex items-center justify-between relative z-10">
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-100 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                            TOTAL HARUS DIBAYAR
                        </span>
                        <span className="bg-emerald-950/40 text-emerald-100 border border-emerald-400/30 text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-full">
                            {cartLength} Item
                        </span>
                    </div>
                    <div className="mt-2.5 flex items-baseline justify-between relative z-10">
                        <h2 className="text-3xl sm:text-4xl font-black tracking-tight tabular-nums font-mono text-white drop-shadow-sm leading-none">
                            {formatRupiah(grandTotal)}
                        </h2>
                    </div>
                </div>
            </div>

            {/* Scrollable Middle Body */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-3 min-h-0">
                {/* Nama Transaksi Card */}
                <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-xs space-y-1.5">
                    <label htmlFor="nama-transaksi-input" className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                        Nama Transaksi / Catatan
                    </label>
                    <input
                        id="nama-transaksi-input"
                        type="text"
                        value={localNama}
                        onChange={(e) => setLocalNama(e.target.value)}
                        onBlur={() => handleParentChange(localNama)}
                        onKeyDown={handleInputKeyDown}
                        placeholder="Misal: Meja 5, Budi, Order GoFood..."
                        className="w-full h-8 px-3 rounded-lg border border-slate-200 bg-slate-50/50 text-xs font-bold transition-all outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
                    />
                </div>

                {/* Member Selection Card */}
                <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-xs space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                        <span>Pelanggan / Member</span>
                        <div>
                            {!selectedMember ? (
                                <button
                                    type="button"
                                    onClick={() => setIsAddMemberOpen(true)}
                                    className="text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-md transition-colors cursor-pointer border border-emerald-200 font-black text-[9px] flex items-center gap-0.5 leading-none shadow-xs"
                                >
                                    + Member Baru
                                </button>
                            ) : (
                                <button
                                    onClick={() => onMemberChange(null)}
                                    className="text-rose-500 hover:bg-rose-50 p-0.5 rounded transition-colors cursor-pointer border-none bg-transparent"
                                    title="Hapus Member"
                                >
                                    <IconX size={13} />
                                </button>
                            )}
                        </div>
                    </div>

                    {selectedMember ? (
                        <div className="space-y-2 animate-in fade-in duration-200">
                            <div className="flex items-center justify-between bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl gap-2">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200/60 font-bold">
                                        <IconUser size={18} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="text-xs font-black text-slate-800 truncate leading-tight">
                                            {selectedMember.nama}
                                        </div>
                                        <div className="text-[10px] font-bold text-slate-400 truncate leading-none mt-1">
                                            {selectedMember.kode}{pointSystemEnabled && ` • `}{pointSystemEnabled && <span className="text-emerald-600 font-extrabold">{selectedMember.poin} Poin</span>}
                                        </div>
                                    </div>
                                </div>
                                {pointSystemEnabled && grandTotal > 0 && (
                                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-extrabold px-2.5 py-1 rounded-lg shrink-0 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span>+{Math.floor(grandTotal / pointRate)} Poin</span>
                                    </div>
                                )}
                            </div>

                            {activeMember && (activeMember.hutang || 0) > 0 && (
                                <div className="bg-rose-50 border border-rose-200 p-2.5 rounded-xl flex items-center justify-between gap-2 shadow-xs">
                                    <div>
                                        <span className="text-[9px] font-black text-rose-500 uppercase tracking-wider block">
                                            Tunggakan Hutang
                                        </span>
                                        <span className="text-xs font-black text-rose-700 font-mono">
                                            {formatRupiah(activeMember.hutang || 0)}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsPayDebtOpen(true)}
                                        className="h-7 px-2.5 bg-rose-600 hover:bg-rose-700 text-white border-none rounded-lg text-[9.5px] font-black flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                                    >
                                        <IconCash size={13} />
                                        <span>BAYAR</span>
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

                {/* Cart Status & Diskon Transaksi Card */}
                <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-xs space-y-2.5">
                    <div className="flex justify-between items-center text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                        <span>Diskon Transaksi</span>
                        {discountAmount > 0 && (
                            <span className="text-emerald-600 font-bold normal-case">
                                Terpasang: -{formatRupiah(discountAmount)}
                            </span>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <div className="flex bg-slate-100 p-0.5 rounded-lg shrink-0">
                            <button
                                type="button"
                                onClick={() => {
                                    setDiscountType("nominal");
                                    setDiscountValue(0);
                                }}
                                className={cn(
                                    "px-2.5 py-1 text-[10px] font-black rounded-md transition-all cursor-pointer border-none outline-none",
                                    discountType === "nominal"
                                        ? "bg-white text-slate-800 shadow-xs"
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
                                    "px-2.5 py-1 text-[10px] font-black rounded-md transition-all cursor-pointer border-none outline-none",
                                    discountType === "percent"
                                        ? "bg-white text-slate-800 shadow-xs"
                                        : "text-slate-500 hover:text-slate-700 bg-transparent"
                                )}
                            >
                                %
                            </button>
                        </div>

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
                                    placeholder="Nominal diskon (misal 10.000)..."
                                    className="w-full h-8 pl-3 pr-8 rounded-lg border border-slate-200 bg-slate-50/50 text-xs font-bold transition-all outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
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
                                    placeholder="Persen diskon (misal 10)..."
                                    className="w-full h-8 pl-3 pr-8 rounded-lg border border-slate-200 bg-slate-50/50 text-xs font-bold transition-all outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                            )}
                            {discountValue > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setDiscountValue(0)}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 p-0.5 rounded transition-colors cursor-pointer border-none bg-transparent"
                                >
                                    <IconX size={13} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Actions Bar (Hold, Recall, Void, Reprint) */}
                <div className="grid grid-cols-4 gap-1.5">
                    <AppButton
                        type="button"
                        variant="outline"
                        onClick={onHold}
                        disabled={cartLength === 0 || isProcessing}
                        className="bg-white hover:bg-slate-100 border-slate-200 text-slate-700 h-9 font-extrabold text-[9px] rounded-xl flex flex-col justify-center items-center gap-0.5 cursor-pointer disabled:opacity-50 transition-all shadow-xs"
                        title="Hold Transaksi (F5)"
                    >
                        <IconPlayerPause size={13} className="text-slate-600" />
                        <span>Hold (F5)</span>
                    </AppButton>
                    <AppButton
                        type="button"
                        variant="outline"
                        onClick={onRecallOpen}
                        className="bg-white hover:bg-slate-100 border-slate-200 text-slate-700 h-9 font-extrabold text-[9px] rounded-xl flex flex-col justify-center items-center gap-0.5 cursor-pointer transition-all shadow-xs"
                        title="Recall Transaksi (F6)"
                    >
                        <IconPlayerPlay size={13} className="text-slate-600" />
                        <span>Recall (F6)</span>
                    </AppButton>
                    <AppButton
                        type="button"
                        variant="outline"
                        onClick={onVoid}
                        disabled={cartLength === 0 || isProcessing}
                        className="bg-white hover:bg-rose-50 border-slate-200 hover:border-rose-200 text-rose-600 h-9 font-extrabold text-[9px] rounded-xl flex flex-col justify-center items-center gap-0.5 cursor-pointer disabled:opacity-50 transition-all shadow-xs"
                        title="Batal Transaksi (F10)"
                    >
                        <IconTrash size={13} />
                        <span>Void (F10)</span>
                    </AppButton>
                    <AppButton
                        type="button"
                        variant="outline"
                        onClick={onReprint}
                        className="bg-white hover:bg-slate-100 border-slate-200 text-slate-700 h-9 font-extrabold text-[9px] rounded-xl flex flex-col justify-center items-center gap-0.5 cursor-pointer transition-all shadow-xs"
                        title="Cetak Ulang Struk"
                    >
                        <IconPrinter size={13} className="text-slate-600" />
                        <span>Reprint</span>
                    </AppButton>
                </div>
            </div>

            {/* Fixed Bottom Action Footer */}
            <div className="bg-white border-t border-slate-200/80 p-3.5 shrink-0 space-y-3 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
                <div className="space-y-1 text-xs font-semibold text-slate-500 px-0.5">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span className="text-slate-800 tabular-nums font-bold font-mono">
                            {formatRupiah(subtotal)}
                        </span>
                    </div>
                    {discountAmount > 0 && (
                        <div className="flex justify-between">
                            <span>Diskon Belanja</span>
                            <span className="font-bold text-rose-500 font-mono">
                                - {formatRupiah(discountAmount)}
                            </span>
                        </div>
                    )}
                    {ppn > 0 && (
                        <div className="flex justify-between">
                            <span>Pajak (PPN {ppnRate}%)</span>
                            <span className="text-slate-800 tabular-nums font-bold font-mono">
                                {formatRupiah(ppn)}
                            </span>
                        </div>
                    )}
                </div>

                <div className="pt-1.5 border-t border-slate-100">
                    <AppButton
                        type="button"
                        onClick={onPayOpen}
                        disabled={cartLength === 0}
                        isLoading={isProcessing}
                        leftIcon={!isProcessing ? <IconCash size={20} /> : null}
                        className="w-full h-12 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-sm rounded-xl flex items-center justify-center gap-2.5 cursor-pointer shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/35 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-40 border-none"
                    >
                        <span>BAYAR SEKARANG (F1)</span>
                    </AppButton>
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
                    setLocalMembers((prev) =>
                        prev.map((m) => (m.uid === updatedMember.uid ? updatedMember : m))
                    );
                    db.members.toArray().then((items) => setLocalMembers(items));
                }}
            />
        </div>
    );
}