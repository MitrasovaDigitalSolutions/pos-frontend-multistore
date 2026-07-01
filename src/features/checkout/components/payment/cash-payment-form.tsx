"use client";

import { FormNominalInput } from "@/components/forms/form-nominal-input";
import { useFormContext, useWatch } from "react-hook-form";
import { IconBackspace, IconCash, IconCoins } from "@tabler/icons-react";
import { formatRupiah } from "@/hooks/use-format-rupiah";

interface CashPaymentFormProps {
    grandTotal: number;
    isProcessing: boolean;
}

function getSmartSuggestions(total: number): number[] {
    if (total <= 0) return [];
    const suggestions = new Set<number>();
    
    const nearest5k = Math.ceil(total / 5000) * 5000;
    if (nearest5k > total) suggestions.add(nearest5k);
    
    const nearest10k = Math.ceil(total / 10000) * 10000;
    if (nearest10k > total) suggestions.add(nearest10k);
    
    const nearest20k = Math.ceil(total / 20000) * 20000;
    if (nearest20k > total) suggestions.add(nearest20k);
    
    const nearest50k = Math.ceil(total / 50000) * 50000;
    if (nearest50k > total) suggestions.add(nearest50k);

    const nearest100k = Math.ceil(total / 100000) * 100000;
    if (nearest100k > total) suggestions.add(nearest100k);
    
    const standardBills = [2000, 5000, 10000, 20000, 50000, 100000, 200000];
    for (const bill of standardBills) {
        if (bill > total) {
            suggestions.add(bill);
        }
    }
    
    const sorted = Array.from(suggestions)
        .filter((val) => val > total)
        .sort((a, b) => a - b);
    
    return sorted.slice(0, 3);
}

export function CashPaymentForm({
    grandTotal,
    isProcessing,
}: CashPaymentFormProps) {
    const { setValue, control } = useFormContext();
    const cashReceived = useWatch({ control, name: "cashReceived" });

    const handleNumpadClick = (val: string) => {
        const currentVal = cashReceived !== null && cashReceived !== undefined ? String(cashReceived) : "";
        if (val === "clear") {
            setValue("cashReceived", null);
        } else if (val === "backspace") {
            if (currentVal.length <= 1) {
                setValue("cashReceived", null);
            } else {
                setValue("cashReceived", parseInt(currentVal.slice(0, -1), 10));
            }
        } else if (val === "000") {
            if (currentVal && currentVal !== "0") {
                setValue("cashReceived", parseInt(currentVal + "000", 10));
            }
        } else {
            const newValStr = currentVal === "0" ? val : currentVal + val;
            const parsed = parseInt(newValStr, 10);
            if (!isNaN(parsed)) {
                setValue("cashReceived", parsed);
            }
        }
    };

    const smartSuggestions = getSmartSuggestions(grandTotal);

    return (
        <div className="space-y-4">
            <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                    <IconCash size={12} className="text-emerald-500" />
                    <span>Nominal Uang Diterima</span>
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
                        autoFocus
                    />
                    {cashReceived && (
                        <button
                            type="button"
                            onClick={() => setValue("cashReceived", null)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/60 px-2.5 py-1 text-[9px] font-bold rounded-lg transition-all cursor-pointer select-none z-10"
                            disabled={isProcessing}
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Smart Suggestions Rows */}
            <div className="space-y-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 select-none">
                    <IconCoins size={12} className="text-slate-400" />
                    <span>Rekomendasi Pembayaran</span>
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                        type="button"
                        onClick={() => setValue("cashReceived", grandTotal)}
                        className={`py-2 px-2.5 text-xs font-bold rounded-xl transition-all border cursor-pointer select-none flex flex-col items-center justify-center ${
                            Number(cashReceived) === grandTotal
                                ? "bg-emerald-600 border-emerald-600 text-white shadow-sm"
                                : "bg-white hover:bg-emerald-50/50 hover:border-emerald-200 border-slate-200 text-emerald-700"
                        }`}
                        disabled={isProcessing || grandTotal <= 0}
                    >
                        <span className="text-[8px] opacity-75 font-bold uppercase tracking-wider">Uang Pas</span>
                        <span className="font-mono mt-0.5 tracking-tight font-extrabold">{formatRupiah(grandTotal)}</span>
                    </button>

                    {smartSuggestions.map((val) => (
                        <button
                            key={val}
                            type="button"
                            onClick={() => setValue("cashReceived", val)}
                            className={`py-2 px-2.5 text-xs font-bold rounded-xl transition-all border cursor-pointer select-none flex flex-col items-center justify-center ${
                                Number(cashReceived) === val
                                    ? "bg-emerald-600 border-emerald-600 text-white shadow-sm"
                                    : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
                            }`}
                            disabled={isProcessing}
                        >
                            <span className="text-[8px] opacity-75 font-semibold uppercase tracking-wider">Uang Kertas</span>
                            <span className="font-mono mt-0.5 tracking-tight font-extrabold">{formatRupiah(val)}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Numeric Keypad */}
            <div className="bg-slate-50/50 border border-slate-100 p-2.5 rounded-2xl">
                <div className="grid grid-cols-3 gap-2 select-none">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <button
                            key={num}
                            type="button"
                            onClick={() => handleNumpadClick(String(num))}
                            className="bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-800 py-2.5 text-base font-black rounded-xl transition-all active:scale-[0.97] cursor-pointer flex items-center justify-center shadow-sm"
                            disabled={isProcessing}
                        >
                            {num}
                        </button>
                    ))}
                    <button
                        type="button"
                        onClick={() => handleNumpadClick("000")}
                        className="bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-800 py-2.5 text-base font-black rounded-xl transition-all active:scale-[0.97] cursor-pointer flex items-center justify-center shadow-sm"
                        disabled={isProcessing}
                    >
                        000
                    </button>
                    <button
                        type="button"
                        onClick={() => handleNumpadClick("0")}
                        className="bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-800 py-2.5 text-base font-black rounded-xl transition-all active:scale-[0.97] cursor-pointer flex items-center justify-center shadow-sm"
                        disabled={isProcessing}
                    >
                        0
                    </button>
                    <button
                        type="button"
                        onClick={() => handleNumpadClick("backspace")}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-650 border border-slate-200/60 py-2.5 rounded-xl transition-all active:scale-[0.97] cursor-pointer flex items-center justify-center shadow-sm"
                        disabled={isProcessing}
                    >
                        <IconBackspace size={18} className="stroke-[2.2]" />
                    </button>
                </div>
            </div>
        </div>
    );
}
