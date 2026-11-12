"use client";

import { useCallback, useMemo, useState } from "react";
import {
  IconArrowUpRight,
  IconReceipt2,
  IconSearch,
} from "@tabler/icons-react";
import { DataTable, DataTableTextActionButton } from "@/components/ui/data-table";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useDebounce } from "@/hooks/use-debounce";
import { extractDataList } from "@/lib/utils";
import { useUnsettledRemittanceItems } from "../api/remittance-api";
import type { UnsettledTransactionItem } from "../types";
import { calculateSelectedItemsSummary } from "../utils/remittance-utils";
import { UnsettledFloatingSummaryBar } from "./unsettled/unsettled-floating-summary-bar";
import { useUnsettledColumns } from "./unsettled/use-unsettled-columns";
import { UnsettledTransactionCard } from "./unsettled/unsettled-transaction-card";

interface UnsettledTransactionsTableProps {
  selectedItemUids: string[];
  onSelectionChange: (uids: string[]) => void;
  onOpenCreateWithSelected: () => void;
  onRemitSingleItem: (item: UnsettledTransactionItem) => void;
}

export function UnsettledTransactionsTable({
  selectedItemUids,
  onSelectionChange,
  onOpenCreateWithSelected,
  onRemitSingleItem,
}: UnsettledTransactionsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);

  const queryParams = useMemo(() => {
    return {
      all: 1,
      ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
    };
  }, [debouncedSearch]);

  const { data: itemsRes, isLoading, isFetching } = useUnsettledRemittanceItems(queryParams);
  const items = useMemo(() => extractDataList<UnsettledTransactionItem>(itemsRes), [itemsRes]);

  const selectedSet = useMemo(() => new Set(selectedItemUids), [selectedItemUids]);

  const allVisibleSelected = useMemo(
    () => items.length > 0 && items.every((item) => selectedSet.has(item.uid)),
    [items, selectedSet]
  );

  const handleToggleItem = useCallback(
    (uid: string) => {
      const next = new Set(selectedSet);
      if (next.has(uid)) {
        next.delete(uid);
      } else {
        next.add(uid);
      }
      onSelectionChange(Array.from(next));
    },
    [onSelectionChange, selectedSet]
  );

  const handleToggleAllVisible = useCallback(
    (checked: boolean) => {
      const next = new Set(selectedSet);
      if (checked) {
        items.forEach((item) => next.add(item.uid));
      } else {
        items.forEach((item) => next.delete(item.uid));
      }
      onSelectionChange(Array.from(next));
    },
    [items, onSelectionChange, selectedSet]
  );

  const selectedItems = useMemo(
    () => items.filter((item) => selectedSet.has(item.uid)),
    [items, selectedSet]
  );

  const selectedSummary = useMemo(
    () => calculateSelectedItemsSummary(selectedItems),
    [selectedItems]
  );

  const columns = useUnsettledColumns({
    selectedSet,
    allVisibleSelected,
    onToggleItem: handleToggleItem,
    onToggleAllVisible: handleToggleAllVisible,
  });

  return (
    <TooltipProvider delayDuration={150}>
      <div className="space-y-3">
        <DataTable
          columns={columns}
          data={items}
          isLoading={isLoading}
          isFetching={isFetching}
          clientPagination={true}
          perPage={10}
          entityName="transaksi"
          actionColumnWidth="w-24"
          emptyMessage={
            searchTerm
              ? "Tidak ada transaksi yang cocok"
              : "Semua transaksi konsinyasi sudah disetor"
          }
          getRowClassName={(item) =>
            selectedSet.has(item.uid) ? "bg-blue-50/40 hover:bg-blue-50/70" : ""
          }
          extraActions={(item) => (
            <DataTableTextActionButton
              variant="indigo"
              onClick={() => onRemitSingleItem(item)}
              icon={<IconArrowUpRight size={13} />}
              tooltip="Setor item transaksi ini secara langsung"
            >
              Setor
            </DataTableTextActionButton>
          )}
          extraToolbarActions={
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="flex items-center gap-1.5">
                <IconReceipt2 size={16} className="text-purple-600 shrink-0" />
                <h3 className="text-xs font-bold text-slate-900 leading-none">
                  Transaksi Belum Disetor
                </h3>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600 font-semibold">
                  {items.length} item
                </span>
              </div>

              {items.length > 0 && (
                <button
                  type="button"
                  onClick={() => handleToggleAllVisible(!allVisibleSelected)}
                  className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 px-2 py-1 rounded-md hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  {allVisibleSelected ? "Batal Pilih Semua" : "Pilih Semua"}
                </button>
              )}

              <div className="relative w-48 sm:w-56">
                <IconSearch
                  size={13}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari struk / produk..."
                  className="w-full h-7 pl-7 pr-2.5 text-xs rounded-lg border border-slate-200 bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          }
          renderCardItem={(row) => (
            <UnsettledTransactionCard
              item={row.original}
              isSelected={selectedSet.has(row.original.uid)}
              onToggleSelect={handleToggleItem}
              onRemitSingle={onRemitSingleItem}
            />
          )}
        />

        {/* Floating Summary Card (muncul saat ada item yang dipilih) */}
        <UnsettledFloatingSummaryBar
          selectedCount={selectedItems.length}
          summary={selectedSummary}
          onClearSelection={() => onSelectionChange([])}
          onSubmitSelected={onOpenCreateWithSelected}
        />
      </div>
    </TooltipProvider>
  );
}
