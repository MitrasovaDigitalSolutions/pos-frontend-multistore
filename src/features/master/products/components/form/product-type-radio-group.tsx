"use client";

import { cn } from "@/lib/utils";
import { IconBox, IconPackage, IconTools } from "@tabler/icons-react";
import type { ProductType } from "../../hooks/use-product-form-dialog";

interface ProductTypeRadioGroupProps {
    productType: ProductType;
    onChange: (value: ProductType) => void;
    disabled?: boolean;
}

export function ProductTypeRadioGroup({
    productType,
    onChange,
    disabled = false,
}: ProductTypeRadioGroupProps) {
    return (
        <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Tipe Produk
            </label>
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 border border-slate-200/80 rounded-xl">
                {/* Option 1: Barang Jadi */}
                <button
                    type="button"
                    onClick={() => onChange("finished_good")}
                    disabled={disabled}
                    className={cn(
                        "flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer border select-none",
                        productType === "finished_good"
                            ? "bg-white text-emerald-700 border-slate-200/80 shadow-xs"
                            : "bg-transparent text-slate-500 border-transparent hover:text-slate-800 hover:bg-white/50"
                    )}
                >
                    <IconPackage
                        size={14}
                        className={
                            productType === "finished_good"
                                ? "text-emerald-600 shrink-0"
                                : "text-slate-400 shrink-0"
                        }
                    />
                    <span className="truncate">Barang Jadi</span>
                </button>

                {/* Option 2: Bahan Baku */}
                <button
                    type="button"
                    onClick={() => onChange("raw_material")}
                    disabled={disabled}
                    className={cn(
                        "flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer border select-none",
                        productType === "raw_material"
                            ? "bg-white text-amber-700 border-slate-200/80 shadow-xs"
                            : "bg-transparent text-slate-500 border-transparent hover:text-slate-800 hover:bg-white/50"
                    )}
                >
                    <IconBox
                        size={14}
                        className={
                            productType === "raw_material"
                                ? "text-amber-600 shrink-0"
                                : "text-slate-400 shrink-0"
                        }
                    />
                    <span className="truncate">Bahan Baku</span>
                </button>

                {/* Option 3: Jasa */}
                <button
                    type="button"
                    onClick={() => onChange("jasa")}
                    disabled={disabled}
                    className={cn(
                        "flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer border select-none",
                        productType === "jasa"
                            ? "bg-white text-blue-700 border-slate-200/80 shadow-xs"
                            : "bg-transparent text-slate-500 border-transparent hover:text-slate-800 hover:bg-white/50"
                    )}
                >
                    <IconTools
                        size={14}
                        className={
                            productType === "jasa"
                                ? "text-blue-600 shrink-0"
                                : "text-slate-400 shrink-0"
                        }
                    />
                    <span className="truncate">Jasa</span>
                </button>
            </div>
        </div>
    );
}
