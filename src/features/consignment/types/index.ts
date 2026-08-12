import type { Product } from "@/features/master/products/types";
import type { Supplier } from "@/features/master/suppliers/types";

export type ConsignmentStatus = "draft" | "completed" | "closed" | "void";

export interface ConsignmentReceivingItem {
  uid: string;
  consignment_receiving_uid: string;
  product_uid: string;
  kuantitas: number;
  harga_beli: number;
  update_harga_jual?: boolean;
  harga_jual_baru?: number | null;
  margin_baru?: number | null;
  qty_terjual?: number;
  qty_diretur?: number;
  sisa?: number;
  product?: Product;
}

export interface ConsignmentPayment {
  uid: string;
  store_uid: string;
  user_uid: string;
  nomor_pembayaran: string;
  consignment_receiving_uid: string;
  jumlah_bayar: number;
  cash_account_uid: string;
  metode_pembayaran: "cash" | "transfer";
  tanggal_bayar: string;
  catatan?: string | null;
  status: "completed";
  created_at?: string;
  cashAccount?: {
    uid: string;
    nama: string;
    tipe: string;
  };
  receiving?: ConsignmentReceiving;
}

export interface ConsignmentReceiving {
  uid: string;
  store_uid: string;
  user_uid: string;
  nomor_konsinyasi: string;
  supplier_uid: string | null;
  supplier: string | null;
  tanggal_terima: string;
  catatan: string | null;
  status: ConsignmentStatus;
  created_at: string;
  updated_at: string;
  voided_at?: string | null;
  sisa_hutang?: number;
  sisa_titipan?: number;
  items?: ConsignmentReceivingItem[];
  user?: {
    uid: string;
    nama: string;
  };
  supplier_relationship?: Supplier | null;
  payments?: ConsignmentPayment[];
}

export interface ReturnableItem {
  uid: string;
  product_uid: string;
  nama?: string;
  kuantitas: number;
  qty_terjual: number;
  qty_diretur: number;
  sisa: number;
  harga_beli: number;
}

export interface PriceComparisonItem {
  product_uid: string;
  nama: string;
  harga_beli_lama: number;
  harga_beli_baru: number;
  harga_jual_lama: number;
  margin_lama: number;
  harga_jual_saran: number;
  selisih_harga_beli: number;
  perlu_alert: boolean;
  harga_beli_avg: number;
  harga_jual_saran_avg: number;
}

export interface ConsignmentReceivingParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  supplier_uid?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface CreateConsignmentItemPayload {
  product_uid: string;
  kuantitas: number;
  harga_beli: number;
  update_harga_jual?: boolean;
  harga_jual_baru?: number | null;
  margin_baru?: number | null;
}

export interface CreateConsignmentReceivingPayload {
  supplier_uid?: string | null;
  supplier?: string | null;
  tanggal_terima?: string;
  catatan?: string | null;
  items: CreateConsignmentItemPayload[];
}

export interface CreateConsignmentPaymentPayload {
  jumlah_bayar: number;
  cash_account_uid: string;
  tanggal_bayar?: string;
  catatan?: string | null;
}
