"use client";

import { useFormContext } from "react-hook-form";
import { IconPackage, IconLoader2, IconCheck } from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { cn } from "@/lib/utils";
import type { StockTransferItem } from "../../types";
import type { ReceiveFormValues } from "./types";
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
  isFetching?: boolean;
}

export function TransferDetailItemsTable({
  items,
  canReceive,
  onReceiveItemSubmit,
  processingItemUid,
  canValidateReturn,
  onValidateReturnItem,
  validatingItemUid,
  isFetching = false,
}: TransferDetailItemsTableProps) {
  const { watch } = useFormContext<ReceiveFormValues>();

  const totalItemsCount = items.length;
  const pendingItemsCount = items.filter(
    (item) => item.status === null || item.status === undefined
  ).length;
  const verifiedItemsCount = totalItemsCount - pendingItemsCount;
  const progressPercent = totalItemsCount > 0 ? Math.round((verifiedItemsCount / totalItemsCount) * 100) : 0;
  const isAllVerified = canReceive && pendingItemsCount === 0 && totalItemsCount > 0;

  const columns = useTransferDetailItemsColumns({
    items,
    canReceive,
    canValidateReturn,
    onReceiveItemSubmit,
    processingItemUid,
    onValidateReturnItem,
    validatingItemUid,
  });

  const modeKey = canReceive
    ? "mode-receiving"
    : canValidateReturn
    ? "mode-return"
    : "mode-readonly";

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-2xs p-6 space-y-4">
      {/* Table Header / Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <div className="p-1 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100">
            <IconPackage size={18} />
          </div>
          <span>Daftar Produk Transfer</span>
          {canReceive && pendingItemsCount > 0 ? (
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/80 ml-1">
              {pendingItemsCount} item belum diproses
            </span>
          ) : isAllVerified ? (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/80 ml-1 flex items-center gap-1">
              <IconCheck size={13} className="text-emerald-600 stroke-[3]" />
              100% Diverifikasi
            </span>
          ) : (
            <span className="text-xs font-medium text-slate-400 ml-1">
              ({totalItemsCount} Produk)
            </span>
          )}
        </h3>

        {processingItemUid && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold animate-pulse border border-emerald-200">
            <IconLoader2 className="animate-spin w-3.5 h-3.5 text-emerald-600" />
            <span>Memproses Item...</span>
          </span>
        )}
      </div>

      {/* Realtime Animated Verification Progress Bar */}
      {canReceive && (
        <div className="p-3 bg-gradient-to-r from-slate-50 via-emerald-50/20 to-slate-50 border border-slate-100 rounded-xl space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5">
              <span className={cn("w-2 h-2 rounded-full", isAllVerified ? "bg-emerald-500 animate-ping" : "bg-amber-500 animate-pulse")} />
              <span>Progres Verifikasi Penerimaan</span>
            </span>
            <span className="text-slate-600 font-mono text-[11px]">
              {verifiedItemsCount} dari {totalItemsCount} Produk ({progressPercent}%)
            </span>
          </div>
          <div className="h-2 w-full bg-slate-200/80 rounded-full overflow-hidden p-0.5">
            <motion.div
              className={cn(
                "h-full rounded-full transition-all duration-300",
                isAllVerified ? "bg-emerald-500 shadow-emerald-500/50 shadow-sm" : "bg-gradient-to-r from-amber-500 to-emerald-500"
              )}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>
      )}

      {/* Smooth Table Transition View Container */}
      <AnimatePresence mode="wait">
        <motion.div
          key={modeKey}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22, ease: "easeInOut" }}
        >
          <DataTable
            columns={columns}
            data={items}
            isFetching={isFetching}
            virtualize={false}
            actionColumnWidth="w-48"
            extraActions={
              canReceive
                ? (item) => {
                    const index = items.findIndex((i) => i.uid === item.uid);
                    const actualIndex = index >= 0 ? index : 0;

                    if (item.status !== null && item.status !== undefined) {
                      const isRejected = item.status === "rejected";
                      return (
                        <Badge variant={isRejected ? "danger" : "success"} className="px-2.5 py-0.5 text-xs font-bold shadow-2xs">
                          {isRejected ? "Ditolak" : "Diterima"}
                        </Badge>
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
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
