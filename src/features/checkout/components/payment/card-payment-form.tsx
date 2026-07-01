"use client";

import { FormInput } from "@/components/forms/form-input";
import { useFormContext, useWatch } from "react-hook-form";
import { IconCreditCard } from "@tabler/icons-react";

interface CardPaymentFormProps {
    isProcessing: boolean;
}

export function CardPaymentForm({ isProcessing }: CardPaymentFormProps) {
    const { setValue, control } = useFormContext();
    const cardType = useWatch({ control, name: "cardType" }) || "debit";
    const cardLast4 = useWatch({ control, name: "cardLast4" }) || "";
    const cardRef = useWatch({ control, name: "cardRef" }) || "";

    return (
        <div className="space-y-4">
            {/* Card Type Selection (Segmented Control) */}
            <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Jenis Kartu
                </label>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => setValue("cardType", "debit")}
                        className={`py-3 px-4 rounded-xl border-2 font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                            cardType === "debit"
                                ? "border-indigo-650 bg-indigo-50/30 text-indigo-700 shadow-sm"
                                : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                        }`}
                        disabled={isProcessing}
                    >
                        <span className="text-[10px] uppercase tracking-wide">Debit Card</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setValue("cardType", "credit")}
                        className={`py-3 px-4 rounded-xl border-2 font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                            cardType === "credit"
                                ? "border-indigo-650 bg-indigo-50/30 text-indigo-700 shadow-sm"
                                : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                        }`}
                        disabled={isProcessing}
                    >
                        <span className="text-[10px] uppercase tracking-wide">Credit Card</span>
                    </button>
                </div>
            </div>

            {/* Credit Card Visualization Mock */}
            <div className="relative bg-gradient-to-br from-slate-800 to-slate-950 text-white rounded-2xl p-4 shadow-lg overflow-hidden border border-slate-700/50 aspect-[1.586/1] max-w-[280px] mx-auto select-none my-3">
                {/* Glossy overlay effect */}
                <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0)_50%)]" />
                <div className="flex justify-between items-start">
                    <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase">
                        {cardType === "debit" ? "DEBIT CARD" : "CREDIT CARD"}
                    </span>
                    <IconCreditCard size={26} className="text-slate-300 stroke-[1.5]" />
                </div>
                {/* Chip */}
                <div className="w-8 h-6 bg-gradient-to-r from-amber-350 to-yellow-500 rounded-md my-3 border border-amber-400/20 opacity-80" />
                {/* Spaced Digits */}
                <div className="text-sm font-mono tracking-[0.25em] text-slate-200 my-2">
                    •••• •••• •••• {cardLast4 || "••••"}
                </div>
                {/* Expiry / Owner placeholder */}
                <div className="flex justify-between items-end mt-2">
                    <div className="text-[7px] font-mono text-slate-500 leading-tight">
                        <div>EDC TERMINAL</div>
                        <div className="text-[8px] text-slate-300 tracking-wider">MITRA BUANA MOTOR</div>
                    </div>
                    {cardRef && (
                        <div className="text-[7px] font-mono text-right text-slate-450 truncate max-w-[120px]">
                            REF: {cardRef}
                        </div>
                    )}
                </div>
            </div>

            {/* Inputs Panel */}
            <div className="space-y-3">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        4 Digit Terakhir Kartu (Opsional)
                    </label>
                    <FormInput
                        name="cardLast4"
                        type="text"
                        maxLength={4}
                        placeholder="XXXX"
                        className="h-11 border-slate-200 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 rounded-xl tracking-[0.5rem] text-center font-mono text-lg font-bold"
                        disabled={isProcessing}
                        onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                            setValue("cardLast4", val);
                        }}
                        autoFocus
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        No. Referensi EDC (Opsional)
                    </label>
                    <FormInput
                        name="cardRef"
                        type="text"
                        placeholder="Masukkan nomor referensi EDC..."
                        className="h-11 text-xs border-slate-200 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 rounded-xl font-bold"
                        disabled={isProcessing}
                    />
                </div>
            </div>
        </div>
    );
}
