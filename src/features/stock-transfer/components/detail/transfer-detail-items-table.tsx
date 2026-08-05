"use client";

import { IconInfoCircle, IconPackage, IconRefresh } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import type { StockTransferItem } from "../../types";
import { useTransferDetailItemsColumns } from "./use-transfer-detail-items-columns";

interface TransferDetailItemsTableProps {
  items: StockTransferItem[];
  canReceive: boolean;
  onResetAllQty: () => void;
  onReceiveItem?: (item: StockTransferItem, status: "received" | "rejected") => void;
  processingItemUid?: string | null;
  canValidateReturn?: boolean;
  onValidateReturnItem?: (item: StockTransferItem, kuantitasReturn: number) => void;
  validatingItemUid?: string | null;
}

export function TransferDetailItemsTable({
  items,
  canReceive,
  onResetAllQty,
  onReceiveItem,
  processingItemUid,
  canValidateReturn,
  onValidateReturnItem,
  validatingItemUid,
}: TransferDetailItemsTableProps) {
  const columns = useTransferDetailItemsColumns({
    canReceive,
    canValidateReturn,
    onReceiveItem,
    processingItemUid,
    onValidateReturnItem,
    validatingItemUid,
  });

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-4">
      {/* Table Header / Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-50 pb-3">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <IconPackage size={18} className="text-emerald-600" />
          <span>Daftar Produk Dikirim</span>
          {canReceive && (
            <span className="text-xs font-normal text-slate-500 ml-2">
              (Item diproses langsung per baris)
            </span>
          )}
          {canValidateReturn && (
            <span className="text-xs font-normal text-amber-600 ml-2">
              (Validasi return per item)
            </span>
          )}
        </h3>

        {canReceive ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onResetAllQty}
            className="h-7 text-xs font-bold text-emerald-700 hover:bg-emerald-50 px-2 rounded-lg gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <IconRefresh size={13} />
            Reset Semua Input
          </Button>
        ) : (
          <span className="text-xs text-slate-400 font-semibold">
            {items.length} Produk
          </span>
        )}
      </div>

      {canReceive && (
        <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-800 flex items-start gap-2">
          <IconInfoCircle size={16} className="text-blue-600 shrink-0 mt-0.5" />
          <div>
            <strong>Penerimaan Stok Aktif:</strong> Sesuaikan jumlah dan status per item, lalu klik tombol <strong>Terima</strong> atau <strong>Konfirmasi Tolak</strong> pada masing-masing baris. Transaksi akan langsung tersimpan.
          </div>
        </div>
      )}

      {canValidateReturn && (
        <div className="p-3 bg-amber-50/70 border border-amber-100 rounded-xl text-xs text-amber-800 flex items-start gap-2">
          <IconInfoCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>Validasi Return Aktif:</strong> Sebagai toko pengirim, Anda harus memvalidasi jumlah barang yang dikembalikan (selisih). Masukkan jumlah yang benar-benar diterima kembali, lalu klik <strong>Validasi Return</strong>.
          </div>
        </div>
      )}

      <DataTable columns={columns} data={items} virtualize={false} />
    </div>
  );
}
