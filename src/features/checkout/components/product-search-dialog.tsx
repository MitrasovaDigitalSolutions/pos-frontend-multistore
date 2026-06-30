"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useForm, useWatch } from "react-hook-form";
import { BaseDialog } from "@/components/ui/base-dialog";
import { Scrollable } from "@/components/ui/scrollable";
import { FilterForm } from "@/components/forms/filter-form";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { DataTable } from "@/components/ui/data-table";
import type { Product } from "@/features/products/types";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import {
    IconPackage,
    IconPlus
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";

interface ProductSearchDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    products: Product[];
    onAddProduct: (product: Product) => void;
    initialSearchQuery?: string;
}

interface ProductSearchFilterValues {
    search: string;
    category_uid: string;
    brand_uid: string;
    stock: string;
}

export function ProductSearchDialog({
    open,
    onOpenChange,
    products,
    onAddProduct,
    initialSearchQuery = "",
}: ProductSearchDialogProps) {
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(5);

    const methods = useForm<ProductSearchFilterValues>({
        defaultValues: {
            search: initialSearchQuery,
            category_uid: "all",
            brand_uid: "all",
            stock: "all",
        },
    });

    const searchQuery = useWatch({ control: methods.control, name: "search" }) || "";
    const selectedCategory = useWatch({ control: methods.control, name: "category_uid" }) || "all";
    const selectedBrand = useWatch({ control: methods.control, name: "brand_uid" }) || "all";
    const stockFilter = useWatch({ control: methods.control, name: "stock" }) || "all";

    // Track previous filters to reset page to 1 during render phase when a filter changes
    const [prevFilters, setPrevFilters] = useState({
        search: initialSearchQuery,
        category: "all",
        brand: "all",
        stock: "all",
    });

    if (
        searchQuery !== prevFilters.search ||
        selectedCategory !== prevFilters.category ||
        selectedBrand !== prevFilters.brand ||
        stockFilter !== prevFilters.stock
    ) {
        setPrevFilters({
            search: searchQuery,
            category: selectedCategory,
            brand: selectedBrand,
            stock: stockFilter,
        });
        setPage(1);
    }

    // Auto-focus search input after transition on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            const inputEl = document.getElementById("search") as HTMLInputElement;
            inputEl?.focus();
        }, 150);
        return () => clearTimeout(timer);
    }, []);

    // Derive unique categories and brands from loaded products list (for complete offline compatibility)
    const categories = useMemo(() => {
        const unique = new Map<string, string>();
        products.forEach((p) => {
            if (p.category?.uid && p.category?.nama) {
                unique.set(p.category.uid, p.category.nama);
            }
        });
        return Array.from(unique.entries()).map(([uid, nama]) => ({ uid, nama }));
    }, [products]);

    const brands = useMemo(() => {
        const unique = new Map<string, string>();
        products.forEach((p) => {
            if (p.brand?.uid && p.brand?.nama) {
                unique.set(p.brand.uid, p.brand.nama);
            } else if (p.merek) {
                unique.set(p.merek, p.merek);
            }
        });
        return Array.from(unique.entries()).map(([uid, nama]) => ({ uid, nama }));
    }, [products]);

    const categoryOptions = useMemo(() => [
        { value: "all", label: "Semua Kategori" },
        ...categories.map((cat) => ({ value: cat.uid, label: cat.nama })),
    ], [categories]);

    const brandOptions = useMemo(() => [
        { value: "all", label: "Semua Brand" },
        ...brands.map((brand) => ({ value: brand.uid, label: brand.nama })),
    ], [brands]);

    const stockOptions = [
        { value: "all", label: "Semua Status" },
        { value: "available", label: "Tersedia / Ready" },
        { value: "low", label: "Stok Menipis (≤ 5)" },
        { value: "empty", label: "Habis (0)" },
    ];

    // Filter products locally in memory
    const filteredProducts = useMemo(() => {
        return products.filter((p) => {
            // Must be active to sell
            if (p.status !== "active") return false;

            // Search query matching: name, barcode, or brand (supports fuzzy multi-word lookup)
            if (searchQuery.trim()) {
                const queryWords = searchQuery.toLowerCase().trim().split(/\s+/);
                const isMatch = queryWords.every((word) => {
                    const nameMatch = p.nama.toLowerCase().includes(word);
                    const barcodeMatch = p.barcode?.toLowerCase().includes(word) ?? false;
                    const brandMatch =
                        p.brand?.nama.toLowerCase().includes(word) ||
                        p.merek?.toLowerCase().includes(word) ||
                        false;

                    return nameMatch || barcodeMatch || brandMatch;
                });

                if (!isMatch) return false;
            }

            // Category filter
            if (selectedCategory !== "all") {
                if (p.category_uid !== selectedCategory && p.category?.uid !== selectedCategory) {
                    return false;
                }
            }

            // Brand filter
            if (selectedBrand !== "all") {
                if (p.brand_uid !== selectedBrand && p.brand?.uid !== selectedBrand && p.merek !== selectedBrand) {
                    return false;
                }
            }

            // Stock filter
            if (stockFilter !== "all") {
                if (p.is_jasa) {
                    // Services/labor are always available, exclude them for low/empty filters
                    if (stockFilter !== "available") return false;
                } else {
                    if (stockFilter === "available" && p.stok <= 0) return false;
                    if (stockFilter === "low" && (p.stok <= 0 || p.stok > 5)) return false;
                    if (stockFilter === "empty" && p.stok > 0) return false;
                }
            }

            return true;
        });
    }, [products, searchQuery, selectedCategory, selectedBrand, stockFilter]);

    const handleSelectProduct = useCallback((product: Product) => {
        if (!product.is_jasa && product.stok <= 0) return;
        onAddProduct(product);
        onOpenChange(false);
    }, [onAddProduct, onOpenChange]);

    const handleFilterReset = () => {
        methods.reset({
            search: "",
            category_uid: "all",
            brand_uid: "all",
            stock: "all",
        });
        setPage(1);
        setTimeout(() => {
            const inputEl = document.getElementById("search") as HTMLInputElement;
            inputEl?.focus();
        }, 50);
    };

    const handleFilterSubmit = () => {
        setPage(1);
    };

    // Columns configuration for the reusable DataTable component
    const columns = useMemo<ColumnDef<Product>[]>(
        () => [
            {
                accessorKey: "nama",
                header: "Nama Produk",
                cell: ({ row }) => {
                    const p = row.original;
                    return (
                        <div className="flex flex-col gap-0.5">
                            <span className="font-bold text-slate-800 hover:text-emerald-700 transition-colors">
                                {p.nama}
                            </span>
                            <div className="flex items-center gap-1.5">
                                {p.is_jasa && (
                                    <span className="text-[9px] font-extrabold px-1.5 py-0.2 bg-blue-50 text-blue-600 rounded">
                                        JASA
                                    </span>
                                )}
                                {p.brand?.nama && (
                                    <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1 py-px rounded">
                                        {p.brand.nama}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                },
            },
            {
                accessorKey: "barcode",
                header: "Barcode / SKU",
                cell: ({ row }) => (
                    <span className="font-mono text-xs text-slate-600">
                        {row.original.barcode || "-"}
                    </span>
                ),
                size: 150,
            },
            {
                accessorKey: "category.nama",
                header: "Kategori",
                cell: ({ row }) => (
                    <span className="text-xs text-slate-500">
                        {row.original.category?.nama || "-"}
                    </span>
                ),
                size: 150,
            },
            {
                accessorKey: "stok",
                header: "Stok",
                meta: {
                    headerClassName: "text-right",
                    cellClassName: "text-right",
                },
                cell: ({ row }) => {
                    const p = row.original;
                    if (p.is_jasa) {
                        return (
                            <span className="text-xs font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
                                Tersedia
                            </span>
                        );
                    }
                    const isLow = p.stok > 0 && p.stok <= 5;
                    const isEmpty = p.stok <= 0;
                    return (
                        <span
                            className={cn(
                                "text-xs font-bold font-mono px-2 py-0.5 rounded-full",
                                isEmpty && "bg-rose-50 text-rose-600",
                                isLow && "bg-amber-50 text-amber-600",
                                !isEmpty && !isLow && "bg-emerald-50 text-emerald-600"
                            )}
                        >
                            {p.stok} pcs
                        </span>
                    );
                },
                size: 100,
            },
            {
                accessorKey: "harga",
                header: "Harga Jual",
                meta: {
                    headerClassName: "text-right",
                    cellClassName: "text-right font-bold text-slate-800 font-mono text-xs",
                },
                cell: ({ row }) => formatRupiah(row.original.harga),
                size: 120,
            },
            {
                id: "actions",
                header: "Aksi",
                meta: {
                    headerClassName: "text-center",
                    cellClassName: "text-center",
                },
                cell: ({ row }) => {
                    const p = row.original;
                    const hasStock = p.is_jasa || p.stok > 0;
                    return (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleSelectProduct(p);
                            }}
                            disabled={!hasStock}
                            className={cn(
                                "flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer border-none shadow-sm mx-auto",
                                hasStock
                                    ? "bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95"
                                    : "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                            )}
                        >
                            <IconPlus className="w-3.5 h-3.5" />
                            <span>Pilih</span>
                        </button>
                    );
                },
                size: 90,
            },
        ],
        [handleSelectProduct]
    );

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={
                <div className="flex items-center gap-2">
                    <IconPackage className="text-emerald-500 w-5 h-5 animate-pulse" />
                    <span className="text-base font-bold text-slate-800">Cari Produk Selengkapnya</span>
                </div>
            }
            className="sm:max-w-5xl w-full max-h-[90vh] md:max-h-screen flex flex-col"
        >
            <Scrollable className="flex-1 min-h-0 pr-1" orientation="vertical">
                <div className="flex flex-col gap-4 mt-2 pb-2">
                    {/* ─── Search & Quick Filters ─── */}
                    <FilterForm
                        methods={methods}
                        onSubmit={handleFilterSubmit}
                        onReset={handleFilterReset}
                        titleLabel="Filter Pencarian Produk"
                        className="my-1 border-slate-100"
                        cols={4}
                    >
                        <FormInput<ProductSearchFilterValues>
                            name="search"
                            label="Cari Nama/Barcode"
                            placeholder="Masukkan kata kunci..."
                        />
                        <FormSelect<ProductSearchFilterValues>
                            name="category_uid"
                            label="Kategori"
                            options={categoryOptions}
                            placeholder="Semua Kategori"
                        />
                        <FormSelect<ProductSearchFilterValues>
                            name="brand_uid"
                            label="Brand / Merek"
                            options={brandOptions}
                            placeholder="Semua Brand"
                        />
                        <FormSelect<ProductSearchFilterValues>
                            name="stock"
                            label="Ketersediaan"
                            options={stockOptions}
                            placeholder="Semua Status"
                        />
                    </FilterForm>

                    {/* ─── Product Results List (Table via DataTable) ─── */}
                    <DataTable
                        columns={columns}
                        data={filteredProducts}
                        clientPagination={true}
                        page={page}
                        perPage={perPage}
                        onPageChange={setPage}
                        onPerPageChange={setPerPage}
                        entityName="produk"
                        emptyMessage="Tidak ada produk ditemukan."
                        virtualize={false}
                    />
                </div>
            </Scrollable>
        </BaseDialog>
    );
}
