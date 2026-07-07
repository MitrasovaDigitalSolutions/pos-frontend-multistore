"use client";

import { IconCalendarEvent } from "@tabler/icons-react";
import { formatToReadableDate } from "@/lib/date-utils";

export function DashboardPageHeader() {
  const formattedDate = formatToReadableDate(new Date()).toUpperCase();

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-800 leading-tight">
          Overview
        </h1>
        <div className="flex items-center gap-1.5 mt-1">
          <IconCalendarEvent size={11} className="text-slate-400" />
          <span className="text-[10px] font-bold text-slate-400 tracking-wide">
            HARI INI: {formattedDate}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
      </div>
    </div>
  );
}
