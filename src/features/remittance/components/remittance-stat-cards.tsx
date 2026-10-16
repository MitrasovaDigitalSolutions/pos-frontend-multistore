"use client";

import { IconArrowUpRight, IconBuildingBank, IconCash, IconPlus, IconReceipt2 } from "@tabler/icons-react";
import { AppButton } from "@/components/shared/app-button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import type { UnsettledSummary } from "../types";

interface RemittanceStatCardsProps {
  summary?: UnsettledSummary | null;
  isLoading?: boolean;
  onOpenCreateDialog: () => void;
  canCreate?: boolean;
}

export function RemittanceStatCards({
  summary,
  isLoading = false,
  onOpenCreateDialog,
  canCreate = true,
}: RemittanceStatCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[1, 2, 3].map((idx) => (
          <div key={idx} className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs space-y-2">
            <Skeleton className="h-3.5 w-24 rounded-md" />
            <Skeleton className="h-6 w-36 rounded-md" />
          </div>
        ))}
      </div>
    );
  }

  const grossSales = summary?.total_omzet ?? summary?.unsettled_gross_sales ?? 0;
  const commission = summary?.total_fee_komisi ?? summary?.unsettled_commission ?? 0;
  const netPayable = summary?.total_wajib_setor ?? summary?.unsettled_net_payable ?? 0;
  const itemsCount = summary?.items_count ?? summary?.total_items_count ?? 0;
  const hasPayable = netPayable > 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {/* Card 1: Omzet Konsinyasi */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between pb-2">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Omzet Belum Disetor
          </span>
          <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <IconReceipt2 size={16} />
          </div>
        </div>
        <div className="flex items-baseline justify-between gap-2 pt-0.5">
          <span className="text-xl font-bold text-slate-900 tracking-tight font-mono">
            {formatRupiah(grossSales)}
          </span>
          {itemsCount > 0 && (
            <span className="text-[11px] font-medium text-slate-400 font-mono">
              {itemsCount} item
            </span>
          )}
        </div>
      </div>

      {/* Card 2: Komisi Toko */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between pb-2">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Hak Komisi Cabang
          </span>
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <IconCash size={16} />
          </div>
        </div>
        <div className="flex items-baseline justify-between gap-2 pt-0.5">
          <span className="text-xl font-bold text-emerald-600 tracking-tight font-mono">
            +{formatRupiah(commission)}
          </span>
          <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">
            Kas Toko
          </span>
        </div>
      </div>

      {/* Card 3: Wajib Setor Pokok (Netto) & CTA */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between pb-2">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Wajib Setor ke Pusat
          </span>
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <IconBuildingBank size={16} />
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <span className="text-xl font-extrabold text-blue-600 tracking-tight font-mono">
            {formatRupiah(netPayable)}
          </span>
          {canCreate && (
            <AppButton
              onClick={onOpenCreateDialog}
              disabled={!hasPayable}
              variant="default"
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold h-7 px-2.5 rounded-lg shadow-2xs text-xs shrink-0 gap-1"
            >
              <IconPlus size={14} />
              <span>Setor</span>
              <IconArrowUpRight size={12} className="opacity-70" />
            </AppButton>
          )}
        </div>
      </div>
    </div>
  );
}
