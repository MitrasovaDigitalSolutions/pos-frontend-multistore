"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { hasRole, hasPermission } from "@/constants/roles";
import { useBrands } from "./api/brands-api";
import { BrandList } from "./components/brand-list";
import { BrandDialog } from "./components/brand-dialog";
import { brandSchema, type BrandInput } from "./schemas/brand-schema";
import type { Brand } from "./types";
import { FilterForm } from "@/components/forms/filter-form";
import { FormInput } from "@/components/forms/form-input";

interface BrandFilterValues {
    search: string;
}

export function Brands() {
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

    const filterMethods = useForm<BrandFilterValues>({
        defaultValues: {
            search: "",
        },
    });

    const handleFilterSubmit = (data: BrandFilterValues) => {
        setDebouncedSearch(data.search);
        setPage(1);
    };

    const handleFilterReset = () => {
        filterMethods.reset({ search: "" });
        setDebouncedSearch("");
        setPage(1);
    };

    const { data: brandsData, isLoading, isFetching } = useBrands({
        page,
        per_page: perPage,
        sort_by: sortBy,
        sort_order: sortOrder,
        search: debouncedSearch || undefined,
    });

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

    const dialogMethods = useForm<BrandInput>({
        resolver: zodResolver(brandSchema) as Resolver<BrandInput>,
        defaultValues: {
            nama: "",
            deskripsi: "",
        },
    });

    if (!hasViewProducts) {
        return (
            <div className="p-8 text-center bg-white border border-slate-100 rounded-2xl shadow-sm">
                <p className="text-sm font-bold text-slate-800">Akses Ditolak</p>
                <p className="text-xs text-slate-400 mt-1">Anda tidak memiliki izin untuk melihat data brand.</p>
            </div>
        );
    }

    const handleEdit = (brand: Brand) => {
        setEditingBrand(brand);
        dialogMethods.reset({
            nama: brand.nama,
            deskripsi: brand.deskripsi || "",
        });
        setIsDialogOpen(true);
    };

    const handleAddClick = () => {
        setEditingBrand(null);
        dialogMethods.reset({
            nama: "",
            deskripsi: "",
        });
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <FormProvider {...dialogMethods}>
                <BrandList
                    brands={brandsData?.data || []}
                    meta={brandsData?.meta}
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
                            <FormInput<BrandFilterValues>
                                name="search"
                                label="Cari Brand"
                                placeholder="Masukkan nama brand..."
                            />
                        </FilterForm>
                    }
                />

                <BrandDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    editingBrand={editingBrand}
                />
            </FormProvider>
        </div>
    );
}
