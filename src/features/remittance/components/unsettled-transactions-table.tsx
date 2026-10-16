"use client";

import { useMemo, useState } from "react";
import { IconReceipt2, IconSearch } from "@tabler/icons-react";
import { DataTable } from "@/components/ui/data-table";
import { useDebounce } from "@/hooks/use-debounce";
import { extractDataList } from "@/lib/utils";
import { useUnsettledRemittanceItems } from "../api/remittance-api";
import type { UnsettledTransactionItem } from "../types";
import { useUnsettledColumns } from "./unsettled/use-unsettled-columns";
import { UnsettledTransactionCard } from "./unsettled/unsettled-transaction-card";

export function UnsettledTransactionsTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);

  const queryParams = useMemo(() => {
    return debouncedSearch.trim() ? { search: debouncedSearch.trim() } : undefined;
  }, [debouncedSearch]);

  const { data: itemsRes, isLoading, isFetching } = useUnsettledRemittanceItems(queryParams);
  const items = useMemo(() => extractDataList<UnsettledTransactionItem>(itemsRes), [itemsRes]);

  const columns = useUnsettledColumns();

  return (
    <DataTable
      columns={columns}
      data={items}
      isLoading={isLoading}
      isFetching={isFetching}
      clientPagination={true}
      perPage={10}
      entityName="transaksi"
      emptyMessage={
        searchTerm ? "Tidak ada transaksi yang cocok" : "Semua transaksi konsinyasi sudah disetor"
      }
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
      renderCardItem={(row) => <UnsettledTransactionCard item={row.original} />}
    />
  );
}
