import type { TransferType } from "../constants";

export type { TransferType };

export interface StockTransfer {
  uid: string;
  store_uid_source: string;
  store_uid_destination: string;
  nomor_transfer: string;
  tipe_transfer?: TransferType | string | null;
  status: "draft" | "sent" | "menunggu_validasi" | "finish" | "finished" | "rejected" | "cancelled";
  status_penerimaan?: "pending" | "partially_received" | "received" | "rejected" | null;
  status_pengiriman?: "pending" | "partially_received" | "received" | "rejected" | null;
  user_uid_source: string | null;
  user_uid_destination: string | null;
  catatan: string | null;
  tanggal_kirim: string | null;
  tanggal_terima: string | null;
  created_at: string;
  updated_at: string;
  source_store?: {
    uid: string;
    nama: string;
    alamat?: string | null;
    telepon?: string | null;
    is_central?: boolean;
    is_active?: boolean;
  };
  destination_store?: {
    uid: string;
    nama: string;
    alamat?: string | null;
    telepon?: string | null;
    is_central?: boolean;
    is_active?: boolean;
  };
  source_user?: {
    uid: string;
    name: string;
    username?: string;
    email?: string;
  } | null;
  destination_user?: {
    uid: string;
    name: string;
    username?: string;
    email?: string;
  } | null;
  items: StockTransferItem[];
}

export interface StockTransferItem {
  uid: string;
  stock_transfer_uid: string;
  product_uid: string;
  kuantitas: number;
  tipe_komisi?: "percentage" | "fixed" | null;
  nilai_komisi?: string | number | null;
  nominal_komisi?: string | number | null;
  harga_beli_cabang?: string | number | null;
  harga_jual_cabang?: string | number | null;
  harga_pasok?: number | null;
  harga_jual?: number | null;
  harga_pasok_pusat?: string | number | null;
  harga_jual_pusat?: string | number | null;
  komisi_per_unit?: number | null;
  kuantitas_diterima?: number | null;
  kuantitas_return?: number | null;
  validated_at?: string | null;
  jenis_validasi?: "retur" | "koreksi" | null;
  kuantitas_koreksi?: number | null;
  keterangan?: string | null;
  status?: "received" | "rejected" | null;
  jenis_selisih?: "salah_input" | "rusak" | "hilang" | null;
  stok_sebelum_source: number | null;
  stok_sesudah_source: number | null;
  stok_sebelum_dest: number | null;
  stok_sesudah_dest: number | null;
  harga_beli_avg: number;
  created_at?: string | null;
  updated_at?: string | null;
  product?: {
    uid: string;
    nama: string;
    barcode: string;
    satuan?: string;
    stok?: number;
    harga_jual?: number;
    harga_beli?: number;
    margin?: number;
    is_raw_material?: boolean;
    is_jasa?: boolean;
  };
}
