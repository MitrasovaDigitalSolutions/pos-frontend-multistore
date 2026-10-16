"use client";

import { useMemo, useState } from "react";
import { IconSearch } from "@tabler/icons-react";
import { DataTable } from "@/components/ui/data-table";
import { useDebounce } from "@/hooks/use-debounce";
import { extractDataList } from "@/lib/utils";
import { useConsignmentStockPositions } from "../api/remittance-api";
import type { ConsignmentStockPosition } from "../types";
import { ConsignmentStockStatTiles } from "./stock-position/consignment-stock-stat-tiles";
import { useConsignmentStockColumns } from "./stock-position/use-consignment-stock-columns";
import { ConsignmentStockCard } from "./stock-position/consignment-stock-card";

interface ConsignmentStockPositionTableProps {
  storeUid?: string;
  showStoreColumn?: boolean;
}

export function ConsignmentStockPositionTable({
  storeUid,
  showStoreColumn = false,
}: ConsignmentStockPositionTableProps) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const queryParams = useMemo(
    () => ({
      store_uid: storeUid,
      search: debouncedSearch.trim() ? debouncedSearch.trim() : undefined,
    }),
    [storeUid, debouncedSearch]
  );

  const { data: response, isLoading, isFetching } = useConsignmentStockPositions(queryParams);

  const rawItems = useMemo(
    () => extractDataList<ConsignmentStockPosition>(response),
    [response]
  );

  // Client-side fallback filter for instant search responsiveness
  const items = useMemo(() => {
    if (!debouncedSearch.trim()) return rawItems;
    const q = debouncedSearch.toLowerCase().trim();
    return rawItems.filter((item) => {
      const name = (item.product?.nama || item.nama_produk || "").toLowerCase();
      const barcode = (item.product?.barcode || "").toLowerCase();
      const sku = (item.product?.sku || item.sku || "").toLowerCase();
      const cat = (item.product?.category?.nama || "").toLowerCase();
      const storeName = (item.store?.nama || item.store_nama || "").toLowerCase();
      return (
        name.includes(q) ||
        barcode.includes(q) ||
        sku.includes(q) ||
        cat.includes(q) ||
        storeName.includes(q)
      );
    });
  }, [rawItems, debouncedSearch]);

  const columns = useConsignmentStockColumns({ showStoreColumn });

  return (
    <div className="space-y-3">
      {/* 4 Compact Metric Tiles */}
      <ConsignmentStockStatTiles items={items} isLoading={isLoading} />

      {/* Reusable DataTable */}
      <DataTable
        columns={columns}
        data={items}
        isLoading={isLoading}
        isFetching={isFetching}
        clientPagination={true}
        perPage={15}
        entityName="produk titipan"
        emptyMessage="Tidak ada barang konsinyasi yang tersimpan di cabang ini."
        extraToolbarActions={
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="relative w-56 sm:w-64">
              <IconSearch
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari produk / barcode / SKU..."
                className="w-full h-7 pl-7 pr-2.5 text-xs rounded-lg border border-slate-200 bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        }
        renderCardItem={(row) => (
          <ConsignmentStockCard item={row.original} showStoreColumn={showStoreColumn} />
        )}
      />
    </div>
  );
}
