import React from "react";
import { IconCash, IconCreditCard, IconNotebook } from "@tabler/icons-react";
import type { PaymentMode, PaymentModeOption } from "../types/payment-dialog.types";

interface PaymentModeSelectorProps {
    payMode: PaymentMode;
    onSelectMode: (mode: PaymentMode) => void;
    isProcessing: boolean;
}

export function PaymentModeSelector({
    payMode,
    onSelectMode,
    isProcessing,
}: PaymentModeSelectorProps) {
    const payModes: PaymentModeOption[] = [
        {
            key: "cash",
            label: "Tunai",
            icon: IconCash,
            activeColor: "emerald",
        },
        {
            key: "card",
            label: "Kartu / EDC",
            icon: IconCreditCard,
            activeColor: "indigo",
        },
        {
            key: "debt",
            label: "Hutang",
            icon: IconNotebook,
            activeColor: "rose",
        },
    ];

    const getTabClass = (mode: PaymentMode, activeColor: string) => {
        if (payMode === mode) {
            return `bg-${activeColor}-50 border-${activeColor}-500 text-${activeColor}-700 shadow-sm shadow-${activeColor}-500/10`;
        }
        return "bg-white border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50/80 hover:border-slate-300";
    };

    return (
        <div className="grid grid-cols-3 gap-2.5 mb-5 select-none">
            {payModes.map((mode) => {
                const Icon = mode.icon;
                const isActive = payMode === mode.key;
                return (
                    <button
                        key={mode.key}
                        type="button"
                        onClick={() => onSelectMode(mode.key)}
                        className={`h-12 rounded-xl flex items-center justify-center gap-2.5 font-extrabold text-xs cursor-pointer border-2 transition-all duration-200 active:scale-[0.97] ${getTabClass(mode.key, mode.activeColor)}`}
                        disabled={isProcessing}
                    >
                        <Icon
                            size={17}
                            className={isActive ? `text-${mode.activeColor}-600` : "text-slate-400"}
                        />
                        <span>{mode.label}</span>
                    </button>
                );
            })}
        </div>
    );
}
