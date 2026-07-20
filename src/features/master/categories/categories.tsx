"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { hasRole } from "@/constants/roles";
import { useCategories } from "./api/categories-api";
import { CategoryList } from "./components/category-list";
import { CategoryDialog } from "./components/category-dialog";
import { categorySchema, type CategoryInput } from "./schemas/category-schema";
import type { Category } from "./types";
import { FilterForm } from "@/components/forms/filter-form";
import { FormInput } from "@/components/forms/form-input";
import { AccessDeniedState } from "@/components/ui/access-denied-state";

interface CategoryFilterValues {
    search: string;
}

export function Categories() {
    const { data: session } = useSession();
    const userRoles = session?.user?.roles || [];
    const isAdmin = hasRole(userRoles, "admin");

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

    if (!isAdmin) {
        return (
            <AccessDeniedState
                description="Halaman kelola kategori produk hanya dapat diakses oleh Administrator."
            />
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
