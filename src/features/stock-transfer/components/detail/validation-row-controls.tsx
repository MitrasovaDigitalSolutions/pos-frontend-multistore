"use client";

import { IconCheck, IconX } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { StockTransferItem } from "../../types";

interface ValidationRowControlsProps {
  item: StockTransferItem;
  mode: "retur" | "koreksi";
  returnQty: number;
  onValidateItem?: (
    item: StockTransferItem,
    payload: { jenis: "retur" | "koreksi"; kuantitas_return?: number; setujui?: boolean }
  ) => void;
  isProcessing: boolean;
}

export function ValidationRowControls({
  item,
  mode,
  returnQty,
  onValidateItem,
  isProcessing,
}: ValidationRowControlsProps) {
  const [confirmReturnOpen, setConfirmReturnOpen] = useState(false);
  const [rejectReturnOpen, setRejectReturnOpen] = useState(false);
  const [approveKoreksiOpen, setApproveKoreksiOpen] = useState(false);
  const [rejectKoreksiOpen, setRejectKoreksiOpen] = useState(false);

  if (item.validated_at) {
    const qty = mode === "koreksi" ? item.kuantitas_koreksi : item.kuantitas_return;
    const label = item.jenis_validasi || mode;
    return (
      <div className="flex flex-col items-center gap-0.5">
        <Badge variant="success" className="px-2.5 py-0.5 text-xs font-bold shadow-2xs">
          Sudah Divalidasi
        </Badge>
        <span className="text-[10px] text-slate-500 font-bold capitalize">
          {label}: {qty ?? 0} pcs
        </span>
      </div>
    );
  }

  if (mode === "koreksi") {
    const kelebihan = Number(item.kuantitas_diterima || 0) - Number(item.kuantitas);
    return (
      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          disabled={isProcessing}
          onClick={() => setApproveKoreksiOpen(true)}
          className="h-7 text-[11px] px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
        >
          <IconCheck size={14} />
          Setujui
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isProcessing}
          onClick={() => setRejectKoreksiOpen(true)}
          className="h-7 text-[11px] px-2.5 rounded-xl text-rose-600 border-rose-200 hover:bg-rose-50 gap-1"
        >
          <IconX size={14} />
          Tolak
        </Button>

        <ConfirmDialog
          open={approveKoreksiOpen}
          onOpenChange={setApproveKoreksiOpen}
          title="Konfirmasi Koreksi Stok"
          description={`Setujui koreksi ${returnQty} pcs untuk "${item.product?.nama}"? Stok toko asal berkurang ${returnQty} pcs dan stok tujuan bertambah ${returnQty} pcs.`}
          confirmText="Ya, Setujui Koreksi"
          variant="success"
          isLoading={isProcessing}
          onConfirm={() => {
            onValidateItem?.(item, { jenis: "koreksi", setujui: true, kuantitas_return: returnQty });
            setApproveKoreksiOpen(false);
          }}
        />

        <ConfirmDialog
          open={rejectKoreksiOpen}
          onOpenChange={setRejectKoreksiOpen}
          title="Tolak Koreksi"
          description={`Tolak koreksi kelebihan ${kelebihan} pcs? Jumlah yang diterima akan dicatat sesuai jumlah yang dikirim (${item.kuantitas} pcs).`}
          confirmText="Ya, Tolak"
          variant="danger"
          isLoading={isProcessing}
          onConfirm={() => {
            onValidateItem?.(item, { jenis: "koreksi", setujui: false });
            setRejectKoreksiOpen(false);
          }}
        />
      </div>
    );
  }

  // mode === "retur"
  const diff = Number(item.kuantitas) - Number(item.kuantitas_diterima || 0);
  
  if (diff <= 0) {
    return (
      <Badge variant="success" className="px-2.5 py-0.5 text-xs font-bold shadow-2xs">
        Diterima Penuh
      </Badge>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        size="sm"
        disabled={isProcessing || returnQty === undefined || returnQty === null}
        onClick={() => setConfirmReturnOpen(true)}
        className="h-7 text-[11px] px-2.5 rounded-xl gap-1"
      >
        <IconCheck size={14} />
        Validasi
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={isProcessing}
        onClick={() => setRejectReturnOpen(true)}
        className="h-7 text-[11px] px-2.5 rounded-xl text-rose-600 border-rose-200 hover:bg-rose-50 gap-1"
      >
        <IconX size={14} />
        Tolak
      </Button>

      <ConfirmDialog
        open={confirmReturnOpen}
        onOpenChange={setConfirmReturnOpen}
        title="Konfirmasi Validasi Return"
        description={`Validasi return sebanyak ${returnQty} pcs untuk produk "${item.product?.nama}"? Stok akan dikembalikan ke toko Anda.`}
        confirmText="Ya, Validasi"
        variant="info"
        isLoading={isProcessing}
        onConfirm={() => {
          onValidateItem?.(item, { jenis: "retur", kuantitas_return: returnQty });
          setConfirmReturnOpen(false);
        }}
      />

      <ConfirmDialog
        open={rejectReturnOpen}
        onOpenChange={setRejectReturnOpen}
        title="Tolak Klaim Retur"
        description={`Tolak klaim selisih untuk "${item.product?.nama}"? Seluruh ${item.kuantitas} pcs akan dianggap diterima penuh oleh toko tujuan.`}
        confirmText="Ya, Tolak"
        variant="danger"
        isLoading={isProcessing}
        onConfirm={() => {
          onValidateItem?.(item, { jenis: "retur", setujui: false });
          setRejectReturnOpen(false);
        }}
      />
    </div>
  );
}
