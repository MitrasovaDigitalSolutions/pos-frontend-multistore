"use client";

import { IconPackage } from "@tabler/icons-react";
import type { Product } from "@/features/master/products/types";

interface AdjustmentProductCardProps {
    id?: string;
    product: Product;
    currentStock: number;
    unitLabel: string;
}

export function AdjustmentProductCard({
    id,
    product,
    currentStock,
    unitLabel,
}: AdjustmentProductCardProps) {
    return (
        <div
            id={id}
            className="p-2.5 bg-slate-50/90 border border-slate-200/80 rounded-xl flex items-center justify-between gap-2.5"
        >
            <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200/80 flex items-center justify-center shrink-0 text-slate-500 shadow-2xs">
                    <IconPackage size={16} />
                </div>
                <div className="min-w-0 space-y-0.5">
                    <span className="font-bold text-xs text-slate-900 block truncate leading-tight">
                        {product.nama}
                    </span>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                        <span>{product.barcode || "-"}</span>
                        {product.category && (
                            <>
                                <span>•</span>
                                <span className="text-slate-500 font-sans truncate">{product.category.nama}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Current Stock Tag */}
            <div className="text-right shrink-0 bg-white border border-slate-200/80 px-2 py-0.5 rounded-lg shadow-2xs">
                <span className="text-[8px] font-bold text-slate-400 block uppercase tracking-wider leading-none">
                    Stok Sekarang
                </span>
                <div className="flex items-baseline justify-end gap-1 mt-0.5 leading-none">
                    <span className="font-black text-slate-900 text-sm font-mono">
                        {currentStock}
                    </span>
                    <span className="text-[9px] font-bold text-slate-500">
                        {unitLabel}
                    </span>
                </div>
            </div>
        </div>
    );
}
