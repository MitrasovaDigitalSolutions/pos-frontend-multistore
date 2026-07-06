"use client";

import { FormDatePicker } from "@/components/forms/form-date-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useDashboardSummary, useJasaVsProduct } from "@/features/dashboard/api/dashboard-api";
import { RecentOrdersTable } from "@/features/dashboard/components/recent-orders-table";
import { RevenueChart } from "@/features/dashboard/components/revenue-chart";
import { SalesStatistics } from "@/features/dashboard/components/sales-statistics";
import { StatMiniCards } from "@/features/dashboard/components/stat-mini-cards";
import { TopSellingWeekly } from "@/features/dashboard/components/top-selling-weekly";
import { JasaVsProductChart } from "@/features/dashboard/components/jasa-vs-product-chart";
import { getDefaultDateRange, formatDate } from "@/lib/date-utils";
import { IconFilter } from "@tabler/icons-react";
import { useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";

interface DashboardFilterValues {
  from: string;
  to: string;
}

export function Dashboard() {
  const { from: defaultFrom, to: defaultTo } = getDefaultDateRange();

  const methods = useForm<DashboardFilterValues>({
    defaultValues: {
      from: defaultFrom,
      to: defaultTo,
    },
  });

  const { from: watchFrom, to: watchTo } = useWatch({
    control: methods.control,
  });

  const [paymentMethod] = useState<string>("");

  const { data: summary, isLoading: summaryLoading } = useDashboardSummary({
    from: watchFrom || undefined,
    to: watchTo || undefined,
    payment_method: paymentMethod || undefined,
  });

  const { data: jasaVsProduct, isLoading: jasaVsProductLoading } = useJasaVsProduct({
    from: watchFrom || undefined,
    to: watchTo || undefined,
  });

  const isLoading = summaryLoading;

  const formatDateRange = () => {
    if (!watchFrom && !watchTo) return "Semua Waktu";
    
    if (watchFrom && watchTo) {
      return `${formatDate(watchFrom, "dd MMM yyyy")} - ${formatDate(watchTo, "dd MMM yyyy")}`;
    }
    if (watchFrom) {
      return `Mulai ${formatDate(watchFrom, "dd MMM yyyy")}`;
    }
    if (watchTo) {
      return `Sampai ${formatDate(watchTo, "dd MMM yyyy")}`;
    }
    return "Semua Waktu";
  };

  return (
    <FormProvider {...methods}>
      <div className="space-y-2">
        {/* Compact Header with Title & Popover Filter Trigger */}
        <div className="flex items-center justify-between select-none py-1">
          <div>
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Ringkasan</h1>
            <p className="text-[10px] font-extrabold text-slate-400 mt-0.5 uppercase tracking-widest">
              Rentang: {formatDateRange()}
            </p>
          </div>
          <Popover>
            <PopoverTrigger
              render={
                <button
                  type="button"
                  className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer select-none shadow-sm"
                >
                  <IconFilter size={12} className="stroke-[2.5]" />
                  <span>Filter Tanggal</span>
                </button>
              }
            />
            <PopoverContent className="w-80 p-4 bg-white rounded-2xl border border-slate-100 shadow-xl" align="end">
              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-800">Filter Tanggal</h4>
                  <p className="text-[9px] text-slate-400">Pilih rentang tanggal summary dan statistik.</p>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Mulai:</span>
                    <FormDatePicker<DashboardFilterValues>
                      name="from"
                      placeholder="Tanggal Awal"
                      className="w-full"
                      clearable={true}
                      size="sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Sampai:</span>
                    <FormDatePicker<DashboardFilterValues>
                      name="to"
                      placeholder="Tanggal Akhir"
                      className="w-full"
                      clearable={true}
                      size="sm"
                    />
                  </div>
                </div>
                <div className="pt-2.5 border-t border-slate-50 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      methods.reset({
                        from: defaultFrom,
                        to: defaultTo,
                      });
                    }}
                    className="text-[10px] font-extrabold text-slate-500 hover:text-rose-600 hover:border-rose-100 hover:bg-rose-50/20 transition-all border border-slate-100 rounded-lg px-2.5 py-1.5 bg-white shadow-sm flex items-center gap-1 cursor-pointer select-none"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <section className="grid grid-cols-12 gap-4 mb-4">
          <div className="col-span-12 lg:col-span-3 h-full">
            <StatMiniCards summary={summary} isLoading={isLoading} />
          </div>
          <div className="col-span-12 md:col-span-8 lg:col-span-6 h-full">
            <RevenueChart summary={summary} from={watchFrom || undefined} to={watchTo || undefined} />
          </div>
          <div className="col-span-12 md:col-span-4 lg:col-span-3 h-full">
            <SalesStatistics summary={summary} isLoading={isLoading} />
          </div>
        </section>

        <section className="grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-6 h-full">
            <RecentOrdersTable
              from={watchFrom}
              to={watchTo}
              paymentMethod={paymentMethod}
            />
          </div>
          <div className="col-span-12 md:col-span-6 lg:col-span-3 h-full">
            <TopSellingWeekly summary={summary} isLoading={isLoading} />
          </div>
          <div className="col-span-12 md:col-span-6 lg:col-span-3 h-full">
            <JasaVsProductChart data={jasaVsProduct} isLoading={jasaVsProductLoading} />
          </div>
        </section>
      </div>
    </FormProvider>
  );
}




