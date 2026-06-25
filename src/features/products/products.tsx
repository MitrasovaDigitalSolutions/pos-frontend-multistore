"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { hasRole, hasPermission } from "@/constants/roles";
import { useProducts } from "./api/products-api";
import { ProductTable } from "./components/product-table";
import { ProductFormDialog } from "./components/product-form-dialog";
import { productSchema, type ProductInput } from "./schemas/product-schema";
import type { Product } from "./types";
import { useCategories } from "@/features/categories/api/categories-api";
import { useBrands } from "@/features/brands/api/brands-api";
import { FilterForm } from "@/components/forms/filter-form";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";

interface ProductFilterValues {
  search: string;
  category_uid: string;
  brand_uid: string;
  status: string;
}

export function Products() {
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
  }>({});

  // Load categories and brands for the dropdown filter options
  const { data: categoriesRes } = useCategories({ per_page: 1000 });
  const { data: brandsRes } = useBrands({ per_page: 1000 });

  const filterMethods = useForm<ProductFilterValues>({
    defaultValues: {
      search: "",
      category_uid: "all",
      brand_uid: "all",
      status: "all",
    },
  });

  const handleFilterSubmit = (data: ProductFilterValues) => {
    setAppliedFilters({
      search: data.search || undefined,
      status: data.status !== "all" ? data.status : undefined,
      category_uid: data.category_uid !== "all" ? (data.category_uid) : undefined,
      brand_uid: data.brand_uid !== "all" ? (data.brand_uid) : undefined,
    });
    setPage(1);
  };

  const handleFilterReset = () => {
    filterMethods.reset({
      search: "",
      category_uid: "all",
      brand_uid: "all",
      status: "all",
    });
    setAppliedFilters({});
    setPage(1);
  };

  const { data: productsData, isLoading, isFetching } = useProducts({
    page,
    per_page: perPage,
    sort_by: sortBy,
    sort_order: sortOrder,
    ...appliedFilters,
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

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

  if (!hasViewProducts) {
    return (
      <div className="p-8 text-center bg-white border border-slate-100 rounded-2xl shadow-sm">
        <p className="text-sm font-bold text-slate-800">Akses Ditolak</p>
        <p className="text-xs text-slate-400 mt-1">Anda tidak memiliki izin untuk melihat data produk.</p>
      </div>
    );
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    dialogMethods.reset({
      nama: product.nama,
      merek: product.merek,
      barcode: product.barcode || "",
      harga: product.harga,
      stok: product.stok,
      harga_beli: product.harga_beli ?? 0,
      margin: product.margin ?? 0,
      category_uid: product.category_uid ?? null,
      brand_uid: product.brand_uid ?? null,
      image: null,
      is_jasa: !!product.is_jasa,
    });
    setIsDialogOpen(true);
  };

  const handleAddClick = () => {
    setEditingProduct(null);
    dialogMethods.reset({
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
            </FilterForm>
          }
        />

        <ProductFormDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          editingProduct={editingProduct}
        />
      </FormProvider>
    </div>
  );
}
