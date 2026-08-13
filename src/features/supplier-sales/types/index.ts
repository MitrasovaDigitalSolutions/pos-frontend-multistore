export interface SupplierSaleItem {
    uid: string;
    supplier_sales_uid: string;
    product_uid: string;
    harga_estimasi: number;
    created_at?: string;
    updated_at?: string;
    product?: {
        uid: string;
        nama: string;
        barcode?: string | null;
        satuan?: string;
        harga_beli?: number;
    };
}

export interface SupplierSale {
    uid: string;
    supplier_uid: string;
    nama: string;
    keterangan?: string | null;
    status: "active" | "inactive";
    created_at?: string;
    updated_at?: string;
    supplier?: {
        uid: string;
        nama: string;
    };
    items?: SupplierSaleItem[];
}
