"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, FormProvider, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BaseDialog } from "@/components/ui/base-dialog";
import { FormInput } from "@/components/forms/form-input";
import { Button } from "@/components/ui/button";
import {
    IconClipboardCheck,
    IconFileSpreadsheet,
    IconFileTypePdf,
    IconUpload,
    IconX,
    IconDownload,
    IconLoader2,
    IconEdit,
    IconCheck,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { opnameHeaderSchema, type OpnameHeaderInput } from "../schemas/opname-schema";
import {
    useCreateOpname,
    useImportOpname,
    downloadOpnameTemplateXlsx,
    downloadOpnameSheetPdf,
} from "../api/stock-api";
import { useAppRouter } from "@/hooks/use-app-router";

interface OpnameDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function OpnameDialog({
    open,
    onOpenChange,
}: OpnameDialogProps) {
    const router = useAppRouter();
    const [activeTab, setActiveTab] = useState<"import" | "manual">("import");

    // Excel Import States
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [catatanImport, setCatatanImport] = useState("");
    const [isDragActive, setIsDragActive] = useState(false);
    const [isDownloadingXlsx, setIsDownloadingXlsx] = useState(false);
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // API Mutations
    const createOpname = useCreateOpname();
    const importOpname = useImportOpname();

    const methods = useForm<OpnameHeaderInput>({
        resolver: zodResolver(opnameHeaderSchema) as Resolver<OpnameHeaderInput>,
        defaultValues: {
            catatan: "",
        },
    });

    const {
        handleSubmit,
        reset,
    } = methods;

    useEffect(() => {
        if (open) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setActiveTab("import");
            setSelectedFile(null);
            setCatatanImport("");
            reset({
                catatan: "",
            });
        }
    }, [open, reset]);

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
        if (catatanImport.trim()) {
            formData.append("catatan", catatanImport.trim());
        }

        importOpname.mutate(formData, {
            onSuccess: (res) => {
                toast.success("Draft stock opname berhasil dibuat dari file Excel!");
                onOpenChange(false);
                router.push(`/admin/inventory/stock-opname/${res.data.uid}/items`);
            },
            onError: (err) => {
                toast.error(err.message || "Gagal mengimpor file stock opname.");
            },
        });
    };

    const onManualSubmit = (data: OpnameHeaderInput) => {
        createOpname.mutate(data, {
            onSuccess: (res) => {
                toast.success("Draft stock opname berhasil dibuat!");
                onOpenChange(false);
                router.push(`/admin/inventory/stock-opname/${res.data.uid}/items`);
            },
            onError: (err) => {
                toast.error(err.message || "Gagal membuat stock opname.");
            },
        });
    };

    const isPending = createOpname.isPending || importOpname.isPending;

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                        <IconClipboardCheck size={18} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 leading-none">
                            Buat Stock Opname Baru
                        </h3>
                        <p className="text-[11px] text-slate-400 font-normal mt-0.5">
                            Pilih metode pembuatan draft perhitungan stok
                        </p>
                    </div>
                </div>
            }
            className="sm:max-w-lg flex flex-col max-h-[90dvh] p-0 overflow-hidden"
        >
            {/* ── Tab Selector ── */}
            <div className="px-5 pt-4 pb-2 bg-slate-50/70 border-b border-slate-100">
                <div className="grid grid-cols-2 p-1 bg-slate-200/70 rounded-xl gap-1">
                    <button
                        type="button"
                        onClick={() => setActiveTab("import")}
                        disabled={isPending}
                        className={cn(
                            "flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer",
                            activeTab === "import"
                                ? "bg-white text-emerald-700 shadow-xs"
                                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                        )}
                    >
                        <IconFileSpreadsheet size={15} />
                        <span>Upload Excel (Default)</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("manual")}
                        disabled={isPending}
                        className={cn(
                            "flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer",
                            activeTab === "manual"
                                ? "bg-white text-emerald-700 shadow-xs"
                                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                        )}
                    >
                        <IconEdit size={15} />
                        <span>Input Manual</span>
                    </button>
                </div>
            </div>

            {/* ── Tab Contents ── */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                {/* ── Template Download Banner (Available on both tabs) ── */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                            <IconDownload size={13} className="text-slate-500" />
                            Dokumen & Template Opname
                        </span>
                        <span className="text-[10px] text-slate-400">Siap Cetak / Edit</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={handleDownloadTemplateXlsx}
                            disabled={isDownloadingXlsx || isPending}
                            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 text-emerald-800 text-[11px] font-bold transition-colors cursor-pointer disabled:opacity-50"
                        >
                            {isDownloadingXlsx ? (
                                <IconLoader2 size={13} className="animate-spin" />
                            ) : (
                                <IconFileSpreadsheet size={14} className="text-emerald-600 shrink-0" />
                            )}
                            <span className="truncate">Unduh Template Excel (.xlsx)</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleDownloadSheetPdf}
                            disabled={isDownloadingPdf || isPending}
                            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-rose-50 hover:bg-rose-100/80 border border-rose-200/80 text-rose-800 text-[11px] font-bold transition-colors cursor-pointer disabled:opacity-50"
                        >
                            {isDownloadingPdf ? (
                                <IconLoader2 size={13} className="animate-spin" />
                            ) : (
                                <IconFileTypePdf size={14} className="text-rose-600 shrink-0" />
                            )}
                            <span className="truncate">Unduh Lembar Fisik (.pdf)</span>
                        </button>
                    </div>
                </div>

                {activeTab === "import" ? (
                    <form id="import-opname-form" onSubmit={handleImportSubmit} className="space-y-4">
                        {/* Drag & Drop Upload Zone */}
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
                                    <div className="p-3 rounded-full bg-emerald-50 text-emerald-600 mb-1">
                                        <IconUpload size={22} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-700">
                                            Klik untuk memilih file atau tarik file Excel ke sini
                                        </p>
                                        <p className="text-[10.5px] text-slate-400 mt-0.5">
                                            Format yang didukung: <span className="font-semibold">.xlsx, .xls</span>
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Catatan Input */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">
                                Catatan Opname <span className="text-slate-400 font-normal">(Opsional)</span>
                            </label>
                            <input
                                type="text"
                                value={catatanImport}
                                onChange={(e) => setCatatanImport(e.target.value)}
                                placeholder="Contoh: Opname Hasil Stock Take Gudang A..."
                                disabled={isPending}
                                className="w-full h-10 px-3 text-xs rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/20 outline-none bg-white transition-colors"
                            />
                        </div>
                    </form>
                ) : (
                    <FormProvider {...methods}>
                        <form id="manual-opname-form" onSubmit={handleSubmit(onManualSubmit)} className="space-y-4">
                            <div className="space-y-1">
                                <FormInput<OpnameHeaderInput>
                                    name="catatan"
                                    label="Catatan Opname"
                                    placeholder="Contoh: Opname Bulanan Akhir Juni 2026..."
                                    disabled={isPending}
                                />
                                <p className="text-[10.5px] text-slate-400">
                                    Draf opname manual akan dibuat kosong. Anda dapat memindai barcode atau mencari produk pada langkah berikutnya.
                                </p>
                            </div>
                        </form>
                    </FormProvider>
                )}
            </div>

            {/* ── Dialog Footer Actions ── */}
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2.5 shrink-0">
                <Button
                    type="button"
                    onClick={() => onOpenChange(false)}
                    variant="outline"
                    className="h-9 px-4 text-xs font-bold rounded-xl border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
                    disabled={isPending}
                >
                    Batal
                </Button>

                {activeTab === "import" ? (
                    <Button
                        type="submit"
                        form="import-opname-form"
                        disabled={!selectedFile || isPending}
                        className="h-9 px-4.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs border-none disabled:opacity-50"
                    >
                        {importOpname.isPending ? (
                            <>
                                <IconLoader2 size={14} className="animate-spin" />
                                <span>Mengimpor Excel...</span>
                            </>
                        ) : (
                            <>
                                <IconUpload size={14} />
                                <span>Upload & Buat Draf</span>
                            </>
                        )}
                    </Button>
                ) : (
                    <Button
                        type="submit"
                        form="manual-opname-form"
                        disabled={isPending}
                        className="h-9 px-4.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs border-none"
                    >
                        {createOpname.isPending ? (
                            <>
                                <IconLoader2 size={14} className="animate-spin" />
                                <span>Membuat Draf...</span>
                            </>
                        ) : (
                            <>
                                <IconCheck size={14} />
                                <span>Buat Draf Manual</span>
                            </>
                        )}
                    </Button>
                )}
            </div>
        </BaseDialog>
    );
}
