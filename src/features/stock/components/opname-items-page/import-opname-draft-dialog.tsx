"use client";

import { useRef, useState } from "react";
import { BaseDialog } from "@/components/ui/base-dialog";
import { Button } from "@/components/ui/button";
import {
    IconFileSpreadsheet,
    IconFileTypePdf,
    IconUpload,
    IconX,
    IconDownload,
    IconLoader2,
    IconAlertCircle,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { OpnameItem } from "../../types";
import {
    useImportOpnameIntoDraft,
    downloadOpnameTemplateXlsx,
    downloadOpnameSheetPdf,
} from "../../api/stock-api";

interface ImportOpnameDraftDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    opnameUid: string;
    nomorOpname: string;
    onImportSuccess: (items?: OpnameItem[]) => void;
}

export function ImportOpnameDraftDialog({
    open,
    onOpenChange,
    opnameUid,
    nomorOpname,
    onImportSuccess,
}: ImportOpnameDraftDialogProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragActive, setIsDragActive] = useState(false);
    const [isDownloadingXlsx, setIsDownloadingXlsx] = useState(false);
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const importIntoDraft = useImportOpnameIntoDraft();

    const handleDownloadTemplateXlsx = async () => {
        setIsDownloadingXlsx(true);
        try {
            await downloadOpnameTemplateXlsx();
            toast.success("Template Excel Stock Opname berhasil diunduh.");
        } catch (error) {
            console.error("Gagal mengunduh template XLSX:", error);
            toast.error("Gagal mengunduh template Excel.");
        } finally {
            setIsDownloadingXlsx(false);
        }
    };

    const handleDownloadSheetPdf = async () => {
        setIsDownloadingPdf(true);
        try {
            await downloadOpnameSheetPdf();
            toast.success("Lembar Cetak Stock Opname (PDF) berhasil diunduh.");
        } catch (error) {
            console.error("Gagal mengunduh lembar PDF:", error);
            toast.error("Gagal mengunduh lembar PDF.");
        } finally {
            setIsDownloadingPdf(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.name.match(/\.(xlsx|xls)$/i)) {
                toast.error("Format file harus berupa spreadsheet Excel (.xlsx atau .xls)");
                return;
            }
            setSelectedFile(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragActive(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragActive(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragActive(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            if (!file.name.match(/\.(xlsx|xls)$/i)) {
                toast.error("Format file harus berupa spreadsheet Excel (.xlsx atau .xls)");
                return;
            }
            setSelectedFile(file);
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleImportSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) {
            toast.error("Silakan pilih file Excel (.xlsx) terlebih dahulu.");
            return;
        }

        const formData = new FormData();
        formData.append("file", selectedFile);

        importIntoDraft.mutate(
            { uid: opnameUid, formData },
            {
                onSuccess: (res) => {
                    toast.success("File Excel berhasil diunggah ke draf opname!");
                    onOpenChange(false);
                    setSelectedFile(null);
                    onImportSuccess(res.data?.items);
                },
                onError: (err) => {
                    toast.error(err.message || "Gagal mengimpor file ke draf stock opname.");
                },
            }
        );
    };

    const isPending = importIntoDraft.isPending;

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                        <IconFileSpreadsheet size={18} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 leading-none">
                            Upload Excel ke Draf #{nomorOpname}
                        </h3>
                        <p className="text-[11px] text-slate-400 font-normal mt-0.5">
                            Perbarui item perhitungan draf ini dari file spreadsheet
                        </p>
                    </div>
                </div>
            }
            className="sm:max-w-md flex flex-col max-h-[90dvh] p-0 overflow-hidden"
        >
            <div className="flex-1 overflow-y-auto space-y-4">
                {/* ── Warning Note ── */}
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/80 border border-amber-200/70 text-amber-800 text-[11px] leading-relaxed">
                    <IconAlertCircle size={16} className="shrink-0 text-amber-600 mt-0.5" />
                    <span>
                        File Excel yang diunggah akan menyelaraskan item perhitungan draf ini. Pastikan format kolom sesuai dengan template standar.
                    </span>
                </div>

                {/* ── Template Download Banner ── */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                            <IconDownload size={13} className="text-slate-500" />
                            Dokumen & Template
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={handleDownloadTemplateXlsx}
                            disabled={isDownloadingXlsx || isPending}
                            className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[10.5px] font-bold transition-colors cursor-pointer disabled:opacity-50"
                        >
                            {isDownloadingXlsx ? (
                                <IconLoader2 size={12} className="animate-spin" />
                            ) : (
                                <IconFileSpreadsheet size={13} className="text-emerald-600" />
                            )}
                            <span className="truncate">Template (.xlsx)</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleDownloadSheetPdf}
                            disabled={isDownloadingPdf || isPending}
                            className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 text-[10.5px] font-bold transition-colors cursor-pointer disabled:opacity-50"
                        >
                            {isDownloadingPdf ? (
                                <IconLoader2 size={12} className="animate-spin" />
                            ) : (
                                <IconFileTypePdf size={13} className="text-rose-600" />
                            )}
                            <span className="truncate">Lembar (.pdf)</span>
                        </button>
                    </div>
                </div>

                {/* ── Drag & Drop Area ── */}
                <form id="import-draft-form" onSubmit={handleImportSubmit} className="space-y-3">
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                            "relative border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2",
                            isDragActive
                                ? "border-emerald-500 bg-emerald-50/50 scale-[0.99]"
                                : selectedFile
                                    ? "border-emerald-300 bg-emerald-50/20"
                                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                        )}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx, .xls"
                            onChange={handleFileChange}
                            className="hidden"
                            disabled={isPending}
                        />

                        {selectedFile ? (
                            <div className="flex items-center gap-3 w-full p-2.5 bg-white rounded-lg border border-emerald-200 shadow-xs">
                                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg shrink-0">
                                    <IconFileSpreadsheet size={20} />
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                    <p className="text-xs font-bold text-slate-800 truncate">
                                        {selectedFile.name}
                                    </p>
                                    <p className="text-[10px] text-slate-400">
                                        {(selectedFile.size / 1024).toFixed(1)} KB • Siap diunggah
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveFile();
                                    }}
                                    disabled={isPending}
                                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                                    title="Hapus file"
                                >
                                    <IconX size={16} />
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="p-2.5 rounded-full bg-emerald-50 text-emerald-600 mb-0.5">
                                    <IconUpload size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-700">
                                        Pilih file Excel atau tarik ke sini
                                    </p>
                                    <p className="text-[10.5px] text-slate-400 mt-0.5">
                                        Format: <span className="font-semibold">.xlsx, .xls</span>
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </form>
            </div>

            {/* ── Dialog Footer ── */}
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2 shrink-0">
                <Button
                    type="button"
                    onClick={() => onOpenChange(false)}
                    variant="outline"
                    className="h-9 px-4 text-xs font-bold rounded-xl border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
                    disabled={isPending}
                >
                    Batal
                </Button>

                <Button
                    type="submit"
                    form="import-draft-form"
                    disabled={!selectedFile || isPending}
                    className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs border-none disabled:opacity-50"
                >
                    {isPending ? (
                        <>
                            <IconLoader2 size={14} className="animate-spin" />
                            <span>Mengunggah...</span>
                        </>
                    ) : (
                        <>
                            <IconUpload size={14} />
                            <span>Upload ke Draf Ini</span>
                        </>
                    )}
                </Button>
            </div>
        </BaseDialog>
    );
}
