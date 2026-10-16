"use client";

import { IconCheck, IconClock, IconX } from "@tabler/icons-react";
import { formatRupiah } from "@/hooks/use-format-rupiah";

interface RemittanceVerifyStatCardsProps {
  pendingCount: number;
  verifiedTotal: number;
  rejectedCount: number;
}

export function RemittanceVerifyStatCards({
  pendingCount,
  verifiedTotal,
  rejectedCount,
}: RemittanceVerifyStatCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
      {/* 1. Pending */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-2xs flex items-center justify-between">
        <div>
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
            Menunggu Verifikasi
          </span>
          <span className="text-lg font-bold text-amber-600 font-mono mt-0.5 block">
            {pendingCount} Setoran
          </span>
        </div>
        <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
          <IconClock size={16} />
        </div>
      </div>

      {/* 2. Verified Total */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-2xs flex items-center justify-between">
        <div>
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
            Total Diterima
          </span>
          <span className="text-lg font-bold text-emerald-600 font-mono mt-0.5 block">
            {formatRupiah(verifiedTotal)}
          </span>
        </div>
        <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <IconCheck size={16} />
        </div>
      </div>

      {/* 3. Rejected */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-2xs flex items-center justify-between">
        <div>
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
            Setoran Ditolak
          </span>
          <span className="text-lg font-bold text-rose-600 font-mono mt-0.5 block">
            {rejectedCount} Setoran
          </span>
        </div>
        <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
          <IconX size={16} />
        </div>
      </div>
    </div>
  );
}
