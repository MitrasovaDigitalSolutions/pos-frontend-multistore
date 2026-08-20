"use client";

import {
  IconCheck,
  IconClipboard,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";

interface OpnameStatsCardsProps {
  totalCount: number;
  matchCount: number;
  positiveCount: number;
  negativeCount: number;
}

export function OpnameStatsCards({
  totalCount,
  matchCount,
  positiveCount,
  negativeCount,
}: OpnameStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
      {/* Total Scanned */}
      <div className="bg-white border border-slate-100 rounded-xl p-2.5 shadow-2xs flex items-center justify-between">
        <div className="min-w-0">
          <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block truncate">
            Total Dihitung
          </span>
          <p className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
            {totalCount}{" "}
            <span className="text-[10px] font-medium text-slate-400">item</span>
          </p>
        </div>
        <div className="bg-slate-50 text-slate-600 p-1.5 rounded-lg shrink-0">
          <IconClipboard size={16} />
        </div>
      </div>

      {/* Sesuai Sistem */}
      <div className="bg-white border border-slate-100 rounded-xl p-2.5 shadow-2xs flex items-center justify-between">
        <div className="min-w-0">
          <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block truncate">
            Sesuai Sistem
          </span>
          <p className="text-sm sm:text-base font-bold text-emerald-600 mt-0.5">
            {matchCount}{" "}
            <span className="text-[10px] font-medium text-emerald-600/70">
              item
            </span>
          </p>
        </div>
        <div className="bg-emerald-50 text-emerald-600 p-1.5 rounded-lg shrink-0">
          <IconCheck size={16} />
        </div>
      </div>

      {/* Selisih Lebih (+) */}
      <div className="bg-white border border-slate-100 rounded-xl p-2.5 shadow-2xs flex items-center justify-between">
        <div className="min-w-0">
          <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block truncate">
            Selisih Lebih (+)
          </span>
          <p className="text-sm sm:text-base font-bold text-blue-600 mt-0.5">
            {positiveCount}{" "}
            <span className="text-[10px] font-medium text-blue-600/70">
              item
            </span>
          </p>
        </div>
        <div className="bg-blue-50 text-blue-600 p-1.5 rounded-lg shrink-0">
          <IconPlus size={16} />
        </div>
      </div>

      {/* Selisih Kurang (-) */}
      <div className="bg-white border border-slate-100 rounded-xl p-2.5 shadow-2xs flex items-center justify-between">
        <div className="min-w-0">
          <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block truncate">
            Selisih Kurang (-)
          </span>
          <p className="text-sm sm:text-base font-bold text-rose-600 mt-0.5">
            {negativeCount}{" "}
            <span className="text-[10px] font-medium text-rose-600/70">
              item
            </span>
          </p>
        </div>
        <div className="bg-rose-50 text-rose-600 p-1.5 rounded-lg shrink-0">
          <IconTrash size={16} />
        </div>
      </div>
    </div>
  );
}
