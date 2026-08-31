"use client";

import { Button } from "@/components/ui/button";
import {
    IconCheck,
    IconDeviceFloppy,
    IconFileInvoice,
    IconLoader2,
    IconNotes,
    IconX,
} from "@tabler/icons-react";

interface JournalEditorHeaderProps {
    isEditMode: boolean;
    referenceNumber?: string | null;
    isPending: boolean;
    hasValidLines: boolean;
    isBalanced: boolean;
    onCancel: () => void;
    onSaveDraft: () => void;
    onPost: () => void;
}

export function JournalEditorHeader({
    isEditMode,
    referenceNumber,
    isPending,
    hasValidLines,
    isBalanced,
    onCancel,
    onSaveDraft,
    onPost,
}: JournalEditorHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-950/40">
            <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-xs">
                    <IconNotes className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                        {isEditMode ? "Edit Jurnal Manual" : "Input Jurnal Manual"}
                    </h2>
                    {isEditMode && referenceNumber && (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-200/70 dark:bg-slate-800 border border-slate-300/50 dark:border-slate-700/50">
                            <IconFileInvoice className="w-3 h-3 text-slate-500" />
                            <span className="font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                {referenceNumber}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Top Action Buttons */}
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onCancel}
                    disabled={isPending}
                    className="h-8 px-3 text-xs font-bold rounded-xl border-slate-200 hover:bg-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                    <IconX className="w-3.5 h-3.5 mr-1" />
                    Batal
                </Button>

                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isPending || !hasValidLines}
                    onClick={onSaveDraft}
                    className="h-8 px-3 text-xs font-bold rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                    {isPending ? (
                        <IconLoader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                    ) : (
                        <IconDeviceFloppy className="w-3.5 h-3.5 mr-1 text-slate-500" />
                    )}
                    Simpan Draf
                </Button>

                <Button
                    type="button"
                    size="sm"
                    disabled={!isBalanced || isPending || !hasValidLines}
                    onClick={onPost}
                    className="h-8 px-4 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 rounded-xl shadow-xs cursor-pointer"
                >
                    {isPending ? (
                        <IconLoader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                    ) : (
                        <IconCheck className="w-3.5 h-3.5 mr-1" />
                    )}
                    Posting Jurnal
                </Button>
            </div>
        </div>
    );
}
