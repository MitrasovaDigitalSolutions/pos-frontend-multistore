"use client";

import { formatRupiah } from "@/hooks/use-format-rupiah";
import { IconAlertCircle, IconLoader2, IconUpload } from "@tabler/icons-react";
import { RefreshCcw } from "lucide-react";

interface BulkSubmitBarProps {
    itemCount: number;
    productCount: number;
    total: number;
    onSubmit: () => void;
    onSecondarySubmit?: () => void;
    onReset: () => void;
    isSubmitting?: boolean;
    disabled?: boolean;
    submitLabel?: string;
    submitIcon?: React.ReactNode;
    secondarySubmitLabel?: string;
    secondarySubmitIcon?: React.ReactNode;
}

export function BulkSubmitBar({
    itemCount,
    productCount,
    total,
    onSubmit,
    onSecondarySubmit,
    onReset,
    isSubmitting = false,
    disabled = false,
    submitLabel,
    submitIcon,
    secondarySubmitLabel,
    secondarySubmitIcon,
}: BulkSubmitBarProps) {
    const hasItems = itemCount > 0;

    return (
        <div className="sticky bottom-0 z-10">
            <div className="bg-white/95 backdrop-blur-sm border border-slate-100 rounded-2xl shadow-lg shadow-slate-200/50 p-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Left: Stats */}
                    <div className="flex items-center gap-4 flex-wrap">
                        {hasItems && (
                            <>
                                {/* Unsaved badge */}
                                <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-xl border border-amber-100">
                                    <IconAlertCircle size={14} />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">
                                        {productCount} produk belum disubmit
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 text-xs">
                                    <span className="text-slate-400 font-medium">Total Qty:</span>
                                    <span className="font-bold text-slate-800">{itemCount} pcs</span>
                                </div>

                                <div className="flex items-center gap-2 text-xs">
                                    <span className="text-slate-400 font-medium">Total Nilai:</span>
                                    <span className="font-extrabold text-emerald-600 font-mono text-sm">
                                        {formatRupiah(total)}
                                    </span>
                                </div>
                            </>
                        )}

                        {!hasItems && (
                            <span className="text-xs text-slate-400 font-medium">
                                Belum ada item — scan barcode untuk mulai
                            </span>
                        )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-3">
                        {/* Reset */}
                        <button
                            type="button"
                            onClick={onReset}
                            disabled={isSubmitting || disabled}
                            className="
                                flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold
                                border border-slate-200 text-slate-600 bg-white
                                hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50
                                disabled:opacity-40 disabled:cursor-not-allowed
                                transition-all cursor-pointer
                            "
                        >
                            <RefreshCcw size={16} />
                            <span>Reset</span>
                        </button>

                        {/* Secondary Submit (Simpan Penerimaan) */}
                        {onSecondarySubmit && (
                            <button
                                type="button"
                                onClick={onSecondarySubmit}
                                disabled={!hasItems || isSubmitting || disabled}
                                className="
                                    flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold
                                    border border-emerald-600 text-emerald-700 bg-white
                                    hover:bg-emerald-50 hover:shadow-md
                                    disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none
                                    transition-all cursor-pointer
                                "
                            >
                                {secondarySubmitIcon || <IconUpload size={16} />}
                                <span>{secondarySubmitLabel || "Simpan Penerimaan"}</span>
                            </button>
                        )}

                        {/* Submit */}
                        <button
                            type="button"
                            onClick={onSubmit}
                            disabled={!hasItems || isSubmitting || disabled}
                            className="
                                flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold
                                bg-emerald-600 text-white shadow-md shadow-emerald-600/20
                                hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/30
                                disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none
                                transition-all cursor-pointer
                            "
                        >
                            {isSubmitting ? (
                                <>
                                    <IconLoader2 size={16} className="animate-spin" />
                                    <span>Mengirim...</span>
                                </>
                            ) : (
                                <>
                                    {submitIcon || <IconUpload size={16} />}
                                    <span>{submitLabel || "Simpan Semua Items ke Server"}</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
