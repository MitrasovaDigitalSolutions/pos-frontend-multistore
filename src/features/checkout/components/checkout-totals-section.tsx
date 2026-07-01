"use client";

import { Button } from "@/components/ui/button";
import { useForm, FormProvider, useWatch } from "react-hook-form";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { FormNominalInput } from "@/components/forms/form-nominal-input";
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
import { useState, useEffect } from "react";
import { CreateMemberDialog } from "./create-member-dialog";
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
    setNamaTransaksi: (name: string) => void;
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
    setNamaTransaksi,
}: CheckoutTotalsSectionProps) {
    const isOnline = useNetworkStatus();
    const { data: membersData = [], isLoading: isMembersLoading } = useAllMembers();
    const [localMembers, setLocalMembers] = useState<Member[]>([]);
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
    const getTaxRate = useSettingsStore((state) => state.getTaxRate);
    const ppnRate = getTaxRate();
    const getSetting = useSettingsStore((state) => state.getSetting);
    const pointRate = parseFloat(getSetting("point_rate", "1000")) || 1000;

    const members = isOnline && membersData.length > 0 ? membersData : localMembers;

    const memberOptions = members
        .filter((m) => m.status === "active")
        .map((m) => ({
            value: m.uid,
            label: `${m.nama} (${m.kode}) - ${m.poin} Poin`,
        }));

    const methods = useForm({
        defaultValues: {
            namaTransaksi: namaTransaksi,
            memberUid: selectedMember?.uid || "",
            discountValue: discountValue || (null as number | null),
        },
    });

    useEffect(() => {
        methods.reset({
            namaTransaksi,
            memberUid: selectedMember?.uid || "",
            discountValue: discountValue || null,
        });
    }, [namaTransaksi, selectedMember, discountValue, methods]);

    const watchedName = useWatch({ control: methods.control, name: "namaTransaksi" });
    const watchedMemberUid = useWatch({ control: methods.control, name: "memberUid" });
    const watchedDiscountValue = useWatch({ control: methods.control, name: "discountValue" });

    useEffect(() => {
        setNamaTransaksi(watchedName);
    }, [watchedName, setNamaTransaksi]);

    useEffect(() => {
        if (watchedMemberUid) {
            const found = members.find((m) => m.uid === watchedMemberUid);
            if (found && (!selectedMember || selectedMember.uid !== watchedMemberUid)) {
                onMemberChange(found);
            }
        } else if (watchedMemberUid === "" && selectedMember) {
            onMemberChange(null);
        }
    }, [watchedMemberUid, members, selectedMember, onMemberChange]);

    useEffect(() => {
        const val = Number(watchedDiscountValue) || 0;
        if (discountType === "nominal") {
            if (val > subtotal) {
                setDiscountValue(subtotal);
                methods.setValue("discountValue", subtotal);
            } else {
                setDiscountValue(val);
            }
        } else {
            if (val > 100) {
                setDiscountValue(100);
                methods.setValue("discountValue", 100);
            } else {
                setDiscountValue(val);
            }
        }
    }, [watchedDiscountValue, discountType, subtotal, setDiscountValue, methods]);

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

    return (
        <FormProvider {...methods}>
            <div className="bg-slate-50/70 border-l border-slate-200 flex flex-col h-full overflow-hidden">
                {/* Scrollable Top Area */}
                <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 min-h-0">
                    {/* Header & Trx Info */}
                    <div className="flex flex-col select-none border-b border-slate-100 pb-3 mt-1">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-4 bg-emerald-600 rounded-full" />
                                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest leading-none">
                                    Checkout
                                </h3>
                            </div>
                            <span className="text-[10px] font-mono font-bold bg-white border border-slate-100 text-slate-600 px-2 py-0.5 rounded-md shadow-sm">
                                {transactionId ? `#${transactionId.slice(-8)}` : "Draft"}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2 font-bold leading-none">
                            <span>Kasir: <span className="text-slate-600">{cashierName}</span></span>
                            <span>{trxTime.split(" ").slice(-1)[0] || trxTime}</span>
                        </div>
                    </div>

                    {/* Card 1: Informasi Transaksi & Member */}
                    <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm space-y-3">
                        <FormInput<{ namaTransaksi: string }>
                            name="namaTransaksi"
                            label="Nama Transaksi (Opsional)"
                            placeholder="Misal: Meja 5, Pak Budi..."
                            className="h-8 text-[11px] border-slate-200 focus-visible:ring-emerald-500 rounded-lg text-slate-800"
                        />
                        <div className="h-px bg-slate-100" />
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                <span>Pelanggan / Member</span>
                                <div className="flex items-center gap-1.5 select-none">
                                    {!selectedMember && (
                                        <button
                                            type="button"
                                            onClick={() => setIsAddMemberOpen(true)}
                                            className="text-emerald-700 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-800 px-2 py-0.5 rounded-md transition-colors cursor-pointer border border-emerald-200 font-bold text-[9px] leading-none shadow-sm"
                                        >
                                            + Member Baru
                                        </button>
                                    )}
                                    {selectedMember && (
                                        <button
                                            onClick={() => {
                                                methods.setValue("memberUid", "");
                                                onMemberChange(null);
                                            }}
                                            className="text-rose-500 hover:bg-rose-50 p-1 rounded-md transition-colors cursor-pointer border-none bg-transparent"
                                            title="Hapus Member"
                                        >
                                            <IconX size={12} />
                                        </button>
                                    )}
                                </div>
                            </div>
                            {selectedMember ? (
                                <div className="flex items-center gap-2 bg-emerald-50/50 border border-emerald-100 p-2 rounded-lg">
                                    <div className="w-7 h-7 rounded-md bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
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
                                <FormSelect<{ memberUid: string }>
                                    name="memberUid"
                                    options={memberOptions}
                                    placeholder="Pilih member loyalitas..."
                                    searchPlaceholder="Cari nama atau kode member..."
                                    isLoading={isMembersLoading}
                                    size="sm"
                                />
                            )}
                        </div>
                    </div>

                    {/* Card 2: Keranjang & Diskon */}
                    <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm space-y-3 select-none">
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="space-y-0.5">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Item</span>
                                <div className="font-extrabold text-slate-700">{cartLength} Produk</div>
                            </div>
                            <div className="space-y-0.5 text-right">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Poin Didapat</span>
                                <div className="font-extrabold text-emerald-600 flex items-center justify-end gap-1">
                                    {selectedMember ? (
                                        <>
                                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                            <span>+{Math.floor(grandTotal / pointRate)} Poin</span>
                                        </>
                                    ) : (
                                        <span className="text-slate-400">Non-Member</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="h-px bg-slate-100" />
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                <span>Diskon Transaksi</span>
                                {discountAmount > 0 && (
                                    <span className="text-emerald-600 font-bold text-[9px] normal-case">
                                        Terpasang: -{formatRupiah(discountAmount)}
                                    </span>
                                )}
                            </div>

                            <div className="flex gap-2">
                                {/* Toggle Button Group */}
                                <div className="flex bg-slate-100 p-0.5 rounded-lg shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setDiscountType("nominal");
                                            setDiscountValue(0);
                                            methods.setValue("discountValue", null);
                                        }}
                                        className={cn(
                                            "px-2.5 py-1 text-[9px] font-black rounded-md transition-all cursor-pointer border-none outline-none",
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
                                            methods.setValue("discountValue", null);
                                        }}
                                        className={cn(
                                            "px-2.5 py-1 text-[9px] font-black rounded-md transition-all cursor-pointer border-none outline-none",
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
                                        <FormNominalInput<{ discountValue: number | null }>
                                            name="discountValue"
                                            placeholder="Contoh: 50.000"
                                            className="w-full h-8 px-2.5 pr-8 rounded-lg border border-slate-200 bg-transparent text-[11px] font-medium transition-all outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 text-slate-800"
                                        />
                                    ) : (
                                        <FormInput<{ discountValue: number | null }>
                                            name="discountValue"
                                            type="number"
                                            placeholder="Contoh: 10"
                                            className="w-full h-8 px-2.5 pr-8 rounded-lg border border-slate-200 bg-transparent text-[11px] font-medium transition-all outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 text-slate-800 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            min="0"
                                            max="100"
                                            onChange={(e) => {
                                                const val = parseFloat(e.target.value) || 0;
                                                if (val > 100) {
                                                    methods.setValue("discountValue", 100);
                                                } else {
                                                    methods.setValue("discountValue", val);
                                                }
                                            }}
                                        />
                                    )}
                                    {discountValue > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setDiscountValue(0);
                                                methods.setValue("discountValue", null);
                                            }}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 p-0.5 rounded transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center z-10"
                                        >
                                            <IconX size={12} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons Grid - Combined 1-row layout */}
                    <div className="grid grid-cols-4 gap-2 select-none">
                        <Button
                            variant="outline"
                            onClick={onHold}
                            disabled={cartLength === 0 || isProcessing}
                            className="bg-white hover:bg-slate-50 border-slate-200 text-slate-700 h-9 font-bold text-[9px] rounded-lg flex flex-col justify-center items-center gap-0.5 cursor-pointer disabled:opacity-50 px-1 py-1"
                            title="Hold Transaksi (F5)"
                        >
                            <IconPlayerPause size={12} className="shrink-0 text-slate-500" />
                            <span>Hold (F5)</span>
                        </Button>
                        <Button
                            variant="outline"
                            onClick={onRecallOpen}
                            className="bg-white hover:bg-slate-50 border-slate-200 text-slate-700 h-9 font-bold text-[9px] rounded-lg flex flex-col justify-center items-center gap-0.5 cursor-pointer px-1 py-1"
                            title="Recall Transaksi (F6)"
                        >
                            <IconPlayerPlay size={12} className="shrink-0 text-slate-500" />
                            <span>Recall (F6)</span>
                        </Button>
                        <Button
                            variant="outline"
                            onClick={onVoid}
                            disabled={cartLength === 0 || isProcessing}
                            className="bg-white hover:bg-rose-50 border-slate-200 hover:border-rose-200 text-rose-600 h-9 font-bold text-[9px] rounded-lg flex flex-col justify-center items-center gap-0.5 cursor-pointer disabled:opacity-50 px-1 py-1"
                            title="Batal Transaksi (F10)"
                        >
                            <IconTrash size={12} className="shrink-0" />
                            <span>Void (F10)</span>
                        </Button>
                        <Button
                            variant="outline"
                            onClick={onReprint}
                            className="bg-white hover:bg-slate-50 border-slate-200 text-slate-750 h-9 font-bold text-[9px] rounded-lg flex flex-col justify-center items-center gap-0.5 cursor-pointer px-1 py-1"
                            title="Cetak Ulang Struk (F4)"
                        >
                            <IconPrinter size={12} className="shrink-0 text-slate-500" />
                            <span>Reprint</span>
                        </Button>
                    </div>
                </div>

                {/* Fixed Bottom Area (Totals & Pay Button) */}
                <div className="bg-white border-t border-slate-200 p-4 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] shrink-0 space-y-3">
                    <div className="space-y-1.5 text-[11px] font-semibold text-slate-450 select-none">
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

                    <div className="border-t border-dashed border-slate-200 pt-3 flex justify-between items-center gap-3">
                        <div className="flex flex-col min-w-0">
                            <span className="text-[9px] font-extrabold text-slate-450 uppercase tracking-widest leading-none">
                                Total Belanja
                            </span>
                            <span className="text-2xl font-black text-emerald-600 tracking-tight mt-1 leading-none truncate tabular-nums">
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
        </FormProvider>
    );
}
