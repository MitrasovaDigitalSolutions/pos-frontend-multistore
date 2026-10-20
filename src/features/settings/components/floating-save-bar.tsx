"use client";

import { useFormContext } from "react-hook-form";
import { type StoreSettingsInput } from "../schemas/settings-schema";
import { cn } from "@/lib/utils";
import { AppButton } from "@/components/shared/app-button";
import { Save, Check, RotateCcw, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface FloatingSaveBarProps {
    isSaving: boolean;
}

export function FloatingSaveBar({ isSaving }: FloatingSaveBarProps) {
    const {
        formState: { isDirty, errors },
        reset,
    } = useFormContext<StoreSettingsInput>();

    const hasErrors = Object.keys(errors).length > 0;

    return (
        <div className="sticky bottom-3 sm:bottom-4 z-30 w-full mt-4">
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-[0_8px_30px_rgba(15,23,42,0.08)] rounded-2xl px-4 py-2.5 sm:px-5 sm:py-3 flex flex-col sm:flex-row items-center justify-between gap-3 transition-all duration-300">
                {/* Status Indicator */}
                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    {hasErrors ? (
                        <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                            <AlertTriangle size={15} className="shrink-0 animate-bounce" />
                            <span className="text-xs font-bold uppercase tracking-wide">
                                Form memiliki input tidak valid
                            </span>
                        </div>
                    ) : isDirty ? (
                        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                            <span className="relative flex h-2 w-2 shrink-0">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                            </span>
                            <span className="text-xs font-bold uppercase tracking-wide">
                                Perubahan belum disimpan
                            </span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                            <Check size={14} className="text-emerald-500 shrink-0" />
                            <span className="text-xs font-bold uppercase tracking-wide">
                                Semua pengaturan tersimpan
                            </span>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
                    {isDirty && (
                        <AppButton
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isSaving}
                            onClick={() => {
                                reset();
                                toast.info("Perubahan dibatalkan.");
                            }}
                            leftIcon={<RotateCcw size={12} />}
                            className="text-xs font-bold uppercase tracking-wider rounded-xl px-3.5 py-2 h-auto transition-all border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer shadow-xs active:scale-[0.98]"
                        >
                            Batal
                        </AppButton>
                    )}

                    <AppButton
                        id="btn-simpan-pengaturan"
                        type="submit"
                        size="sm"
                        isLoading={isSaving}
                        loadingText="Menyimpan..."
                        disabled={!isDirty || isSaving}
                        leftIcon={!isSaving ? <Save size={13} /> : null}
                        className={cn(
                            "font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-200 px-4 py-2 h-auto cursor-pointer border-none flex items-center gap-1.5 shadow-sm",
                            isDirty
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 active:scale-[0.98]"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-60"
                        )}
                    >
                        Simpan
                    </AppButton>
                </div>
            </div>
        </div>
    );
}
