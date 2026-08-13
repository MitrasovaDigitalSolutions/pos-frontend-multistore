"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { IconPlus } from "@tabler/icons-react";
import { ROUTES } from "@/constants/routes";

interface RequestTransferSummaryHeaderProps {
    canManage: boolean;
}

export function RequestTransferSummaryHeader({ canManage }: RequestTransferSummaryHeaderProps) {
    const router = useRouter();

    return (
        <div className="flex justify-between items-center border-b border-slate-50 pb-4">
            <div>
                <h3 className="text-sm font-bold text-slate-900">Summary Request Transfer</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                    Daftar permintaan stok yang masih pending, dikelompokkan per supplier dan katalog.
                </p>
            </div>
            {canManage && (
                <Button
                    onClick={() => router.push(ROUTES.ADMIN_REQUEST_TRANSFERS_CREATE)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 rounded-xl flex gap-1.5 cursor-pointer"
                >
                    <IconPlus size={16} /> Buat Request
                </Button>
            )}
        </div>
    );
}
