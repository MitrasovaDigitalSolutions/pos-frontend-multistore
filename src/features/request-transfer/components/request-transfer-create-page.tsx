"use client";

import { ROUTES } from "@/constants/routes";
import type { Product } from "@/features/master/products/types";
import { useAllSuppliers } from "@/features/master/suppliers/api/suppliers-api";
import { useStores } from "@/features/stores/api/stores-api";
import { useAllSupplierSales } from "@/features/supplier-sales/api/supplier-sales-api";
import { useAppRouter } from "@/hooks/use-app-router";
import { useActiveStoreStore } from "@/stores/active-store-store";
import { useSearchParams } from "next/navigation";
import { useState, useMemo, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useCreateRequestTransfer } from "../api/request-transfer-api";
import type { RequestLineItem } from "../schemas/request-transfer-schema";
import { RequestTransferCreateHeader } from "./create/request-transfer-create-header";
import { RequestTransferFormInfo } from "./create/request-transfer-form-info";
import { RequestTransferItemsTable } from "./create/request-transfer-items-table";
import { RequestTransferSummaryCard } from "./create/request-transfer-summary-card";

export function RequestTransferCreatePage() {
    const router = useAppRouter();
    const searchParams = useSearchParams();

    const paramRequestTo = searchParams.get("request_to") || searchParams.get("toko_tujuan") || "";
    const paramSupplier = searchParams.get("supplier_uid") || searchParams.get("supplier") || "";
    const paramSales = searchParams.get("supplier_sales_uid") || searchParams.get("sales_uid") || searchParams.get("katalog_uid") || "";

    const createRequest = useCreateRequestTransfer();
    const activeStoreUid = useActiveStoreStore((state) => state.activeStoreUid);

    const { data: storesRes, isLoading: isLoadingStores } = useStores({ per_page: 1000 });
    const { data: suppliers, isLoading: isLoadingSuppliers } = useAllSuppliers();
    const { data: supplierSales, isLoading: isLoadingSales } = useAllSupplierSales();

    // Filter out current active store so user only requests from other stores
    const stores = useMemo(() => {
        return (storesRes?.data || []).filter((s) => !activeStoreUid || s.uid !== activeStoreUid);
    }, [storesRes?.data, activeStoreUid]);

    const [requestTo, setRequestTo] = useState("");
    const [supplierUid, setSupplierUid] = useState("");
    const [supplierSalesUid, setSupplierSalesUid] = useState<string | null>(null);
    const [catatan, setCatatan] = useState("");
    const [items, setItems] = useState<RequestLineItem[]>([]);

    const isInitializedRef = useRef(false);

    // Auto-prefill form and catalog items from query parameters
    useEffect(() => {
        if (isInitializedRef.current) return;

        let initialized = false;

        if (paramRequestTo) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setRequestTo(paramRequestTo);
            initialized = true;
        }

        if (paramSupplier) {
            setSupplierUid(paramSupplier);
            initialized = true;
        }

        if (paramSales && supplierSales && supplierSales.length > 0) {
            const sale = supplierSales.find((s) => s.uid === paramSales);
            if (sale) {
                setSupplierSalesUid(paramSales);
                if (sale.supplier_uid && !paramSupplier) {
                    setSupplierUid(sale.supplier_uid);
                }
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
                isInitializedRef.current = true;
            }
        } else if (!paramSales && initialized) {
            isInitializedRef.current = true;
        }
    }, [paramRequestTo, paramSupplier, paramSales, supplierSales]);

    const selectedStore = stores.find((s) => s.uid === requestTo);
    const selectedSupplier = suppliers?.find((s) => s.uid === supplierUid);
    const selectedCatalog = supplierSales?.find((s) => s.uid === supplierSalesUid);


    const handleSupplierChange = (uid: string) => {
        setSupplierUid(uid);
        if (uid && supplierSalesUid) {
            const currentSale = supplierSales?.find((s) => s.uid === supplierSalesUid);
            if (currentSale && currentSale.supplier_uid !== uid) {
                setSupplierSalesUid(null);
            }
        }
    };

    const handleCatalogChange = (uid: string) => {
        setSupplierSalesUid(uid || null);
        if (uid) {
            const sale = supplierSales?.find((s) => s.uid === uid);
            if (sale) {
                if (sale.supplier_uid) {
                    setSupplierUid(sale.supplier_uid);
                }
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
    const canSubmit = !!requestTo && hasValidItems;

    const handleSubmit = () => {
        if (!requestTo) {
            toast.error("Toko tujuan request wajib dipilih.");
            return;
        }
        if (!hasValidItems) {
            toast.error("Minimal 1 item dengan kuantitas lebih dari 0.");
            return;
        }

        createRequest.mutate(
            {
                request_to: requestTo || null,
                supplier_uid: supplierUid || null,
                supplier_sales_uid: supplierSalesUid || null,
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
        <div className="space-y-4 sm:space-y-6">
            <RequestTransferCreateHeader />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
                {/* Left Form Sections */}
                <div className="lg:col-span-8 space-y-4 sm:space-y-6">
                    <RequestTransferFormInfo
                        requestTo={requestTo}
                        supplierUid={supplierUid}
                        supplierSalesUid={supplierSalesUid}
                        catatan={catatan}
                        stores={stores}
                        suppliers={suppliers || []}
                        supplierSales={supplierSales || []}
                        isLoadingStores={isLoadingStores}
                        isLoadingSuppliers={isLoadingSuppliers}
                        isLoadingSales={isLoadingSales}
                        disabled={isPending}
                        onRequestToChange={setRequestTo}
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
                <div className="lg:col-span-4 space-y-4 sm:space-y-6">
                    <RequestTransferSummaryCard
                        storeName={selectedStore ? (selectedStore.is_central ? `${selectedStore.nama} (Pusat)` : selectedStore.nama) : undefined}
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

