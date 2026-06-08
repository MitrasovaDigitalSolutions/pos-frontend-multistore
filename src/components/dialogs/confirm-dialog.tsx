"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/stores/ui-store";
import { IconAlertTriangle } from "@tabler/icons-react";

/**
 * Global confirm dialog — replaces native confirm() calls.
 * State is managed by the UI store (Zustand).
 * Mount this once in the root layout or providers.
 */
export function ConfirmDialog() {
    const { confirmDialog, closeConfirmDialog } = useUIStore();
    const { isOpen, title, description, onConfirm, variant } = confirmDialog;

    const handleConfirm = () => {
        onConfirm?.();
        closeConfirmDialog();
    };

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => !open && closeConfirmDialog()}
        >
            <DialogContent className="max-w-95 bg-white rounded-2xl border-slate-100 p-6">
                <DialogHeader className="pb-4 border-b border-slate-100">
                    <DialogTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <IconAlertTriangle
                            size={20}
                            className={
                                variant === "destructive"
                                    ? "text-rose-500"
                                    : "text-amber-500"
                            }
                        />
                        <span>{title}</span>
                    </DialogTitle>
                </DialogHeader>

                <p className="text-xs text-slate-600 pt-4">{description}</p>

                <div className="grid grid-cols-2 gap-3 pt-4">
                    <Button
                        onClick={closeConfirmDialog}
                        className="h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                    >
                        Batal
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        className={`h-10 font-bold text-xs text-white rounded-xl cursor-pointer ${
                            variant === "destructive"
                                ? "bg-rose-600 hover:bg-rose-700"
                                : "bg-emerald-600 hover:bg-emerald-700"
                        }`}
                    >
                        Konfirmasi
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
