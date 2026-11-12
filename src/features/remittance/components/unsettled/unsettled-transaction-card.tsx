"use client";

import { IconArrowUpRight } from "@tabler/icons-react";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableTextActionButton } from "@/components/ui/data-table";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { formatDate } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import type { UnsettledTransactionItem } from "../../types";
import { getUnsettledItemMetrics } from "../../utils/remittance-utils";

interface UnsettledTransactionCardProps {
  item: UnsettledTransactionItem;
  isSelected?: boolean;
  onToggleSelect?: (uid: string) => void;
  onRemitSingle?: (item: UnsettledTransactionItem) => void;
}

export function UnsettledTransactionCard({
  item,
  isSelected = false,
  onToggleSelect,
  onRemitSingle,
}: UnsettledTransactionCardProps) {
  const noTransaksi = item.sale?.nomor_transaksi || item.no_struk || "—";
  const rawDate =
    item.sale?.tanggal_transaksi ||
    item.sale?.created_at ||
    item.created_at ||
    item.tanggal;
  const tanggalFormatted = rawDate
    ? formatDate(rawDate, "dd MMM yyyy, HH:mm") || rawDate
    : "—";
  const namaProduk = item.nama_produk || item.product?.nama || item.product_nama || "—";
  const barcode = item.barcode || item.product?.barcode || item.product_barcode;
  const { wajibSetor, komisi, hargaPasok } = getUnsettledItemMetrics(item);

  return (
    <div
      onClick={() => onToggleSelect?.(item.uid)}
      className={cn(
        "p-3 bg-white border rounded-xl space-y-2 text-xs shadow-2xs transition-colors",
        onToggleSelect && "cursor-pointer",
        isSelected
          ? "border-blue-500 bg-blue-50/30 ring-1 ring-blue-500/30"
          : "border-slate-200/80 hover:border-slate-300"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5 min-w-0">
          {onToggleSelect && (
            <div className="pt-0.5" onClick={(e) => e.stopPropagation()}>
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onToggleSelect(item.uid)}
                aria-label={`Pilih ${namaProduk}`}
              />
            </div>
          )}
          <div className="min-w-0">
            <span className="font-mono font-bold text-slate-900 block truncate">
              {noTransaksi}
            </span>
            <span className="text-[10px] text-slate-400 block">{tanggalFormatted}</span>
          </div>
        </div>
        <span className="font-bold text-blue-700 font-mono text-sm shrink-0">
          {formatRupiah(wajibSetor)}
        </span>
      </div>

      <div>
        <span className="font-semibold text-slate-800 leading-tight block">
          {namaProduk}
        </span>
        {barcode && (
          <span className="font-mono text-[10px] text-slate-400 block mt-0.5">
            {barcode}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 text-[11px] pt-2 border-t border-slate-100 text-slate-500">
        <div className="min-w-0">
          <span className="block truncate">
            Qty: <strong className="text-slate-800 font-mono">{item.kuantitas}</strong> • Pasok:{" "}
            <span className="text-slate-700 font-mono">{formatRupiah(hargaPasok)}</span>
          </span>
          <span className="block mt-0.5">
            Komisi:{" "}
            <strong className="text-emerald-600 font-mono">+{formatRupiah(komisi)}</strong>
          </span>
        </div>

        {onRemitSingle && (
          <div onClick={(e) => e.stopPropagation()} className="shrink-0">
            <DataTableTextActionButton
              variant="indigo"
              onClick={() => onRemitSingle(item)}
              icon={<IconArrowUpRight size={13} />}
              className="py-1.5 px-3"
            >
              Setor
            </DataTableTextActionButton>
          </div>
        )}
      </div>
    </div>
  );
}
