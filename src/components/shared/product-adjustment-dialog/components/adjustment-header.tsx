"use client";

import { Badge } from "@/components/ui/badge";
import { IconActivity } from "@tabler/icons-react";

interface AdjustmentHeaderProps {
    canManualAdjustment: boolean;
}

export function AdjustmentHeader({ canManualAdjustment }: AdjustmentHeaderProps) {
    return (
        <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-xs shadow-emerald-500/20 shrink-0">
                <IconActivity size={16} />
            </div>
            <div>
                <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-sm block leading-tight">
                        {canManualAdjustment ? "Penyesuaian Stok Produk" : "Detail Penyesuaian Stok"}
                    </span>
                    <Badge
                        variant={canManualAdjustment ? "outline" : "secondary"}
                        className="text-[9px] font-mono font-bold px-1.5 py-0 rounded"
                    >
                        {canManualAdjustment ? "Adjustment Qty" : "Hanya Lihat"}
                    </Badge>
                </div>
                <span className="text-[11px] text-slate-400 font-medium block">
                    {canManualAdjustment
                        ? "Koreksi penambahan atau pengurangan fisik stok secara langsung"
                        : "Penyesuaian stok manual dinonaktifkan oleh kebijakan Toko Pusat"}
                </span>
            </div>
        </div>
    );
}
