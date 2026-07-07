"use client";

import { FormInput } from "@/components/forms/form-input";
import { useFormContext, useWatch } from "react-hook-form";

interface CardPaymentFormProps {
    isProcessing: boolean;
}

export function CardPaymentForm({ isProcessing }: CardPaymentFormProps) {
    const { setValue, control } = useFormContext();
    const cardType = useWatch({ control, name: "cardType" }) || "debit";

    return (
        <div className="space-y-5 animate-in fade-in-50 duration-200">
            {/* Card Type Selection (Segmented Control) */}
            <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block select-none">
                    Jenis Kartu
                </label>
                <div className="bg-slate-100/80 p-1 rounded-xl grid grid-cols-2 select-none border border-slate-200/40">
                    <button
                        type="button"
                        onClick={() => setValue("cardType", "debit")}
                        className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border-none ${
                            cardType === "debit"
                                ? "bg-white text-slate-900 shadow-sm font-extrabold"
                                : "bg-transparent text-slate-500 hover:text-slate-700"
                        }`}
                        disabled={isProcessing}
                    >
                        Debit Card
                    </button>
                    <button
                        type="button"
                        onClick={() => setValue("cardType", "credit")}
                        className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border-none ${
                            cardType === "credit"
                                ? "bg-white text-slate-900 shadow-sm font-extrabold"
                                : "bg-transparent text-slate-500 hover:text-slate-700"
                        }`}
                        disabled={isProcessing}
                    >
                        Credit Card
                    </button>
                </div>
            </div>

            {/* Inputs Panel */}
            <div className="bg-slate-50/50 border border-slate-100 p-5 rounded-2xl space-y-4">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">
                        4 Digit Terakhir Kartu (Opsional)
                    </label>
                    <FormInput
                        name="cardLast4"
                        type="text"
                        maxLength={4}
                        placeholder="XXXX"
                        className="h-11 border-slate-200/80 focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 rounded-xl text-center font-mono font-bold text-sm tracking-widest"
                        disabled={isProcessing}
                        onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                            setValue("cardLast4", val);
                        }}
                        autoFocus
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">
                        No. Referensi EDC (Opsional)
                    </label>
                    <FormInput
                        name="cardRef"
                        type="text"
                        placeholder="Masukkan nomor referensi transaksi..."
                        className="h-11 text-xs border-slate-200/80 focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 rounded-xl px-3.5"
                        disabled={isProcessing}
                    />
                </div>
            </div>
        </div>
    );
}
