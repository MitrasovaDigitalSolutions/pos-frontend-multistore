"use client";

import { Button } from "@/components/ui/button";
import { IconCheck, IconDeviceFloppy } from "@tabler/icons-react";

interface OpnameItemsMobileBarProps {
  itemsCount: number;
  stats: { match: number; positive: number; negative: number };
  isPendingSave: boolean;
  isPendingFinalize: boolean;
  onSaveDraft: () => void;
  onOpenFinalize: () => void;
}

export function OpnameItemsMobileBar({
  itemsCount,
  stats,
  isPendingSave,
  isPendingFinalize,
  onSaveDraft,
  onOpenFinalize,
}: OpnameItemsMobileBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-2.5 sm:hidden flex items-center justify-between gap-2 shadow-lg">
      <div className="text-[11px] leading-tight text-slate-600 min-w-0">
        <span className="font-bold text-slate-900">{itemsCount}</span>{" "}
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
          disabled={itemsCount === 0 || isPendingSave}
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
          disabled={itemsCount === 0 || isPendingSave || isPendingFinalize}
          size="sm"
          className="h-8 px-3 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-xs rounded-xl"
        >
          <IconCheck size={14} className="mr-1" />
          Finalisasi
        </Button>
      </div>
    </div>
  );
}
