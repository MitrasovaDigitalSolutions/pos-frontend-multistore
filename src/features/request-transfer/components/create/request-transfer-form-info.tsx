"use client";

import { IconBuildingStore, IconNotes } from "@tabler/icons-react";
import { CommandSelect } from "@/components/ui/command-select";
import type { Supplier } from "@/features/master/suppliers/types";
import type { SupplierSale } from "@/features/supplier-sales/types";
import type { Store } from "@/features/stores/types";

interface RequestTransferFormInfoProps {
  requestTo: string;
  supplierUid: string;
  supplierSalesUid: string | null;
  catatan: string;
  stores: Store[];
  suppliers: Supplier[];
  supplierSales: SupplierSale[];
  isLoadingStores?: boolean;
  isLoadingSuppliers: boolean;
  isLoadingSales: boolean;
  disabled: boolean;
  onRequestToChange: (uid: string) => void;
  onSupplierChange: (uid: string) => void;
  onCatalogChange: (uid: string) => void;
  onCatatanChange: (value: string) => void;
}

export function RequestTransferFormInfo({
  requestTo,
  supplierUid,
  supplierSalesUid,
  catatan,
  stores,
  suppliers,
  supplierSales,
  isLoadingStores = false,
  isLoadingSuppliers,
  isLoadingSales,
  disabled,
  onRequestToChange,
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
          <span>Toko Sumber & Detail Request</span>
        </h3>
        <span className="text-[11px] text-slate-400 font-medium">Langkah 1 dari 2</span>
      </div>

      {/* Selectors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Target Store (request_to) Selector */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Toko Sumber (Tujuan) <span className="text-rose-500">*</span>
            </label>
          </div>

          <CommandSelect
            value={requestTo}
            onChange={onRequestToChange}
            options={(stores || []).map((s) => ({
              value: s.uid,
              label: s.is_central ? `${s.nama} (Pusat)` : s.nama,
            }))}
            placeholder="Pilih toko sumber..."
            searchPlaceholder="Cari toko..."
            isLoading={isLoadingStores}
            disabled={disabled}
          />
        </div>

        {/* Supplier Selector */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Supplier
            </label>
            <span className="text-[10px] text-slate-400 font-normal">(opsional)</span>
          </div>
          <CommandSelect
            value={supplierUid}
            onChange={onSupplierChange}
            options={(suppliers || []).map((s) => ({ value: s.uid, label: s.nama }))}
            placeholder="Pilih supplier (opsional)..."
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
            placeholder="Pilih katalog (auto-isi)..."
            searchPlaceholder="Cari katalog sales..."
            isLoading={isLoadingSales}
            disabled={disabled || !supplierUid}
            emptyMessage={!supplierUid ? "Pilih supplier terlebih dahulu" : "Tidak ada katalog sales"}
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



