import type { RemittanceStatus } from "../constants";

export type { RemittanceStatus };

export interface UnsettledSummary {
  total_omzet?: number;
  total_fee_komisi?: number;
  total_wajib_setor?: number;
  items_count?: number;
  // Legacy alias support
  unsettled_gross_sales?: number;
  unsettled_commission?: number;
  unsettled_net_payable?: number;
  total_items_count?: number;
  items?: UnsettledTransactionItem[];
}

export interface UnsettledTransactionItem {
  uid: string;
  sale_uid?: string;
  product_uid?: string;
  store_uid?: string;
  store_remittance_uid?: string | null;
  nama_produk?: string;
  barcode?: string;
  harga_satuan?: string | number;
  kuantitas: number;
  subtotal?: string | number;
  diskon_item?: string | number;
  harga_beli?: string | number;
  harga_pasok?: string | number;
  fee_komisi_toko?: string | number;
  harga_beli_cabang?: number;
  harga_jual_cabang?: number;
  laba_cabang?: number;
  remittance_status?: "unsettled" | "pending_remittance" | "remitted" | string;
  created_at?: string;
  updated_at?: string;
  sale?: {
    uid: string;
    nomor_transaksi?: string;
    created_at?: string;
    tanggal_transaksi?: string;
    cash_received?: number;
  } | null;
  product?: {
    uid: string;
    nama?: string;
    barcode?: string;
    sku?: string;
    image_url?: string | null;
    satuan?: string;
  } | null;
  // Fallback properties for view rendering
  no_struk?: string;
  tanggal?: string;
  kasir_nama?: string;
  product_nama?: string;
  product_barcode?: string | null;
  harga_jual?: number;
  komisi_toko?: number;
  wajib_setor?: number;
}

export interface StoreRemittanceItem {
  uid?: string;
  id?: number;
  store_remittance_uid: string;
  sale_item_uid: string;
  nominal_pasok: string | number;
  nominal_komisi: string | number;
  sale_item?: UnsettledTransactionItem | null;
  saleItem?: UnsettledTransactionItem | null;
  created_at?: string;
  updated_at?: string;
}

export interface StoreRemittanceStoreRef {
  uid: string;
  nama: string;
  is_central?: boolean;
}

export interface StoreRemittanceUserRef {
  uid: string;
  name: string;
  username?: string;
}

export interface StoreRemittanceCashAccountRef {
  uid: string;
  nama: string;
  nomor_rekening?: string | null;
}

export interface StoreRemittance {
  uid: string;
  nomor_remittance?: string;
  nomor_setoran?: string;
  store_uid?: string;
  store_uid_source?: string;
  store_source_nama?: string;
  store_uid_dest?: string;
  store_uid_destination?: string;
  store_destination_nama?: string;
  user_uid?: string;
  verified_by?: string | null;
  total_omzet?: string | number;
  total_omzet_kotor?: number;
  total_fee_komisi?: string | number;
  total_fee_cabang?: number;
  total_wajib_setor?: string | number;
  nominal_disetor: number;
  cash_account_source_uid: string;
  cash_account_source_nama?: string;
  cash_account_dest_uid?: string | null;
  cash_account_dest_nama?: string | null;
  bukti_transfer?: string | null;
  bukti_transfer_url?: string | null;
  status: RemittanceStatus;
  catatan?: string | null;
  alasan_penolakan?: string | null;
  user_submit_nama?: string | null;
  user_verify_nama?: string | null;
  verified_at?: string | null;
  cutoff_at?: string | null;
  items_count?: number;
  created_at: string;
  updated_at: string;
  // Eager-loaded relations from Backend
  store?: StoreRemittanceStoreRef | null;
  destination_store?: StoreRemittanceStoreRef | null;
  destinationStore?: StoreRemittanceStoreRef | null;
  user?: StoreRemittanceUserRef | null;
  verified_by_user?: StoreRemittanceUserRef | null;
  verifiedByUser?: StoreRemittanceUserRef | null;
  source_cash_account?: StoreRemittanceCashAccountRef | null;
  sourceCashAccount?: StoreRemittanceCashAccountRef | null;
  destination_cash_account?: StoreRemittanceCashAccountRef | null;
  destinationCashAccount?: StoreRemittanceCashAccountRef | null;
  items?: StoreRemittanceItem[];
}

export interface CreateRemittancePayload {
  sale_item_uids: string[];
  cash_account_source_uid?: string;
  cash_account_dest_uid?: string;
  nominal_disetor: number;
  bukti_transfer?: File | null;
  catatan?: string;
}

export interface RejectRemittancePayload {
  alasan: string;
}

export interface RemittanceFilters {
  status?: RemittanceStatus | string;
  store_uid?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  per_page?: number;
}

export interface ConsignmentStockPosition {
  id?: number;
  product_uid: string;
  store_uid: string;
  stok?: string | number | null;
  harga_beli?: number;
  harga_jual?: number;
  harga_beli_avg?: number;
  margin?: string | number | null;
  status?: string;
  is_konsinyasi_internal?: boolean;
  harga_beli_cabang?: number;
  harga_jual_cabang?: number;
  laba_cabang?: number;
  product?: {
    uid: string;
    nama: string;
    barcode: string;
    satuan?: string;
    merek?: string | null;
    status?: string;
    category_uid?: string;
    image_url?: string | null;
    harga?: number;
    sku?: string;
    category?: {
      uid: string;
      nama: string;
    };
  };
  store?: {
    uid: string;
    nama: string;
    is_central?: boolean;
  };
  created_at?: string;
  updated_at?: string;
  // Fallback / legacy computed fields
  sku?: string;
  nama_produk?: string;
  unit?: string;
  total_diterima?: number;
  total_terjual?: number;
  total_diretur?: number;
  sisa_stok?: number;
  harga_pasok?: number;
  komisi_per_unit?: number;
  total_nilai_pasok?: number;
  total_potensi_omzet?: number;
  store_nama?: string;
}
