"use client";

import { useMemo } from "react";
import { useSettingsQuery } from "@/features/settings/api/settings-api";

export type ConsignmentCommissionMode = "cut_revenue" | "markup_price";
export type CommissionType = "percentage" | "fixed";

export interface CalculatePricingParams {
  modalPusat: number; // HPP / Harga beli pusat
  hargaDasarPusat: number; // Harga jual master retail pusat
  tipeKomisi: CommissionType;
  nilaiKomisi: number;
  mode: ConsignmentCommissionMode;
  kuantitas: number;
}

export interface CalculatedPricingResult {
  nominalKomisiPerUnit: number;
  hargaJualCabang: number; // Harga banderol di kasir cabang
  hargaBeliCabang: number; // Harga beli cabang = Harga pasok pusat = Nilai wajib setor
  labaCabangPerUnit: number;
  labaPusatPerUnit: number;
  totalWajibSetor: number;
  totalOmzetRetail: number;
  totalLabaCabang: number;
  totalLabaPusat: number;
  marginCabangPercent: number;
  marginPusatPercent: number;
}

/**
 * Pure calculation function for consignment pricing
 */
export function calculateConsignmentPricing({
  modalPusat,
  hargaDasarPusat,
  tipeKomisi,
  nilaiKomisi,
  mode,
  kuantitas,
}: CalculatePricingParams): CalculatedPricingResult {
  const safeQty = Math.max(0.001, kuantitas || 1);
  const safeModal = Math.max(0, modalPusat || 0);
  const safeHargaDasar = Math.max(0, hargaDasarPusat || 0);
  const safeNilaiKomisi = Math.max(0, nilaiKomisi || 0);

  // Hitung nominal komisi per unit
  const nominalKomisiPerUnit =
    safeNilaiKomisi === 0
      ? 0
      : tipeKomisi === "percentage"
      ? (safeHargaDasar * safeNilaiKomisi) / 100
      : safeNilaiKomisi;

  let hargaJualCabang: number;
  let hargaBeliCabang: number;

  if (safeNilaiKomisi === 0) {
    // Tanpa komisi: harga retail cabang = harga pasok = harga dasar pusat
    hargaJualCabang = safeHargaDasar;
    hargaBeliCabang = safeHargaDasar;
  } else if (mode === "markup_price") {
    // Mode Naikkan Harga: Harga jual cabang naik, harga beli cabang tetap harga dasar
    hargaJualCabang = safeHargaDasar + nominalKomisiPerUnit;
    hargaBeliCabang = safeHargaDasar;
  } else {
    // Mode Cut Revenue (default): Harga jual cabang tetap, harga beli cabang dipotong komisi
    hargaJualCabang = safeHargaDasar;
    hargaBeliCabang = Math.max(0, safeHargaDasar - nominalKomisiPerUnit);
  }

  const labaCabangPerUnit = Math.max(0, hargaJualCabang - hargaBeliCabang);
  const labaPusatPerUnit = Math.max(0, hargaBeliCabang - safeModal);

  const totalWajibSetor = hargaBeliCabang * safeQty;
  const totalOmzetRetail = hargaJualCabang * safeQty;
  const totalLabaCabang = labaCabangPerUnit * safeQty;
  const totalLabaPusat = labaPusatPerUnit * safeQty;

  const marginCabangPercent =
    hargaJualCabang > 0 ? Math.round((labaCabangPerUnit / hargaJualCabang) * 100) : 0;
  const marginPusatPercent =
    safeModal > 0 ? Math.round((labaPusatPerUnit / safeModal) * 100) : 0;

  return {
    nominalKomisiPerUnit,
    hargaJualCabang,
    hargaBeliCabang,
    labaCabangPerUnit,
    labaPusatPerUnit,
    totalWajibSetor,
    totalOmzetRetail,
    totalLabaCabang,
    totalLabaPusat,
    marginCabangPercent,
    marginPusatPercent,
  };
}

/**
 * Hook to read consignment commission mode from backend settings
 */
export function useConsignmentCommissionMode() {
  const { data: settings = [], isLoading } = useSettingsQuery();

  const modeSetting = useMemo(() => {
    return settings.find((s) => s.key === "consignment_commission_mode");
  }, [settings]);

  const mode: ConsignmentCommissionMode =
    modeSetting?.value === "markup_price" ? "markup_price" : "cut_revenue";

  const label =
    modeSetting?.label || "Perlakuan Komisi Konsinyasi Cabang";

  const description =
    mode === "markup_price"
      ? "Mode Markup: Harga jual kasir cabang dinaikkan sebesar komisi cabang. Nilai wajib setor = Harga dasar pusat."
      : "Mode Cut Revenue: Harga banderol konsumen tetap sama dengan pusat. Nilai wajib setor = Harga dasar pusat dipotong komisi cabang.";

  return {
    mode,
    label,
    description,
    isLoading,
    calculatePricing: (params: Omit<CalculatePricingParams, "mode">) =>
      calculateConsignmentPricing({ ...params, mode }),
  };
}
