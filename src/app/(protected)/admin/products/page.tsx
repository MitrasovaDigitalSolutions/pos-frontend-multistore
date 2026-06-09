"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { hasRole, hasPermission } from "@/constants/roles";
import { useProducts } from "@/features/products/api/products-api";
import { ProductTable } from "@/features/products/components/product-table";
import { ProductFormDialog } from "@/features/products/components/product-form-dialog";
import type { Product } from "@/features/products/types";

export default function AdminProductsPage() {
  const { data: session } = useSession();
  const userRoles = session?.user?.roles || [];
  const userPermissions = session?.user?.permissions || [];
  
  const hasViewProducts =
    hasRole(userRoles, "admin") ||
    hasPermission(userRoles, userPermissions, "view_products");

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

