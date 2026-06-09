"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { hasRole, hasPermission } from "@/constants/roles";
import { useCategories } from "./api/categories-api";
import { CategoryList } from "./components/category-list";
import { CategoryDialog } from "./components/category-dialog";
import { categorySchema, type CategoryInput } from "./schemas/category-schema";
import type { Category } from "./types";

export function Categories() {
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

    const { data: categoriesData, isLoading, isFetching } = useCategories({
        page,
        per_page: perPage,
        search: debouncedSearch || undefined,
    });

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const methods = useForm<CategoryInput>({
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
        methods.reset({
            nama: category.nama,
            deskripsi: category.deskripsi || "",
        });
        setIsDialogOpen(true);
    };

    const handleAddClick = () => {
        setEditingCategory(null);
        methods.reset({
            nama: "",
            deskripsi: "",
        });
        setIsDialogOpen(true);
    };

    return (
        <FormProvider {...methods}>
            <div className="space-y-6">
                <CategoryList
                    categories={categoriesData?.data || []}
                    meta={categoriesData?.meta}
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

                <CategoryDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    editingCategory={editingCategory}
                />
            </div>
        </FormProvider>
    );
}
