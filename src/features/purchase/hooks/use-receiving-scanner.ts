"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { productSchema, type ProductInput } from "@/features/products/schemas/product-schema";
import type { Product } from "@/features/products/types";
import { useScanReceivingProduct } from "@/features/purchase/api/purchase-api";
import type { PurchaseItemLocal, PurchaseOrderItem, ReceivingItem, Receiving, PurchaseOrder } from "@/features/purchase/types";

interface UseReceivingScannerProps {
    currentId: string;
    currentReceiving?: Receiving;
    poId: string | null;
    poData?: PurchaseOrder;
    items: PurchaseItemLocal[];
    addItem: (product: {
        product_uid: string;
        barcode: string | null;
        nama: string;
        harga_estimasi: number;
        kuantitas?: number;
        alasan?: string | null;
    }) => void;
}

export function useReceivingScanner({
    currentId,
    currentReceiving,
    poId,
    poData,
    items,
    addItem,
}: UseReceivingScannerProps) {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [notFoundQuery, setNotFoundQuery] = useState("");

    const productForm = useForm<ProductInput>({
        resolver: zodResolver(productSchema) as unknown as Resolver<ProductInput>,
        defaultValues: {
            nama: "",
            merek: "Umum",
            barcode: "",
            harga: 0,
            stok: 0,
            harga_beli: 0,
            margin: 0,
            category_uid: null,
            brand_uid: null,
            image: null,
            is_jasa: false,
        },
    });

    const scanMutation = useScanReceivingProduct();

    const handleProductFound = async (product: Product) => {
        if (!poId) {
            addItem({
                product_uid: product.uid,
                barcode: product.barcode,
                nama: product.nama,
                harga_estimasi: product.harga_beli || 0,
            });
            toast.success(`Ditambahkan: ${product.nama}`);
            return;
        }

        try {
            const res = await scanMutation.mutateAsync({
                receiving_uid: currentId,
                barcode: product.barcode || "",
            });

            if (!res || !res.data || !res.data.product) {
                addItem({
                    product_uid: product.uid,
                    barcode: product.barcode,
                    nama: product.nama,
                    harga_estimasi: product.harga_beli || 0,
                });
                toast.success(`Ditambahkan: ${product.nama} (Luar PO)`);
                return;
            }

            const scanResult = res.data;
            const poItem = scanResult.po_item;

            if (poItem) {
                const existingItem = items.find((i) => i.product_uid === product.uid);
                const currentQty = existingItem ? existingItem.kuantitas : 0;

                if (currentQty + 1 > poItem.sisa) {
                    toast.warning(`Peringatan: Kuantitas melebihi sisa PO (${poItem.sisa} pcs).`);
                }
            }

            addItem({
                product_uid: product.uid,
                barcode: product.barcode,
                nama: product.nama,
                harga_estimasi: product.harga_beli || scanResult.product.harga_beli || scanResult.product.harga_beli_terakhir || poItem?.harga_estimasi || 0,
            });
            toast.success(`Ditambahkan: ${product.nama}`);
        } catch {
            addItem({
                product_uid: product.uid,
                barcode: product.barcode,
                nama: product.nama,
                harga_estimasi: product.harga_beli || 0,
            });
            toast.success(`Ditambahkan: ${product.nama} (Luar PO)`);
        }
    };

    const handleOpenCreateDialog = (query: string) => {
        const cleanQuery = query.trim();
        const isBarcode = /^\d+$/.test(cleanQuery);
        productForm.reset({
            nama: isBarcode ? "" : cleanQuery,
            merek: "Umum",
            barcode: isBarcode ? cleanQuery : "",
            harga: 0,
            stok: 0,
            harga_beli: 0,
            margin: 0,
            category_uid: null,
            brand_uid: null,
            image: null,
            is_jasa: false,
        });
        setIsCreateDialogOpen(true);
    };

    const getProductInfo = (productId: string | number) => {
        const targetId = productId;
        const localItem = items.find((item) => item.product_uid === targetId);
        if (localItem) {
            return {
                uid: localItem.product_uid,
                nama: localItem.nama,
                barcode: localItem.barcode,
                harga_beli: localItem.harga_estimasi,
            } as unknown as Product;
        }

        const recItem = currentReceiving?.items?.find((item: ReceivingItem) => item.product_uid === targetId);
        if (recItem?.product) return recItem.product;

        const poItem = poData?.items?.find((item: PurchaseOrderItem) => item.product_uid === targetId);
        if (poItem?.product) return poItem.product;

        return null;
    };

    return {
        productForm,
        isCreateDialogOpen,
        setIsCreateDialogOpen,
        notFoundQuery,
        setNotFoundQuery,
        handleProductFound,
        handleOpenCreateDialog,
        getProductInfo,
    };
}
