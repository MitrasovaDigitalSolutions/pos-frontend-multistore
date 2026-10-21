"use client";

import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { BaseDialog } from "@/components/ui/base-dialog";
import { IconActivity } from "@tabler/icons-react";
import { useProducts } from "@/features/master/products/api/products-api";
import type { Product } from "@/features/master/products/types";
import { FilterForm } from "@/components/forms/filter-form";
import { FormInput } from "@/components/forms/form-input";
import { DataTable } from "@/components/ui/data-table";
import { DataTableTextActionButton } from "@/components/ui/data-table-actions";
import { ColumnDef } from "@tanstack/react-table";
import { useStockTutorialStore } from "@/stores/stock-tutorial-store";
import { MOCK_ADJUSTMENT_PRODUCT } from "../tutorial/constants/stock-tutorial-constants";
import {
    ProductAdjustmentDialog,
    type ProductAdjustmentDialogProps,
} from "@/components/shared/product-adjustment-dialog";

interface AdjustmentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface ProductSearchValues {
    search: string;
}

export function AdjustmentDialog({
    open,
    onOpenChange,
}: AdjustmentDialogProps) {
    const isTutorialRunning = useStockTutorialStore((state) => state.isRunning);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [sortBy, setSortBy] = useState<string | undefined>("nama");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>("asc");

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    // Reset states on dialog open/close transitions
    const [prevOpen, setPrevOpen] = useState(open);
    if (open !== prevOpen) {
        setPrevOpen(open);
        if (open) {
            setSearch("");
            setPage(1);
            setSortBy("nama");
            setSortOrder("asc");
            setSelectedProduct(null);
            setIsFormOpen(false);
        }
    }

    const { data: productsData, isLoading: isProductsLoading } = useProducts({
        search: search || undefined,
        page: page,
        per_page: 5,
        sort_by: sortBy,
        sort_order: sortOrder,
    });

    const products = useMemo(() => {
        const rawProducts = productsData?.data || [];
        if (isTutorialRunning && rawProducts.length === 0) {
            return [MOCK_ADJUSTMENT_PRODUCT as Product];
        }
        return rawProducts;
    }, [productsData?.data, isTutorialRunning]);

    // Listen to tutorial simulation events to open/close adjustment form
    useEffect(() => {
        if (!isTutorialRunning) return;
        const handleOpenForm = (e: Event) => {
            const customEvent = e as CustomEvent<{ product?: Product }>;
            const prod = customEvent.detail?.product || (products[0] as Product) || (MOCK_ADJUSTMENT_PRODUCT as Product);
            setSelectedProduct(prod);
            setIsFormOpen(true);
        };
        const handleCloseForm = () => {
            setIsFormOpen(false);
        };
        window.addEventListener("stock-tutorial-open-adjust-form", handleOpenForm);
        window.addEventListener("stock-tutorial-close-adjust-form", handleCloseForm);
        return () => {
            window.removeEventListener("stock-tutorial-open-adjust-form", handleOpenForm);
            window.removeEventListener("stock-tutorial-close-adjust-form", handleCloseForm);
        };
    }, [isTutorialRunning, products]);

    const filterMethods = useForm<ProductSearchValues>({
        defaultValues: {
            search: "",
        },
    });

    const handleFilterSubmit = (data: ProductSearchValues) => {
        setSearch(data.search);
        setPage(1);
    };

    const handleFilterReset = () => {
        filterMethods.reset({ search: "" });
        setSearch("");
        setPage(1);
    };

    const columns = useMemo<ColumnDef<Product>[]>(
        () => [
            {
                accessorKey: "barcode",
                header: "Barcode / SKU",
                enableSorting: false,
                cell: ({ row }) => (
                    <span className="font-mono text-slate-500 text-xs">
                        {row.original.barcode || "-"}
                    </span>
                ),
                size: 120,
            },
            {
                accessorKey: "nama",
                header: "Nama Produk",
                cell: ({ row }) => (
                    <span className="font-semibold text-slate-800 text-xs">
                        {row.original.nama}
                    </span>
                ),
                size: 240,
            },
            {
                accessorKey: "stok",
                header: "Stok",
                meta: {
                    headerClassName: "text-right pr-4",
                    cellClassName: "text-right font-semibold text-slate-700 text-xs pr-4",
                },
                size: 80,
                cell: ({ row }) => row.original.stok,
            },
        ],
        []
    );

    return (
        <>
            <BaseDialog
                open={open}
                onOpenChange={onOpenChange}
                title={
                    <>
                        <IconActivity size={20} className="text-amber-500" />
                        <span>Pilih Produk untuk Penyesuaian Stok</span>
                    </>
                }
                className="sm:max-w-3xl"
                scrollable={true}
            >
                <div className="flex flex-col flex-1 overflow-hidden">
                    {/* Reusable FilterForm */}
                    <div id="adjustment-search-filter">
                        <FilterForm<ProductSearchValues>
                            methods={filterMethods}
                            onSubmit={handleFilterSubmit}
                            onReset={handleFilterReset}
                            className="mt-0"
                        >
                            <FormInput<ProductSearchValues>
                                name="search"
                                placeholder="Cari barcode, nama, atau merek..."
                            />
                        </FilterForm>
                    </div>

                    {/* DataTable */}
                    <div className="min-h-[280px]">
                        <DataTable<Product, unknown>
                            columns={columns}
                            data={products}
                            isLoading={isProductsLoading}
                            page={page}
                            perPage={5}
                            onPageChange={setPage}
                            meta={productsData?.meta}
                            entityName="produk"
                            sortBy={sortBy}
                            sortOrder={sortOrder}
                            onSortChange={(by, order) => {
                                setSortBy(by);
                                setSortOrder(order);
                                setPage(1);
                            }}
                            extraActions={(p) => (
                                <DataTableTextActionButton
                                    id={p.uid === products[0]?.uid ? "btn-adjust-product-row-0" : undefined}
                                    variant="amber"
                                    onClick={() => {
                                        setSelectedProduct(p);
                                        setIsFormOpen(true);
                                    }}
                                >
                                    Sesuaikan
                                </DataTableTextActionButton>
                            )}
                            virtualize={false}
                        />
                    </div>
                </div>
            </BaseDialog>

            {/* Step 2: Form Popup Dialog (Canonical Reusable Component) */}
            <ProductAdjustmentDialog
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                product={selectedProduct}
            />
        </>
    );
}

// Re-export for any external consumers
export {
    ProductAdjustmentDialog as AdjustmentFormDialog,
    type ProductAdjustmentDialogProps as AdjustmentFormDialogProps,
};
