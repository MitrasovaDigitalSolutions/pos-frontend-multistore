"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { hasPermission, hasRole } from "@/constants/roles";
import { AccessDeniedState } from "@/components/ui/access-denied-state";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { FilterForm } from "@/components/forms/filter-form";
import { FormInput } from "@/components/forms/form-input";
import { useProducts } from "@/features/master/products/api/products-api";
import type { Product } from "@/features/master/products/types";
import { IconArrowRight, IconLayersLinked, IconPackage } from "@tabler/icons-react";
import type { ColumnDef } from "@tanstack/react-table";
import { useForm } from "react-hook-form";
import { ProductBomEditor } from "./components/product-bom-editor";

interface FilterValues {
    search: string;
}

export function ProductBom() {
    const { data: session } = useSession();
    const userRoles = session?.user?.roles || [];
    const userPermissions = session?.user?.permissions || [];
    const canView =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "view_production") ||
        hasPermission(userRoles, userPermissions, "manage_production");

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const filterMethods = useForm<FilterValues>({
        defaultValues: {
            search: "",
        },
    });

    const handleFilterSubmit = (data: FilterValues) => {
        setDebouncedSearch(data.search);
        setPage(1);
    };

    const handleFilterReset = () => {
        filterMethods.reset({ search: "" });
        setDebouncedSearch("");
        setPage(1);
    };

    // Load only finished goods (is_raw_material: "0")
    const { data: productsData, isLoading, isFetching } = useProducts({
        page,
        per_page: perPage,
        is_raw_material: "0",
        is_jasa: "0",
        status: "active",
        search: debouncedSearch || undefined,
    });

    const columns = useMemo<ColumnDef<Product>[]>(
        () => [
            {
                accessorKey: "nama",
                header: "Barang Jadi",
                cell: ({ row }) => (
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs border border-emerald-200/60 shrink-0">
                            <IconPackage size={16} />
                        </div>
                        <div>
                            <span className="font-bold text-slate-900 text-xs block">
                                {row.original.nama}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                                Barcode: {row.original.barcode || "-"}
                            </span>
                        </div>
                    </div>
                ),
            },
            {
                id: "kategori_brand",
                header: "Kategori & Brand",
                cell: ({ row }) => (
                    <div className="flex flex-col gap-0.5 text-xs">
                        <span className="text-slate-700 font-medium">
                            {row.original.category?.nama || "-"}
                        </span>
                        <span className="text-[10px] text-slate-400">
                            {row.original.brand?.nama || "No Brand"}
                        </span>
                    </div>
                ),
                size: 160,
            },
            {
                id: "actions",
                header: "Resep BoM",
                meta: {
                    headerClassName: "text-right",
                    cellClassName: "text-right",
                },
                cell: ({ row }) => (
                    <Button
                        size="sm"
                        onClick={() => setSelectedProduct(row.original)}
                        className="h-8 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer ml-auto"
                    >
                        <span>Kelola BoM</span>
                        <IconArrowRight size={14} />
                    </Button>
                ),
                size: 130,
            },
        ],
        []
    );

    if (!canView) {
        return (
            <AccessDeniedState
                description="Anda tidak memiliki izin untuk mengelola master resep BoM produk."
            />
        );
    }

    // If a product is selected, render editor
    if (selectedProduct) {
        return (
            <ProductBomEditor
                product={selectedProduct}
                onBack={() => setSelectedProduct(null)}
            />
        );
    }

    return (
        <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-2">
            <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/80 shrink-0">
                        <IconLayersLinked size={22} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-900">
                            Manajemen Produk BoM (Bill of Materials)
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                            Tentukan standar resep bahan baku dan toleransi waste untuk setiap barang jadi hasil produksi.
                        </p>
                    </div>
                </div>
            </div>

            {/* Search & Filter */}
            <FilterForm<FilterValues>
                methods={filterMethods}
                onSubmit={handleFilterSubmit}
                onReset={handleFilterReset}
            >
                <FormInput<FilterValues>
                    name="search"
                    label="Cari Barang Jadi"
                    placeholder="Cari nama atau barcode barang jadi..."
                />
            </FilterForm>

            {/* List Table */}
            <DataTable
                columns={columns}
                data={productsData?.data || []}
                meta={productsData?.meta}
                page={page}
                perPage={perPage}
                onPageChange={setPage}
                onPerPageChange={(newPerPage) => {
                    setPerPage(newPerPage);
                    setPage(1);
                }}
                isLoading={isLoading}
                isFetching={isFetching}
                emptyMessage="Tidak ada barang jadi ditemukan."
                entityName="produk BoM"
            />
        </section>
    );
}
