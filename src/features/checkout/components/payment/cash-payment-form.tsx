"use client";

import { FormNominalInput } from "@/components/forms/form-nominal-input";
import { useFormContext, useWatch } from "react-hook-form";

interface CashPaymentFormProps {
    grandTotal: number;
    isProcessing: boolean;
}

export function CashPaymentForm({
    grandTotal,
    isProcessing,
}: CashPaymentFormProps) {
    const { setValue, control } = useFormContext();
    const cashReceived = useWatch({ control, name: "cashReceived" });

    const quickNominals = [500, 1000, 2000, 5000, 10000, 20000, 50000, 100000];

    return (
        <div className="space-y-5 animate-in fade-in-50 duration-200">
            {/* Input Nominal Card */}
            <div className="bg-slate-50/50 border border-slate-100 p-5 rounded-2xl space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    Uang Diterima (Cash)
                </label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-extrabold text-lg select-none z-10 font-mono">
                        Rp
                    </span>
                    <FormNominalInput
                        name="cashReceived"
                        placeholder="0"
                        className="h-14 pl-11 pr-20 text-2xl font-black text-slate-900 bg-white border border-slate-200/80 focus-visible:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/20 rounded-xl relative transition-all shadow-sm font-mono tracking-tight"
                        disabled={isProcessing}
                        autoFocus
                    />
                    {cashReceived !== null && cashReceived !== undefined && (
                        <button
                            type="button"
                            onClick={() => setValue("cashReceived", null)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-600 px-3 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer select-none z-10 border-none"
                            disabled={isProcessing}
                        >
                            Reset
                        </button>
                    )}
                </div>
            </div>

            {/* Additive Quick Cash Row */}
            <div className="space-y-3 px-1">
                <div className="flex justify-between items-center select-none">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                        Pilihan Cepat
                    </span>
                    <button
                        type="button"
                        onClick={() => setValue("cashReceived", grandTotal)}
                        className={`h-7 px-3 text-[10px] font-extrabold rounded-lg transition-all border cursor-pointer select-none flex items-center justify-center active:scale-98 ${
                            Number(cashReceived) === grandTotal
                                ? "bg-emerald-600 border-emerald-600 text-white shadow-emerald-600/10 font-extrabold"
                                : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
                        }`}
                        disabled={isProcessing || grandTotal <= 0}
                    >
                        Uang Pas
                    </button>
                </div>

                <div className="grid grid-cols-4 gap-2">
                    {quickNominals.map((val) => {
                        const label = val >= 1000 ? `+${val / 1000}k` : `+${val}`;
                        return (
                            <button
                                key={val}
                                type="button"
                                onClick={() => {
                                    const current = Number(cashReceived) || 0;
                                    setValue("cashReceived", current + val);
                                }}
                                className="h-10 text-xs font-bold rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:border-slate-300 shadow-sm active:scale-95 transition-all select-none flex items-center justify-center font-mono"
                                disabled={isProcessing}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
