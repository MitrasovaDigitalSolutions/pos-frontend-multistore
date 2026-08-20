"use client";

import { Button } from "@/components/ui/button";
import { OPNAME_STATUS_CLASSES, OPNAME_STATUS_LABELS } from "@/constants/stock";
import { cn } from "@/lib/utils";
import type { Opname } from "../../types";
import {
  IconArrowLeft,
  IconCheck,
  IconDeviceFloppy,
  IconEdit,
  IconHelp,
} from "@tabler/icons-react";

interface OpnameItemsHeaderProps {
  opname: Opname;
  itemsCount: number;
  isPendingSave: boolean;
  isPendingFinalize: boolean;
  isInstructionsOpen: boolean;
  onToggleInstructions: () => void;
  onOpenEditHeader: () => void;
  onSaveDraft: () => void;
  onOpenFinalize: () => void;
  onBack: () => void;
}

export function OpnameItemsHeader({
  opname,
  itemsCount,
  isPendingSave,
  isPendingFinalize,
  isInstructionsOpen,
  onToggleInstructions,
  onOpenEditHeader,
  onSaveDraft,
  onOpenFinalize,
  onBack,
}: OpnameItemsHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
      {/* ── Title, Status, and Catatan ── */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <Button
          type="button"
          onClick={onBack}
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-xl border-slate-200 text-slate-500 hover:text-slate-900 bg-white shrink-0"
          title="Kembali ke Daftar Stock"
        >
          <IconArrowLeft size={16} />
        </Button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
              Opname #{opname.nomor_opname}
            </h2>
            <span
              className={cn(
                "px-1.5 py-0.5 rounded-full text-[9px] font-bold border",
                OPNAME_STATUS_CLASSES[opname.status] ||
                  "bg-amber-50 text-amber-700 border-amber-100"
              )}
            >
              {OPNAME_STATUS_LABELS[opname.status]}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[10.5px] text-slate-400 truncate mt-0.5">
            <span className="shrink-0">Catatan:</span>
            <span className="font-semibold text-slate-600 truncate max-w-[140px] sm:max-w-xs">
              {opname.catatan || "—"}
            </span>
            <button
              type="button"
              onClick={onOpenEditHeader}
              className="text-emerald-600 hover:text-emerald-700 p-0.5 hover:bg-emerald-50 rounded shrink-0 cursor-pointer transition-colors"
              title="Edit Catatan"
            >
              <IconEdit size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Desktop Action Buttons (sm:flex) ── */}
      <div className="hidden sm:flex items-center gap-2 shrink-0">
        <Button
          onClick={onToggleInstructions}
          variant="outline"
          className={cn(
            "font-bold text-xs h-8 px-2.5 rounded-xl flex items-center gap-1 cursor-pointer transition-colors border-slate-200",
            isInstructionsOpen
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
              : "bg-white text-slate-600 hover:text-slate-900"
          )}
        >
          <IconHelp size={14} />
          <span>{isInstructionsOpen ? "Tutup Petunjuk" : "Petunjuk"}</span>
        </Button>

        <Button
          onClick={onSaveDraft}
          disabled={itemsCount === 0 || isPendingSave}
          variant="outline"
          className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-white font-bold text-xs h-8 px-3 rounded-xl flex items-center gap-1 cursor-pointer"
        >
          <IconDeviceFloppy size={14} />
          <span>{isPendingSave ? "Menyimpan..." : "Simpan Draf"}</span>
        </Button>

        <Button
          onClick={onOpenFinalize}
          disabled={itemsCount === 0 || isPendingSave || isPendingFinalize}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-8 px-3.5 rounded-xl flex items-center gap-1 cursor-pointer shadow-xs border-none"
        >
          <IconCheck size={14} />
          <span>Finalisasi & Update Stok</span>
        </Button>
      </div>

      {/* ── Mobile Action (sm:hidden) ── */}
      <div className="flex sm:hidden items-center gap-1 shrink-0">
        <Button
          onClick={onToggleInstructions}
          variant="outline"
          size="sm"
          className={cn(
            "font-bold text-[11px] h-8 px-2 rounded-xl flex items-center gap-1 border-slate-200",
            isInstructionsOpen
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-white text-slate-600"
          )}
        >
          <IconHelp size={14} />
          <span>{isInstructionsOpen ? "Tutup" : "Panduan"}</span>
        </Button>
      </div>
    </div>
  );
}
