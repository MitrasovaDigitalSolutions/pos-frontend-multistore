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

    return (
        <div className="space-y-4">
            <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Nominal Uang Diterima
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
            <div className="grid grid-cols-3 gap-2">
                {[10000, 20000, 50000, 100000, 200000].map((val) => (
                    <button
                        key={val}
                        type="button"
                        onClick={() => {
                            const current = Number(cashReceived) || 0;
                            setValue("cashReceived", current + val);
                        }}
                        className="bg-slate-50 hover:bg-emerald-50 hover:border-emerald-400 border border-slate-200 text-slate-800 py-2.5 text-xs font-bold rounded-xl transition-all tabular-nums cursor-pointer"
                        disabled={isProcessing}
                    >
                        +{val.toLocaleString("id-ID")}
                    </button>
                ))}
                <button
                    type="button"
                    onClick={() => setValue("cashReceived", grandTotal)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer border-none"
                    disabled={isProcessing}
                >
                    Uang Pas
                </button>
                <button
                    type="button"
                    onClick={() => setValue("cashReceived", null)}
                    className="col-span-3 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer"
                    disabled={isProcessing}
                >
                    Reset Nominal
                </button>
            </div>
        </div>
    );
}
