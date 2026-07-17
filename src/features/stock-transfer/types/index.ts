export interface StockTransfer {
  uid: string;
  store_uid_source: string;
  store_uid_destination: string;
  nomor_transfer: string;
  status: "draft" | "in_transit" | "received" | "cancelled";
  user_uid_source: string | null;
  user_uid_destination: string | null;
  catatan: string | null;
  tanggal_kirim: string | null;
  tanggal_terima: string | null;
  created_at: string;
  updated_at: string;
  source_store?: { uid: string; nama: string; is_central?: boolean };
  destination_store?: { uid: string; nama: string; is_central?: boolean };
  source_user?: { uid: string; name: string } | null;
  destination_user?: { uid: string; name: string } | null;
  items: StockTransferItem[];
}

export interface StockTransferItem {
  uid: string;
  stock_transfer_uid: string;
  product_uid: string;
  kuantitas: number;
  kuantitas_diterima?: number | null;
  keterangan?: string | null;
  stok_sebelum_source: number | null;
  stok_sesudah_source: number | null;
  stok_sebelum_dest: number | null;
  stok_sesudah_dest: number | null;
  harga_beli_avg: number;
  product?: { uid: string; nama: string; barcode: string; satuan?: string };
}
