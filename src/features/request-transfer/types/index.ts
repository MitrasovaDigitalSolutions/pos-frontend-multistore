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
    supplier_uid: string;
    supplier_sales_uid?: string | null;
    user_uid?: string | null;
    status: RequestTransferStatus;
    catatan?: string | null;
    tanggal_request?: string | null;
    supplier?: { uid: string; nama: string };
    supplierSale?: { uid: string; nama: string } | null;
    user?: { uid: string; name: string } | null;
    items?: RequestTransferItem[];
}

export interface RequestTransferSummary {
    supplier_uid: string;
    supplier_nama: string;
    supplier_sales_uid: string | null;
    supplier_sales_nama: string | null;
    request_count: number;
    total_item_lines: number;
    tanggal_request_terakhir: string | null;
}

export interface RequestTransferGroupedItem {
    product_uid: string;
    nama?: string | null;
    kuantitas: number;
    qty_dipesan: number;
    qty_dikirim: number;
    stok_pusat: number;
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
    supplier_uid: string;
    supplier_nama: string;
    supplier_sales_uid: string | null;
    supplier_sales_nama: string | null;
    requests: RequestTransferDetailRequest[];
    items: RequestTransferGroupedItem[];
}

export interface RequestTransferStorePayload {
    supplier_uid: string;
    supplier_sales_uid?: string | null;
    catatan?: string | null;
    tanggal_request?: string | null;
    items: { product_uid: string; kuantitas: number }[];
}
