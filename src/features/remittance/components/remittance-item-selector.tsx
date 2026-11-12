"use client";

import { useMemo, useState } from "react";
import { IconListCheck, IconSearch } from "@tabler/icons-react";
import { Checkbox } from "@/components/ui/checkbox";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { formatDate } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import type { UnsettledTransactionItem } from "../types";
import { getUnsettledItemMetrics } from "../utils/remittance-utils";

interface RemittanceItemSelectorProps {
  items: UnsettledTransactionItem[];
  selectedUids: string[];
  onChange: (uids: string[]) => void;
  disabled?: boolean;
  errorMessage?: string;
}

export function RemittanceItemSelector({
  items,
  selectedUids,
  onChange,
  disabled = false,
  errorMessage,
}: RemittanceItemSelectorProps) {
  const [search, setSearch] = useState("");

  const selectedSet = useMemo(() => new Set(selectedUids), [selectedUids]);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      const noStruk = (item.sale?.nomor_transaksi || item.no_struk || "").toLowerCase();
      const nama = (item.nama_produk || item.product?.nama || item.product_nama || "").toLowerCase();
      const barcode = (item.barcode || item.product?.barcode || item.product_barcode || "").toLowerCase();
      return noStruk.includes(q) || nama.includes(q) || barcode.includes(q);
    });
  }, [items, search]);

  const allFilteredSelected =
    filteredItems.length > 0 && filteredItems.every((item) => selectedSet.has(item.uid));

  const handleToggleItem = (uid: string) => {
    if (disabled) return;
    const next = new Set(selectedSet);
    if (next.has(uid)) {
      next.delete(uid);
    } else {
      next.add(uid);
    }
    onChange(Array.from(next));
  };

  const handleToggleAllFiltered = () => {
    if (disabled) return;
    const next = new Set(selectedSet);
    if (allFilteredSelected) {
      filteredItems.forEach((item) => next.delete(item.uid));
    } else {
      filteredItems.forEach((item) => next.add(item.uid));
    }
    onChange(Array.from(next));
  };

  return (
    <div className="border border-slate-200/80 rounded-xl bg-slate-50/50 p-3 flex flex-col space-y-2.5">
      {/* Header & Quick Toggle */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <IconListCheck size={15} className="text-blue-600 shrink-0" />
          <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
            Pilih Item Disetor
          </span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 font-mono">
            {selectedUids.length}/{items.length}
          </span>
        </div>

        {filteredItems.length > 0 && (
          <button
            type="button"
            disabled={disabled}
            onClick={handleToggleAllFiltered}
            className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-50 cursor-pointer"
          >
            {allFilteredSelected ? "Kosongkan Pilihan" : "Pilih Semua"}
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <IconSearch
          size={13}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          disabled={disabled}
          placeholder="Filter no. struk atau nama produk..."
          className="w-full h-7 pl-7 pr-2.5 text-xs rounded-lg border border-slate-200 bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Scrollable Items List */}
      <div className="max-h-56 overflow-y-auto space-y-1.5 pr-0.5">
        {filteredItems.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            Tidak ada item transaksi yang cocok.
          </div>
        ) : (
          filteredItems.map((item) => {
            const isSelected = selectedSet.has(item.uid);
            const noStruk = item.sale?.nomor_transaksi || item.no_struk || "—";
            const rawDate =
              item.sale?.tanggal_transaksi ||
              item.sale?.created_at ||
              item.created_at ||
              item.tanggal;
            const dateStr = rawDate ? formatDate(rawDate, "dd MMM, HH:mm") || rawDate : "";
            const productName =
              item.nama_produk || item.product?.nama || item.product_nama || "Produk";
            const { wajibSetor, komisi } = getUnsettledItemMetrics(item);

            return (
              <div
                key={item.uid}
                onClick={() => handleToggleItem(item.uid)}
                className={cn(
                  "p-2 rounded-lg border text-xs flex items-start justify-between gap-2.5 transition-colors cursor-pointer select-none",
                  isSelected
                    ? "bg-blue-50/60 border-blue-300"
                    : "bg-white border-slate-200/80 hover:border-slate-300"
                )}
              >
                <div className="flex items-start gap-2 min-w-0">
                  <div className="pt-0.5" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={isSelected}
                      disabled={disabled}
                      onCheckedChange={() => handleToggleItem(item.uid)}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono font-bold text-[11px] text-slate-900">
                        {noStruk}
                      </span>
                      {dateStr && (
                        <span className="text-[10px] text-slate-400">{dateStr}</span>
                      )}
                    </div>
                    <p className="font-semibold text-slate-800 truncate leading-snug">
                      {productName}
                    </p>
                    <span className="text-[10px] text-slate-500">
                      Qty: <strong className="font-mono text-slate-700">{item.kuantitas}</strong> •
                      Komisi:{" "}
                      <span className="font-mono text-emerald-600 font-semibold">
                        +{formatRupiah(komisi)}
                      </span>
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-mono font-bold text-blue-700 text-xs block">
                    {formatRupiah(wajibSetor)}
                  </span>
                  <span className="text-[9.5px] text-slate-400 block">Wajib Setor</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {errorMessage && (
        <p className="text-[11px] text-rose-500 font-semibold">{errorMessage}</p>
      )}
    </div>
  );
}

