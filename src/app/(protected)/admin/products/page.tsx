"use client";

import { useState, useEffect } from "react";
import { useProducts } from "@/features/products/api/products-api";
import { ProductTable } from "@/features/products/components/product-table";
import { ProductFormDialog } from "@/features/products/components/product-form-dialog";
import type { Product } from "@/features/products/types";

export default function AdminProductsPage() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input to avoid excessive API requests
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to first page on search
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  const { data: productsData, isLoading, isFetching } = useProducts({
    page,
    per_page: perPage,
    search: debouncedSearch || undefined,
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const handleAddClick = () => {
    setEditingProduct(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <ProductTable
        products={productsData?.data || []}
        meta={productsData?.meta}
        page={page}
        perPage={perPage}
        onPageChange={setPage}
        onPerPageChange={setPerPage}
        search={search}
        onSearchChange={setSearch}
        onEdit={handleEdit}
        onAddClick={handleAddClick}
        isLoading={isLoading}
        isFetching={isFetching}
      />

      <ProductFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingProduct={editingProduct}
      />
    </div>
  );
}

