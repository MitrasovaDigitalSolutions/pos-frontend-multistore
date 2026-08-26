"use client";

import { useOpnameUIStore } from "@/stores/opname-items-store";
import { IconSearch, IconX } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";

export function OpnameItemsSearchBar() {
  const search = useOpnameUIStore((state) => state.search);
  const setSearch = useOpnameUIStore((state) => state.setSearch);

  const [prevSearch, setPrevSearch] = useState(search);
  const [localValue, setLocalValue] = useState(search);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync localValue during render when external store changes (avoids cascading render lint)
  if (prevSearch !== search) {
    setPrevSearch(search);
    setLocalValue(search);
  }

  // Debounce search update to store by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== search) {
        setSearch(localValue);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localValue, search, setSearch]);

  const handleClear = () => {
    setLocalValue("");
    setSearch("");
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-48 sm:w-64">
      <IconSearch
        size={14}
        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
      />
      <input
        ref={inputRef}
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder="Cari barcode atau nama..."
        className="h-7.5 w-full pl-8 pr-7 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 font-medium placeholder:text-slate-400 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/20 transition-all"
      />
      {localValue.trim().length > 0 && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100 transition-colors cursor-pointer"
          title="Hapus pencarian"
        >
          <IconX size={12} />
        </button>
      )}
    </div>
  );
}
