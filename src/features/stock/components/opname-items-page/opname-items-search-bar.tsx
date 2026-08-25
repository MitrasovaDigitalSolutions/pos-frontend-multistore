"use client";

import { IconSearch, IconX } from "@tabler/icons-react";
import { useRef } from "react";

interface OpnameItemsSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  totalCount: number;
  filteredCount: number;
}

export function OpnameItemsSearchBar({
  value,
  onChange,
  totalCount,
  filteredCount,
}: OpnameItemsSearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isFiltering = value.trim().length > 0;

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 px-3.5 py-2 border-b border-slate-100 bg-white">
      {/* Search Input */}
      <div className="relative flex-1">
        <IconSearch
          size={14}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Cari item di daftar opname (nama / barcode)..."
          className="h-8 w-full pl-8 pr-8 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-800 font-medium placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 focus:bg-white transition-all"
        />
        {isFiltering && (
          <button
            type="button"
            onClick={() => {
              onChange("");
              inputRef.current?.focus();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
            title="Hapus pencarian"
          >
            <IconX size={13} />
          </button>
        )}
      </div>

      {/* Result Count Badge */}
      {isFiltering && (
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10.5px] font-bold text-slate-500 whitespace-nowrap">
            Menampilkan{" "}
            <span className="text-emerald-600">{filteredCount.toLocaleString("id-ID")}</span>
            {" "}dari{" "}
            <span className="text-slate-700">{totalCount.toLocaleString("id-ID")}</span>
            {" "}item
          </span>
        </div>
      )}
    </div>
  );
}
