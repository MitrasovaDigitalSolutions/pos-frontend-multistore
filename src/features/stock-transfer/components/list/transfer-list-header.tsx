"use client";

import { IconPlus, IconTruckDelivery } from "@tabler/icons-react";
import { AppButton } from "@/components/shared/app-button";
import { StockTransferListMode } from "../../api/stock-transfer-api";
import { useAppRouter } from "@/hooks/use-app-router";
import { ROUTES } from "@/constants/routes";

interface TransferListHeaderProps {
  mode: StockTransferListMode;
  canManage: boolean;
}

export function TransferListHeader({ mode, canManage }: TransferListHeaderProps) {
  const router = useAppRouter();

  const getHeaderInfo = () => {
    if (mode === "outgoing") {
      return {
        title: "Transfer Keluar",
        description: "Kelola pengiriman stok ke cabang lain."
      };
    } else if (mode === "incoming") {
      return {
        title: "Transfer Masuk",
        description: "Kelola penerimaan stok dari cabang lain."
      };
    } else {
      return {
        title: "Retur Transfer",
        description: "Validasi pengembalian stok yang ditolak/berselisih oleh toko asal."
      };
    }
  };

  const headerInfo = getHeaderInfo();

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <IconTruckDelivery size={22} />
          </div>
          <span>{headerInfo.title}</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          {headerInfo.description}
        </p>
      </div>

      {canManage && mode === "outgoing" && (
        <AppButton
          type="button"
          onClick={() => router.push(`${ROUTES.ADMIN_STOCK_TRANSFERS}/new`)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 rounded-xl flex gap-1.5 cursor-pointer shadow-sm"
        >
          <IconPlus size={16} /> Buat Transfer Baru
        </AppButton>
      )}
    </div>
  );
}
