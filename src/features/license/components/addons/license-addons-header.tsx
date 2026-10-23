"use client";

import { Input } from "@/components/ui/input";
import {
    IconSearch,
    IconShieldCheck,
    IconShieldX,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface LicenseAddonsHeaderProps {
    count: number;
    isOperable: boolean;
    searchQuery: string;
    onSearchChange: (value: string) => void;
    showSearch: boolean;
}

export function LicenseAddonsHeader({
    count,
    isOperable,
    searchQuery,
    onSearchChange,
    showSearch,
}: LicenseAddonsHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
                <div
                    className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border",
                        isOperable
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100/70"
                            : "bg-rose-50 text-rose-600 border-rose-100",
                    )}
                >
                    {isOperable ? <IconShieldCheck size={15} /> : <IconShieldX size={15} />}
                </div>
                <div>
                    <div className="flex items-center gap-1.5">
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                            {isOperable ? "Daftar Add-on Aktif" : "Daftar Add-on Terpasang"}
                        </h3>
                        <span
                            className={cn(
                                "text-[10px] font-extrabold px-1.5 py-0.2 rounded-full border",
                                isOperable
                                    ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                    : "bg-rose-100 text-rose-700 border-rose-200",
                            )}
                        >
                            {count} {isOperable ? "Add-on Aktif" : "Add-on Dinonaktifkan"}
                        </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium">
                        {isOperable
                            ? "Fitur tambahan yang terpasang dan siap digunakan pada operasional toko Anda"
                            : "Fitur terpasang ditangguhkan sementara karena paket langganan kedaluwarsa"}
                    </p>
                </div>
            </div>

            {/* Responsive Search Bar */}
            {showSearch && (
                <div className="relative w-full sm:w-64 shrink-0">
                    <IconSearch
                        size={14}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                    <Input
                        type="text"
                        placeholder="Cari add-on..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="h-8 pl-8 pr-3 text-xs rounded-xl border-slate-200 focus-visible:ring-emerald-500 bg-slate-50/50"
                    />
                </div>
            )}
        </div>
    );
}
