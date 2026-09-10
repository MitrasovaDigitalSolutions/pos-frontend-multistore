"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { hasPermission, hasRole } from "@/constants/roles";
import { useBomComponentTypes } from "./api/bom-component-types-api";
import { BomComponentTypeList } from "./components/bom-component-type-list";
import { BomComponentTypeDialog } from "./components/bom-component-type-dialog";
import {
    bomComponentTypeSchema,
    type BomComponentTypeInput,
} from "./schemas/bom-component-type-schema";
import type { BomComponentType } from "./types";
import { FilterForm } from "@/components/forms/filter-form";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { AccessDeniedState } from "@/components/ui/access-denied-state";
import { BOM_BUSINESS_CATEGORIES } from "./schemas/bom-component-type-schema";

interface FilterValues {
    search: string;
    kategori_bisnis: string;
}

export function BomComponentTypes() {
    const { data: session } = useSession();
    const userRoles = session?.user?.roles || [];
    const userPermissions = session?.user?.permissions || [];
    const canView =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "view_production") ||
        hasPermission(userRoles, userPermissions, "manage_production");

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [sortBy, setSortBy] = useState<string | undefined>("nama");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>("asc");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [filterKategoriBisnis, setFilterKategoriBisnis] = useState("");

    const filterMethods = useForm<FilterValues>({
        defaultValues: {
            search: "",
            kategori_bisnis: "",
        },
    });

    const handleFilterSubmit = (data: FilterValues) => {
        setDebouncedSearch(data.search);
        setFilterKategoriBisnis(data.kategori_bisnis || "");
        setPage(1);
    };

    const handleFilterReset = () => {
        filterMethods.reset({ search: "", kategori_bisnis: "" });
        setDebouncedSearch("");
        setFilterKategoriBisnis("");
        setPage(1);
    };

    const { data: typesData, isLoading, isFetching } = useBomComponentTypes({
        page,
        per_page: perPage,
        sort_by: sortBy,
        sort_order: sortOrder,
        search: debouncedSearch || undefined,
        kategori_bisnis: filterKategoriBisnis || undefined,
    });

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingType, setEditingType] = useState<BomComponentType | null>(null);

    const dialogMethods = useForm<BomComponentTypeInput>({
        resolver: zodResolver(bomComponentTypeSchema) as Resolver<BomComponentTypeInput>,
        defaultValues: {
            kode: "",
            nama: "",
            kategori_bisnis: "general",
            is_main_driver: false,
            deskripsi: "",
        },
    });

    if (!canView) {
        return (
            <AccessDeniedState
                description="Anda tidak memiliki hak akses untuk melihat master tipe komponen BoM."
            />
        );
    }

    const handleEdit = (item: BomComponentType) => {
        setEditingType(item);
        dialogMethods.reset({
            kode: item.kode,
            nama: item.nama,
            kategori_bisnis: item.kategori_bisnis || "general",
            is_main_driver: item.is_main_driver ?? false,
            deskripsi: item.deskripsi || "",
        });
        setIsDialogOpen(true);
    };

    const handleAddClick = () => {
        setEditingType(null);
        dialogMethods.reset({
            kode: "",
            nama: "",
            kategori_bisnis: "general",
            is_main_driver: false,
            deskripsi: "",
        });
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <FormProvider {...dialogMethods}>
                <BomComponentTypeList
                    types={typesData?.data || []}
                    meta={typesData?.meta}
                    page={page}
                    perPage={perPage}
                    onPageChange={setPage}
                    onPerPageChange={(newPerPage) => {
                        setPerPage(newPerPage);
                        setPage(1);
                    }}
                    onEdit={handleEdit}
                    onAddClick={handleAddClick}
                    isLoading={isLoading}
                    isFetching={isFetching}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSortChange={(field, order) => {
                        setSortBy(field);
                        setSortOrder(order);
                    }}
                    filterElement={
                        <FilterForm<FilterValues>
                            methods={filterMethods}
                            onSubmit={handleFilterSubmit}
                            onReset={handleFilterReset}
                        >
                            <FormInput<FilterValues>
                                name="search"
                                label="Cari Tipe Komponen"
                                placeholder="Masukkan nama atau kode tipe komponen..."
                            />
                            <FormSelect<FilterValues>
                                name="kategori_bisnis"
                                label="Filter Kategori"
                                options={[
                                    { value: "", label: "Semua Kategori Bisnis" },
                                    ...BOM_BUSINESS_CATEGORIES.map((c) => ({
                                        value: c.value,
                                        label: c.label,
                                    })),
                                ]}
                                placeholder="Semua Kategori..."
                            />
                        </FilterForm>
                    }
                />

                <BomComponentTypeDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    editingType={editingType}
                />
            </FormProvider>
        </div>
    );
}
