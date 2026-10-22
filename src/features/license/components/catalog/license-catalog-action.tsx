"use client";

import { IconCheck, IconPlus } from "@tabler/icons-react";

interface LicenseCatalogActionProps {
    isOwned: boolean;
    isOperable?: boolean;
    onOrder: () => void;
}

/**
 * Single Responsibility: Render the contextual action button based on license ownership.
 */
export function LicenseCatalogAction({
    isOwned,
    isOperable = true,
    onOrder,
}: LicenseCatalogActionProps) {
    if (!isOwned) {
        return (
            <button
                type="button"
                onClick={onOrder}
                className="h-7.5 px-3 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200/80 border border-emerald-200/90 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs shrink-0"
            >
                <IconPlus size={13} strokeWidth={2.5} />
                <span>Pesan Add-on</span>
            </button>
        );
    }

    if (isOperable) {
        return (
            <div className="h-7.5 px-2.5 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 flex items-center gap-1 shadow-2xs select-none shrink-0">
                <IconCheck size={13} strokeWidth={2.5} />
                <span>Sudah Terpasang</span>
            </div>
        );
    }

    return (
        <button
            type="button"
            onClick={onOrder}
            className="h-7.5 px-2.5 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 border border-rose-200/80 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs shrink-0"
            title="Perbarui langganan untuk mengaktifkan kembali add-on ini"
        >
            <span>Aktifkan Kembali</span>
        </button>
    );
}
