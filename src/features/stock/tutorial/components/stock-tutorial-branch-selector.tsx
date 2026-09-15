"use client";

import React from "react";
import { IconFileSpreadsheet, IconBarcode, IconArrowRight } from "@tabler/icons-react";
import { useStockTutorialStore } from "@/stores/stock-tutorial-store";

export function StockTutorialBranchSelector() {
    const selectedBranch = useStockTutorialStore((state) => state.selectedBranch);

    const handleSelect = (branch: "excel" | "manual") => {
        if (typeof window !== "undefined") {
            window.dispatchEvent(
                new CustomEvent("stock-tutorial-select-branch", {
                    detail: { branch },
                })
            );
        }
    };

    return (
        <div className="space-y-3 pt-1">
            <p className="text-[11.5px] sm:text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Stock Opname menyediakan 2 metode audit. Silakan klik salah satu jalur di bawah untuk melanjutkan alur tutorial yang ingin Anda pelajari:
            </p>

            <div className="grid grid-cols-1 gap-2 pt-0.5">
                {/* ── Option 1: Excel Upload ── */}
                <button
                    type="button"
                    onClick={() => handleSelect("excel")}
                    className={`group relative flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedBranch === "excel"
                            ? "border-emerald-500 bg-emerald-50/90 dark:bg-emerald-950/50 shadow-sm"
                            : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:border-emerald-400 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30"
                    }`}
                >
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 shrink-0 group-hover:scale-105 transition-transform">
                            <IconFileSpreadsheet size={18} />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                                <span className="font-extrabold text-xs text-slate-800 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                                    Jalur Upload Excel
                                </span>
                                <span className="text-[9.5px] px-1.5 py-0.2 rounded-full font-bold bg-emerald-100/80 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                                    Massal
                                </span>
                            </div>
                            <p className="text-[10px] text-slate-400 dark:text-slate-400 truncate mt-0.5">
                                Unduh template, isi hitung fisik lapangan, & unggah file
                            </p>
                        </div>
                    </div>
                    <div className="p-1 rounded-md text-slate-300 dark:text-slate-600 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all shrink-0">
                        <IconArrowRight size={14} />
                    </div>
                </button>

                {/* ── Option 2: Input Manual & Barcode ── */}
                <button
                    type="button"
                    onClick={() => handleSelect("manual")}
                    className={`group relative flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedBranch === "manual"
                            ? "border-blue-500 bg-blue-50/90 dark:bg-blue-950/50 shadow-sm"
                            : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:border-blue-400 hover:bg-blue-50/40 dark:hover:bg-blue-950/30"
                    }`}
                >
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 shrink-0 group-hover:scale-105 transition-transform">
                            <IconBarcode size={18} />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                                <span className="font-extrabold text-xs text-slate-800 dark:text-slate-100 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                                    Jalur Input Manual & Barcode
                                </span>
                                <span className="text-[9.5px] px-1.5 py-0.2 rounded-full font-bold bg-blue-100/80 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                                    Langsung
                                </span>
                            </div>
                            <p className="text-[10px] text-slate-400 dark:text-slate-400 truncate mt-0.5">
                                Draf kosong, scan barcode rak toko, & atur kuantitas fisik
                            </p>
                        </div>
                    </div>
                    <div className="p-1 rounded-md text-slate-300 dark:text-slate-600 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0">
                        <IconArrowRight size={14} />
                    </div>
                </button>
            </div>
        </div>
    );
}
