"use client";

import { useFormContext } from "react-hook-form";
import { type StoreSettingsInput } from "../schemas/settings-schema";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
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
        <div className="sticky bottom-4 z-40 w-full mt-6">
            <div className="bg-white/80 backdrop-blur-md border border-slate-200/70 shadow-[0_8px_32px_rgba(15,23,42,0.05)] dark:bg-slate-900/80 dark:border-slate-800/70 rounded-2xl px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-300">
                <div className="flex items-center gap-3">
                    {hasErrors ? (
                        <div className="flex items-center gap-2 text-rose-600 animate-shake">
                            <span className="w-2 h-2 rounded-full bg-rose-500 ring-4 ring-rose-500/20 animate-pulse" />
                            <span className="text-xs font-bold uppercase tracking-wider">
                                Input tidak valid. Periksa kembali form.
                            </span>
                        </div>
                    ) : isDirty ? (
                        <div className="flex items-center gap-2 text-amber-600">
                            <span className="w-2 h-2 rounded-full bg-amber-500 ring-4 ring-amber-500/25 animate-pulse" />
                            <span className="text-xs font-bold uppercase tracking-wider">
                                Ada perubahan yang belum disimpan
                            </span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-slate-500">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/25" />
                            <span className="text-xs font-bold uppercase tracking-wider">
                                Semua perubahan disimpan
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end shrink-0">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={!isDirty || isSaving}
                        onClick={() => {
                            reset();
                            toast.info("Perubahan dibatalkan.");
                        }}
                        className={cn(
                            "text-xs font-bold uppercase tracking-wider rounded-xl px-4 py-2 h-auto transition-all border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 cursor-pointer shadow-sm active:scale-[0.98]",
                            !isDirty && "hidden sm:inline-flex opacity-0 pointer-events-none"
                        )}
                    >
                        Batal
                    </Button>
                    <Button
                        type="submit"
                        size="sm"
                        disabled={isSaving}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg shadow-emerald-600/10 active:scale-[0.98] transition-all duration-200 px-5 py-2.5 h-auto cursor-pointer border-none flex items-center gap-1.5"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="animate-spin" size={12} />
                                Menyimpan...
                            </>
                        ) : (
                            <>
                                <Save size={12} />
                                Simpan
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
