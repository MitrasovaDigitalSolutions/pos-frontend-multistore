"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BaseDialog } from "@/components/ui/base-dialog";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  IconUpload,
  IconDownload,
  IconLoader2,
  IconAlertTriangle,
  IconFileSpreadsheet,
  IconX,
  IconCheck,
  IconTableImport,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface ImportExportProps {
  // Controlled modal state
  open?: boolean;
  onOpen?: () => void;
  onClose?: () => void;

  // Action callbacks
  handleImport: (file: File) => Promise<void> | void;
  handleExport: () => Promise<void> | void;

  // External loading states (optional, falls back to internal promise-based loading)
  isLoadingImport?: boolean;
  isLoadingExport?: boolean;

  // Text & UI configurations
  title?: string;
  description?: string;
  warningMessage?: string;
  accept?: string; // e.g. ".csv, .xlsx, .xls"
  exportLabel?: string;
  importLabel?: string;
  showExport?: boolean;
  showImport?: boolean;

  // Template download
  templateDownloadUrl?: string;
  templateDownloadLabel?: string;

  // Progress states
  importProgress?: number | null;
  isProgressActive?: boolean;
}

export function ImportExport({
  open: openProp,
  onOpen,
  onClose,
  handleImport,
  handleExport,
  isLoadingImport,
  isLoadingExport,
  title = "Import Data",
  description = "Unggah file spreadsheet Anda untuk mengimpor data ke dalam sistem.",
  warningMessage = "Peringatan: Data yang sudah ada akan ditimpa dengan data baru dari file yang diimpor. Tindakan ini tidak dapat dibatalkan atau dikembalikan.",
  accept = ".xlsx, .xls, .csv",
  exportLabel = "Export",
  importLabel = "Import",
  showExport = true,
  showImport = true,
  templateDownloadUrl,
  templateDownloadLabel = "Unduh Template",
  importProgress = null,
  isProgressActive = false,
}: ImportExportProps) {
  // Modal state (support both controlled and uncontrolled)
  const isControlled = openProp !== undefined;
  const [isOpenInternal, setIsOpenInternal] = useState(false);
  const isOpen = isControlled ? openProp : isOpenInternal;

  // Internal loading states
  const [isImportingInternal, setIsImportingInternal] = useState(false);
  const [isExportingInternal, setIsExportingInternal] = useState(false);

  const isImporting = isLoadingImport !== undefined ? isLoadingImport : isImportingInternal;
  const isExporting = isLoadingExport !== undefined ? isLoadingExport : isExportingInternal;

  // Drag and Drop state
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Popover state
  const [showFinishedState, setShowFinishedState] = useState(false);
  const [importingFileName, setImportingFileName] = useState<string>("");
  const prevActiveRef = useRef(false);

  useEffect(() => {
    const isActive = isImporting || isProgressActive;
    if (prevActiveRef.current && !isActive) {
      setShowFinishedState(true);
      const timer = setTimeout(() => {
        setShowFinishedState(false);
        setImportingFileName("");
      }, 2000);
      return () => clearTimeout(timer);
    }
    prevActiveRef.current = isActive;
  }, [isImporting, isProgressActive]);

  const handleOpenDialog = () => {
    if (!isControlled) {
      setIsOpenInternal(true);
    }
    onOpen?.();
  };

  const handleCloseDialog = () => {
    if (isImporting) return; // Prevent closing while processing
    if (!isControlled) {
      setIsOpenInternal(false);
    }
    setSelectedFile(null);
    onClose?.();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleCloseDialog();
    } else {
      handleOpenDialog();
    }
  };

  // Drag and Drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };

  const triggerFileInput = () => {
    if (isImporting) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
    // Clear input so same file can be selected again
    e.target.value = "";
  };

  const validateAndSetFile = (file: File) => {
    const fileExtension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    const acceptedTypes = accept.split(",").map((t) => t.trim().toLowerCase());

    const isValid = acceptedTypes.some((type) => {
      if (type.startsWith(".")) {
        return fileExtension === type;
      }
      return file.type.includes(type);
    });

    if (!isValid) {
      toast.error(`Format file tidak valid. Gunakan format file: ${accept}`);
      return;
    }

    setSelectedFile(file);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Action confirmations
  const onExportClick = async () => {
    if (isExporting || isImporting) return;
    setIsExportingInternal(true);
    try {
      await handleExport();
    } catch (error) {
      console.error("Export error:", error);
    } finally {
      setIsExportingInternal(false);
    }
  };

  const onImportConfirm = async () => {
    if (!selectedFile || isImporting) return;
    setImportingFileName(selectedFile.name);
    setIsImportingInternal(true);
    try {
      await handleImport(selectedFile);
      setSelectedFile(null);
      handleCloseDialog();
    } catch (error) {
      console.error("Import error:", error);
    } finally {
      setIsImportingInternal(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        {showExport && (
          <Button
            type="button"
            variant="outline"
            onClick={onExportClick}
            disabled={isExporting || isImporting || isProgressActive}
            className="h-9 px-3 text-xs font-bold border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-emerald-600 rounded-xl flex gap-1.5 cursor-pointer bg-white transition-colors disabled:opacity-50"
          >
            {isExporting ? (
              <IconLoader2 size={16} className="animate-spin text-emerald-600" />
            ) : (
              <IconDownload size={16} className="text-slate-500 hover:text-emerald-600" />
            )}
            {exportLabel}
          </Button>
        )}

        {showImport && (
          <Popover open={isImporting || isProgressActive || showFinishedState}>
            <PopoverTrigger
              render={
                <Button
                  type="button"
                  onClick={handleOpenDialog}
                  disabled={isImporting || isProgressActive}
                  className="h-9 px-3 text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white rounded-xl flex gap-1.5 cursor-pointer transition-all disabled:bg-violet-600/50 disabled:opacity-90 relative"
                >
                  {isImporting || isProgressActive ? (
                    <IconLoader2 size={16} className="animate-spin" />
                  ) : (
                    <IconUpload size={16} />
                  )}
                  {importLabel}
                </Button>
              }
            />
            <PopoverContent
              side="top"
              align="end"
              sideOffset={8}
              className="w-72 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl rounded-2xl p-4 z-50 text-left animate-in fade-in slide-in-from-bottom-2 duration-200"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {showFinishedState ? (
                      <span className="flex items-center gap-1.5 text-violet-600 dark:text-violet-400">
                        <span className="w-5 h-5 rounded-full bg-violet-50 dark:bg-violet-950/35 flex items-center justify-center text-violet-600 dark:text-violet-400 shrink-0">
                          <IconCheck size={12} className="stroke-[3]" />
                        </span>
                        <span>Import Selesai!</span>
                      </span>
                    ) : isImporting && !isProgressActive ? (
                      <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <IconLoader2 size={14} className="animate-spin text-violet-600" />
                        <span>Mengunggah file...</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <IconLoader2 size={14} className="animate-spin text-violet-600" />
                        <span>Memproses data...</span>
                      </span>
                    )}
                  </span>
                  {!showFinishedState && importProgress !== null && (
                    <span className="text-xs font-mono font-extrabold text-violet-600 dark:text-violet-400">
                      {importProgress}%
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden relative">
                    {showFinishedState ? (
                      <div className="bg-violet-500 h-full w-full transition-all duration-300" />
                    ) : isImporting && !isProgressActive ? (
                      <div className="h-full bg-violet-600/30 rounded-full w-full overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-violet-600 to-transparent w-1/2 h-full animate-shimmer-loading" />
                      </div>
                    ) : (
                      <div
                        className="bg-violet-600 h-full transition-all duration-300 rounded-full relative overflow-hidden"
                        style={{ width: `${importProgress ?? 0}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-1/2 h-full animate-shimmer-loading" />
                      </div>
                    )}
                  </div>
                  {importingFileName && (
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate font-semibold">
                      File: {importingFileName}
                    </div>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Dialog Modal */}
      <BaseDialog
        open={isOpen}
        onOpenChange={handleOpenChange}
        showCloseButton={!isImporting}
        className="max-w-sm p-4 gap-0 overflow-hidden"
        title={
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-violet-100 flex items-center justify-center shrink-0">
              <IconFileSpreadsheet size={13} className="text-violet-600" />
            </div>
            <span className="text-[13px] font-bold text-slate-800">{title}</span>
          </div>
        }
      >
        <div className="space-y-3 pt-4">
          {/* Description */}
          <p className="text-[10px] text-slate-400 font-medium leading-relaxed -mt-2">
            {description}
          </p>

          {/* Warning inline */}
          <div className="flex items-start gap-2 bg-amber-50 px-3 py-2.5 rounded-xl border border-amber-200/70">
            <IconAlertTriangle size={13} className="text-amber-500 shrink-0 mt-[1px]" />
            <p className="text-[10px] text-amber-700 font-medium leading-relaxed">
              {warningMessage}
            </p>
          </div>

          {/* Template download — compact row */}
          {templateDownloadUrl && (
            <div className="flex items-center justify-between gap-2 bg-violet-50 border border-violet-100 rounded-xl px-3 py-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <IconTableImport size={13} className="text-violet-500 shrink-0" />
                <span className="text-[10px] font-semibold text-violet-700 truncate">
                  Belum punya template?
                </span>
              </div>
              <a
                href={templateDownloadUrl}
                download
                className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-violet-600 hover:text-violet-800 bg-white border border-violet-200 rounded-lg px-2 py-1 transition-all hover:border-violet-400 hover:shadow-sm"
              >
                <IconDownload size={11} className="shrink-0" />
                {templateDownloadLabel}
              </a>
            </div>
          )}

          {/* Drag-and-drop zone or file preview */}
          {!selectedFile ? (
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={triggerFileInput}
              className={cn(
                "border-2 border-dashed rounded-xl px-4 py-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all select-none",
                isDragActive
                  ? "border-violet-500 bg-violet-50/60 scale-[1.01]"
                  : "border-slate-200 hover:border-violet-400 hover:bg-slate-50/70"
              )}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept={accept}
                className="hidden"
                disabled={isImporting}
              />
              <div className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center transition-colors",
                isDragActive ? "bg-violet-100 text-violet-600" : "bg-slate-100 text-slate-400"
              )}>
                <IconUpload size={17} />
              </div>
              <div className="text-center">
                <p className="text-[11px] font-semibold text-slate-600">
                  <span className="text-violet-600">Klik pilih file</span> atau seret ke sini
                </p>
                <p className="text-[9px] text-slate-400 mt-1 font-medium uppercase tracking-wide">
                  {accept}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 border border-violet-100 rounded-xl px-3 py-2.5 bg-violet-50/40">
              <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center shrink-0">
                <IconFileSpreadsheet size={17} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-slate-800 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-[9px] text-slate-400 font-medium mt-0.5">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
              <button
                type="button"
                disabled={isImporting}
                onClick={() => setSelectedFile(null)}
                className="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors disabled:opacity-50 shrink-0"
              >
                <IconX size={14} />
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-9 text-xs font-bold border-slate-200 hover:bg-slate-50 rounded-xl cursor-pointer text-slate-600"
              onClick={handleCloseDialog}
              disabled={isImporting}
            >
              Batal
            </Button>
            <Button
              type="button"
              className="flex-1 h-9 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer bg-violet-600 hover:bg-violet-700 text-white disabled:bg-violet-400 disabled:opacity-70 transition-colors"
              onClick={onImportConfirm}
              disabled={!selectedFile || isImporting}
            >
              {isImporting ? (
                <>
                  <IconLoader2 size={13} className="animate-spin" />
                  <span>Mengimpor...</span>
                </>
              ) : (
                <>
                  <IconCheck size={13} />
                  <span>Import Sekarang</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </BaseDialog>
    </div>
  );
}
