"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
                  className="h-9 px-3 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex gap-1.5 cursor-pointer transition-all disabled:bg-emerald-600/50 disabled:opacity-90 relative"
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
                      <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                        <span className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/35 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                          <IconCheck size={12} className="stroke-[3]" />
                        </span>
                        <span>Import Selesai!</span>
                      </span>
                    ) : isImporting && !isProgressActive ? (
                      <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <IconLoader2 size={14} className="animate-spin text-emerald-600" />
                        <span>Mengunggah file...</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <IconLoader2 size={14} className="animate-spin text-emerald-600" />
                        <span>Memproses data...</span>
                      </span>
                    )}
                  </span>
                  {!showFinishedState && importProgress !== null && (
                    <span className="text-xs font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                      {importProgress}%
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden relative">
                    {showFinishedState ? (
                      <div className="bg-emerald-500 h-full w-full transition-all duration-300" />
                    ) : isImporting && !isProgressActive ? (
                      <div className="h-full bg-emerald-600/30 rounded-full w-full overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-600 to-transparent w-1/2 h-full animate-shimmer-loading" />
                      </div>
                    ) : (
                      <div
                        className="bg-emerald-600 h-full transition-all duration-300 rounded-full relative overflow-hidden"
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
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent
          className="max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 gap-0 border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden"
          showCloseButton={!isImporting}
        >
          <DialogHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
            <DialogTitle className="text-sm font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <IconFileSpreadsheet size={18} className="text-emerald-600" />
              <span>{title}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            {/* Warning Alert Box */}
            <div className="flex items-start gap-2.5 bg-amber-55/10 dark:bg-amber-950/20 p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/50">
              <IconAlertTriangle size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-[11px] text-amber-800 dark:text-amber-400 font-semibold leading-relaxed">
                {warningMessage}
              </div>
            </div>

            {/* Drag and Drop Zone or selected file preview */}
            {!selectedFile ? (
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={triggerFileInput}
                className={cn(
                  "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all",
                  isDragActive
                    ? "border-emerald-500 bg-emerald-50/10 dark:bg-emerald-950/10"
                    : "border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
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
                <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-850 flex items-center justify-center text-slate-400 hover:text-emerald-500 transition-colors">
                  <IconUpload size={20} />
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Tarik & lepas file di sini, atau klik untuk memilih file
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5">
                    Format yang didukung: {accept}
                  </p>
                </div>
              </div>
            ) : (
              <div className="border border-slate-100 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-emerald-55/10 dark:bg-emerald-950/30 text-emerald-600 flex items-center justify-center shrink-0">
                    <IconFileSpreadsheet size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate pr-2">
                      {selectedFile.name}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                      Ukuran: {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={isImporting}
                  onClick={() => setSelectedFile(null)}
                  className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg"
                >
                  <IconX size={16} />
                </Button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="w-full flex gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-10 text-xs font-bold border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
              onClick={handleCloseDialog}
              disabled={isImporting}
            >
              Batal
            </Button>
            <Button
              type="button"
              className="flex-1 h-10 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-emerald-600/50 disabled:opacity-90"
              onClick={onImportConfirm}
              disabled={!selectedFile || isImporting}
            >
              {isImporting ? (
                <>
                  <IconLoader2 size={14} className="animate-spin" />
                  <span>Mengimpor...</span>
                </>
              ) : (
                <>
                  <IconCheck size={14} />
                  <span>Import Sekarang</span>
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
