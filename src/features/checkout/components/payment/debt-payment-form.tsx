"use client";

import { FormNominalInput } from "@/components/forms/form-nominal-input";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { toast } from "sonner";
import type { Member } from "@/features/members/types";
import { useFormContext, useWatch } from "react-hook-form";

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
            <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl text-center">
                <p className="text-xs font-bold text-rose-800">Member Belum Dipilih</p>
                <p className="text-[10px] text-rose-500 mt-1">
                    Metode pembayaran hutang hanya tersedia untuk member terdaftar. Silakan pilih member terlebih dahulu di layar kasir.
                </p>
            </div>
        );
    }

    const cashNum = Number(cashReceived) || 0;

    return (
        <div className="space-y-4">
            {/* Selected Member Info Card */}
            <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl flex items-center justify-between text-xs">
                <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Member</span>
                    <h4 className="font-bold text-slate-800 mt-0.5">{selectedMember.nama}</h4>
                    <span className="text-[10px] text-slate-500">{selectedMember.kode}</span>
                </div>
                <div className="text-right">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Hutang Aktif</span>
                    <h4 className="font-bold text-rose-600 mt-0.5">{formatRupiah(selectedMember.hutang || 0)}</h4>
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Uang Muka / DP (Tunai) - Opsional
                </label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg select-none z-10">
                        Rp
                    </span>
                    <FormNominalInput
                        name="cashReceived"
                        placeholder="0"
                        className="h-14 pl-12 pr-24 text-2xl font-extrabold text-slate-950 bg-white border-2 border-emerald-500 focus-visible:ring-emerald-600 rounded-xl relative"
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
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer select-none z-10"
                            disabled={isProcessing}
                        >
                            Reset
                        </button>
                    )}
                </div>
            </div>

            <div className="border-t border-dashed border-slate-200 pt-3.5 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Sisa Hutang Baru Yang Dicatat
                </span>
                <h2 className="text-3xl font-extrabold mt-1 tracking-tight tabular-nums text-rose-500">
                    {formatRupiah(grandTotal - cashNum)}
                </h2>
            </div>
        </div>
    );
}
