"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    IconAlertTriangle,
    IconCircleCheck,
    IconInfoCircle,
    IconLoader2,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import React from "react";

export interface ConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    description?: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void | Promise<void>;
    isLoading?: boolean;
    variant?: "danger" | "warning" | "info" | "success";
}

export function ConfirmDialog({
    open,
    onOpenChange,
    title = "Konfirmasi Tindakan",
    description = "Apakah Anda yakin ingin melakukan tindakan ini?",
    confirmText = "Ya, Lanjutkan",
    cancelText = "Batal",
    onConfirm,
    isLoading = false,
    variant = "warning",
}: ConfirmDialogProps) {
    const handleConfirm = async () => {
        try {
            await onConfirm();
        } catch (error) {
            console.error(error);
        }
    };

    // Style mapping for different dialog variants
    const variantStyles = {
        danger: {
            iconBg: "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/50",
            confirmBtn: "bg-rose-600 hover:bg-rose-700 text-white focus-visible:ring-rose-500",
            icon: IconAlertTriangle,
        },
        warning: {
            iconBg: "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/50",
            confirmBtn: "bg-amber-600 hover:bg-amber-700 text-white focus-visible:ring-amber-500",
            icon: IconAlertTriangle,
        },
        info: {
            iconBg: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/50",
            confirmBtn: "bg-blue-600 hover:bg-blue-700 text-white focus-visible:ring-blue-500",
            icon: IconInfoCircle,
        },
        success: {
            iconBg: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50",
            confirmBtn: "bg-emerald-600 hover:bg-emerald-700 text-white focus-visible:ring-emerald-500",
            icon: IconCircleCheck,
        },
    };

    const style = variantStyles[variant];
    const Icon = style.icon;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-6 gap-0 border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100"
                showCloseButton={false}
            >
                <div className="flex flex-col items-center text-center">
                    {/* Icon Container */}
                    <div className={cn(
                        "w-12 h-12 rounded-full border flex items-center justify-center mb-4 animate-in fade-in zoom-in-75 duration-300",
                        style.iconBg
                    )}>
                        <Icon size={24} stroke={2} />
                    </div>

                    <DialogHeader className="gap-1 mb-2">
                        <DialogTitle className="text-sm font-bold text-slate-900 dark:text-slate-50">
                            {title}
                        </DialogTitle>
                        <DialogDescription render={<div />} className="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-normal">
                            {description}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                {/* Actions container to bypass standard DialogFooter styles */}
                <div className="w-full flex flex-col sm:flex-row gap-2 mt-6">
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full sm:w-auto flex-1 h-10 text-xs font-bold border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 rounded-xl cursor-pointer order-2 sm:order-1"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        type="button"
                        className={cn(
                            "w-full sm:w-auto flex-1 h-10 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer order-1 sm:order-2",
                            style.confirmBtn
                        )}
                        onClick={handleConfirm}
                        disabled={isLoading}
                    >
                        {isLoading && <IconLoader2 size={14} className="animate-spin" />}
                        <span>{confirmText}</span>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
