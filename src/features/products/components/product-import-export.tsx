"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { apiClient } from "@/shared/api/axios";
import { toast } from "sonner";
import {
  IconUpload,
  IconDownload,
  IconLoader2,
  IconCheck,
  IconAlertCircle,
  IconFileSpreadsheet,
} from "@tabler/icons-react";

interface ProductImportExportProps {
  importUrl?: string;
  exportUrl?: string;
  progressUrlFn?: (id: string) => string;
  onImportSuccess?: () => void;
}

export function ProductImportExport({
  importUrl = "/v1/template-product/import",
  exportUrl = "/v1/template-product/export",
  progressUrlFn = (id) => `/v1/template-product/import/progress/${id}`,
  onImportSuccess,
}: ProductImportExportProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importStatus, setImportStatus] = useState<"idle" | "uploading" | "processing" | "completed" | "failed">("idle");
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await apiClient.get(exportUrl, {
        responseType: "blob",
      });

      // Extract filename from Content-Disposition if present
      let filename = "template_produk.xlsx";
      const contentDisposition = response.headers["content-disposition"];
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      // Create download link
      const contentType = response.headers["content-type"];
      const blob = new Blob([response.data], {
        type: typeof contentType === "string" ? contentType : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Template data produk berhasil diunduh.");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Gagal mengunduh template data produk.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file extension
    const allowedExtensions = /(\.csv|\.xlsx|\.xls)$/i;
    if (!allowedExtensions.exec(file.name)) {
      toast.error("Format file tidak valid. Gunakan file .csv, .xlsx, atau .xls.");
      event.target.value = "";
      return;
    }

    setIsImporting(true);
    setImportProgress(0);
    setImportStatus("uploading");
    setErrorMessage(null);
    setPopoverOpen(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await apiClient.post(importUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const responseData = response.data as {
        data?: {
          id?: string;
          import_id?: string;
          uuid?: string;
        };
        id?: string;
        import_id?: string;
        uuid?: string;
      };
      const importId =
        responseData?.data?.id ||
        responseData?.id ||
        responseData?.data?.import_id ||
        responseData?.import_id ||
        responseData?.data?.uuid ||
        responseData?.uuid;

      if (!importId) {
        // If no background job ID is returned, assume it completed instantly
        setImportProgress(100);
        setImportStatus("completed");
        toast.success("Data produk berhasil diimport!");
        onImportSuccess?.();
        setIsImporting(false);
        return;
      }

      // 3. Start polling the progress status
      setImportStatus("processing");
      startPolling(importId);
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      console.error("Import upload error:", err);
      const errorMsg = err.response?.data?.message || err.message || "Gagal mengunggah file import.";
      setImportStatus("failed");
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
      setIsImporting(false);
    } finally {
      // Clear file input value to allow uploading the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const startPolling = (id: string) => {
    // Clear any existing polling
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const response = await apiClient.get(progressUrlFn(id));
        const resData = response.data as {
          data?: {
            progress?: number | string;
            status?: string;
            message?: string;
            error?: string;
          };
          progress?: number | string;
          status?: string;
          message?: string;
          error?: string;
        };

        // Handle wrapper structures gracefully
        const progressDetails = resData?.data || resData;
        const progressPercent = Number(progressDetails?.progress ?? 0);
        const status = progressDetails?.status;

        setImportProgress(progressPercent);

        if (status === "completed" || progressPercent >= 100) {
          stopPollingAndFinish(true);
        } else if (status === "failed" || status === "error") {
          stopPollingAndFinish(false, progressDetails?.error || progressDetails?.message || "Gagal memproses import data.");
        }
      } catch (error) {
        console.error("Polling import progress error:", error);
        // Do not stop immediately on a single network failure, let it retry, but keep track
      }
    }, 1500);
  };

  const stopPollingAndFinish = (success: boolean, errorDetail?: string) => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    setIsImporting(false);

    if (success) {
      setImportStatus("completed");
      setImportProgress(100);
      toast.success("Proses import selesai dengan sukses!");
      onImportSuccess?.();
    } else {
      setImportStatus("failed");
      setErrorMessage(errorDetail || "Terjadi kesalahan saat memproses data.");
      toast.error(errorDetail || "Import data produk gagal.");
    }
  };

  const handleClosePopover = () => {
    if (isImporting) return; // Prevent closing manually while importing to ensure visibility
    setPopoverOpen(false);
    // Reset status after closing if it's in final state
    setTimeout(() => {
      setImportStatus("idle");
      setImportProgress(0);
      setErrorMessage(null);
    }, 200);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".csv, .xlsx, .xls"
        className="hidden"
        disabled={isImporting}
      />

      {/* Export Template Button */}
      <Button
        onClick={handleExport}
        disabled={isExporting || isImporting}
        variant="outline"
        className="h-9 px-3 text-xs font-bold border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-emerald-600 rounded-xl flex gap-1.5 cursor-pointer bg-white transition-colors disabled:opacity-50"
      >
        {isExporting ? (
          <IconLoader2 size={16} className="animate-spin text-emerald-600" />
        ) : (
          <IconDownload size={16} className="text-slate-500 hover:text-emerald-600" />
        )}
        Export Template
      </Button>

      {/* Import Button with Popover */}
      <Popover open={popoverOpen} onOpenChange={(open) => {
        // Only allow manual closing if not currently importing
        if (!isImporting) {
          if (!open) {
            handleClosePopover();
          } else {
            setPopoverOpen(true);
          }
        }
      }}>
        <PopoverTrigger
          render={
            <Button
              onClick={handleImportClick}
              disabled={isImporting}
              className="h-9 px-3 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex gap-1.5 cursor-pointer transition-colors disabled:bg-emerald-600/50 disabled:opacity-90 disabled:cursor-not-allowed"
            >
              {isImporting ? (
                <IconLoader2 size={16} className="animate-spin" />
              ) : (
                <IconUpload size={16} />
              )}
              Import Produk
            </Button>
          }
        />
        <PopoverContent
          side="top"
          align="end"
          sideOffset={10}
          className="w-80 p-4 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 text-left outline-none"
        >
          <div className="space-y-3.5">
            {/* Title / Header */}
            <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
              <IconFileSpreadsheet className="text-emerald-600 shrink-0" size={18} />
              <span className="font-bold text-slate-900 text-sm">Status Import Produk</span>
            </div>

            {/* Status Messages */}
            {importStatus === "uploading" && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-600 text-xs">
                  <IconLoader2 size={14} className="animate-spin text-emerald-600 shrink-0" />
                  <span>Mengunggah file ke server...</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full animate-pulse w-1/3" />
                </div>
              </div>
            )}

            {importStatus === "processing" && (
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-slate-600 flex items-center gap-1.5">
                    <IconLoader2 size={14} className="animate-spin text-emerald-600 shrink-0" />
                    Memproses baris data...
                  </span>
                  <span className="text-emerald-600 font-bold font-mono text-sm">{importProgress}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${importProgress}%` }}
                  />
                </div>
              </div>
            )}

            {importStatus === "completed" && (
              <div className="space-y-3">
                <div className="flex items-start gap-2.5 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100/50">
                  <IconCheck size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-emerald-800">Selesai</p>
                    <p className="text-[11px] text-emerald-600 mt-0.5">
                      Seluruh data produk dari file template telah berhasil diimpor ke dalam sistem.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleClosePopover}
                  className="w-full h-8 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl cursor-pointer"
                >
                  Tutup
                </Button>
              </div>
            )}

            {importStatus === "failed" && (
              <div className="space-y-3">
                <div className="flex items-start gap-2.5 bg-rose-50/50 p-2.5 rounded-xl border border-rose-100/50">
                  <IconAlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-rose-800">Gagal</p>
                    <p className="text-[11px] text-rose-600 mt-0.5 leading-relaxed">
                      {errorMessage || "Terjadi kesalahan sistem saat memproses file."}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleClosePopover}
                  className="w-full h-8 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl cursor-pointer"
                >
                  Tutup
                </Button>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
