"use client";

import { FormDatePicker } from "@/components/forms/form-date-picker";
import { FilterForm } from "@/components/forms/filter-form";
import { FormMultiSelect } from "@/components/forms/form-multi-select";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSalesByCategory } from "@/features/reports/api/reports-api";
import { useCategories } from "@/features/categories/api/categories-api";
import { getDefaultDateRange, formatDate } from "@/lib/date-utils";
import { IconChartBar, IconRefresh, IconX } from "@tabler/icons-react";
import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { SalesByCategoryChart } from "./sales-by-category-chart";
import { SalesByCategoryTable } from "./sales-by-category-table";

interface FilterValues {
  fromDate: string;
  toDate: string;
  categoryIds: string[];
}

export function SalesByCategoryView() {
  const { from: defaultFrom, to: defaultTo } = getDefaultDateRange();

  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({
    fromDate: defaultFrom,
    toDate: defaultTo,
    categoryIds: [],
  });

  const methods = useForm<FilterValues>({
    defaultValues: appliedFilters,
  });

  const { data: categoriesRes, isLoading: isLoadingCategories } = useCategories({ per_page: 1000 });
  const categories = useMemo(() => categoriesRes?.data ?? [], [categoriesRes]);
  const categoryOptions = useMemo(() => categories.map((c) => ({
    value: c.uid,
    label: c.nama,
  })), [categories]);

  const { data, isLoading, isFetching, refetch } = useSalesByCategory(
    appliedFilters.fromDate,
    appliedFilters.toDate,
    appliedFilters.categoryIds
  );

  const categoryData = useMemo(() => {
    const rawData = data?.data ?? [];

    // Fallback if category list hasn't loaded yet
    if (categories.length === 0) {
      return rawData;
    }

    // Determine target category list (either selected ones or all database categories)
    const targetCategories = appliedFilters.categoryIds.length > 0
      ? categories.filter((c) => appliedFilters.categoryIds.includes(c.uid))
      : categories;

    // Create a map of raw data by category UID
    const rawDataMap = new Map<string, typeof rawData[number]>();
    rawData.forEach((item) => {
      if (item.category_uid) {
        rawDataMap.set(item.category_uid, item);
      }
    });

    const result: typeof rawData = [];

    // Add all target categories
    targetCategories.forEach((cat) => {
      const existing = rawDataMap.get(cat.uid);
      if (existing) {
        result.push(existing);
      } else {
        result.push({
          category_uid: cat.uid,
          category: cat.nama,
          total_sales: 0,
          total_profit: 0,
          total_quantity: 0,
          percentage_sales: 0,
        });
      }
    });

    // Include uncategorized ("Tanpa Kategori") if we are not filtering by specific categories
    if (appliedFilters.categoryIds.length === 0) {
      const uncategorized = rawData.find((item) => item.category_uid === null);
      if (uncategorized) {
        result.push(uncategorized);
      }
    }

    // Recalculate percentage of contribution based on total sales in this set
    const totalSalesSum = result.reduce((sum, item) => sum + item.total_sales, 0);
    return result
      .map((item) => ({
        ...item,
        percentage_sales: totalSalesSum > 0 ? (item.total_sales / totalSalesSum) * 100 : 0,
      }))
      .sort((a, b) => b.total_sales - a.total_sales);
  }, [data, categories, appliedFilters.categoryIds]);

  const handleSubmit = (values: FilterValues) => {
    setAppliedFilters(values);
  };

  const handleReset = () => {
    const defaults: FilterValues = {
      fromDate: defaultFrom,
      toDate: defaultTo,
      categoryIds: [],
    };
    methods.reset(defaults);
    setAppliedFilters(defaults);
  };

  const handleRemoveCategory = (id: string) => {
    const nextIds = appliedFilters.categoryIds.filter((cid) => cid !== id);
    setAppliedFilters((prev) => ({
      ...prev,
      categoryIds: nextIds,
    }));
    methods.setValue("categoryIds", nextIds);
  };

  return (
    <div className="space-y-5">
      {/* Header Card */}
      <Card className="bg-white border-slate-100 rounded-2xl shadow-sm p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <IconChartBar size={17} />
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-slate-900">
                Laporan Penjualan Per Kategori
              </h1>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Analisis kontribusi penjualan berdasarkan kategori produk.
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isLoading || isFetching}
            className="h-9 border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center gap-1.5 shrink-0"
            title="Muat Ulang"
          >
            <IconRefresh size={16} className={isFetching ? "animate-spin" : ""} />
          </Button>
        </div>

        <FilterForm
          methods={methods}
          onSubmit={handleSubmit}
          onReset={handleReset}
          cols={3}
          titleLabel="Filter Laporan"
        >
          <FormDatePicker<FilterValues>
            name="fromDate"
            label="Dari Tanggal"
            placeholder="Mulai..."
            clearable={false}
          />
          <FormDatePicker<FilterValues>
            name="toDate"
            label="Sampai Tanggal"
            placeholder="Selesai..."
            clearable={false}
          />
          <FormMultiSelect<FilterValues>
            name="categoryIds"
            label="Kategori Produk"
            placeholder="Semua Kategori"
            searchPlaceholder="Cari kategori..."
            options={categoryOptions}
            isLoading={isLoadingCategories}
          />
        </FilterForm>

        {/* Period and Category summary chips */}
        {data && (
          <div className="mt-3 space-y-2.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
                Periode:
              </span>
              <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2.5 py-1 rounded-lg">
                {formatDate(data.from, "dd MMM yyyy")}
                {" — "}
                {formatDate(data.to, "dd MMM yyyy")}
              </span>
              <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2.5 py-1 rounded-lg">
                {categoryData.length} Kategori
              </span>
            </div>

            {appliedFilters.categoryIds.length > 0 && (
              <div className="flex flex-wrap gap-1.5 items-center pt-2.5 border-t border-slate-100/60">
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 mr-1">
                  Filter Kategori:
                </span>
                {appliedFilters.categoryIds.map((id) => {
                  const cat = categories.find((c) => c.uid === id);
                  if (!cat) return null;
                  return (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-[10px] font-bold pl-2.5 pr-1.5 py-0.5 rounded-lg transition-colors border border-slate-200/50"
                    >
                      {cat.nama}
                      <button
                        type="button"
                        onClick={() => handleRemoveCategory(id)}
                        className="w-4 h-4 rounded-md hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                        title="Hapus filter kategori ini"
                      >
                        <IconX size={10} strokeWidth={3} />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Chart */}
      <SalesByCategoryChart data={categoryData} isLoading={isLoading} />

      {/* Table */}
      <SalesByCategoryTable data={categoryData} isLoading={isLoading} />
    </div>
  );
}
