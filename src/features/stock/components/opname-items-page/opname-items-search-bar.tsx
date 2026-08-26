"use client";

import { IconSearch, IconX, IconFilter } from "@tabler/icons-react";
import { useRef } from "react";
import { useOpnameUIStore } from "@/stores/opname-items-store";
import { cn } from "@/lib/utils";
import type { OpnameItemsSummary } from "../../api/stock-api";

interface OpnameItemsSearchBarProps {
  summary?: OpnameItemsSummary;
  totalFiltered: number;
}

export function OpnameItemsSearchBar({
  summary,
  totalFiltered,
}: OpnameItemsSearchBarProps) {
  const search = useOpnameUIStore((state) => state.search);
  const setSearch = useOpnameUIStore((state) => state.setSearch);
  const filterSelisih = useOpnameUIStore((state) => state.filterSelisih);
  const setFilterSelisih = useOpnameUIStore((state) => state.setFilterSelisih);

  const inputRef = useRef<HTMLInputElement>(null);
  const isSearching = search.trim().length > 0;

  const totalAll = summary?.total_count ?? 0;
  const matchCount = summary?.match_count ?? 0;
  const diffCount = (summary?.positive_count ?? 0) + (summary?.negative_count ?? 0);
  const positiveCount = summary?.positive_count ?? 0;
  const negativeCount = summary?.negative_count ?? 0;

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 px-3.5 py-2.5 border-b border-slate-100 bg-white">
      {/* ── Search Input ── */}
      <div className="relative flex-1 min-w-[200px]">
        <IconSearch
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari barcode atau nama barang..."
          className="h-8.5 w-full pl-8.5 pr-8 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-800 font-medium placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 focus:bg-white transition-all"
        />
        {isSearching && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              inputRef.current?.focus();
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
            title="Hapus pencarian"
          >
            <IconX size={13} />
          </button>
        )}
      </div>

      {/* ── Filter Pills / Tabs ── */}
      <div className="flex items-center gap-1 overflow-x-auto pb-0.5 sm:pb-0 scrollbar-none">
        <button
          type="button"
          onClick={() => setFilterSelisih("all")}
          className={cn(
            "px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 border",
            filterSelisih === "all"
              ? "bg-slate-900 text-white border-slate-900 shadow-xs"
              : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
          )}
        >
          <span>Semua</span>
          <span className={cn(
            "text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold",
            filterSelisih === "all" ? "bg-slate-700 text-white" : "bg-slate-200 text-slate-700"
          )}>
            {totalAll.toLocaleString("id-ID")}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFilterSelisih("diff")}
          className={cn(
            "px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 border",
            filterSelisih === "diff"
              ? "bg-amber-600 text-white border-amber-600 shadow-xs"
              : "bg-amber-50/60 text-amber-700 border-amber-200 hover:bg-amber-100/70"
          )}
        >
          <IconFilter size={13} />
          <span>Ada Selisih</span>
          <span className={cn(
            "text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold",
            filterSelisih === "diff" ? "bg-amber-700 text-white" : "bg-amber-200/80 text-amber-900"
          )}>
            {diffCount.toLocaleString("id-ID")}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFilterSelisih("match")}
          className={cn(
            "px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 border",
            filterSelisih === "match"
              ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
              : "bg-emerald-50/60 text-emerald-700 border-emerald-200 hover:bg-emerald-100/70"
          )}
        >
          <span>Sesuai</span>
          <span className={cn(
            "text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold",
            filterSelisih === "match" ? "bg-emerald-700 text-white" : "bg-emerald-200/80 text-emerald-900"
          )}>
            {matchCount.toLocaleString("id-ID")}
          </span>
        </button>

        {positiveCount > 0 && (
          <button
            type="button"
            onClick={() => setFilterSelisih("plus")}
            className={cn(
              "px-2 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 border",
              filterSelisih === "plus"
                ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                : "bg-blue-50/50 text-blue-700 border-blue-200 hover:bg-blue-100"
            )}
            title="Selisih Lebih (+)"
          >
            <span>+</span>
            <span className="font-mono text-[10px]">{positiveCount}</span>
          </button>
        )}

        {negativeCount > 0 && (
          <button
            type="button"
            onClick={() => setFilterSelisih("minus")}
            className={cn(
              "px-2 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 border",
              filterSelisih === "minus"
                ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                : "bg-rose-50/50 text-rose-700 border-rose-200 hover:bg-rose-100"
            )}
            title="Selisih Kurang (-)"
          >
            <span>-</span>
            <span className="font-mono text-[10px]">{negativeCount}</span>
          </button>
        )}
      </div>
    </div>
  );
}
