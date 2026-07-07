"use client";

import { useScanReturnProduct } from "@/features/purchase/api/purchase-api";
import type { PurchaseItemLocal } from "@/features/purchase/types";
import type { Product } from "@/features/products/types";
import { toast } from "sonner";

interface UseReturnScannerProps {
    receivingId: string | null;
    items: PurchaseItemLocal[];
    addItem: (product: {
        product_uid: string;
        barcode: string | null;
        nama: string;
        harga_estimasi: number;
        kuantitas?: number;
        alasan?: string | null;
    }) => void;
    updateItem: (temp_uid: string, data: Partial<Pick<PurchaseItemLocal, "kuantitas" | "harga_estimasi" | "alasan">>) => void;
}

export function useReturnScanner({
    receivingId,
    items,
    addItem,
    updateItem,
}: UseReturnScannerProps) {
    const scanMutation = useScanReturnProduct();

    const handleProductFound = async (product: Product) => {
        if (!receivingId) {
            toast.error("Referensi Penerimaan belum ditentukan.");
            return;
        }

        try {
            const res = await scanMutation.mutateAsync({
                receiving_uid: receivingId,
                barcode: product.barcode || "",
            });

            if (!res || !res.data || !res.data.product) {
                toast.error(`Produk "${product.nama}" tidak terdaftar atau tidak valid dalam Penerimaan terkait.`);
                return;
            }

            const scanResult = res.data;
            const maxLimit = scanResult.kuantitas_sisa;

            // Find item in Zustand store
            const existingItem = items.find((i) => i.product_uid === product.uid);
            const currentQty = existingItem ? existingItem.kuantitas : 0;

            if (currentQty >= maxLimit) {
                toast.error(`Kuantitas retur untuk "${product.nama}" mencapai batas sisa faktur penerimaan (${maxLimit} pcs).`);
                return;
            }

            if (existingItem) {
                updateItem(existingItem.temp_uid, { kuantitas: currentQty + 1 });
                toast.success(`Menambahkan 1 pcs "${product.nama}".`);
            } else {
                addItem({
                    product_uid: product.uid,
                    barcode: product.barcode,
                    nama: product.nama,
                    harga_estimasi: product.harga_beli || scanResult.product.harga_beli || 0,
                    alasan: "damaged",
                });
                toast.success(`"${product.nama}" berhasil ditambahkan ke keranjang retur.`);
            }
        } catch (err: unknown) {
            const errorObj = err as { message?: string };
            toast.error(errorObj.message || `Gagal memverifikasi produk "${product.nama}" pada Penerimaan.`);
        }
    };

    return {
        handleProductFound,
        isPending: scanMutation.isPending,
    };
}
