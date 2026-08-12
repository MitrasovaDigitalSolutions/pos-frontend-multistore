"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useFormContext } from "react-hook-form";
import { IconPackage, IconLoader2, IconCheck } from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { TRANSFER_SHIPMENT_STATUS } from "../../constants";
import type { StockTransferItem } from "../../types";
import type { ReceiveFormValues } from "./types";
import { useTransferDetailItemsColumns } from "./use-transfer-detail-items-columns";
import { ReceivingItemRowControls } from "./receiving-item-row-controls";
import { ValidationRowControls } from "./validation-row-controls";
import { ReceivingConfirmDialog } from "./receiving-confirm-dialog";

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
  canValidateTransfer?: boolean;
  onValidateItem?: (
    item: StockTransferItem,
    payload: { jenis: "retur" | "koreksi"; kuantitas_return?: number; setujui?: boolean }
  ) => void;
  validatingItemUid?: string | null;
  isFetching?: boolean;
}

export function TransferDetailItemsTable({
  items,
  canReceive,
  onReceiveItemSubmit,
  processingItemUid,
  canValidateTransfer,
  onValidateItem,
  validatingItemUid,
  isFetching = false,
}: TransferDetailItemsTableProps) {
  const { watch } = useFormContext<ReceiveFormValues>();

  // Receiving dialog state
  const [activeItem, setActiveItem] = useState<StockTransferItem | null>(null);
  const [activeMode, setActiveMode] = useState<
    typeof TRANSFER_SHIPMENT_STATUS.RECEIVED | typeof TRANSFER_SHIPMENT_STATUS.REJECTED
  >(TRANSFER_SHIPMENT_STATUS.RECEIVED);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Validation dialog state
  const [activeValidateItem, setActiveValidateItem] = useState<StockTransferItem | null>(null);
  const [activeValidateAction, setActiveValidateAction] = useState<
    "approve_koreksi" | "reject_koreksi" | "confirm_retur" | "reject_retur"
  >("confirm_retur");
  const [isValidateDialogOpen, setIsValidateDialogOpen] = useState(false);

  const qtyInputRefs = useRef<Map<string, HTMLInputElement>>(new Map());
  const validationInputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  const registerInputRef = useCallback((uid: string, el: HTMLInputElement | null) => {
    if (el) {
      qtyInputRefs.current.set(uid, el);
    } else {
      qtyInputRefs.current.delete(uid);
    }
  }, []);

  const registerValidationInputRef = useCallback((uid: string, el: HTMLInputElement | null) => {
    if (el) {
      validationInputRefs.current.set(uid, el);
    } else {
      validationInputRefs.current.delete(uid);
    }
  }, []);

  const focusNextPendingItem = useCallback(
    (excludeUid?: string) => {
      setTimeout(() => {
        const nextPending = items.find(
          (i) => i.uid !== excludeUid && (i.status === null || i.status === undefined)
        );
        if (nextPending) {
          const el = qtyInputRefs.current.get(nextPending.uid);
          if (el) {
            el.focus();
            el.select();
          }
        }
      }, 120);
    },
    [items]
  );

  const focusNextPendingValidationItem = useCallback(
    (excludeUid?: string) => {
      setTimeout(() => {
        const nextPending = items.find(
          (i) => i.uid !== excludeUid && !i.validated_at
        );
        if (nextPending) {
          const el = validationInputRefs.current.get(nextPending.uid);
          if (el) {
            el.focus();
            el.select();
          }
        }
      }, 120);
    },
    [items]
  );

  // Auto-focus first pending item on mount or when receiving/validation mode is activated
  useEffect(() => {
    if (canReceive && items.length > 0) {
      focusNextPendingItem();
    } else if (canValidateTransfer && items.length > 0) {
      focusNextPendingValidationItem();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canReceive, canValidateTransfer]);

  const handleOpenTerimaItem = (item: StockTransferItem) => {
    setActiveItem(item);
    setActiveMode(TRANSFER_SHIPMENT_STATUS.RECEIVED);
    setIsDialogOpen(true);
  };

  const handleOpenTolakItem = (item: StockTransferItem) => {
    setActiveItem(item);
    setActiveMode(TRANSFER_SHIPMENT_STATUS.REJECTED);
    setIsDialogOpen(true);
  };

  const handleOpenValidateItem = (item: StockTransferItem) => {
    const kelebihan = Number(item.kuantitas_diterima || 0) - Number(item.kuantitas);
    setActiveValidateItem(item);
    setActiveValidateAction(kelebihan > 0 ? "approve_koreksi" : "confirm_retur");
    setIsValidateDialogOpen(true);
  };

  const handleOpenApproveValidation = (item: StockTransferItem) => {
    const kelebihan = Number(item.kuantitas_diterima || 0) - Number(item.kuantitas);
    setActiveValidateItem(item);
    setActiveValidateAction(kelebihan > 0 ? "approve_koreksi" : "confirm_retur");
    setIsValidateDialogOpen(true);
  };

  const handleOpenRejectValidation = (item: StockTransferItem) => {
    const kelebihan = Number(item.kuantitas_diterima || 0) - Number(item.kuantitas);
    setActiveValidateItem(item);
    setActiveValidateAction(kelebihan > 0 ? "reject_koreksi" : "reject_retur");
    setIsValidateDialogOpen(true);
  };

  const handleConfirmValidationSubmit = async () => {
    if (!activeValidateItem || !onValidateItem) return;
    const currentUid = activeValidateItem.uid;
    const index = items.findIndex((i) => i.uid === activeValidateItem.uid);
    const actualIndex = index >= 0 ? index : 0;
    const formReturnQty = watch(`items.${actualIndex}.kuantitas_return`);
    const formKoreksiQty = watch(`items.${actualIndex}.kuantitas_koreksi`);
    const kelebihan = Number(activeValidateItem.kuantitas_diterima || 0) - Number(activeValidateItem.kuantitas);

    if (activeValidateAction === "approve_koreksi") {
      const koreksiQty =
        formKoreksiQty !== undefined && formKoreksiQty !== null
          ? Number(formKoreksiQty)
          : kelebihan;
      onValidateItem(activeValidateItem, { jenis: "koreksi", setujui: true, kuantitas_return: koreksiQty });
    } else if (activeValidateAction === "reject_koreksi") {
      onValidateItem(activeValidateItem, { jenis: "koreksi", setujui: false });
    } else if (activeValidateAction === "confirm_retur") {
      const returnQty =
        formReturnQty !== undefined && formReturnQty !== null
          ? Number(formReturnQty)
          : Number(activeValidateItem.kuantitas) - Number(activeValidateItem.kuantitas_diterima || 0);
      onValidateItem(activeValidateItem, { jenis: "retur", kuantitas_return: returnQty });
    } else if (activeValidateAction === "reject_retur") {
      onValidateItem(activeValidateItem, { jenis: "retur", setujui: false });
    }

    setIsValidateDialogOpen(false);
    focusNextPendingValidationItem(currentUid);
  };

  const totalItemsCount = items.length;
  const pendingItemsCount = items.filter(
    (item) => item.status === null || item.status === undefined
  ).length;
  const isAllVerified = canReceive && pendingItemsCount === 0 && totalItemsCount > 0;

  const columns = useTransferDetailItemsColumns({
    items,
    canReceive,
    canValidateTransfer,
    onReceiveItemSubmit,
    onOpenTerimaItem: handleOpenTerimaItem,
    registerInputRef,
    onOpenValidateItem: handleOpenValidateItem,
    registerValidationInputRef,
    processingItemUid,
    onValidateItem,
    validatingItemUid,
  });

  const modeKey = canReceive
    ? "mode-receiving"
    : canValidateTransfer
    ? "mode-validasi"
    : "mode-readonly";

  const activeItemIndex = activeItem
    ? items.findIndex((i) => i.uid === activeItem.uid)
    : -1;
  const activeQtyDiterima =
    activeItemIndex >= 0
      ? Number(watch(`items.${activeItemIndex}.kuantitas_diterima`) ?? activeItem?.kuantitas)
      : activeItem?.kuantitas || 0;
  const activeKeterangan =
    activeItemIndex >= 0
      ? watch(`items.${activeItemIndex}.keterangan`)
      : activeItem?.keterangan || "";

  // Dynamic props for table-level validation confirm dialog
  const getValidateDialogProps = () => {
    if (!activeValidateItem) {
      return { title: "", description: "", confirmText: "", variant: "info" as const };
    }
    const index = items.findIndex((i) => i.uid === activeValidateItem.uid);
    const actualIndex = index >= 0 ? index : 0;
    const formReturnQty = watch(`items.${actualIndex}.kuantitas_return`);
    const formKoreksiQty = watch(`items.${actualIndex}.kuantitas_koreksi`);
    const kelebihan = Number(activeValidateItem.kuantitas_diterima || 0) - Number(activeValidateItem.kuantitas);

    if (activeValidateAction === "approve_koreksi") {
      const koreksiQty =
        formKoreksiQty !== undefined && formKoreksiQty !== null ? Number(formKoreksiQty) : kelebihan;
      return {
        title: "Konfirmasi Koreksi Stok",
        description: `Setujui koreksi ${koreksiQty} pcs untuk "${activeValidateItem.product?.nama}"? Stok toko asal berkurang ${koreksiQty} pcs dan stok tujuan bertambah ${koreksiQty} pcs.`,
        confirmText: "Ya, Setujui Koreksi",
        variant: "success" as const,
      };
    }
    if (activeValidateAction === "reject_koreksi") {
      return {
        title: "Tolak Koreksi",
        description: `Tolak koreksi kelebihan ${kelebihan} pcs? Jumlah yang diterima akan dicatat sesuai jumlah yang dikirim (${activeValidateItem.kuantitas} pcs).`,
        confirmText: "Ya, Tolak",
        variant: "danger" as const,
      };
    }
    if (activeValidateAction === "confirm_retur") {
      const returnQty =
        formReturnQty !== undefined && formReturnQty !== null
          ? Number(formReturnQty)
          : Number(activeValidateItem.kuantitas) - Number(activeValidateItem.kuantitas_diterima || 0);
      return {
        title: "Konfirmasi Validasi Return",
        description: `Validasi return sebanyak ${returnQty} pcs untuk produk "${activeValidateItem.product?.nama}"? Stok akan dikembalikan ke toko Anda.`,
        confirmText: "Ya, Validasi",
        variant: "info" as const,
      };
    }
    return {
      title: "Tolak Klaim Retur",
      description: `Tolak klaim selisih untuk "${activeValidateItem.product?.nama}"? Seluruh ${activeValidateItem.kuantitas} pcs akan dianggap diterima penuh oleh toko tujuan.`,
      confirmText: "Ya, Tolak",
      variant: "danger" as const,
    };
  };

  const validateDialogProps = getValidateDialogProps();

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
                      onOpenTerima={() => handleOpenTerimaItem(item)}
                      onOpenTolak={() => handleOpenTolakItem(item)}
                      isProcessing={processingItemUid === item.uid}
                    />
                  );
                }
                : canValidateTransfer
                  ? (item) => {
                    const kelebihan = Number(item.kuantitas_diterima || 0) - Number(item.kuantitas);
                    const mode = kelebihan > 0 ? "koreksi" : "retur";

                    return (
                      <ValidationRowControls
                        item={item}
                        mode={mode}
                        onOpenApprove={() => handleOpenApproveValidation(item)}
                        onOpenReject={() => handleOpenRejectValidation(item)}
                        isProcessing={validatingItemUid === item.uid}
                      />
                    );
                  }
                  : undefined
            }
          />
        </motion.div>
      </AnimatePresence>

      <ReceivingConfirmDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open && activeItem) {
            setTimeout(() => {
              const el = qtyInputRefs.current.get(activeItem.uid);
              if (el) {
                el.focus();
                el.select();
              }
            }, 80);
          }
        }}
        item={activeItem}
        mode={activeMode}
        qtyDiterima={activeQtyDiterima}
        keterangan={activeKeterangan}
        onConfirm={async (payload) => {
          if (activeItem && onReceiveItemSubmit) {
            const currentUid = activeItem.uid;
            await onReceiveItemSubmit(activeItem, payload);
            setIsDialogOpen(false);
            focusNextPendingItem(currentUid);
          }
        }}
        isLoading={!!processingItemUid}
      />

      <ConfirmDialog
        open={isValidateDialogOpen}
        onOpenChange={(open) => {
          setIsValidateDialogOpen(open);
          if (!open && activeValidateItem) {
            setTimeout(() => {
              const el = validationInputRefs.current.get(activeValidateItem.uid);
              if (el) {
                el.focus();
                el.select();
              }
            }, 80);
          }
        }}
        title={validateDialogProps.title}
        description={validateDialogProps.description}
        confirmText={validateDialogProps.confirmText}
        variant={validateDialogProps.variant}
        isLoading={!!validatingItemUid}
        onConfirm={handleConfirmValidationSubmit}
      />
    </div>
  );
}

