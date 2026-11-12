import { getImageUrl } from "@/lib/utils";
import type { StoreRemittance, StoreRemittanceItem, UnsettledTransactionItem } from "../types";

export interface UnsettledItemMetrics {
  hargaJual: number;
  hargaPasok: number;
  kuantitas: number;
  omzet: number;
  wajibSetor: number;
  komisi: number;
}

export interface SelectedItemsSummary {
  totalOmzet: number;
  totalFeeKomisi: number;
  totalWajibSetor: number;
  itemsCount: number;
  totalKuantitas: number;
}

export type SelectedRemittanceItemsSummary = SelectedItemsSummary;

/**
 * Menghitung metrik finansial per item penjualan konsinyasi
 * sesuai rumus StoreRemittanceService di Backend:
 * - pasok (wajib setor) = harga_pasok * kuantitas
 * - omzet = subtotal (atau harga_satuan * kuantitas)
 * - komisi = max(0, subtotal - pasok)
 */
export function getUnsettledItemMetrics(item: UnsettledTransactionItem): UnsettledItemMetrics {
  const kuantitas = Number(item.kuantitas || 0);
  const hargaJual = Number(item.harga_satuan || item.harga_jual_cabang || item.harga_jual || 0);
  const hargaPasok = Number(item.harga_pasok || item.harga_beli_cabang || item.harga_beli || 0);

  const omzet =
    item.subtotal !== undefined && item.subtotal !== null
      ? Number(item.subtotal)
      : hargaJual * kuantitas;

  const wajibSetor =
    item.wajib_setor !== undefined && item.wajib_setor !== null
      ? Number(item.wajib_setor)
      : hargaPasok * kuantitas;

  const explicitKomisi = item.fee_komisi_toko ?? item.laba_cabang ?? item.komisi_toko;
  const komisi =
    explicitKomisi !== undefined && explicitKomisi !== null
      ? Number(explicitKomisi)
      : Math.max(0, omzet - wajibSetor);

  return {
    hargaJual,
    hargaPasok,
    kuantitas,
    omzet,
    wajibSetor,
    komisi,
  };
}

/**
 * Menghitung ringkasan finansial dari kumpulan item konsinyasi yang dipilih
 */
export function calculateSelectedItemsSummary(
  items: UnsettledTransactionItem[]
): SelectedItemsSummary {
  let totalOmzet = 0;
  let totalWajibSetor = 0;
  let totalKuantitas = 0;

  for (const item of items) {
    const metrics = getUnsettledItemMetrics(item);
    totalOmzet += metrics.omzet;
    totalWajibSetor += metrics.wajibSetor;
    totalKuantitas += metrics.kuantitas;
  }

  const totalFeeKomisi = Math.max(0, totalOmzet - totalWajibSetor);

  return {
    totalOmzet,
    totalFeeKomisi,
    totalWajibSetor,
    itemsCount: items.length,
    totalKuantitas,
  };
}

export function getRemittanceNomor(rem?: StoreRemittance | null): string {
  if (!rem) return "—";
  return rem.nomor_remittance || rem.nomor_setoran || "—";
}

export function getRemittanceProofUrl(rem?: StoreRemittance | null): string | null {
  if (!rem) return null;
  const raw = rem.bukti_transfer_url || rem.bukti_transfer;
  if (!raw) return null;
  return getImageUrl(raw) || null;
}

export function getRemittanceSourceStoreName(rem?: StoreRemittance | null): string {
  if (!rem) return "Cabang";
  return rem.store?.nama || rem.store_source_nama || "Cabang";
}

export function getRemittanceDestStoreName(rem?: StoreRemittance | null): string {
  if (!rem) return "Toko Pusat";
  return (
    rem.destination_store?.nama ||
    rem.destinationStore?.nama ||
    rem.store_destination_nama ||
    "Toko Pusat"
  );
}

export function getRemittanceSourceAccountName(rem?: StoreRemittance | null): string {
  if (!rem) return "Kas Toko";
  return (
    rem.source_cash_account?.nama ||
    rem.sourceCashAccount?.nama ||
    rem.cash_account_source_nama ||
    "Kas Toko"
  );
}

export function getRemittanceDestAccountName(rem?: StoreRemittance | null): string {
  if (!rem) return "Kas Pusat";
  return (
    rem.destination_cash_account?.nama ||
    rem.destinationCashAccount?.nama ||
    rem.cash_account_dest_nama ||
    "Kas Pusat"
  );
}

export function getRemittanceSubmitUserName(rem?: StoreRemittance | null): string {
  if (!rem) return "—";
  return rem.user?.name || rem.user_submit_nama || "—";
}

export function getRemittanceVerifyUserName(rem?: StoreRemittance | null): string {
  if (!rem) return "—";
  return rem.verified_by_user?.name || rem.verifiedByUser?.name || rem.user_verify_nama || "—";
}

export function getRemittanceItemSaleItem(
  remItem: StoreRemittanceItem
): UnsettledTransactionItem | null {
  return remItem.sale_item ?? remItem.saleItem ?? null;
}

