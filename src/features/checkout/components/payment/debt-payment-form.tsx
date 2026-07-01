"use client";

import { FormNominalInput } from "@/components/forms/form-nominal-input";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { toast } from "sonner";
import type { Member } from "@/features/members/types";
import { useFormContext, useWatch } from "react-hook-form";
import { IconNotebook, IconAlertCircle, IconUser } from "@tabler/icons-react";

interface DebtPaymentFormProps {
    selectedMember: Member | null;
    grandTotal: number;
    isProcessing: boolean;
}

export function DebtPaymentForm({
    selectedMember,
    grandTotal,
    isProcessing,
}: DebtPaymentFormProps) {
    const { setValue, control } = useFormContext();
    const cashReceived = useWatch({ control, name: "cashReceived" });

    if (!selectedMember) {
        return (
            <div className="bg-rose-50/50 border-2 border-dashed border-rose-100 p-6 rounded-2xl text-center select-none">
                <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-3 border border-rose-100/60 shadow-sm animate-pulse">
                    <IconAlertCircle size={20} className="stroke-[2.2]" />
                </div>
                <p className="text-xs font-black text-rose-800 uppercase tracking-wider">Member Belum Pilih</p>
                <p className="text-[10px] text-rose-500/80 mt-1.5 leading-relaxed max-w-xs mx-auto font-bold">
                    Metode pembayaran hutang hanya tersedia untuk member terdaftar. Silakan pilih member terlebih dahulu di layar kasir.
                </p>
            </div>
        );
    }

    const cashNum = Number(cashReceived) || 0;
    const remainingDebt = grandTotal - cashNum;

    return (
        <div className="space-y-4">
            {/* Selected Member Info Card (VIP Premium Card style) */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-slate-900/50 p-4 rounded-2xl flex items-center justify-between shadow-md shadow-slate-900/5 select-none relative overflow-hidden">
                <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-24 h-24 rounded-full bg-white/5 pointer-events-none" />
                <div className="z-10 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-350 border border-slate-700/60 flex items-center justify-center shrink-0">
                        <IconUser size={18} className="stroke-[2]" />
                    </div>
                    <div>
                        <span className="text-[8px] font-black text-rose-400 uppercase tracking-widest bg-rose-950/40 border border-rose-900/30 px-1.5 py-0.5 rounded-md">MEMBER ACCOUNT</span>
                        <h4 className="font-extrabold text-sm text-slate-100 mt-2 tracking-wide">{selectedMember.nama}</h4>
                        <span className="text-[10px] text-slate-400 tracking-wider font-mono">{selectedMember.kode}</span>
                    </div>
                </div>
                <div className="text-right z-10">
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Hutang Aktif</span>
                    <h4 className="font-black text-rose-400 text-sm sm:text-base mt-1.5 tabular-nums">{formatRupiah(selectedMember.hutang || 0)}</h4>
                </div>
            </div>

            {/* DP / Down Payment Input */}
            <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                    <IconNotebook size={12} className="text-slate-500" />
                    <span>Uang Muka / DP (Tunai) - Opsional</span>
                </label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg select-none z-10">
                        Rp
                    </span>
                    <FormNominalInput
                        name="cashReceived"
                        placeholder="0"
                        className="h-12 pl-11 pr-24 text-xl font-extrabold text-slate-900 bg-white border-2 border-slate-200 focus-visible:border-emerald-500 focus-visible:ring-emerald-500 rounded-xl relative transition-all"
                        disabled={isProcessing}
                        onValueChange={(val) => {
                            if (val !== null && val >= grandTotal) {
                                toast.warning("Uang muka harus kurang dari total tagihan.");
                                setValue("cashReceived", null);
                            }
                        }}
                        autoFocus
                    />
                    {cashReceived && (
                        <button
                            type="button"
                            onClick={() => setValue("cashReceived", null)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/60 px-2.5 py-1 text-[9px] font-bold rounded-lg transition-all cursor-pointer select-none z-10"
                            disabled={isProcessing}
                        >
                            Reset
                        </button>
                    )}
                </div>
            </div>

            {/* Sisa Hutang Baru Breakdown */}
            <div className="bg-rose-50/30 border border-rose-100/60 p-4 rounded-2xl text-center select-none">
                <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">
                    Sisa Hutang Baru Yang Dicatat
                </span>
                <h2 className="text-2xl font-black mt-1.5 tracking-tight tabular-nums text-rose-600">
                    {formatRupiah(remainingDebt)}
                </h2>
                <p className="text-[9px] text-rose-500/80 mt-1 font-bold">
                    Catatan: Sisa tagihan akan ditambahkan ke total hutang member.
                </p>
            </div>
        </div>
    );
}
