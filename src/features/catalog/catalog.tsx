"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { hasRole } from "@/constants/roles";
import { FilterForm } from "@/components/forms/filter-form";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { FormRadioChips, type RadioChipOption } from "@/components/forms/form-radio-chips";
import { IconBox, IconLayoutGrid, IconPackage, IconTools } from "@tabler/icons-react";
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
    product_type: string;
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
        is_raw_material?: string;
        include_archived?: "1";
    }>(() => ({
        search: searchParam || undefined,
        status: "active",
    }));

    const { data: categoriesRes } = useCategories({ per_page: 1000 });
    const { data: brandsRes } = useBrands({ per_page: 1000 });

    const filterMethods = useForm<CatalogFilterValues>({
        defaultValues: {
            search: searchParam,
            category_uid: "all",
            brand_uid: "all",
            status: "active",
            product_type: "all",
        },
    });

    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<CatalogProduct | null>(null);
    const [duplicateProduct, setDuplicateProduct] = useState<CatalogProduct | null>(null);

    const dialogMethods = useForm<ProductInput>({
        resolver: zodResolver(productSchema) as Resolver<ProductInput>,
        defaultValues: {
            nama: "",
            merek: "",
            barcode: "",
            harga: 0,
            harga_grosir: null,
            min_qty_grosir: null,
            harga_grosir_total: null,
            stok: 0,
            harga_beli: 0,
            margin: 0,
            category_uid: null,
            brand_uid: null,
            image: null,
            is_jasa: false,
            is_raw_material: false,
            is_active: true,
        },
    });

    const handleEdit = (product: CatalogProduct) => {
        setDuplicateProduct(null);
        setEditingProduct(product);
        const storeProduct = product.product_stores?.[0];
        const rawHGrosir = product.harga_grosir ?? storeProduct?.harga_grosir ?? null;
        const rawMinQty = product.min_qty_grosir ?? storeProduct?.min_qty_grosir ?? null;
        const hGrosir = rawHGrosir !== null && rawHGrosir !== undefined ? Number(rawHGrosir) : null;
        const minQty = rawMinQty !== null && rawMinQty !== undefined ? Number(rawMinQty) : null;
        const hGrosirTotal = (hGrosir && minQty) ? Math.round(hGrosir * minQty) : null;
        dialogMethods.reset({
            nama: product.nama,
            merek: product.merek || "",
            barcode: product.barcode || "",
            harga: product.harga,
            harga_grosir: hGrosir,
            min_qty_grosir: minQty,
            harga_grosir_total: hGrosirTotal,
            stok: product.stok ?? 0,
            harga_beli: product.harga_beli ?? 0,
            margin: product.margin ?? 0,
            category_uid: product.category_uid ?? null,
            brand_uid: product.brand_uid ?? null,
            image: null,
            is_jasa: !!product.is_jasa,
            is_raw_material: !!product.is_raw_material,
            is_active: product.status !== "inactive",
        });
        setIsEditDialogOpen(true);
    };

    const handleCopy = (product: CatalogProduct) => {
        setEditingProduct(null);
        setDuplicateProduct(product);
        setIsEditDialogOpen(true);
    };

    const handleCreateNewProduct = () => {
        setEditingProduct(null);
        setDuplicateProduct(null);
        dialogMethods.reset({
            nama: "",
            merek: "",
            barcode: "",
            harga: 0,
            harga_grosir: null,
            min_qty_grosir: null,
            harga_grosir_total: null,
            stok: 0,
            harga_beli: 0,
            margin: 0,
            category_uid: null,
            brand_uid: null,
            image: null,
            is_jasa: false,
            is_raw_material: false,
            is_active: true,
        });
        setIsEditDialogOpen(true);
    };

    // Sync URL search param → form
    const [prevSearchParam, setPrevSearchParam] = useState(searchParam);
    if (searchParam !== prevSearchParam) {
        setPrevSearchParam(searchParam);
        filterMethods.setValue("search", searchParam);
        setAppliedFilters((prev) => ({
            ...prev,
            search: searchParam || undefined,
        }));
    }

    const handleFilterSubmit = (data: CatalogFilterValues) => {
        let status: string | undefined = undefined;
        let include_archived: "1" | undefined = undefined;

        if (data.status === "archived") {
            status = "archived";
            include_archived = "1";
        } else if (data.status === "all") {
            status = undefined;
            include_archived = "1";
        } else {
            status = data.status;
        }

        setAppliedFilters({
            search: data.search || undefined,
            status,
            category_uid: data.category_uid !== "all" ? data.category_uid : undefined,
            brand_uid: data.brand_uid !== "all" ? data.brand_uid : undefined,
            is_jasa: data.product_type === "jasa" ? "1" : undefined,
            is_raw_material: data.product_type === "raw_material" ? "1" : (data.product_type === "finished_good" ? "0" : undefined),
            include_archived,
        });
        setPage(1);
    };

    const handleProductTypeFilterChange = (selectedType: string) => {
        const currentValues = filterMethods.getValues();
        handleFilterSubmit({
            ...currentValues,
            product_type: selectedType,
        });
    };

    const handleFilterReset = () => {
        filterMethods.reset({
            search: "",
            category_uid: "all",
            brand_uid: "all",
            status: "active",
            product_type: "all",
        });
        setAppliedFilters({
            status: "active",
        });
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
        { value: "archived", label: "Dihapus / Diarsipkan" },
    ];

    const productTypeRadioOptions: RadioChipOption[] = [
        { value: "all", label: "Semua Tipe", icon: <IconLayoutGrid size={13} /> },
        { value: "finished_good", label: "Barang Jadi", icon: <IconPackage size={13} /> },
        { value: "raw_material", label: "Bahan Baku", icon: <IconBox size={13} /> },
        { value: "jasa", label: "Jasa", icon: <IconTools size={13} /> },
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
                    onCopy={isAdmin ? handleCopy : undefined}
                    onAddClick={handleCreateNewProduct}
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
                            <FormRadioChips<CatalogFilterValues>
                                name="product_type"
                                label="Tipe Produk"
                                options={productTypeRadioOptions}
                                variant="segmented"
                                size="sm"
                                wrapperClassName="col-span-1 xs:col-span-2 md:col-span-2"
                                onChange={handleProductTypeFilterChange}
                            />
                        </FilterForm>
                    }
                />

                <ProductFormDialog
                    open={isEditDialogOpen}
                    onOpenChange={(open) => {
                        setIsEditDialogOpen(open);
                        if (!open) {
                            setDuplicateProduct(null);
                        }
                    }}
                    editingProduct={editingProduct as unknown as Product | null}
                    duplicateProduct={duplicateProduct as unknown as Product | null}
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
