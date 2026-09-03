"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { hasRole, hasPermission } from "@/constants/roles";
import { useProducts } from "./api/products-api";
import { ProductTable } from "./components/product-table";
import { ProductFormDialog } from "./components/product-form-dialog";
import { ProductStoreDialog } from "./components/product-store-dialog";
import { CatalogMatchDialog } from "./components/catalog-match-dialog";
import { StoreProductEditDialog } from "./components/store-product-edit-dialog";
import { productSchema, type ProductInput } from "./schemas/product-schema";
import type { Product } from "./types";
import { useCategories } from "@/features/master/categories/api/categories-api";
import { useBrands } from "@/features/master/brands/api/brands-api";
import { FilterForm } from "@/components/forms/filter-form";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { FormRadioChips, type RadioChipOption } from "@/components/forms/form-radio-chips";
import { IconBox, IconLayoutGrid, IconPackage, IconTools } from "@tabler/icons-react";
import { useSearchParams } from "next/navigation";
import { AccessDeniedState } from "@/components/ui/access-denied-state";

interface ProductFilterValues {
  search: string;
  category_uid: string;
  brand_uid: string;
  status: string;
  product_type: string;
}

export function Products() {
  const searchParams = useSearchParams();
  const searchParam = searchParams.get("search") || "";

  const { data: session } = useSession();
  const userRoles = session?.user?.roles || [];
  const userPermissions = session?.user?.permissions || [];

  const hasViewProducts =
    hasRole(userRoles, "admin") ||
    hasPermission(userRoles, userPermissions, "view_products");

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<string | undefined>("nama");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>("asc");
  const [appliedFilters, setAppliedFilters] = useState<{
    search?: string;
    status?: string;
    category_uid?: string;
    brand_uid?: string;
    is_jasa?: string;
    is_raw_material?: string;
    include_archived?: number;
  }>(() => ({
    search: searchParam || undefined,
    status: "active",
  }));

  // Load categories and brands for the dropdown filter options
  const { data: categoriesRes } = useCategories({ per_page: 1000 });
  const { data: brandsRes } = useBrands({ per_page: 1000 });

  const filterMethods = useForm<ProductFilterValues>({
    defaultValues: {
      search: searchParam,
      category_uid: "all",
      brand_uid: "all",
      status: "active",
      product_type: "all",
    },
  });

  // Sync URL search param to state and form values
  const [prevSearchParam, setPrevSearchParam] = useState(searchParam);
  if (searchParam !== prevSearchParam) {
    setPrevSearchParam(searchParam);
    filterMethods.setValue("search", searchParam);
    setAppliedFilters((prev) => ({
      ...prev,
      search: searchParam || undefined,
    }));
  }

  const handleFilterSubmit = (data: ProductFilterValues) => {
    let status: string | undefined = undefined;
    let include_archived: number | undefined = undefined;

    if (data.status === "archived") {
      status = "archived";
      include_archived = 1;
    } else if (data.status === "all") {
      status = undefined;
      include_archived = 1;
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

  const { data: productsData, isLoading, isFetching } = useProducts({
    page,
    per_page: perPage,
    sort_by: sortBy,
    sort_order: sortOrder,
    ...appliedFilters,
  });

  const [isCatalogMatchOpen, setIsCatalogMatchOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isStoreEditOpen, setIsStoreEditOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [isStoreDialogOpen, setIsStoreDialogOpen] = useState(false);
  const [managingProduct, setManagingProduct] = useState<Product | null>(null);

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
      is_grosir: false,
      is_active: true,
    },
  });

  if (!hasViewProducts) {
    return (
      <AccessDeniedState
        description="Anda tidak memiliki izin untuk melihat atau mengelola data produk."
        requiredPermission="view_products"
      />
    );
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsStoreEditOpen(true);
  };

  const handleAddClick = () => {
    setIsCatalogMatchOpen(true);
  };

  const handleOpenManualCreate = (prefilledNama?: string) => {
    setEditingProduct(null);
    dialogMethods.reset({
      nama: prefilledNama || "",
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
      is_grosir: false,
    });
    setIsDialogOpen(true);
  };

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

  return (
    <div className="space-y-6">
      <FormProvider {...dialogMethods}>
        <ProductTable
          products={productsData?.data || []}
          meta={productsData?.meta}
          page={page}
          perPage={perPage}
          onPageChange={setPage}
          onPerPageChange={setPerPage}
          onEdit={handleEdit}
          onManageStores={(p) => {
            setManagingProduct(p);
            setIsStoreDialogOpen(true);
          }}
          onAddClick={handleAddClick}
          isLoading={isLoading}
          isFetching={isFetching}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={(by, order) => {
            setSortBy(by);
            setSortOrder(order);
            setPage(1);
          }}
          filterElement={
            <FilterForm
              methods={filterMethods}
              onSubmit={handleFilterSubmit}
              onReset={handleFilterReset}
            >
              <FormInput<ProductFilterValues>
                name="search"
                label="Cari Produk"
                placeholder="Cari barcode, nama, atau merek..."
              />
              <FormSelect<ProductFilterValues>
                name="category_uid"
                label="Kategori"
                options={categoryOptions}
                placeholder="Semua Kategori"
              />
              <FormSelect<ProductFilterValues>
                name="brand_uid"
                label="Brand"
                options={brandOptions}
                placeholder="Semua Brand"
              />
              <FormSelect<ProductFilterValues>
                name="status"
                label="Status"
                options={statusOptions}
                placeholder="Semua Status"
              />
              <FormRadioChips<ProductFilterValues>
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
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          editingProduct={editingProduct}
        />
      </FormProvider>

      <CatalogMatchDialog
        open={isCatalogMatchOpen}
        onOpenChange={setIsCatalogMatchOpen}
        onSelectNewProduct={(nama) => handleOpenManualCreate(nama)}
      />

      <StoreProductEditDialog
        open={isStoreEditOpen}
        onOpenChange={setIsStoreEditOpen}
        product={editingProduct}
      />

      <ProductStoreDialog
        open={isStoreDialogOpen}
        onOpenChange={setIsStoreDialogOpen}
        product={managingProduct}
      />
    </div>
  );
}
