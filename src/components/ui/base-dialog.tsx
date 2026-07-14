"use client";

import * as React from "react";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { IconX } from "@tabler/icons-react";

import { Scrollable } from "@/components/ui/scrollable";

// ─── BaseDialog ──────────────────────────────────────────────────────────────
// Reusable dialog with a symmetric header — title and close (X) button are
// always on the same row, same height, perfectly aligned.

interface BaseDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Icon + title shown in the header */
    title?: React.ReactNode;
    /** Optional extra content to render on the right side of the header (e.g. action buttons) */
    headerRight?: React.ReactNode;
    /** Dialog panel max-width & misc classes */
    className?: string;
    children: React.ReactNode;
    /** Prevent closing via the X button (e.g. mid-flow forms) */
    showCloseButton?: boolean;
    /** Enable scrollable content inside the dialog body */
    scrollable?: boolean;
}

export function BaseDialog({
    open,
    onOpenChange,
    title,
    headerRight,
    className,
    children,
    showCloseButton = true,
    scrollable = false,
}: BaseDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {/* Always hide the default absolute-positioned close button */}
            <DialogContent
                className={cn(
                    "bg-white rounded-2xl border-slate-100 p-6 shadow-2xl flex flex-col max-h-[90vh]",
                    className,
                )}
                showCloseButton={false}
            >
                {/* ── Symmetric Header ── */}
                {title && (
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
                        <DialogTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            {title}
                        </DialogTitle>

                        <div className="flex items-center gap-2">
                            {headerRight}
                            {showCloseButton && (
                                <DialogClose className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer border-none bg-transparent shrink-0">
                                    <IconX size={16} />
                                    <span className="sr-only">Tutup</span>
                                </DialogClose>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Content ── */}
                {scrollable ? (
                    <Scrollable className="flex-1 max-h-[calc(90vh-100px)] min-h-0" scrollbarClassName="z-40">
                        {children}
                    </Scrollable>
                ) : (
                    children
                )}
            </DialogContent>
        </Dialog>
    );
}
