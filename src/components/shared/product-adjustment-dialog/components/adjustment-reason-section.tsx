"use client";

import { cn } from "@/lib/utils";
import { QUICK_REASONS } from "../constants";

interface AdjustmentReasonSectionProps {
    fieldId?: string;
    inputId?: string;
    value: string;
    onChange: (val: string) => void;
    disabled?: boolean;
}

export function AdjustmentReasonSection({
    fieldId,
    inputId,
    value,
    onChange,
    disabled = false,
}: AdjustmentReasonSectionProps) {
    return (
        <div id={fieldId} className="space-y-1.5">
            <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-700 block">
                    Alasan Penyesuaian <span className="text-rose-500">*</span>
                </label>
                <span className="text-[9px] text-slate-400">Pilih opsi cepat atau tulis</span>
            </div>
            <div className="flex flex-wrap gap-1">
                {QUICK_REASONS.map((reason) => (
                    <button
                        key={reason}
                        type="button"
                        disabled={disabled}
                        onClick={() => onChange(reason)}
                        className={cn(
                            "text-[10px] font-semibold px-2 py-0.5 rounded-lg border transition-all",
                            disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
                            value === reason
                                ? "bg-emerald-600 border-emerald-600 text-white shadow-2xs font-bold"
                                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        )}
                    >
                        {reason}
                    </button>
                ))}
            </div>
            <input
                id={inputId}
                type="text"
                value={value || ""}
                disabled={disabled}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Tulis alasan penyesuaian stok..."
                className="w-full h-8 px-2.5 rounded-lg border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                required
            />
        </div>
    );
}
