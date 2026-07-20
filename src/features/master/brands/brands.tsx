"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { hasRole } from "@/constants/roles";
import { useBrands } from "./api/brands-api";
import { BrandList } from "./components/brand-list";
import { BrandDialog } from "./components/brand-dialog";
import { brandSchema, type BrandInput } from "./schemas/brand-schema";
import type { Brand } from "./types";
import { FilterForm } from "@/components/forms/filter-form";
import { FormInput } from "@/components/forms/form-input";
import { AccessDeniedState } from "@/components/ui/access-denied-state";

interface BrandFilterValues {
    search: string;
}

export function Brands() {
    const { data: session } = useSession();
    const userRoles = session?.user?.roles || [];
    const isAdmin = hasRole(userRoles, "admin");

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

    if (!isAdmin) {
        return (
            <AccessDeniedState
                description="Halaman kelola brand produk hanya dapat diakses oleh Administrator."
            />
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
