"use client";

import { useSyncExternalStore } from "react";
import { IconArrowUpRight, IconChecks, IconX } from "@tabler/icons-react";
import { AppButton } from "@/components/shared/app-button";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/stores/sidebar-store";
import type { SelectedRemittanceItemsSummary } from "../../utils/remittance-utils";

interface UnsettledFloatingSummaryBarProps {
  selectedCount: number;
  summary: SelectedRemittanceItemsSummary;
  onClearSelection: () => void;
  onSubmitSelected: () => void;
}

export function UnsettledFloatingSummaryBar({
  selectedCount,
  summary,
  onClearSelection,
  onSubmitSelected,
}: UnsettledFloatingSummaryBarProps) {
  const isSidebarCollapsed = useSidebarStore((state) => state.isCollapsed);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const effectiveCollapsed = mounted ? isSidebarCollapsed : false;

  if (selectedCount <= 0) {
    return null;
  }

  return (
    <div
      id="remittance-floating-summary-bar"
      className={cn(
        "fixed bottom-3 sm:bottom-4 z-40 transition-all duration-300",
        "left-3 right-3 sm:left-6 sm:right-6 md:left-8 md:right-8",
        effectiveCollapsed ? "lg:left-[96px] lg:right-8" : "lg:left-[256px] lg:right-8"
      )}
    >
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-blue-200/90 dark:border-slate-800 rounded-2xl shadow-xl shadow-slate-900/10 p-3 sm:p-4 transition-all animate-in fade-in slide-in-from-bottom-4 duration-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
          {/* Left: Selected Badge & Financial Breakdown */}
          <div className="space-y-2 sm:space-y-0 sm:flex sm:items-center sm:justify-between lg:justify-start sm:gap-4 flex-wrap">
            {/* Top row on mobile: Badge + TotalQty */}
            <div className="flex items-center justify-between sm:justify-start gap-2">
              <div className="inline-flex items-center gap-1.5 bg-blue-600 text-white px-2.5 py-1 rounded-xl shadow-2xs shrink-0">
                <IconChecks size={14} className="shrink-0" />
                <span className="text-[11px] font-extrabold tracking-wide font-mono">
                  {selectedCount} Item Dipilih
                </span>
              </div>

              <span className="text-[11px] text-slate-500 font-medium">
                Qty:{" "}
                <strong className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {summary.totalKuantitas} pcs
                </strong>
              </span>
            </div>

            {/* Financial Metrics: Responsive 3-column mini-grid on mobile, inline flex on sm+ */}
            <div className="grid grid-cols-3 gap-1.5 sm:flex sm:items-center sm:gap-3.5 bg-slate-50/90 sm:bg-transparent border border-slate-100 sm:border-0 rounded-xl p-2 sm:p-0 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1 min-w-0">
                <span className="text-[10px] sm:text-xs text-slate-400 font-medium">Omzet:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 font-mono truncate">
                  {formatRupiah(summary.totalOmzet)}
                </span>
              </div>

              <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>

              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1 min-w-0">
                <span className="text-[10px] sm:text-xs text-slate-400 font-medium">Komisi:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono truncate">
                  +{formatRupiah(summary.totalFeeKomisi)}
                </span>
              </div>

              <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>

              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1.5 min-w-0">
                <span className="text-[10px] sm:text-xs text-slate-500 font-semibold">
                  Wajib Setor:
                </span>
                <span className="font-extrabold text-blue-700 dark:text-blue-400 font-mono text-xs sm:text-sm truncate">
                  {formatRupiah(summary.totalWajibSetor)}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Action Buttons */}
          <div className="grid grid-cols-12 gap-2 w-full lg:w-auto sm:flex sm:items-center sm:justify-end sm:gap-2.5 shrink-0">
            <AppButton
              type="button"
              variant="outline"
              onClick={onClearSelection}
              leftIcon={<IconX size={15} className="shrink-0" />}
              className="col-span-4 sm:col-auto flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer h-auto min-h-9"
            >
              <span>Batal Pilih</span>
            </AppButton>

            <AppButton
              type="button"
              onClick={onSubmitSelected}
              rightIcon={<IconArrowUpRight size={15} className="shrink-0" />}
              className="col-span-8 sm:col-auto flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30 transition-all cursor-pointer truncate h-auto min-h-9"
            >
              <span className="truncate">Proses Setoran ({selectedCount} Item)</span>
            </AppButton>
          </div>
        </div>
      </div>
    </div>
  );
}

