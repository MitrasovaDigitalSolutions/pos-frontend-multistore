"use client";

import { Input } from "@/components/ui/input";
import { IconSearch, IconX } from "@tabler/icons-react";

interface LicenseCatalogSearchBarProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

/**
 * Single Responsibility: Compact search input with clear trigger.
 */
export function LicenseCatalogSearchBar({
    searchQuery,
    onSearchChange,
}: LicenseCatalogSearchBarProps) {
    return (
        <div className="relative w-full md:w-72 shrink-0">
            <IconSearch
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <Input
                type="text"
                placeholder="Cari add-on, kode, atau menu..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="h-8 pl-8 pr-7 text-xs rounded-lg border-slate-200 focus-visible:ring-emerald-500 bg-slate-50/60"
            />
            {searchQuery && (
                <button
                    type="button"
                    onClick={() => onSearchChange("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                    title="Hapus pencarian"
                >
                    <IconX size={13} />
                </button>
            )}
        </div>
    );
}
