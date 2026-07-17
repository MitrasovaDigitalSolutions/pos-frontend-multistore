"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useForm, FormProvider, useWatch } from "react-hook-form";
import { IconAlertCircle, IconCircleX } from "@tabler/icons-react";
import { ROUTES } from "@/constants/routes";
import { useAppRouter } from "@/hooks/use-app-router";
import { useActiveStoreStore } from "@/stores/active-store-store";
import {
  useCancelStockTransfer,
  useFinalizeStockTransfer,
  useReceiveStockTransfer,
  useStockTransferDetail,
} from "../api/stock-transfer-api";
import { TRANSFER_STATUS } from "../constants";

import { BaseDialog } from "@/components/ui/base-dialog";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";

import { TransferDetailHeader } from "./detail/transfer-detail-header";
import { TransferDetailStepper } from "./detail/transfer-detail-stepper";
import { TransferDetailItemsTable } from "./detail/transfer-detail-items-table";
import { TransferDetailInfoCards } from "./detail/transfer-detail-info-cards";
import { TransferReceiveConfirmDialog } from "./detail/transfer-receive-confirm-dialog";
import type { ReceiveFormValues } from "./detail/types";

interface TransferDetailPageProps {
  uid: string;
}

export function TransferDetailPage({ uid }: TransferDetailPageProps) {
  const router = useAppRouter();
  const activeStoreUid = useActiveStoreStore((state) => state.activeStoreUid);

  const { data: transfer, isLoading, error } = useStockTransferDetail(uid);
  const finalize = useFinalizeStockTransfer();
  const receive = useReceiveStockTransfer();
  const cancel = useCancelStockTransfer();

  // React Hook Form for receiving items
  const formMethods = useForm<ReceiveFormValues>({
    defaultValues: {
      items: [],
    },
  });

  // Explicitly subscribe to items array field changes using useWatch
  const formItems = useWatch({
    control: formMethods.control,
    name: "items",
  }) || [];

  const [confirmReceiveOpen, setConfirmReceiveOpen] = useState(false);
  const [confirmFinalizeOpen, setConfirmFinalizeOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  // Sync default values when transfer data is fetched
  useEffect(() => {
    if (transfer?.items) {
      formMethods.reset({
        items: transfer.items.map((item) => ({
          product_uid: item.product_uid,
          kuantitas_diterima: item.kuantitas_diterima ?? item.kuantitas,
          keterangan: item.keterangan || "",
        })),
      });
    }
  }, [transfer, formMethods]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64 rounded-xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !transfer) {
    return (
      <div className="p-12 text-center bg-white border border-slate-100 rounded-2xl shadow-sm space-y-3">
        <IconAlertCircle size={36} className="mx-auto text-rose-400" />
        <h4 className="text-sm font-bold text-slate-800">Detail Transfer Tidak Ditemukan</h4>
        <Button
          onClick={() => router.push(ROUTES.ADMIN_STOCK_TRANSFERS)}
          variant="outline"
          className="h-8 text-xs cursor-pointer"
        >
          Kembali ke Daftar Transfer
        </Button>
      </div>
    );
  }

  const isSource = activeStoreUid === transfer.store_uid_source;
  const isDest = activeStoreUid === transfer.store_uid_destination;

  const canFinalize = transfer.status === TRANSFER_STATUS.DRAFT && isSource;
  const canReceive = transfer.status === TRANSFER_STATUS.IN_TRANSIT && isDest;
  const canCancel =
    (transfer.status === TRANSFER_STATUS.DRAFT || transfer.status === TRANSFER_STATUS.IN_TRANSIT) &&
    isSource;

  // Detect discrepancies dynamically using reactive formItems from useWatch
  const hasDiscrepancies = transfer.items.some((item) => {
    const fItem = formItems.find((f) => f.product_uid === item.product_uid);
    if (!fItem || fItem.kuantitas_diterima === undefined || fItem.kuantitas_diterima === null) {
      return false;
    }
    return Number(fItem.kuantitas_diterima) !== Number(item.kuantitas);
  });

  const handleResetAllQty = () => {
    if (!transfer?.items) return;
    transfer.items.forEach((item, index) => {
      formMethods.setValue(`items.${index}.kuantitas_diterima`, item.kuantitas);
    });
    toast.info("Jumlah diterima direset sesuai jumlah pengiriman");
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

  const handleReceiveConfirm = () => {
    const currentValues = formMethods.getValues();
    const payloadItems = (currentValues.items || []).map((item) => ({
      product_uid: item.product_uid,
      kuantitas_diterima: item.kuantitas_diterima,
      keterangan: item.keterangan?.trim() || undefined,
    }));

    receive.mutate(
      {
        uid,
        payload: { items: payloadItems },
      },
      {
        onSuccess: () => {
          toast.success("Transfer stok berhasil diterima dan ditambahkan ke inventori!");
          setConfirmReceiveOpen(false);
        },
        onError: (err) => toast.error(err.message || "Gagal menerima transfer"),
      }
    );
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

  return (
    <FormProvider {...formMethods}>
      <div className="space-y-6">
        {/* Header Bar */}
        <TransferDetailHeader
          transfer={transfer}
          canFinalize={canFinalize}
          canReceive={canReceive}
          canCancel={canCancel}
          hasDiscrepancies={hasDiscrepancies}
          onFinalize={() => setConfirmFinalizeOpen(true)}
          onReceiveClick={() => setConfirmReceiveOpen(true)}
          onCancelClick={() => setCancelModalOpen(true)}
        />

        {/* Visual Stepper Bar */}
        <TransferDetailStepper status={transfer.status} />

        {/* Main Grid Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Interactive Product Table */}
          <div className="lg:col-span-8">
            <TransferDetailItemsTable
              items={transfer.items || []}
              canReceive={canReceive}
              onResetAllQty={handleResetAllQty}
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

        {/* Confirmation Modal for Receiving Stock */}
        <TransferReceiveConfirmDialog
          open={confirmReceiveOpen}
          onOpenChange={setConfirmReceiveOpen}
          items={transfer.items || []}
          formItems={formItems}
          onConfirm={handleReceiveConfirm}
          isLoading={receive.isPending}
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
          className="sm:max-w-md"
        >
          <div className="space-y-4 py-2">
            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin membatalkan transaksi transfer stok ini? Pembatalan tidak dapat diurungkan.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Alasan Pembatalan (Opsional)</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Contoh: Salah kirim cabang / stok tidak mencukupi..."
                rows={3}
                className="w-full resize-none rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setCancelModalOpen(false)}
                className="h-9 text-xs rounded-xl"
              >
                Batal
              </Button>
              <Button
                onClick={handleCancelSubmit}
                disabled={cancel.isPending}
                className="h-9 text-xs rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer"
              >
                Ya, Batalkan Transfer
              </Button>
            </div>
          </div>
        </BaseDialog>
      </div>
    </FormProvider>
  );
}
