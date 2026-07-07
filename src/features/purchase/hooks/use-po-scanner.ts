"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { productSchema, type ProductInput } from "@/features/products/schemas/product-schema";
import type { Product } from "@/features/products/types";
import type { PurchaseItemLocal, PurchaseOrder } from "@/features/purchase/types";

interface UsePoScannerProps {
    currentId: string;
    currentOrder?: PurchaseOrder;
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

export function usePoScanner({
    currentId: _currentId,
    currentOrder,
    items,
    addItem,
}: UsePoScannerProps) {
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

    const handleProductFound = (product: Product) => {
        addItem({
            product_uid: product.uid,
            barcode: product.barcode,
            nama: product.nama,
            harga_estimasi: product.harga_beli || 0,
        });
        toast.success(`Ditambahkan: ${product.nama}`);
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

        const orderItem = currentOrder?.items?.find((item) => item.product_uid === targetId);
        if (orderItem?.product) return orderItem.product;

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
