export type RequestTransferStatus = "pending" | "ordered" | "transferred" | "rejected";

export interface RequestTransferItem {
    uid: string;
    request_transfer_uid: string;
    product_uid: string;
    store_uid?: string | null;
    kuantitas: number;
    qty_dipesan: number;
    qty_dikirim: number;
    product?: {
        uid: string;
        nama: string;
        barcode?: string | null;
        satuan?: string;
    };
    store?: {
        uid: string;
        nama: string;
    };
}

export interface RequestTransfer {
    uid: string;
    nomor_request: string;
    supplier_uid?: string | null;
    supplier_sales_uid?: string | null;
    request_by?: string;
    request_to?: string;
    user_uid?: string | null;
    status: RequestTransferStatus;
    catatan?: string | null;
    tanggal_request?: string | null;
    supplier?: { uid: string; nama: string } | null;
    supplierSale?: { uid: string; nama: string } | null;
    requestedBy?: { uid: string; nama: string } | null;
    requestedTo?: { uid: string; nama: string } | null;
    user?: { uid: string; name: string } | null;
    items?: RequestTransferItem[];
}

export interface RequestTransferSummary {
    summary_uid: string;
    request_to: string;
    request_to_nama?: string | null;
    supplier_uid: string | null;
    supplier_nama: string | null;
    supplier_sales_uid: string | null;
    supplier_sales_nama: string | null;
    request_count: number;
    total_item_lines: number;
    tanggal_request_terakhir: string | null;
}

export interface RequestTransferGroupedItem {
    product_uid: string;
    nama?: string | null;
    barcode?: string | null;
    harga_beli?: number | null;
    harga_jual?: number | null;
    kuantitas: number;
    qty_dipesan: number;
    qty_dikirim: number;
    stok_source: number;
    cukup: boolean;
}

export interface RequestTransferDetailRequest {
    uid: string;
    nomor_request: string;
    status: RequestTransferStatus;
    catatan?: string | null;
    tanggal_request?: string | null;
    user?: string | null;
    store_uid?: string | null;
    store_nama?: string | null;
    items: {
        product_uid: string;
        nama?: string | null;
        kuantitas: number;
        qty_dipesan: number;
        qty_dikirim: number;
    }[];
}

export interface RequestTransferDetail {
    request_to: string;
    request_to_nama: string;
    supplier_uid: string | null;
    supplier_nama: string | null;
    supplier_sales_uid: string | null;
    supplier_sales_nama: string | null;
    requests: RequestTransferDetailRequest[];
    items: RequestTransferGroupedItem[];
}

export interface RequestTransferStorePayload {
    supplier_uid?: string | null;
    supplier_sales_uid?: string | null;
    request_to?: string | null;
    catatan?: string | null;
    tanggal_request?: string | null;
    items: { product_uid: string; kuantitas: number }[];
}

