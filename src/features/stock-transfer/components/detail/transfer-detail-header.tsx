"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IconArrowLeft,
  IconCheck,
  IconCircleX,
  IconTruckDelivery,
  IconPrinter,
} from "@tabler/icons-react";
import { ROUTES } from "@/constants/routes";
import { useAppRouter } from "@/hooks/use-app-router";
import { TRANSFER_STATUS_CLASSES, TRANSFER_STATUS_LABELS } from "../../constants";
import type { StockTransfer } from "../../types";
import { useActiveStoreStore } from "@/stores/active-store-store";
import { useReviewStockTransfer } from "../../api/stock-transfer-api";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

interface TransferDetailHeaderProps {
  transfer: StockTransfer;
  canFinalize: boolean;
  canReceive: boolean;
  canCancel: boolean;
  hasDiscrepancies?: boolean;
  onFinalize: () => void;
  onReceiveClick: () => void;
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
  onReceiveClick,
  onCancelClick,
  onPrint,
}: TransferDetailHeaderProps) {
  const router = useAppRouter();
  const { data: session } = useSession();
  const activeStoreUid = useActiveStoreStore((state) => state.activeStoreUid);
  const activeStore = session?.user?.stores?.find((s) => s.uid === activeStoreUid);
  const review = useReviewStockTransfer();

  const isCentral = activeStore?.is_central || false;

  const handleReview = () => {
    review.mutate(transfer.uid, {
      onSuccess: () => toast.success("Transfer ditandai sudah direview"),
      onError: (err) => toast.error(err.message || "Gagal mereview"),
    });
  };

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
            {transfer.perlu_review && (
              <Badge variant="outline" className="text-xs px-2.5 py-0.5 font-bold border bg-amber-50 text-amber-700 border-amber-200">
                Perlu Review
              </Badge>
            )}
            {transfer.perlu_review && isCentral && (
               <Button type="button" onClick={handleReview} disabled={review.isPending} size="sm" variant="outline" className="h-6 text-[10px] px-2 py-0 border-amber-300 text-amber-700 hover:bg-amber-100">
                 Tandai Sudah Dicek
               </Button>
            )}
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
        {canReceive && (
          <Button
            type="button"
            onClick={onReceiveClick}
            className={`font-bold text-xs h-9 rounded-xl flex gap-1.5 cursor-pointer shadow-xs text-white ${
              hasDiscrepancies
                ? "bg-amber-600 hover:bg-amber-700 ring-2 ring-amber-300"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            <IconCheck size={16} /> Terima & Konfirmasi Stok
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
