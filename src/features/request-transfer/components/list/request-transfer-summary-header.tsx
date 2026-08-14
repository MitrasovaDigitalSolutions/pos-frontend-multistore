"use client";

import { useAppRouter } from "@/hooks/use-app-router";
import { Button } from "@/components/ui/button";
import { IconPlus } from "@tabler/icons-react";
import { ROUTES } from "@/constants/routes";

interface RequestTransferSummaryHeaderProps {
    canManage: boolean;
    mode?: "outgoing" | "incoming";
}

export function RequestTransferSummaryHeader({ canManage, mode = "outgoing" }: RequestTransferSummaryHeaderProps) {
    const router = useAppRouter();


    const isIncoming = mode === "incoming";
    const title = isIncoming ? "Kelola Request Masuk" : "Request Transfer";
    const description = isIncoming
        ? "Daftar permintaan stok dari cabang lain yang ditujukan ke toko ini."
        : "Daftar permintaan stok yang diajukan oleh toko ini ke toko sumber / pusat.";

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
                <h3 className="text-sm font-bold text-slate-900">{title}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                    {description}
                </p>
            </div>
            {!isIncoming && canManage && (
                <Button
                    onClick={() => router.push(ROUTES.ADMIN_REQUEST_TRANSFERS_CREATE)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer w-full sm:w-auto shrink-0 shadow-2xs"
                >
                    <IconPlus size={16} /> Buat Request
                </Button>
            )}
        </div>
    );
}

