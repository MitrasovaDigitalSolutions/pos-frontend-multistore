import type { Sale as BaseSale, SaleItem as BaseSaleItem } from "@/features/dashboard/types";
import type { User } from "@/types/auth";
import type { Product } from "@/features/master/products/types";
import type { PaginationParams } from "@/types/api";
import type { Member } from "@/features/master/members/types";
import type { PrescriptionHistory } from "@/features/pharmacy/types";

export interface TransactionItem extends BaseSaleItem {
    product?: Product | null;
    harga_beli?: number;
    is_taxable?: boolean;
    store_uid?: string | null;
    consignment_receiving_item_uid?: string | null;
    is_konsinyasi_internal?: boolean;
    harga_pasok?: string | number;
    fee_komisi_toko?: string | number;
    remittance_status?: "none" | "pending" | "verified" | "rejected" | string | null;
    store_remittance_uid?: string | null;
    harga_beli_cabang?: number;
    harga_jual_cabang?: number;
    laba_cabang?: number;
    created_at?: string;
    updated_at?: string;
}

export interface CompoundedTransactionIngredient {
    uid: string;
    prescription_history_uid?: string;
    product_uid: string;
    nama_produk: string;
    kuantitas: number;
    harga_satuan: number;
    subtotal: number;
    satuan?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface CompoundedTransactionItem {
    uid: string;
    sale_uid: string;
    prescription_uid?: string | null;
    nama_racikan: string;
    jenis_racikan: string;
    jumlah_kemasan: number;
    aturan_pakai: string;
    tuslah_fee: number;
    embalase_fee: number;
    total_harga: number;
    ingredients: CompoundedTransactionIngredient[];
    created_at?: string;
    updated_at?: string;
}

export interface TransactionUser extends Partial<User> {
    uid?: string;
    name?: string;
    nama?: string;
    username?: string;
    email?: string | null;
    email_verified_at?: string | null;
    status?: "active" | "inactive";
    store_uid?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface Transaction extends BaseSale {
    user?: TransactionUser | null;
    void_by?: TransactionUser | null;
    voidBy?: TransactionUser | null;
    items: TransactionItem[];
    compounded_items?: CompoundedTransactionItem[];
    prescriptions?: CompoundedTransactionItem[];
    prescription_histories?: CompoundedTransactionItem[];
    prescriptionHistories?: PrescriptionHistory[] | CompoundedTransactionItem[] | null;
    member?: Member | null;
    member_uid?: string | null;
    cash_received?: number | null;
    cash_amount?: number | null;
    card_amount?: number | null;
    debt_amount?: number | null;
    diskon_grosir?: number;
    referensi_edc?: string | null;
    cash_drawer_session_uid?: string | null;
    is_offline?: boolean;
    offline_id?: string | null;
    synced_at?: string | null;
    tanggal_transaksi?: string;
    catatan_void?: string | null;
    voided_at?: string | null;
    void_by_uid?: string | null;
    store_remittance_uid?: string | null;
    is_remitted?: boolean;
    remittance_status?: "none" | "pending" | "verified" | "rejected" | string | null;
}

export interface TransactionQueryParams extends PaginationParams {
    status?: string;
    payment_method?: string;
    from?: string;
    to?: string;
    search?: string;
}
