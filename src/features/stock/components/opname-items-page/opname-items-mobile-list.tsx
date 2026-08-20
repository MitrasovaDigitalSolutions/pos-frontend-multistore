"use client";

import { Button } from "@/components/ui/button";
import type { OpnameItemLocal } from "@/stores/opname-items-store";
import { IconBarcode, IconCheck, IconDeviceFloppy } from "@tabler/icons-react";
import { OpnameItemMobileCard } from "./opname-item-mobile-card";

interface OpnameItemsMobileListProps {
  items: OpnameItemLocal[];
  updateItem: (temp_uid: string, updates: Partial<OpnameItemLocal>) => void;
  removeItem: (temp_uid: string) => void;
  stats: { match: number; positive: number; negative: number };
  isPendingSave: boolean;
  isPendingFinalize: boolean;
  onSaveDraft: () => void;
  onOpenFinalize: () => void;
}

export function OpnameItemsMobileList({
  items,
  updateItem,
  removeItem,
  stats,
  isPendingSave,
  isPendingFinalize,
  onSaveDraft,
  onOpenFinalize,
}: OpnameItemsMobileListProps) {
  return (
    <>
      {/* ── Mobile Cards List ── */}
      <div className="block md:hidden p-3 space-y-3">
        {items.map((item, index) => (
          <OpnameItemMobileCard
            key={item.temp_uid}
            item={item}
            index={index}
            updateItem={updateItem}
            removeItem={removeItem}
          />
        ))}
        {items.length === 0 && (
          <div className="text-center py-8 text-slate-400 font-semibold text-xs flex flex-col items-center justify-center gap-1.5">
            <IconBarcode size={24} className="text-slate-300" />
            <span>Belum ada barang dihitung. Scan barcode di atas.</span>
          </div>
        )}
      </div>

      {/* ── Mobile Sticky Bottom Action Bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-2.5 sm:hidden flex items-center justify-between gap-2 shadow-lg">
        <div className="text-[11px] leading-tight text-slate-600 min-w-0">
          <span className="font-bold text-slate-900">{items.length}</span>{" "}
          barang dihitung
          <div className="flex items-center gap-1 text-[10px] text-slate-400 truncate">
            <span>
              Cocok: <strong className="text-emerald-600">{stats.match}</strong>
            </span>
            <span>•</span>
            <span>
              Selisih:{" "}
              <strong
                className={
                  stats.positive + stats.negative > 0
                    ? "text-rose-600"
                    : "text-slate-500"
                }
              >
                {stats.positive + stats.negative}
              </strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            type="button"
            onClick={onSaveDraft}
            disabled={items.length === 0 || isPendingSave}
            variant="outline"
            size="sm"
            className="h-8 px-2.5 text-xs font-bold border-blue-200 text-blue-700 bg-blue-50/50 rounded-xl"
          >
            <IconDeviceFloppy size={14} className="mr-1" />
            Draf
          </Button>
          <Button
            type="button"
            onClick={onOpenFinalize}
            disabled={items.length === 0 || isPendingSave || isPendingFinalize}
            size="sm"
            className="h-8 px-3 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-xs rounded-xl"
          >
            <IconCheck size={14} className="mr-1" />
            Finalisasi
          </Button>
        </div>
      </div>
    </>
  );
}
