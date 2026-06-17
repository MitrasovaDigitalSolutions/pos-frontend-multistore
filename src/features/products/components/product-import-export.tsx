"use client";

import React, { useState } from "react";
import { apiClient } from "@/shared/api/axios";
import { toast } from "sonner";
import { ImportExport } from "@/components/shared/import-export";

interface ProductImportExportProps {
  importUrl?: string;
  exportUrl?: string;
  progressUrlFn?: (id: string) => string;
  onImportSuccess?: () => void;
  showImport?: boolean;
  showExport?: boolean;
}

export function ProductImportExport({
  importUrl = "/v1/template-product/import",
  exportUrl = "/v1/template-product/export",
  progressUrlFn = (id) => `/v1/template-product/import/progress/${id}`,
  onImportSuccess,
  showImport = true,
  showExport = true,
}: ProductImportExportProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

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
        type:
          typeof contentType === "string"
            ? contentType
            : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
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
      throw error;
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (file: File) => {
    setIsImporting(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      // 1. Upload file
      const response = await apiClient.post(importUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const responseData = response.data as {
        data?: { id?: string; import_id?: string; uuid?: string };
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
        toast.success("Data produk berhasil diimport!");
        onImportSuccess?.();
        return;
      }

      // 2. Poll progress status using a promise wrapper
      await new Promise<void>((resolve, reject) => {
        let interval: NodeJS.Timeout | null = null;
        
        const cleanUp = () => {
          if (interval) clearInterval(interval);
        };

        interval = setInterval(async () => {
          try {
            const progressResponse = await apiClient.get(progressUrlFn(importId));
            const resData = progressResponse.data as {
              data?: { status?: string; progress?: number | string; error?: string; message?: string };
              status?: string;
              progress?: number | string;
              error?: string;
              message?: string;
            };

            const progressDetails = resData?.data || resData;
            const status = progressDetails?.status;
            const progressPercent = Number(progressDetails?.progress ?? 0);

            if (status === "completed" || progressPercent >= 100) {
              cleanUp();
              toast.success("Proses import selesai dengan sukses!");
              onImportSuccess?.();
              resolve();
            } else if (status === "failed" || status === "error") {
              cleanUp();
              const errorMsg =
                progressDetails?.error || progressDetails?.message || "Gagal memproses import data.";
              toast.error(errorMsg);
              reject(new Error(errorMsg));
            }
          } catch (err) {
            console.error("Polling error:", err);
            // Don't reject immediately on temporary network issues, keep polling
          }
        }, 1500);
      });
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      console.error("Import error:", err);
      const errorMsg = err.response?.data?.message || err.message || "Gagal mengimpor file data.";
      toast.error(errorMsg);
      throw error;
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <ImportExport
      title="Import Data Produk"
      description="Unggah template data produk (.xlsx, .xls, atau .csv) untuk mengimpor data produk baru atau memperbarui produk yang ada."
      warningMessage="Peringatan: Data produk lama yang cocok dengan data baru akan ditimpa. Tindakan ini tidak dapat dibatalkan atau dikembalikan."
      handleExport={handleExport}
      handleImport={handleImport}
      isLoadingImport={isImporting}
      isLoadingExport={isExporting}
      showImport={showImport}
      showExport={showExport}
    />
  );
}
