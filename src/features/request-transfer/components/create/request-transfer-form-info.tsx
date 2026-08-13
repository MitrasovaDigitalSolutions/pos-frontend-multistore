"use client";

import { IconBuildingStore, IconNotes } from "@tabler/icons-react";
import { CommandSelect } from "@/components/ui/command-select";
import type { Supplier } from "@/features/master/suppliers/types";
import type { SupplierSale } from "@/features/supplier-sales/types";

interface RequestTransferFormInfoProps {
  supplierUid: string;
  supplierSalesUid: string | null;
  catatan: string;
  suppliers: Supplier[];
  supplierSales: SupplierSale[];
  isLoadingSuppliers: boolean;
  isLoadingSales: boolean;
  disabled: boolean;
  onSupplierChange: (uid: string) => void;
  onCatalogChange: (uid: string) => void;
  onCatatanChange: (value: string) => void;
}

export function RequestTransferFormInfo({
  supplierUid,
  supplierSalesUid,
  catatan,
  suppliers,
  supplierSales,
  isLoadingSuppliers,
  isLoadingSales,
  disabled,
  onSupplierChange,
  onCatalogChange,
  onCatatanChange,
}: RequestTransferFormInfoProps) {
  const filteredSales = (supplierSales || []).filter(
    (s) => !supplierUid || s.supplier_uid === supplierUid
  );

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-4">
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-slate-50 pb-2.5">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <div className="p-1 rounded-md bg-emerald-50 text-emerald-600">
            <IconBuildingStore size={15} />
          </div>
          <span>Supplier & Detail Request</span>
        </h3>
        <span className="text-[11px] text-slate-400 font-medium">Langkah 1 dari 2</span>
      </div>

      {/* Selectors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Supplier Selector */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Supplier <span className="text-rose-500">*</span>
          </label>
          <CommandSelect
            value={supplierUid}
            onChange={onSupplierChange}
            options={(suppliers || []).map((s) => ({ value: s.uid, label: s.nama }))}
            placeholder="Pilih supplier..."
            searchPlaceholder="Cari nama supplier..."
            isLoading={isLoadingSuppliers}
            disabled={disabled}
          />
        </div>

        {/* Catalog Selector */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Katalog Sales
            </label>
            <span className="text-[10px] text-slate-400 font-normal">(opsional)</span>
          </div>
          <CommandSelect
            value={supplierSalesUid ?? ""}
            onChange={onCatalogChange}
            options={filteredSales.map((s) => ({ value: s.uid, label: s.nama }))}
            placeholder="Pilih katalog (auto-isi barang)..."
            searchPlaceholder="Cari katalog sales..."
            isLoading={isLoadingSales}
            disabled={disabled || !supplierUid}
            emptyMessage={!supplierUid ? "Pilih supplier terlebih dahulu" : "Tidak ada katalog sales untuk supplier ini"}
          />
        </div>
      </div>

      {/* Catatan Field */}
      <div className="space-y-1 pt-1">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <IconNotes size={14} className="text-slate-400" />
            <span>Catatan Request</span>
            <span className="text-[10px] font-normal text-slate-400">(opsional)</span>
          </label>
          <span className="text-[10px] text-slate-400">{catatan.length}/300</span>
        </div>
        <textarea
          value={catatan}
          onChange={(e) => onCatatanChange(e.target.value)}
          disabled={disabled}
          placeholder="Misal: Mohon prioritaskan pengiriman barang bertanda bintang..."
          rows={2}
          maxLength={300}
          className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
}
