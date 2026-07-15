"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { IconArrowLeft, IconCheck, IconCircleX, IconTruckDelivery } from "@tabler/icons-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";

import { useStockTransferDetail, useFinalizeStockTransfer, useReceiveStockTransfer, useCancelStockTransfer } from "../api/stock-transfer-api";
import { TRANSFER_STATUS_LABELS, TRANSFER_STATUS_CLASSES, TRANSFER_STATUS } from "../constants";
import type { StockTransferItem } from "../types";
import { useActiveStoreStore } from "@/stores/active-store-store";
import { useAppRouter } from "@/hooks/use-app-router";
import { ROUTES } from "@/constants/routes";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";

const itemColumns: ColumnDef<StockTransferItem>[] = [
    {
        accessorKey: "product.nama",
        header: "Produk",
        cell: ({ row }) => row.original.product?.nama || "-",
        enableSorting: false,
    },
    {
        accessorKey: "kuantitas",
        header: "Kuantitas",
        cell: ({ row }) => <span className="font-semibold">{row.original.kuantitas}</span>,
        enableSorting: false,
    },
    {
        accessorKey: "stok_sebelum_source",
        header: "Stok Sblm (Asal)",
        cell: ({ row }) => row.original.stok_sebelum_source ?? "-",
        enableSorting: false,
    },
    {
        accessorKey: "stok_sesudah_source",
        header: "Stok Ssdh (Asal)",
        cell: ({ row }) => row.original.stok_sesudah_source ?? "-",
        enableSorting: false,
    },
    {
        accessorKey: "stok_sebelum_dest",
        header: "Stok Sblm (Tujuan)",
        cell: ({ row }) => row.original.stok_sebelum_dest ?? "-",
        enableSorting: false,
    },
    {
        accessorKey: "stok_sesudah_dest",
        header: "Stok Ssdh (Tujuan)",
        cell: ({ row }) => row.original.stok_sesudah_dest ?? "-",
        enableSorting: false,
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
    action: () => {},
  });

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64 w-full" /></div>;
  }

  if (error || !transfer) {
    return <div className="p-8 text-center bg-white border border-slate-100 rounded-2xl shadow-sm">Transfer tidak ditemukan.</div>;
  }

  const isSource = activeStoreUid === transfer.store_uid_source;
  const isDest = activeStoreUid === transfer.store_uid_destination;

  const canFinalize = transfer.status === TRANSFER_STATUS.DRAFT && isSource;
  const canReceive = transfer.status === TRANSFER_STATUS.IN_TRANSIT && isDest;
  const canCancel = (transfer.status === TRANSFER_STATUS.DRAFT || transfer.status === TRANSFER_STATUS.IN_TRANSIT) && isSource;

  const handleAction = (action: "finalize" | "receive" | "cancel") => {
    const config = {
      finalize: {
        title: "Kirim Transfer",
        description: "Apakah Anda yakin ingin mengirim transfer ini? Stok akan dipotong dari toko asal.",
        variant: "success" as const,
        action: () => finalize.mutate(uid, { onSuccess: () => { toast.success("Transfer dikirim"); setConfirmDialog(p => ({ ...p, open: false })); } }),
      },
      receive: {
        title: "Terima Transfer",
        description: "Apakah Anda yakin ingin menerima transfer ini? Stok akan ditambahkan ke toko ini.",
        variant: "success" as const,
        action: () => receive.mutate(uid, { onSuccess: () => { toast.success("Transfer diterima"); setConfirmDialog(p => ({ ...p, open: false })); } }),
      },
      cancel: {
        title: "Batalkan Transfer",
        description: "Apakah Anda yakin ingin membatalkan transfer ini?",
        variant: "danger" as const,
        action: () => cancel.mutate(uid, { onSuccess: () => { toast.success("Transfer dibatalkan"); setConfirmDialog(p => ({ ...p, open: false })); } }),
      },
    };

    setConfirmDialog({ open: true, ...config[action] });
  };

  return (
    <div className="space-y-6">
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
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Detail Transfer: {transfer.nomor_transfer}</span>
              <Badge variant="outline" className={TRANSFER_STATUS_CLASSES[transfer.status]}>
                {TRANSFER_STATUS_LABELS[transfer.status] || transfer.status}
              </Badge>
            </h2>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {canFinalize && (
            <Button
              onClick={() => handleAction("finalize")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 rounded-xl flex gap-1.5 cursor-pointer"
            >
              <IconTruckDelivery size={16} /> Finalize
            </Button>
          )}
          {canReceive && (
            <Button
              onClick={() => handleAction("receive")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 rounded-xl flex gap-1.5 cursor-pointer"
            >
              <IconCheck size={16} /> Terima
            </Button>
          )}
          {canCancel && (
            <Button
              onClick={() => handleAction("cancel")}
              variant="outline"
              className="border-rose-200 hover:border-rose-300 hover:bg-rose-50/30 text-rose-600 font-bold text-xs h-9 rounded-xl flex gap-1.5 cursor-pointer bg-white"
            >
              <IconCircleX size={16} /> Batalkan
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
          <h3 className="font-bold mb-4">Daftar Produk</h3>
          <DataTable
            columns={itemColumns}
            data={transfer.items}
            virtualize={false}
          />
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className="border-slate-100 shadow-sm rounded-2xl">
            <CardHeader className="pb-3 border-b border-slate-50">
              <CardTitle className="text-sm font-bold text-slate-800">Ringkasan</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Toko Asal</p>
                <p className="text-sm font-semibold text-slate-700">{transfer.source_store?.nama || "-"}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Toko Tujuan</p>
                <p className="text-sm font-semibold text-slate-700">{transfer.destination_store?.nama || "-"}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tanggal Kirim</p>
                <p className="text-sm font-semibold text-slate-700">
                  {transfer.tanggal_kirim ? format(new Date(transfer.tanggal_kirim), "dd MMM yyyy HH:mm", { locale: id }) : "-"}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tanggal Terima</p>
                <p className="text-sm font-semibold text-slate-700">
                  {transfer.tanggal_terima ? format(new Date(transfer.tanggal_terima), "dd MMM yyyy HH:mm", { locale: id }) : "-"}
                </p>
              </div>
              {transfer.catatan && (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Catatan</p>
                  <p className="text-sm font-semibold text-slate-700">{transfer.catatan}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmText="Ya, Lanjutkan"
        cancelText="Batal"
        variant={confirmDialog.variant}
        onConfirm={confirmDialog.action}
        isLoading={finalize.isPending || receive.isPending || cancel.isPending}
      />
    </div>
  );
}
