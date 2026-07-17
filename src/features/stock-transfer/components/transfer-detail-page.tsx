"use client";

import { formatDate } from "@/lib/date-utils";
import {
  IconAlertCircle,
  IconArrowLeft,
  IconBuildingStore,
  IconCalendar,
  IconCheck,
  IconCircleX,
  IconNotes,
  IconPackage,
  IconTruckDelivery,
  IconUser
} from "@tabler/icons-react";
import { useState } from "react";
import { toast } from "sonner";

import { ROUTES } from "@/constants/routes";
import { useAppRouter } from "@/hooks/use-app-router";
import { useActiveStoreStore } from "@/stores/active-store-store";
import {
  useCancelStockTransfer,
  useFinalizeStockTransfer,
  useReceiveStockTransfer,
  useStockTransferDetail,
} from "../api/stock-transfer-api";
import { TRANSFER_STATUS, TRANSFER_STATUS_CLASSES, TRANSFER_STATUS_LABELS } from "../constants";
import type { StockTransferItem } from "../types";

import { Badge } from "@/components/ui/badge";
import { BaseDialog } from "@/components/ui/base-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { ColumnDef } from "@tanstack/react-table";

const itemColumns: ColumnDef<StockTransferItem>[] = [
  {
    accessorKey: "product.nama",
    header: "Produk",
    size: 240,
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5">
        <span className="font-bold text-slate-800 text-xs">
          {row.original.product?.nama || "—"}
        </span>
        {row.original.product?.barcode && (
          <span className="font-mono text-[10px] text-slate-400">
            {row.original.product.barcode}
          </span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "kuantitas",
    header: "Kuantitas",
    size: 110,
    meta: { headerClassName: "text-center", cellClassName: "text-center font-bold text-slate-900" },
    cell: ({ row }) => (
      <span className="inline-block bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md text-xs font-extrabold">
        {row.original.kuantitas} pcs
      </span>
    ),
  },
  {
    id: "stok_source",
    header: "Dampak Stok (Asal)",
    size: 140,
    meta: { headerClassName: "text-center", cellClassName: "text-center text-xs" },
    cell: ({ row }) => {
      const s1 = row.original.stok_sebelum_source;
      const s2 = row.original.stok_sesudah_source;
      if (s1 == null && s2 == null) return <span className="text-slate-400">—</span>;
      return (
        <span className="font-medium text-slate-700">
          {s1 ?? "—"} ➔ <span className="font-bold text-rose-600">{s2 ?? "—"}</span>
        </span>
      );
    },
  },
  {
    id: "stok_dest",
    header: "Dampak Stok (Tujuan)",
    size: 140,
    meta: { headerClassName: "text-center", cellClassName: "text-center text-xs" },
    cell: ({ row }) => {
      const s1 = row.original.stok_sebelum_dest;
      const s2 = row.original.stok_sesudah_dest;
      if (s1 == null && s2 == null) return <span className="text-slate-400">—</span>;
      return (
        <span className="font-medium text-slate-700">
          {s1 ?? "—"} ➔ <span className="font-bold text-emerald-600">{s2 ?? "—"}</span>
        </span>
      );
    },
  },
];

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

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    variant: "danger" | "warning" | "success" | "info";
    action: () => void;
  }>({
    open: false,
    title: "",
    description: "",
    variant: "info",
    action: () => { },
  });

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
        <Button onClick={() => router.push(ROUTES.ADMIN_STOCK_TRANSFERS)} variant="outline" className="h-8 text-xs">
          Kembali ke Daftar Transfer
        </Button>
      </div>
    );
  }

  const isSource = activeStoreUid === transfer.store_uid_source;
  const isDest = activeStoreUid === transfer.store_uid_destination;

  const canFinalize = transfer.status === TRANSFER_STATUS.DRAFT && isSource;
  const canReceive = transfer.status === TRANSFER_STATUS.IN_TRANSIT && isDest;
  const canCancel = (transfer.status === TRANSFER_STATUS.DRAFT || transfer.status === TRANSFER_STATUS.IN_TRANSIT) && isSource;

  const handleAction = (action: "finalize" | "receive") => {
    const config = {
      finalize: {
        title: "Konfirmasi Pengiriman Transfer",
        description:
          "Apakah Anda yakin ingin menyelesaikan dan mengirim transfer ini? Stok akan otomatis dipotong dari toko pengirim.",
        variant: "success" as const,
        action: () =>
          finalize.mutate(uid, {
            onSuccess: () => {
              toast.success("Transfer stok berhasil difinalisasi & dikirim!");
              setConfirmDialog((p) => ({ ...p, open: false }));
            },
            onError: (err) => toast.error(err.message || "Gagal mengirim transfer"),
          }),
      },
      receive: {
        title: "Konfirmasi Penerimaan Transfer",
        description:
          "Apakah Anda yakin ingin menerima transfer barang ini? Stok akan otomatis ditambahkan ke toko cabang Anda.",
        variant: "success" as const,
        action: () =>
          receive.mutate(uid, {
            onSuccess: () => {
              toast.success("Transfer stok berhasil diterima dan ditambahkan ke inventori!");
              setConfirmDialog((p) => ({ ...p, open: false }));
            },
            onError: (err) => toast.error(err.message || "Gagal menerima transfer"),
          }),
      },
    };

    setConfirmDialog({ open: true, ...config[action] });
  };

  const handleConfirmCancel = () => {
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

  // Status Stepper Progress
  const isCancelled = transfer.status === TRANSFER_STATUS.CANCELLED;
  const stepIndex =
    transfer.status === TRANSFER_STATUS.DRAFT
      ? 1
      : transfer.status === TRANSFER_STATUS.IN_TRANSIT
        ? 2
        : transfer.status === TRANSFER_STATUS.RECEIVED
          ? 3
          : 0;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            onClick={() => router.push(ROUTES.ADMIN_STOCK_TRANSFERS)}
            variant="outline"
            className="p-2 h-9 w-9 rounded-xl border-slate-200 text-slate-500 hover:text-slate-900 bg-white"
          >
            <IconArrowLeft size={18} />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">Transfer: {transfer.nomor_transfer}</h2>
              <Badge variant="outline" className={`text-xs px-2.5 py-0.5 font-bold border ${TRANSFER_STATUS_CLASSES[transfer.status]}`}>
                {TRANSFER_STATUS_LABELS[transfer.status] || transfer.status}
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Rincian mutasi stok produk antarcabang</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {canFinalize && (
            <Button
              onClick={() => handleAction("finalize")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 rounded-xl flex gap-1.5 cursor-pointer shadow-xs"
            >
              <IconTruckDelivery size={16} /> Kirim / Finalize Transfer
            </Button>
          )}
          {canReceive && (
            <Button
              onClick={() => handleAction("receive")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 rounded-xl flex gap-1.5 cursor-pointer shadow-xs"
            >
              <IconCheck size={16} /> Terima Barang Masuk
            </Button>
          )}
          {canCancel && (
            <Button
              onClick={() => setCancelModalOpen(true)}
              variant="outline"
              className="border-rose-200 hover:border-rose-300 hover:bg-rose-50/50 text-rose-600 font-bold text-xs h-9 rounded-xl flex gap-1.5 cursor-pointer bg-white"
            >
              <IconCircleX size={16} /> Batalkan Transfer
            </Button>
          )}
        </div>
      </div>

      {/* Visual Status Stepper Bar */}
      {!isCancelled ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
          <div className="grid grid-cols-3 gap-2 relative">
            {/* Step 1 */}
            <div className={`flex items-center gap-3 p-2.5 rounded-xl border ${stepIndex >= 1 ? "bg-emerald-50/50 border-emerald-200 text-emerald-800" : "bg-slate-50 border-slate-100 text-slate-400"}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${stepIndex >= 1 ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"}`}>
                1
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold">Draft Disiapkan</span>
                <span className="text-[10px] opacity-75">Toko Pengirim</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className={`flex items-center gap-3 p-2.5 rounded-xl border ${stepIndex >= 2 ? "bg-blue-50/50 border-blue-200 text-blue-800" : "bg-slate-50 border-slate-100 text-slate-400"}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${stepIndex >= 2 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"}`}>
                2
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold">Dalam Pengiriman</span>
                <span className="text-[10px] opacity-75">Stok Dipotong</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className={`flex items-center gap-3 p-2.5 rounded-xl border ${stepIndex >= 3 ? "bg-emerald-50/50 border-emerald-200 text-emerald-800" : "bg-slate-50 border-slate-100 text-slate-400"}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${stepIndex >= 3 ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"}`}>
                3
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold">Diterima & Selesai</span>
                <span className="text-[10px] opacity-75">Stok Ditambahkan</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 flex items-center gap-3">
          <IconCircleX size={20} className="text-rose-600 shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-rose-900">Transfer Stok Dibatalkan</h4>
            <p className="text-[11px] text-rose-700">Transaksi pengiriman stok ini telah dibatalkan.</p>
          </div>
        </div>
      )}

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Product Table */}
        <div className="lg:col-span-8 bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-50 pb-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <IconPackage size={18} className="text-emerald-600" />
              <span>Daftar Produk Dikirim</span>
            </h3>
            <span className="text-xs text-slate-400 font-semibold">
              {transfer.items?.length || 0} Produk
            </span>
          </div>

          <DataTable columns={itemColumns} data={transfer.items || []} virtualize={false} />
        </div>

        {/* Right: Metadata Cards */}
        <div className="lg:col-span-4 space-y-6">
          {/* Store Route Card */}
          <Card className="border-slate-100 shadow-sm rounded-2xl bg-white">
            <CardHeader className="pb-3 border-b border-slate-50">
              <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <IconBuildingStore size={16} className="text-emerald-600" />
                <span>Rute Toko</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Toko Asal (Pengirim)</span>
                <span className="font-bold text-slate-900 text-sm">{transfer.source_store?.nama || "—"}</span>
                {transfer.source_user && (
                  <span className="text-[11px] text-slate-400 block mt-0.5 flex items-center gap-1">
                    <IconUser size={12} /> Disiapkan: {transfer.source_user.name}
                  </span>
                )}
              </div>

              <div className="border-t border-slate-50 pt-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Toko Tujuan (Penerima)</span>
                <span className="font-bold text-emerald-700 text-sm">{transfer.destination_store?.nama || "—"}</span>
                {transfer.destination_user && (
                  <span className="text-[11px] text-slate-400 block mt-0.5 flex items-center gap-1">
                    <IconUser size={12} /> Diterima: {transfer.destination_user.name}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Timestamps & Info Card */}
          <Card className="border-slate-100 shadow-sm rounded-2xl bg-white">
            <CardHeader className="pb-3 border-b border-slate-50">
              <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <IconCalendar size={16} className="text-emerald-600" />
                <span>Waktu & Catatan</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-xs">
              <div className="flex justify-between items-center text-slate-600">
                <span>Tanggal Kirim:</span>
                <span className="font-semibold text-slate-800">
                  {transfer.tanggal_kirim
                    ? formatDate(transfer.tanggal_kirim, "dd MMM yyyy, HH:mm")
                    : "—"}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Tanggal Terima:</span>
                <span className="font-semibold text-slate-800">
                  {transfer.tanggal_terima
                    ? formatDate(transfer.tanggal_terima, "dd MMM yyyy, HH:mm")
                    : "—"}
                </span>
              </div>

              {transfer.catatan && (
                <div className="pt-2 border-t border-slate-50 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                    <IconNotes size={12} /> Catatan Pengiriman
                  </span>
                  <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                    {transfer.catatan}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Dialog for Finalize / Receive */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmText="Ya, Lanjutkan"
        cancelText="Batal"
        variant={confirmDialog.variant}
        onConfirm={confirmDialog.action}
        isLoading={finalize.isPending || receive.isPending}
      />

      {/* Cancel Reason BaseDialog */}
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
            <Button variant="outline" onClick={() => setCancelModalOpen(false)} className="h-9 text-xs rounded-xl">
              Batal
            </Button>
            <Button
              onClick={handleConfirmCancel}
              disabled={cancel.isPending}
              className="h-9 text-xs rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
            >
              Ya, Batalkan Transfer
            </Button>
          </div>
        </div>
      </BaseDialog>
    </div>
  );
}
