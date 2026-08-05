"use client";

import { UseFormReturn } from "react-hook-form";
import { FilterForm } from "@/components/forms/filter-form";
import { FormDatePicker } from "@/components/forms/form-date-picker";
import { FormSelect } from "@/components/forms/form-select";
import type { StockTransferListMode } from "../../api/stock-transfer-api";

export interface TransferFilterValues {
  created_from?: string;
  created_to?: string;
  source?: string;
  destination?: string;
  status?: string;
  status_penerimaan?: string;
}

interface TransferListFiltersProps {
  mode: StockTransferListMode;
  filterMethods: UseFormReturn<TransferFilterValues>;
  storeOptions: { value: string; label: string }[];
  statusOptions: { value: string; label: string }[];
  statusPenerimaanOptions: { value: string; label: string }[];
  onSubmit: (values: TransferFilterValues) => void;
  onReset: () => void;
}

export function TransferListFilters({
  mode,
  filterMethods,
  storeOptions,
  statusOptions,
  statusPenerimaanOptions,
  onSubmit,
  onReset,
}: TransferListFiltersProps) {
  return (
    <FilterForm<TransferFilterValues>
      methods={filterMethods}
      onSubmit={onSubmit}
      onReset={onReset}
      titleLabel="Filter Transfer Stok"
    >
      <FormDatePicker<TransferFilterValues>
        name="created_from"
        label="Dari Tanggal"
        placeholder="Pilih tanggal awal..."
        size="sm"
      />
      <FormDatePicker<TransferFilterValues>
        name="created_to"
        label="Sampai Tanggal"
        placeholder="Pilih tanggal akhir..."
        size="sm"
      />
      <FormSelect<TransferFilterValues>
        name="source"
        label="Asal (Source)"
        options={storeOptions}
        placeholder="Semua Cabang"
        size="sm"
      />
      <FormSelect<TransferFilterValues>
        name="destination"
        label="Tujuan (Destination)"
        options={storeOptions}
        placeholder="Semua Cabang"
        size="sm"
      />
      {mode !== "returns" && (
        <FormSelect<TransferFilterValues>
          name="status"
          label="Status Transfer"
          options={statusOptions}
          placeholder="Semua Status Transfer"
          size="sm"
        />
      )}
      <FormSelect<TransferFilterValues>
        name="status_penerimaan"
        label="Status Pengiriman"
        options={statusPenerimaanOptions}
        placeholder="Semua Status Pengiriman"
        size="sm"
      />
    </FilterForm>
  );
}
