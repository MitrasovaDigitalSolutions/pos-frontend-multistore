"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IconArrowLeft,
  IconCircleX,
  IconTruckDelivery,
  IconPrinter,
} from "@tabler/icons-react";
import { ROUTES } from "@/constants/routes";
import { useAppRouter } from "@/hooks/use-app-router";
import { TRANSFER_STATUS_CLASSES, TRANSFER_STATUS_LABELS } from "../../constants";
import type { StockTransfer } from "../../types";

interface TransferDetailHeaderProps {
  transfer: StockTransfer;
  canFinalize: boolean;
  canReceive: boolean;
  canCancel: boolean;
  hasDiscrepancies?: boolean;
  onFinalize: () => void;
  onCancelClick: () => void;
  onPrint?: () => void;
}

export function TransferDetailHeader({
  transfer,
  canFinalize,
  canReceive,
  canCancel,
  hasDiscrepancies = false,
  onFinalize,
  onCancelClick,
  onPrint,
}: TransferDetailHeaderProps) {
  const router = useAppRouter();

  return (
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
            <Badge
              variant="outline"
              className={`text-xs px-2.5 py-0.5 font-bold border ${TRANSFER_STATUS_CLASSES[transfer.status]}`}
            >
              {TRANSFER_STATUS_LABELS[transfer.status] || transfer.status}
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Rincian mutasi stok produk antarcabang</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        {onPrint && (transfer.status === "draft" || transfer.status === "in_transit") && (
          <Button
            type="button"
            onClick={onPrint}
            variant="outline"
            className="border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs h-9 rounded-xl flex gap-1.5 cursor-pointer bg-white"
          >
            <IconPrinter size={16} /> Cetak Surat Jalan
          </Button>
        )}
        {canFinalize && (
          <Button
            type="button"
            onClick={onFinalize}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 rounded-xl flex gap-1.5 cursor-pointer shadow-xs"
          >
            <IconTruckDelivery size={16} /> Kirim / Finalize Transfer
          </Button>
        )}
        {canCancel && (
          <Button
            type="button"
            onClick={onCancelClick}
            variant="outline"
            className="border-rose-200 hover:border-rose-300 hover:bg-rose-50/50 text-rose-600 font-bold text-xs h-9 rounded-xl flex gap-1.5 cursor-pointer bg-white"
          >
            <IconCircleX size={16} /> Batalkan Transfer
          </Button>
        )}
      </div>
    </div>
  );
}
