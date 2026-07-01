"use client";

import { Input } from "@/components/ui/input";
import { CommandSelect } from "@/components/ui/command-select";

interface CardPaymentFormProps {
    cardType: string;
    setCardType: (val: string) => void;
    cardLast4: string;
    setCardLast4: (val: string) => void;
    cardRef: string;
    setCardRef: (val: string) => void;
    isProcessing: boolean;
}

export function CardPaymentForm({
    cardType,
    setCardType,
    cardLast4,
    setCardLast4,
    cardRef,
    setCardRef,
    isProcessing,
}: CardPaymentFormProps) {
    return (
        <div className="space-y-3">
            <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Jenis Kartu
                </label>
                <CommandSelect
                    options={[
                        { value: "debit", label: "Debit" },
                        { value: "credit", label: "Kredit" },
                    ]}
                    value={cardType}
                    onChange={(val) => setCardType(val)}
                    disabled={isProcessing}
                    className="h-10"
                />
            </div>
            <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    4 Digit Terakhir Kartu (Opsional)
                </label>
                <Input
                    type="text"
                    maxLength={4}
                    placeholder="XXXX"
                    className="h-10 border-slate-200 focus-visible:ring-emerald-600 rounded-xl tracking-[0.5rem] text-center font-mono text-lg"
                    value={cardLast4}
                    onChange={(e) =>
                        setCardLast4(e.target.value.replace(/\D/g, "").slice(0, 4))
                    }
                    disabled={isProcessing}
                    autoFocus
                />
            </div>
            <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    No. Referensi EDC (Opsional)
                </label>
                <Input
                    type="text"
                    placeholder="Nomor referensi EDC..."
                    className="h-10 text-xs border-slate-200 focus-visible:ring-emerald-600 rounded-xl"
                    value={cardRef}
                    onChange={(e) => setCardRef(e.target.value)}
                    disabled={isProcessing}
                />
            </div>
        </div>
    );
}
