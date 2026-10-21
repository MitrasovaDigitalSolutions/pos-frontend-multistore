"use client";

import { IconPlus, IconMinus } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { AdjustmentDirection } from "../types";

interface AdjustmentDirectionControlProps {
    value: AdjustmentDirection;
    onChange: (val: AdjustmentDirection) => void;
    disabled?: boolean;
}

export function AdjustmentDirectionControl({
    value,
    onChange,
    disabled = false,
}: AdjustmentDirectionControlProps) {
    return (
        <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 block">
                Arah Perubahan Stok
            </label>
            <div className="grid grid-cols-2 p-0.5 bg-slate-100 rounded-xl border border-slate-200/80 gap-1">
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onChange("add")}
                    className={cn(
                        "h-8 rounded-lg flex items-center justify-center gap-1.5 text-xs font-bold transition-all",
                        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
                        value === "add"
                            ? "bg-white text-emerald-700 shadow-2xs border border-emerald-200/80"
                            : "text-slate-500 hover:text-slate-800"
                    )}
                >
                    <IconPlus size={13} className={value === "add" ? "text-emerald-600 stroke-[3]" : "text-slate-400"} />
                    <span>Tambah Stok (+)</span>
                </button>

                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onChange("subtract")}
                    className={cn(
                        "h-8 rounded-lg flex items-center justify-center gap-1.5 text-xs font-bold transition-all",
                        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
                        value === "subtract"
                            ? "bg-white text-rose-700 shadow-2xs border border-rose-200/80"
                            : "text-slate-500 hover:text-slate-800"
                    )}
                >
                    <IconMinus size={13} className={value === "subtract" ? "text-rose-600 stroke-[3]" : "text-slate-400"} />
                    <span>Kurang Stok (-)</span>
                </button>
            </div>
        </div>
    );
}
