"use client";

import { Button } from "@/components/ui/button";
import { AppButton } from "@/components/shared/app-button";
import { IconCheck } from "@tabler/icons-react";

interface AdjustmentDialogFooterProps {
    canManualAdjustment: boolean;
    isPending: boolean;
    numericAmount: number;
    hasReason: boolean;
    onClose: () => void;
    submitButtonId?: string;
}

export function AdjustmentDialogFooter({
    canManualAdjustment,
    isPending,
    numericAmount,
    hasReason,
    onClose,
    submitButtonId,
}: AdjustmentDialogFooterProps) {
    return (
        <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            {!canManualAdjustment ? (
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onClose}
                    className="h-8 px-4 text-xs font-bold rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                    Tutup
                </Button>
            ) : (
                <>
                    <AppButton
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onClose}
                        disabled={isPending}
                        className="text-xs font-bold h-8 rounded-xl px-3.5"
                    >
                        Batal
                    </AppButton>
                    <AppButton
                        id={submitButtonId}
                        type="submit"
                        size="sm"
                        isLoading={isPending}
                        disabled={!canManualAdjustment || numericAmount <= 0 || !hasReason}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-8 rounded-xl px-4 gap-1.5 shadow-2xs cursor-pointer"
                    >
                        <IconCheck size={14} />
                        <span>Simpan Penyesuaian</span>
                    </AppButton>
                </>
            )}
        </div>
    );
}
