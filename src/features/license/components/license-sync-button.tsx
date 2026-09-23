"use client";

import { IconRefresh } from "@tabler/icons-react";
import { AppButton } from "@/components/shared/app-button";
import { useLicenseSyncMutation } from "../api/license-api";
import { cn } from "@/lib/utils";

interface LicenseSyncButtonProps {
    className?: string;
    compact?: boolean;
}

export function LicenseSyncButton({ className, compact = false }: LicenseSyncButtonProps) {
    const { mutate, isPending } = useLicenseSyncMutation();

    return (
        <AppButton
            variant="outline"
            size="sm"
            onClick={() => mutate()}
            isLoading={isPending}
            loadingText={compact ? undefined : "Menyinkronkan..."}
            className={cn(
                "h-8 text-xs font-bold rounded-lg border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 transition-colors shadow-2xs gap-1.5 shrink-0 cursor-pointer",
                className
            )}
            title="Sinkronkan status paket dan add-on terbaru dari server pusat"
        >
            <IconRefresh size={14} className={isPending ? "animate-spin" : ""} />
            {!compact && <span>Sinkronkan Status</span>}
        </AppButton>
    );
}
