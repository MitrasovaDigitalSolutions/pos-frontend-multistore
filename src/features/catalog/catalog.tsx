"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { hasRole } from "@/constants/roles";
import { FilterForm } from "@/components/forms/filter-form";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { FormSwitch } from "@/components/forms/form-switch";
import { useCategories } from "@/features/master/categories/api/categories-api";
import { useBrands } from "@/features/master/brands/api/brands-api";
import { AccessDeniedState } from "@/components/ui/access-denied-state";
import { useSearchParams } from "next/navigation";
import { useProductCatalog } from "./api/catalog-api";
import { CatalogTable } from "./components/catalog-table";
import { CatalogAssignDialog } from "./components/catalog-assign-dialog";
import type { CatalogProduct } from "./types";
import { ProductFormDialog } from "@/features/master/products/components/product-form-dialog";
import { productSchema, type ProductInput } from "@/features/master/products/schemas/product-schema";
import type { Product } from "@/features/master/products/types";

// ─── Filter shape ─────────────────────────────────────────────────────────────

interface CatalogFilterValues {
    search: string;
    category_uid: string;
    brand_uid: string;
    status: string;
    is_jasa: boolean;
}

// ─── Page Component ───────────────────────────────────────────────────────────

export function ProductCatalog() {
    const searchParams = useSearchParams();
    const searchParam = searchParams.get("search") || "";

    const { data: session } = useSession();
    const userRoles = session?.user?.roles || [];
    const isAdmin = hasRole(userRoles, "admin");

    // ── Pagination & sort ─────────────────────────────────────────────────────
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(15);
    const [sortBy, setSortBy] = useState<string | undefined>("nama");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>("asc");

    // ── Filters ───────────────────────────────────────────────────────────────
    const [appliedFilters, setAppliedFilters] = useState<{
        search?: string;
        status?: string;
        category_uid?: string;
        brand_uid?: string;
        is_jasa?: string;
    }>(() => ({
        search: searchParam || undefined,
    }));

    const { data: categoriesRes } = useCategories({ per_page: 1000 });
    const { data: brandsRes } = useBrands({ per_page: 1000 });

    const filterMethods = useForm<CatalogFilterValues>({
        defaultValues: {
            search: searchParam,
            category_uid: "all",
            brand_uid: "all",
            status: "all",
            is_jasa: false,
        },
    });

    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<CatalogProduct | null>(null);

    const dialogMethods = useForm<ProductInput>({
        resolver: zodResolver(productSchema) as Resolver<ProductInput>,
        defaultValues: {
            nama: "",
            merek: "",
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

    const handleEdit = (product: CatalogProduct) => {
        setEditingProduct(product);
        dialogMethods.reset({
            nama: product.nama,
            merek: product.merek || "",
            barcode: product.barcode || "",
            harga: product.harga,
            stok: product.stok ?? 0,
            harga_beli: product.harga_beli ?? 0,
            margin: product.margin ?? 0,
            category_uid: product.category_uid ?? null,
            brand_uid: product.brand_uid ?? null,
            image: null,
            is_jasa: !!product.is_jasa,
        });
        setIsEditDialogOpen(true);
    };

    // Sync URL search param → form
    useEffect(() => {
        filterMethods.setValue("search", searchParam);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAppliedFilters((prev) => ({ ...prev, search: searchParam || undefined }));
    }, [searchParam, filterMethods]);

    const handleFilterSubmit = (data: CatalogFilterValues) => {
        setAppliedFilters({
            search: data.search || undefined,
            status: data.status !== "all" ? data.status : undefined,
            category_uid: data.category_uid !== "all" ? data.category_uid : undefined,
            brand_uid: data.brand_uid !== "all" ? data.brand_uid : undefined,
            is_jasa: data.is_jasa ? "1" : undefined,
        });
        setPage(1);
    };

    const handleFilterReset = () => {
        filterMethods.reset({
            search: "",
            category_uid: "all",
            brand_uid: "all",
            status: "all",
            is_jasa: false,
        });
        setAppliedFilters({});
        setPage(1);
    };

    // ── Data fetch ────────────────────────────────────────────────────────────
    const { data: catalogData, isLoading, isFetching } = useProductCatalog({
        page,
        per_page: perPage,
        sort_by: sortBy,
        sort_order: sortOrder,
        ...appliedFilters,
    });

    // ── Assign dialog ─────────────────────────────────────────────────────────
    const [isAssignOpen, setIsAssignOpen] = useState(false);
    const [assignTarget, setAssignTarget] = useState<CatalogProduct | null>(null);

    const handleAssign = (product: CatalogProduct) => {
        setAssignTarget(product);
        setIsAssignOpen(true);
    };

    // ── Dropdown options ──────────────────────────────────────────────────────
    const categoryOptions = [
        { value: "all", label: "Semua Kategori" },
        ...(categoriesRes?.data || []).map((c) => ({ value: String(c.uid), label: c.nama })),
    ];

    const brandOptions = [
        { value: "all", label: "Semua Brand" },
        ...(brandsRes?.data || []).map((b) => ({ value: String(b.uid), label: b.nama })),
    ];

    const statusOptions = [
        { value: "all", label: "Semua Status" },
        { value: "active", label: "Aktif" },
        { value: "inactive", label: "Nonaktif" },
    ];

    // ── Access guard ──────────────────────────────────────────────────────────
    if (!isAdmin) {
        return (
            <AccessDeniedState
                description="Halaman Katalog Produk Global hanya dapat diakses dan dikelola oleh Admin."
                requiredPermission="admin"
            />
        );
    }

    return (
        <div className="space-y-6">
            <FormProvider {...dialogMethods}>
                <CatalogTable
                    products={catalogData?.data || []}
                    meta={catalogData?.meta}
                    page={page}
                    perPage={perPage}
                    onPageChange={setPage}
                    onPerPageChange={setPerPage}
                    onAssign={handleAssign}
                    onEdit={handleEdit}
                    isLoading={isLoading}
                    isFetching={isFetching}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSortChange={(by, order) => {
                        setSortBy(by);
                        setSortOrder(order);
                        setPage(1);
                    }}
                    isAdmin={isAdmin}
                    filterElement={
                        <FilterForm
                            methods={filterMethods}
                            onSubmit={handleFilterSubmit}
                            onReset={handleFilterReset}
                        >
                            <FormInput<CatalogFilterValues>
                                name="search"
                                label="Cari Produk"
                                placeholder="Cari barcode, nama, atau merek..."
                            />
                            <FormSelect<CatalogFilterValues>
                                name="category_uid"
                                label="Kategori"
                                options={categoryOptions}
                                placeholder="Semua Kategori"
                            />
                            <FormSelect<CatalogFilterValues>
                                name="brand_uid"
                                label="Brand"
                                options={brandOptions}
                                placeholder="Semua Brand"
                            />
                            <FormSelect<CatalogFilterValues>
                                name="status"
                                label="Status"
                                options={statusOptions}
                                placeholder="Semua Status"
                            />
                            <div className="col-span-2">
                                <FormSwitch<CatalogFilterValues>
                                    name="is_jasa"
                                    label="Produk Jasa / Layanan"
                                    description="Aktifkan untuk menampilkan produk jasa saja"
                                    className="bg-white"
                                />
                            </div>
                        </FilterForm>
                    }
                />

                <ProductFormDialog
                    open={isEditDialogOpen}
                    onOpenChange={setIsEditDialogOpen}
                    editingProduct={editingProduct as Product | null}
                />
            </FormProvider>

            <CatalogAssignDialog
                open={isAssignOpen}
                onOpenChange={setIsAssignOpen}
                product={assignTarget}
            />
        </div>
    );
}
