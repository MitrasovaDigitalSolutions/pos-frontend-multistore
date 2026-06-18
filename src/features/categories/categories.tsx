"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { hasRole, hasPermission } from "@/constants/roles";
import { useCategories } from "./api/categories-api";
import { CategoryList } from "./components/category-list";
import { CategoryDialog } from "./components/category-dialog";
import { categorySchema, type CategoryInput } from "./schemas/category-schema";
import type { Category } from "./types";
import { FilterForm } from "@/components/forms/filter-form";
import { FormInput } from "@/components/forms/form-input";

interface CategoryFilterValues {
    search: string;
}

export function Categories() {
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
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const filterMethods = useForm<CategoryFilterValues>({
        defaultValues: {
            search: "",
        },
    });

    const handleFilterSubmit = (data: CategoryFilterValues) => {
        setDebouncedSearch(data.search);
        setPage(1);
    };

    const handleFilterReset = () => {
        filterMethods.reset({ search: "" });
        setDebouncedSearch("");
        setPage(1);
    };

    const { data: categoriesData, isLoading, isFetching } = useCategories({
        page,
        per_page: perPage,
        sort_by: sortBy,
        sort_order: sortOrder,
        search: debouncedSearch || undefined,
    });

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const dialogMethods = useForm<CategoryInput>({
        resolver: zodResolver(categorySchema) as Resolver<CategoryInput>,
        defaultValues: {
            nama: "",
            deskripsi: "",
        },
    });

    if (!hasViewProducts) {
        return (
            <div className="p-8 text-center bg-white border border-slate-100 rounded-2xl shadow-sm">
                <p className="text-sm font-bold text-slate-800">Akses Ditolak</p>
                <p className="text-xs text-slate-400 mt-1">Anda tidak memiliki izin untuk melihat data kategori.</p>
            </div>
        );
    }

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        dialogMethods.reset({
            nama: category.nama,
            deskripsi: category.deskripsi || "",
        });
        setIsDialogOpen(true);
    };

    const handleAddClick = () => {
        setEditingCategory(null);
        dialogMethods.reset({
            nama: "",
            deskripsi: "",
        });
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <FormProvider {...dialogMethods}>
                <CategoryList
                    categories={categoriesData?.data || []}
                    meta={categoriesData?.meta}
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
                            <FormInput<CategoryFilterValues>
                                name="search"
                                label="Cari Kategori"
                                placeholder="Masukkan nama kategori..."
                            />
                        </FilterForm>
                    }
                />

                <CategoryDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    editingCategory={editingCategory}
                />
            </FormProvider>
        </div>
    );
}
