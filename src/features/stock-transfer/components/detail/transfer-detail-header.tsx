"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IconArrowLeft,
  IconCircleX,
  IconTruckDelivery,
  IconPrinter,
  IconEdit,
} from "@tabler/icons-react";
import { ROUTES } from "@/constants/routes";
import { useAppRouter } from "@/hooks/use-app-router";
import { TRANSFER_STATUS, TRANSFER_STATUS_CLASSES, TRANSFER_STATUS_LABELS } from "../../constants";
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
  onEdit?: () => void;
}

export function TransferDetailHeader({
  transfer,
  canFinalize,
  canCancel,
  onFinalize,
  onCancelClick,
  onPrint,
  onEdit,
}: TransferDetailHeaderProps) {
  const router = useAppRouter();
  const searchParams = useSearchParams();
  const fromMode = searchParams.get("from");

  const handleBack = () => {
    if (fromMode === "incoming") {
      router.push(ROUTES.ADMIN_STOCK_TRANSFERS_INCOMING);
    } else if (fromMode === "validations") {
      router.push(ROUTES.ADMIN_STOCK_TRANSFERS_VALIDATIONS);
    } else {
      router.push(ROUTES.ADMIN_STOCK_TRANSFERS);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <Button
          type="button"
          onClick={handleBack}
          variant="outline"
          className="p-2 h-9 w-9 rounded-xl border-slate-200 text-slate-500 hover:text-slate-900 bg-white cursor-pointer"
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
        {onPrint && transfer.status === TRANSFER_STATUS.SENT && (
          <Button
            type="button"
            onClick={onPrint}
            variant="outline"
            className="border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs h-9 rounded-xl flex gap-1.5 cursor-pointer bg-white"
          >
            <IconPrinter size={16} /> Cetak Surat Jalan
          </Button>
        )}
        {onEdit && transfer.status === TRANSFER_STATUS.DRAFT && (
          <Button
            type="button"
            onClick={onEdit}
            variant="outline"
            className="border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs h-9 rounded-xl flex gap-1.5 cursor-pointer bg-white"
          >
            <IconEdit size={16} /> Edit Draft
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
