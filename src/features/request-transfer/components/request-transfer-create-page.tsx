"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ROUTES } from "@/constants/routes";
import { useAllSuppliers } from "@/features/master/suppliers/api/suppliers-api";
import { useAllSupplierSales } from "@/features/supplier-sales/api/supplier-sales-api";
import type { Product } from "@/features/master/products/types";
import { useCreateRequestTransfer } from "../api/request-transfer-api";
import type { RequestLineItem } from "../schemas/request-transfer-schema";
import { RequestTransferCreateHeader } from "./create/request-transfer-create-header";
import { RequestTransferFormInfo } from "./create/request-transfer-form-info";
import { RequestTransferItemsTable } from "./create/request-transfer-items-table";
import { RequestTransferSummaryCard } from "./create/request-transfer-summary-card";

export function RequestTransferCreatePage() {
    const router = useRouter();
    const createRequest = useCreateRequestTransfer();

    const { data: suppliers, isLoading: isLoadingSuppliers } = useAllSuppliers();
    const { data: supplierSales, isLoading: isLoadingSales } = useAllSupplierSales();

    const [supplierUid, setSupplierUid] = useState("");
    const [supplierSalesUid, setSupplierSalesUid] = useState<string | null>(null);
    const [catatan, setCatatan] = useState("");
    const [items, setItems] = useState<RequestLineItem[]>([]);

    const selectedSupplier = suppliers?.find((s) => s.uid === supplierUid);
    const selectedCatalog = supplierSales?.find((s) => s.uid === supplierSalesUid);

    const handleSupplierChange = (uid: string) => {
        setSupplierUid(uid);
        setSupplierSalesUid(null);
        setItems([]);
    };

    const handleCatalogChange = (uid: string) => {
        setSupplierSalesUid(uid || null);
        if (uid) {
            const sale = supplierSales?.find((s) => s.uid === uid);
            if (sale) {
                const catalogLines: RequestLineItem[] = (sale.items || []).map((i) => ({
                    product_uid: i.product_uid,
                    nama: i.product?.nama || i.product_uid,
                    barcode: i.product?.barcode || null,
                    kuantitas: 0,
                }));
                setItems((prev) => {
                    const merged = [...prev];
                    for (const line of catalogLines) {
                        if (!merged.some((m) => m.product_uid === line.product_uid)) {
                            merged.push(line);
                        }
                    }
                    return merged;
                });
            }
        }
    };

    const handleProductFound = (product: Product) => {
        setItems((prev) => {
            if (prev.some((i) => i.product_uid === product.uid)) {
                toast.info(`Produk "${product.nama}" sudah ada di daftar.`);
                return prev;
            }
            toast.success(`"${product.nama}" ditambahkan`);
            return [
                ...prev,
                {
                    product_uid: product.uid,
                    nama: product.nama,
                    barcode: product.barcode || null,
                    kuantitas: 1,
                },
            ];
        });
    };

    const handleUpdateQty = (productUid: string, qty: number) => {
        setItems((prev) =>
            prev.map((i) => (i.product_uid === productUid ? { ...i, kuantitas: qty } : i)),
        );
    };

    const handleRemoveItem = (productUid: string) => {
        setItems((prev) => prev.filter((i) => i.product_uid !== productUid));
    };

    const totalJenis = items.length;
    const totalQty = items.reduce((acc, curr) => acc + curr.kuantitas, 0);
    const hasValidItems = items.some((i) => i.kuantitas > 0);
    const isPending = createRequest.isPending;
    const canSubmit = !!supplierUid && hasValidItems;

    const handleSubmit = () => {
        if (!supplierUid) {
            toast.error("Supplier wajib dipilih.");
            return;
        }
        if (!hasValidItems) {
            toast.error("Minimal 1 item dengan kuantitas lebih dari 0.");
            return;
        }
        createRequest.mutate(
            {
                supplier_uid: supplierUid,
                supplier_sales_uid: supplierSalesUid,
                catatan: catatan || null,
                items: items
                    .filter((i) => i.kuantitas > 0)
                    .map((i) => ({
                        product_uid: i.product_uid,
                        kuantitas: i.kuantitas,
                    })),
            },
            {
                onSuccess: () => {
                    toast.success("Request transfer berhasil dikirim.");
                    router.push(ROUTES.ADMIN_REQUEST_TRANSFERS);
                },
                onError: (err) => {
                    toast.error(err.message || "Gagal mengirim request.");
                },
            },
        );
    };

    return (
        <div className="space-y-6">
            <RequestTransferCreateHeader />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Form Sections */}
                <div className="lg:col-span-8 space-y-6">
                    <RequestTransferFormInfo
                        supplierUid={supplierUid}
                        supplierSalesUid={supplierSalesUid}
                        catatan={catatan}
                        suppliers={suppliers || []}
                        supplierSales={supplierSales || []}
                        isLoadingSuppliers={isLoadingSuppliers}
                        isLoadingSales={isLoadingSales}
                        disabled={isPending}
                        onSupplierChange={handleSupplierChange}
                        onCatalogChange={handleCatalogChange}
                        onCatatanChange={setCatatan}
                    />

                    <RequestTransferItemsTable
                        items={items}
                        totalQty={totalQty}
                        onProductFound={handleProductFound}
                        onUpdateQty={handleUpdateQty}
                        onRemoveItem={handleRemoveItem}
                    />
                </div>

                {/* Right Summary Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    <RequestTransferSummaryCard
                        supplierName={selectedSupplier?.nama}
                        catalogName={selectedCatalog?.nama}
                        totalJenis={totalJenis}
                        totalQty={totalQty}
                        onSubmit={handleSubmit}
                        isPending={isPending}
                        canSubmit={canSubmit}
                    />
                </div>
            </div>
        </div>
    );
}
