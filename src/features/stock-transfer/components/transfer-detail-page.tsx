"use client";

import { ROUTES } from "@/constants/routes";
import { useAppRouter } from "@/hooks/use-app-router";
import { ENDPOINTS } from "@/shared/api/endpoints";
import { useActiveStoreStore } from "@/stores/active-store-store";
import { IconAlertCircle, IconCircleX } from "@tabler/icons-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  useCancelStockTransfer,
  useFinalizeStockTransfer,
  useReceiveStockTransfer,
  useStockTransferDetail,
  useValidateStockTransferReturn,
} from "../api/stock-transfer-api";
import { JENIS_SELISIH, TRANSFER_SHIPMENT_STATUS, TRANSFER_STATUS } from "../constants";

import { AppButton } from "@/components/shared/app-button";
import { BaseDialog } from "@/components/ui/base-dialog";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";

import type { StockTransferItem } from "../types";
import { TransferDetailHeader } from "./detail/transfer-detail-header";
import { TransferDetailInfoCards } from "./detail/transfer-detail-info-cards";
import { TransferDetailItemsTable } from "./detail/transfer-detail-items-table";
import { TransferDetailStepper } from "./detail/transfer-detail-stepper";
import type { ReceiveFormValues } from "./detail/types";

interface TransferDetailPageProps {
  uid: string;
}

export function TransferDetailPage({ uid }: TransferDetailPageProps) {
  const router = useAppRouter();
  const activeStoreUid = useActiveStoreStore((state) => state.activeStoreUid);

  const { data: transfer, isLoading, isFetching, error } = useStockTransferDetail(uid);
  const finalize = useFinalizeStockTransfer();
  const receive = useReceiveStockTransfer();
  const validateReturn = useValidateStockTransferReturn();
  const cancel = useCancelStockTransfer();

  const formMethods = useForm<ReceiveFormValues>({
    defaultValues: {
      items: [],
    },
  });

  useEffect(() => {
    if (transfer?.items) {
      formMethods.reset({
        items: transfer.items.map((item) => ({
          product_uid: item.product_uid,
          status: item.status || "received",
          jenis_selisih: item.jenis_selisih || null,
          kuantitas_diterima: item.kuantitas_diterima ?? item.kuantitas,
          kuantitas_return: item.kuantitas_return ?? (item.kuantitas - (item.kuantitas_diterima || 0)),
          keterangan: item.keterangan || "",
        })),
      });
    }
  }, [transfer, formMethods]);

  const [confirmFinalizeOpen, setConfirmFinalizeOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [processingItemUid, setProcessingItemUid] = useState<string | null>(null);
  const [validatingItemUid, setValidatingItemUid] = useState<string | null>(null);

  // Fixed Array Index Order Ref to prevent row shifting when refetching
  const initialOrderRef = useRef<string[]>([]);
  useEffect(() => {
    if (transfer?.items && initialOrderRef.current.length === 0) {
      initialOrderRef.current = transfer.items.map((it) => it.uid);
    }
  }, [transfer?.items]);

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const items = useMemo(() => {
    if (!transfer?.items) return [];
    const list = [...transfer.items];
    // eslint-disable-next-line react-hooks/refs
    const orderMap = new Map(initialOrderRef.current.map((itemUid, idx) => [itemUid, idx]));

    return list.sort((a, b) => {
      const idxA = orderMap.get(a.uid) ?? 999;
      const idxB = orderMap.get(b.uid) ?? 999;
      return idxA - idxB;
    });
  }, [transfer?.items]);

  const handleReceiveItemSubmit = async (
    item: StockTransferItem,
    payload: {
      status: typeof TRANSFER_SHIPMENT_STATUS.RECEIVED | typeof TRANSFER_SHIPMENT_STATUS.REJECTED;
      kuantitas_diterima: number;
      jenis_selisih?: typeof JENIS_SELISIH.SALAH_INPUT | typeof JENIS_SELISIH.RUSAK | typeof JENIS_SELISIH.HILANG;
      keterangan?: string;
    }
  ) => {
    setProcessingItemUid(item.uid);
    try {
      await receive.mutateAsync({
        uid,
        itemUid: item.uid,
        payload,
      });
      toast.success(`Item "${item.product?.nama || "produk"}" berhasil diproses.`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal memproses item";
      toast.error(`Gagal memproses item: ${message}`);
    } finally {
      setProcessingItemUid(null);
    }
  };

  const handleValidateReturnItem = async (item: StockTransferItem, kuantitasReturn: number) => {
    setValidatingItemUid(item.uid);
    try {
      await validateReturn.mutateAsync({ uid, itemUid: item.uid, kuantitas_return: kuantitasReturn });
      toast.success(`Return item ${item.product?.nama || "berhasil"} divalidasi.`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal memvalidasi return";
      toast.error(`Gagal memvalidasi return: ${message}`);
    } finally {
      setValidatingItemUid(null);
    }
  };

  const handleFinalizeConfirm = () => {
    finalize.mutate(uid, {
      onSuccess: () => {
        toast.success("Transfer stok berhasil difinalisasi & dikirim!");
        setConfirmFinalizeOpen(false);
      },
      onError: (err) => toast.error(err.message || "Gagal mengirim transfer"),
    });
  };

  const handleCancelSubmit = () => {
    cancel.mutate(
      { uid, alasan: cancelReason.trim() || undefined },
      {
        onSuccess: () => {
          toast.success("Transfer stok telah dibatalkan.");
          setCancelModalOpen(false);
          setCancelReason("");
        },
        onError: (err) => toast.error(err.message || "Gagal membatalkan transfer"),
      }
    );
  };

  const handlePrint = () => {
    window.open(`/api/proxy${ENDPOINTS.INVENTORY.STOCK_TRANSFERS.PRINT_SURAT_JALAN(uid)}`, "_blank");
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto animate-pulse">
        {/* Header Bar Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-9 rounded-xl" />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-48 rounded-lg" />
                <Skeleton className="h-5 w-20 rounded-md" />
              </div>
              <Skeleton className="h-3 w-64 rounded-md" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-32 rounded-xl" />
            <Skeleton className="h-9 w-36 rounded-xl" />
          </div>
        </div>

        {/* Stepper Bar Skeleton */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-2xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <Skeleton className="w-7 h-7 rounded-lg shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-2.5 w-16 rounded-md" />
                  <Skeleton className="h-2 w-10 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Grid Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Product Table Skeleton */}
          <div className="lg:col-span-8 bg-white border border-slate-100 rounded-2xl shadow-2xs p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-50">
              <Skeleton className="h-5 w-44 rounded-lg" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50">
                  <div className="space-y-1.5">
                    <Skeleton className="h-3.5 w-40 rounded-md" />
                    <Skeleton className="h-2.5 w-24 rounded-md" />
                  </div>
                  <Skeleton className="h-7 w-16 rounded-lg" />
                  <Skeleton className="h-8 w-24 rounded-xl" />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Metadata Cards Skeleton */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-2xs space-y-4">
              <Skeleton className="h-4 w-32 rounded-md" />
              <div className="space-y-3 pt-2">
                <div className="p-3 bg-slate-50 rounded-xl space-y-2">
                  <Skeleton className="h-2.5 w-20 rounded-md" />
                  <Skeleton className="h-4 w-36 rounded-md" />
                </div>
                <div className="p-3 bg-slate-50 rounded-xl space-y-2">
                  <Skeleton className="h-2.5 w-20 rounded-md" />
                  <Skeleton className="h-4 w-36 rounded-md" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !transfer) {
    return (
      <div className="p-12 text-center bg-white border border-slate-100 rounded-2xl shadow-2xs space-y-3 max-w-md mx-auto my-8">
        <IconAlertCircle size={36} className="mx-auto text-rose-400" />
        <h4 className="text-sm font-bold text-slate-800">Detail Transfer Tidak Ditemukan</h4>
        <Button
          onClick={() => router.push(ROUTES.ADMIN_STOCK_TRANSFERS)}
          variant="outline"
          className="h-8 text-xs cursor-pointer rounded-xl"
        >
          Kembali ke Daftar Transfer
        </Button>
      </div>
    );
  }

  const isSource = activeStoreUid === transfer.store_uid_source;
  const isDest = activeStoreUid === transfer.store_uid_destination;

  const canFinalize = transfer.status === TRANSFER_STATUS.DRAFT && isSource;
  const canReceive = transfer.status === TRANSFER_STATUS.SENT && isDest;
  const canValidateReturn = transfer.status === TRANSFER_STATUS.RETUR && isSource;
  const canCancel =
    (transfer.status === TRANSFER_STATUS.DRAFT || transfer.status === TRANSFER_STATUS.SENT) &&
    isSource;

  const hasDiscrepancies = transfer.items.some(
    (item) => item.kuantitas_diterima != null && item.kuantitas_diterima !== item.kuantitas
  );

  return (
    <FormProvider {...formMethods}>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header Bar */}
        <TransferDetailHeader
          transfer={transfer}
          canFinalize={canFinalize}
          canReceive={canReceive}
          canCancel={canCancel}
          hasDiscrepancies={hasDiscrepancies}
          onFinalize={() => setConfirmFinalizeOpen(true)}
          onCancelClick={() => setCancelModalOpen(true)}
          onPrint={handlePrint}
          onEdit={transfer.status === TRANSFER_STATUS.DRAFT && isSource ? () => router.push(`${ROUTES.ADMIN_STOCK_TRANSFERS}/${uid}/edit`) : undefined}
        />

        {/* Visual Stepper Bar */}
        <TransferDetailStepper status={transfer.status} />

        {/* Main Grid Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Interactive Product Table */}
          <div className="lg:col-span-8">
            <TransferDetailItemsTable
              items={items}
              canReceive={canReceive}
              onReceiveItemSubmit={handleReceiveItemSubmit}
              processingItemUid={processingItemUid}
              canValidateReturn={canValidateReturn}
              onValidateReturnItem={handleValidateReturnItem}
              validatingItemUid={validatingItemUid}
              isFetching={isFetching}
            />
          </div>

          {/* Right Column: Metadata & Route Cards */}
          <div className="lg:col-span-4">
            <TransferDetailInfoCards transfer={transfer} />
          </div>
        </div>

        {/* Confirmation Modal for Finalizing Transfer */}
        <ConfirmDialog
          open={confirmFinalizeOpen}
          onOpenChange={setConfirmFinalizeOpen}
          title="Konfirmasi Pengiriman Transfer"
          description="Apakah Anda yakin ingin menyelesaikan dan mengirim transfer ini? Stok akan otomatis dipotong dari toko pengirim."
          confirmText="Ya, Kirim Transfer"
          cancelText="Batal"
          variant="success"
          onConfirm={handleFinalizeConfirm}
          isLoading={finalize.isPending}
        />

        {/* Cancel Transfer Dialog */}
        <BaseDialog
          open={cancelModalOpen}
          onOpenChange={setCancelModalOpen}
          title={
            <div className="flex items-center gap-2 text-rose-600">
              <IconCircleX size={20} />
              <span>Batalkan Transfer Stok</span>
            </div>
          }
          className="max-w-md"
        >
          <div className="space-y-4 pt-2">
            <p className="text-xs text-slate-500 leading-relaxed">
              Apakah Anda yakin ingin membatalkan transfer stok ini? Aksi ini tidak dapat dibatalkan.
            </p>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Alasan Pembatalan (Opsional)</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Misal: Salah pilih barang / batal dikirim..."
                rows={3}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-white"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCancelModalOpen(false)}
                className="h-8 text-xs rounded-xl"
              >
                Batal
              </Button>
              <AppButton
                type="button"
                onClick={handleCancelSubmit}
                isLoading={cancel.isPending}
                className="h-8 text-xs rounded-xl bg-rose-600 hover:bg-rose-700 text-white"
              >
                Ya, Batalkan Transfer
              </AppButton>
            </div>
          </div>
        </BaseDialog>
      </div>
    </FormProvider>
  );
}
