"use client";

import { useFormContext } from "react-hook-form";
import { IconPackage } from "@tabler/icons-react";
import { DataTable } from "@/components/ui/data-table";
import type { StockTransferItem } from "../../types";
import type { ReceiveFormValues } from "./types";
import { JENIS_SELISIH_CLASSES, JENIS_SELISIH_LABELS } from "../../constants";
import { useTransferDetailItemsColumns } from "./use-transfer-detail-items-columns";
import { ReceivingItemRowControls } from "./receiving-item-row-controls";
import { ReturnValidationRowControls } from "./return-validation-row-controls";

interface TransferDetailItemsTableProps {
  items: StockTransferItem[];
  canReceive: boolean;
  onReceiveItemSubmit?: (
    item: StockTransferItem,
    payload: {
      status: "received" | "rejected";
      kuantitas_diterima: number;
      jenis_selisih?: "salah_input" | "rusak" | "hilang";
      keterangan?: string;
    }
  ) => Promise<void>;
  processingItemUid?: string | null;
  canValidateReturn?: boolean;
  onValidateReturnItem?: (item: StockTransferItem, kuantitasReturn: number) => void;
  validatingItemUid?: string | null;
}

export function TransferDetailItemsTable({
  items,
  canReceive,
  onReceiveItemSubmit,
  processingItemUid,
  canValidateReturn,
  onValidateReturnItem,
  validatingItemUid,
}: TransferDetailItemsTableProps) {
  const { watch } = useFormContext<ReceiveFormValues>();

  const pendingItemsCount = items.filter(
    (item) => item.status === null || item.status === undefined
  ).length;

  const columns = useTransferDetailItemsColumns({
    canReceive,
    canValidateReturn,
    onReceiveItemSubmit,
    processingItemUid,
    onValidateReturnItem,
    validatingItemUid,
  });

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-2xs p-6 space-y-4">
      {/* Table Header / Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-50 pb-3">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <div className="p-1 rounded-md bg-emerald-50 text-emerald-600">
            <IconPackage size={18} />
          </div>
          <span>Daftar Produk Transfer</span>
          {canReceive && pendingItemsCount > 0 ? (
            <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60 ml-1">
              {pendingItemsCount} item belum diproses
            </span>
          ) : (
            <span className="text-xs font-semibold text-slate-400 ml-1">
              ({items.length} Produk)
            </span>
          )}
        </h3>
      </div>

      <DataTable
        columns={columns}
        data={items}
        virtualize={false}
        extraActions={
          canReceive
            ? (item) => {
                const index = items.findIndex((i) => i.uid === item.uid);
                const actualIndex = index >= 0 ? index : 0;

                if (item.status !== null && item.status !== undefined) {
                  const isRejected = item.status === "rejected";
                  const jenisSelisih = item.jenis_selisih;
                  return (
                    <div className="flex flex-col items-center gap-0.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-extrabold ${
                          isRejected
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        {isRejected ? "Ditolak" : "Diterima"}
                      </span>
                      {jenisSelisih && (
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded-md font-bold border ${JENIS_SELISIH_CLASSES[jenisSelisih]}`}
                        >
                          {JENIS_SELISIH_LABELS[jenisSelisih]}
                        </span>
                      )}
                    </div>
                  );
                }

                return (
                  <ReceivingItemRowControls
                    index={actualIndex}
                    item={item}
                    onReceiveItemSubmit={onReceiveItemSubmit}
                    isProcessing={processingItemUid === item.uid}
                  />
                );
              }
            : canValidateReturn
            ? (item) => {
                const index = items.findIndex((i) => i.uid === item.uid);
                const actualIndex = index >= 0 ? index : 0;
                const formReturnQty = watch(`items.${actualIndex}.kuantitas_return`);
                const returnQty =
                  formReturnQty !== undefined && formReturnQty !== null
                    ? Number(formReturnQty)
                    : Number(item.kuantitas) - Number(item.kuantitas_diterima || 0);

                return (
                  <ReturnValidationRowControls
                    item={item}
                    returnQty={returnQty}
                    onValidateReturnItem={onValidateReturnItem}
                    isProcessing={validatingItemUid === item.uid}
                  />
                );
              }
            : undefined
        }
      />
    </div>
  );
}
