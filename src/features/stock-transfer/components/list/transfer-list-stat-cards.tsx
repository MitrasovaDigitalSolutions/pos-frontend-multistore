"use client";

import {
  IconArrowDownLeft,
  IconArrowsLeftRight,
  IconBuildingStore,
  IconCheck,
  IconClock,
  IconTruckDelivery
} from "@tabler/icons-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { StockTransfer } from "../../types";
import type { StockTransferListMode } from "../../api/stock-transfer-api";

interface TransferListStatCardsProps {
  mode: StockTransferListMode;
  transfers: StockTransfer[];
  totalCount: number;
  isLoading?: boolean;
}

const STAT_COLOR_MAP: Record<string, { bg: string; border: string; iconBg: string; iconBorder: string; iconText: string; labelText: string; valText: string }> = {
  slate: {
    bg: "bg-white",
    border: "border-slate-100",
    iconBg: "bg-slate-50",
    iconBorder: "border-slate-100",
    iconText: "text-slate-600",
    labelText: "text-slate-500",
    valText: "text-slate-900",
  },
  blue: {
    bg: "bg-white",
    border: "border-blue-50",
    iconBg: "bg-blue-50",
    iconBorder: "border-blue-100",
    iconText: "text-blue-600",
    labelText: "text-blue-500",
    valText: "text-blue-900",
  },
  amber: {
    bg: "bg-white",
    border: "border-amber-50",
    iconBg: "bg-amber-50",
    iconBorder: "border-amber-100",
    iconText: "text-amber-600",
    labelText: "text-amber-500",
    valText: "text-amber-900",
  },
  emerald: {
    bg: "bg-white",
    border: "border-emerald-50",
    iconBg: "bg-emerald-50",
    iconBorder: "border-emerald-100",
    iconText: "text-emerald-600",
    labelText: "text-emerald-500",
    valText: "text-emerald-900",
  },
};

import { TRANSFER_STATUS, TRANSFER_SHIPMENT_STATUS } from "../../constants";

export function TransferListStatCards({ mode, transfers, totalCount, isLoading }: TransferListStatCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-2.5 w-24 rounded-md" />
              <Skeleton className="h-5 w-12 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const getStats = () => {
    if (mode === "outgoing") {
      const sentCount = transfers.filter((t) => t.status === TRANSFER_STATUS.SENT).length;
      const draftCount = transfers.filter((t) => t.status === TRANSFER_STATUS.DRAFT).length;
      const returCount = transfers.filter((t) => t.status === TRANSFER_STATUS.RETUR).length;
      return [
        { label: "Total Transfer Keluar", value: totalCount, icon: IconArrowsLeftRight, color: "slate" },
        { label: "Draft Pengiriman", value: draftCount, icon: IconClock, color: "amber" },
        { label: "Dalam Pengiriman", value: sentCount, icon: IconTruckDelivery, color: "blue" },
        { label: "Menunggu Retur", value: returCount, icon: IconArrowDownLeft, color: "emerald" },
      ];
    } else if (mode === "incoming") {
      const sentCount = transfers.filter((t) => t.status === TRANSFER_STATUS.SENT).length;
      const partiallyReceivedCount = transfers.filter((t) => t.status_penerimaan === TRANSFER_SHIPMENT_STATUS.PARTIALLY_RECEIVED).length;
      const finishedCount = transfers.filter((t) => t.status === TRANSFER_STATUS.FINISHED || t.status === TRANSFER_STATUS.FINISH).length;
      return [
        { label: "Total Transfer Masuk", value: totalCount, icon: IconArrowsLeftRight, color: "slate" },
        { label: "Dikirim", value: sentCount, icon: IconClock, color: "blue" },
        { label: "Diterima Sebagian", value: partiallyReceivedCount, icon: IconBuildingStore, color: "amber" },
        { label: "Selesai", value: finishedCount, icon: IconCheck, color: "emerald" },
      ];
    } else { // returns
      const rejectedCount = transfers.filter((t) => t.status_penerimaan === TRANSFER_SHIPMENT_STATUS.REJECTED || t.status_penerimaan === TRANSFER_SHIPMENT_STATUS.PARTIALLY_RECEIVED).length;
      return [
        { label: "Menunggu Validasi", value: totalCount, icon: IconArrowsLeftRight, color: "slate" },
        { label: "Ditolak / Selisih", value: rejectedCount, icon: IconClock, color: "amber" },
        { label: "Selesai", value: 0, icon: IconCheck, color: "emerald" },
      ];
    }
  };

  const stats = getStats();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        const style = STAT_COLOR_MAP[stat.color] || STAT_COLOR_MAP.slate;
        return (
          <div key={idx} className={`${style.bg} p-4 rounded-2xl border ${style.border} shadow-sm flex items-center gap-3`}>
            <div className={`w-10 h-10 rounded-xl ${style.iconBg} border ${style.iconBorder} flex items-center justify-center ${style.iconText} shrink-0`}>
              <Icon size={20} />
            </div>
            <div>
              <p className={`text-[10px] font-bold ${style.labelText} uppercase tracking-wider`}>{stat.label}</p>
              <p className={`text-lg font-black ${style.valText} leading-tight`}>{stat.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
