"use client";

import { ImportExport } from "@/components/shared/import-export";
import { apiClient } from "@/shared/api/axios";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface ProductImportExportProps {
  importUrl?: string;
  exportUrl?: string;
  progressUrlFn?: (uid: string) => string;
  onImportSuccess?: () => void;
  showImport?: boolean;
  showExport?: boolean;
}

export function ProductImportExport({
  importUrl = "/v1/template-product/import",
  exportUrl = "/v1/template-product/export",
  progressUrlFn = (uid) => `/v1/template-product/import/progress/${uid}`,
  onImportSuccess,
  showImport = true,
  showExport = true,
}: ProductImportExportProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [importProgress, setImportProgress] = useState<number | null>(null);
  const [isProgressActive, setIsProgressActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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

  const startPollingProgress = (importId: string) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    setIsProgressActive(true);
    setImportProgress(0);
    let errorCount = 0;

    const cleanUp = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsProgressActive(false);
      setImportProgress(null);
      localStorage.removeItem("active_import_product_uid");
    };

    intervalRef.current = setInterval(async () => {
      try {
        const url = progressUrlFn(importId);
        const progressResponse = await apiClient.get(url);

        errorCount = 0; // Reset error count on success

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

        setImportProgress(progressPercent);

        if (status === "completed" || progressPercent >= 100) {
          cleanUp();
          toast.success("Proses import selesai dengan sukses!");
          onImportSuccess?.();
        } else if (status === "failed" || status === "error") {
          cleanUp();
          const errorMsg =
            progressDetails?.error || progressDetails?.message || "Gagal memproses import data.";
          toast.error(errorMsg);
        } else if (status !== "processing" && status !== "pending") {
          cleanUp();
          onImportSuccess?.();
        }
      } catch (err) {
        console.error("Polling error:", err);
        errorCount++;
        if (errorCount >= 3) {
          cleanUp();
          toast.error("Gagal menghubungi server import. Proses monitoring dihentikan.");
        }
      }
    }, 3000); // 3 seconds interval
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
        data?: { id?: string; import_uid?: string; uid?: string };
        id?: string;
        import_uid?: string;
        uid?: string;
      };

      const importId =
        responseData?.data?.id ||
        responseData?.id ||
        responseData?.data?.import_uid ||
        responseData?.import_uid ||
        responseData?.data?.uid ||
        responseData?.uid;

      if (!importId) {
        // If no background job ID is returned, assume it completed instantly
        toast.success("Data produk berhasil diimport!");
        onImportSuccess?.();
        setIsImporting(false);
        return;
      }

      toast.info("Import sedang diproses.");
      setIsImporting(false);

      // Save active import ID to localStorage
      localStorage.setItem("active_import_product_uid", String(importId));

      // Start polling asynchronously without awaiting it
      startPollingProgress(String(importId));

    } catch (error) {
      setIsImporting(false);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      console.error("Import error:", err);
      const errorMsg = err.response?.data?.message || err.message || "Gagal mengimpor file data.";
      toast.error(errorMsg);
      throw error;
    }
  };

  useEffect(() => {
    const savedImportId = localStorage.getItem("active_import_product_uid");
    if (savedImportId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      startPollingProgress(savedImportId);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      importProgress={importProgress}
      isProgressActive={isProgressActive}
      templateDownloadUrl="/api/v1/template-product/download"
    />
  );
}
