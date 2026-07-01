"use client";

import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { useFormContext } from "react-hook-form";

interface CardPaymentFormProps {
    isProcessing: boolean;
}

export function CardPaymentForm({ isProcessing }: CardPaymentFormProps) {
    const { setValue } = useFormContext();

    return (
        <div className="space-y-3">
            <FormSelect
                name="cardType"
                label="Jenis Kartu"
                options={[
                    { value: "debit", label: "Debit" },
                    { value: "credit", label: "Kredit" },
                ]}
                placeholder="Pilih jenis kartu..."
                disabled={isProcessing}
                className="h-10"
            />
            <FormInput
                name="cardLast4"
                label="4 Digit Terakhir Kartu (Opsional)"
                type="text"
                maxLength={4}
                placeholder="XXXX"
                className="h-10 border-slate-200 focus-visible:ring-emerald-600 rounded-xl tracking-[0.5rem] text-center font-mono text-lg"
                disabled={isProcessing}
                onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                    setValue("cardLast4", val);
                }}
                autoFocus
            />
            <FormInput
                name="cardRef"
                label="No. Referensi EDC (Opsional)"
                type="text"
                placeholder="Nomor referensi EDC..."
                className="h-10 text-xs border-slate-200 focus-visible:ring-emerald-600 rounded-xl"
                disabled={isProcessing}
            />
        </div>
    );
}
