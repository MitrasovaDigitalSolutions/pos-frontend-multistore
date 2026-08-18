"use client";

import { useRouter } from "next/navigation";
import { IconArrowLeft, IconCheck, IconSend, IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import type { RequestTransferDetail } from "../../types";

interface RequestTransferDetailHeaderProps {
    detail: RequestTransferDetail | undefined;
    isPendingAction: boolean;
    anySufficient: boolean;
    onSetConfirmAction: (action: "reject" | "order" | "send") => void;
    mode?: "outgoing" | "incoming";
}

export function RequestTransferDetailHeader({
    detail,
    isPendingAction,
    anySufficient,
    onSetConfirmAction,
    mode = "outgoing",
}: RequestTransferDetailHeaderProps) {
    const router = useRouter();

    const backRoute =
        mode === "incoming"
            ? ROUTES.ADMIN_REQUEST_TRANSFERS_INCOMING
            : ROUTES.ADMIN_REQUEST_TRANSFERS;

    return (
        <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(backRoute)}
                    className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 cursor-pointer"
                >
                    <IconArrowLeft size={14} /> Kembali
                </Button>

                <div>
                    <h2 className="text-sm font-bold text-slate-900">
                        Summary Request: {detail?.request_to_nama || "Pusat"}
                    </h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                        Supplier: {detail?.supplier_nama || "Tanpa Supplier"}
                        {detail?.supplier_sales_nama ? ` • Katalog: ${detail.supplier_sales_nama}` : ""}
                    </p>
                </div>

            </div>

            {detail && (
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onSetConfirmAction("reject")}
                        disabled={isPendingAction}
                        className="flex items-center gap-1.5 text-[11px] font-bold text-rose-600 border-rose-200 hover:bg-rose-50 cursor-pointer"
                    >
                        <IconX size={14} /> Reject
                    </Button>
                    <Button
                        onClick={() => onSetConfirmAction("order")}
                        disabled={isPendingAction}
                        className="flex items-center gap-1.5 text-[11px] font-bold bg-amber-500 hover:bg-amber-600 text-white cursor-pointer"
                    >
                        <IconCheck size={14} /> Order
                    </Button>
                    <Button
                        onClick={() => onSetConfirmAction("send")}
                        disabled={isPendingAction || !anySufficient}
                        title={!anySufficient ? "Tidak ada item dengan stok pusat cukup" : undefined}
                        className="flex items-center gap-1.5 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                    >
                        <IconSend size={14} /> Kirim
                    </Button>
                </div>
            )}
        </div>
    );
}
