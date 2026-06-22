"use client";

import React from "react";
import { BaseDialog } from "@/components/ui/base-dialog";
import { IconPrinter, IconDownload } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

interface PrintPreviewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    pdfUrl: string;
    title?: string;
}

export function PrintPreviewDialog({
    open,
    onOpenChange,
    pdfUrl,
    title = "Pratinjau Cetak Laporan",
}: PrintPreviewDialogProps) {
    if (!pdfUrl) return null;

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={
                <div className="flex items-center gap-2">
                    <IconPrinter className="text-emerald-600" size={18} />
                    <span>{title}</span>
                </div>
            }
            className="max-w-5xl sm:max-w-5xl h-[85vh] flex flex-col"
        >
            <div className="flex-1 w-full h-full min-h-0 py-2 relative flex flex-col">
                <iframe
                    src={pdfUrl}
                    title="PDF Print Preview"
                    className="w-full flex-1 rounded-xl border border-slate-200 shadow-inner bg-slate-50 h-[65vh] min-h-[50vh]"
                />
                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 mt-4 shrink-0">
                    <Button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        className="h-10 border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold px-4"
                        variant="outline"
                    >
                        Tutup
                    </Button>
                    <Button
                        type="button"
                        onClick={() => {
                            const link = document.createElement("a");
                            link.href = pdfUrl;
                            link.download = "laporan.pdf";
                            link.click();
                        }}
                        className="h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold px-4 flex items-center gap-1.5 border-none cursor-pointer"
                    >
                        <IconDownload size={14} />
                        Unduh PDF
                    </Button>
                </div>
            </div>
        </BaseDialog>
    );
}
