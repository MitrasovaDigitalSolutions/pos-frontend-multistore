"use client";

import { Badge } from "@/components/ui/badge";

interface LicenseCatalogStatusBadgeProps {
    isOwned: boolean;
    isOperable?: boolean;
}

/**
 * Single Responsibility: Render semantic status badge for catalog items.
 */
export function LicenseCatalogStatusBadge({
    isOwned,
    isOperable = true,
}: LicenseCatalogStatusBadgeProps) {
    if (!isOwned) {
        return (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200/60 shrink-0 select-none">
                Tersedia
            </span>
        );
    }

    if (isOperable) {
        return (
            <Badge
                variant="outline"
                className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border-emerald-200/90 shrink-0 flex items-center gap-1 shadow-2xs select-none"
            >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Aktif</span>
            </Badge>
        );
    }

    return (
        <Badge
            variant="outline"
            className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border-rose-200 shrink-0 flex items-center gap-1 shadow-2xs select-none"
        >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>Nonaktif</span>
        </Badge>
    );
}
