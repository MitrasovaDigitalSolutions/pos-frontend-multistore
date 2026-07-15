"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { hasRole, hasPermission } from "@/constants/roles";
import { useSuppliers } from "./api/suppliers-api";
import { SupplierList } from "./components/supplier-list";
import { SupplierDialog } from "./components/supplier-dialog";
import { supplierSchema, type SupplierInput } from "./schemas/supplier-schema";
import type { Supplier } from "./types";
import { FilterForm } from "@/components/forms/filter-form";
import { FormInput } from "@/components/forms/form-input";

interface SupplierFilterValues {
    search: string;
}

export function Suppliers() {
    const { data: session } = useSession();
    const userRoles = session?.user?.roles || [];
    const userPermissions = session?.user?.permissions || [];

    const hasViewSuppliers =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "view_suppliers");

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [sortBy, setSortBy] = useState<string | undefined>("nama");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>("asc");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const filterMethods = useForm<SupplierFilterValues>({
        defaultValues: {
            search: "",
        },
    });

    const handleFilterSubmit = (data: SupplierFilterValues) => {
        setDebouncedSearch(data.search);
        setPage(1);
    };

    const handleFilterReset = () => {
        filterMethods.reset({ search: "" });
        setDebouncedSearch("");
        setPage(1);
    };

    const { data: suppliersData, isLoading, isFetching } = useSuppliers({
        page,
        per_page: perPage,
        sort_by: sortBy,
        sort_order: sortOrder,
        search: debouncedSearch || undefined,
    });

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

    const dialogMethods = useForm<SupplierInput>({
        resolver: zodResolver(supplierSchema) as Resolver<SupplierInput>,
        defaultValues: {
            nama: "",
            email: "",
            nomor_telepon: "",
            alamat: "",
        },
    });

    if (!hasViewSuppliers) {
        return (
            <div className="p-8 text-center bg-white border border-slate-100 rounded-2xl shadow-sm">
                <p className="text-sm font-bold text-slate-800">Akses Ditolak</p>
                <p className="text-xs text-slate-400 mt-1">Anda tidak memiliki izin untuk melihat data supplier.</p>
            </div>
        );
    }

    const handleEdit = (supplier: Supplier) => {
        setEditingSupplier(supplier);
        dialogMethods.reset({
            nama: supplier.nama,
            email: supplier.email || "",
            nomor_telepon: supplier.nomor_telepon || "",
            alamat: supplier.alamat || "",
        });
        setIsDialogOpen(true);
    };

    const handleAddClick = () => {
        setEditingSupplier(null);
        dialogMethods.reset({
            nama: "",
            email: "",
            nomor_telepon: "",
            alamat: "",
        });
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <FormProvider {...dialogMethods}>
                <SupplierList
                    suppliers={suppliersData?.data || []}
                    meta={suppliersData?.meta}
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
                            <FormInput<SupplierFilterValues>
                                name="search"
                                label="Cari Supplier"
                                placeholder="Masukkan nama supplier..."
                            />
                        </FilterForm>
                    }
                />

                <SupplierDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    editingSupplier={editingSupplier}
                />
            </FormProvider>
        </div>
    );
}
