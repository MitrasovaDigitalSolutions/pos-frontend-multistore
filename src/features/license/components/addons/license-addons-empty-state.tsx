"use client";

import { IconLayersLinked } from "@tabler/icons-react";

interface LicenseAddonsEmptyStateProps {
    type: "no_addons" | "no_search_results";
    onGoToCatalog?: () => void;
}

export function LicenseAddonsEmptyState({
    type,
    onGoToCatalog,
}: LicenseAddonsEmptyStateProps) {
    if (type === "no_addons") {
        return (
            <div className="text-center py-10 px-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-2 text-slate-400">
                    <IconLayersLinked size={20} />
                </div>
                <h4 className="text-xs font-bold text-slate-700">Belum Ada Add-on Tambahan</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 max-w-sm mx-auto">
                    Sistem Anda saat ini berjalan dengan add-on POS dasar. Anda dapat menambah fitur pada tab Katalog & Paket.
                </p>
                {onGoToCatalog && (
                    <button
                        type="button"
                        onClick={onGoToCatalog}
                        className="mt-3 text-xs font-bold text-emerald-600 hover:text-emerald-700 underline cursor-pointer"
                    >
                        Eksplor Katalog Add-on →
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="text-center py-8 rounded-xl bg-white border border-slate-200/80">
            <p className="text-xs font-bold text-slate-600">Tidak ada add-on yang cocok dengan pencarian</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
                Coba periksa kembali kata kunci pencarian Anda.
            </p>
        </div>
    );
}
