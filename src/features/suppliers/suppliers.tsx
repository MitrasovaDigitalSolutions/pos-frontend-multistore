"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { hasRole, hasPermission } from "@/constants/roles";
import { useSuppliers } from "./api/suppliers-api";
import { SupplierList } from "./components/supplier-list";
import { SupplierDialog } from "./components/supplier-dialog";
import { supplierSchema, type SupplierInput } from "./schemas/supplier-schema";
import type { Supplier } from "./types";

export function Suppliers() {
    const { data: session } = useSession();
    const userRoles = session?.user?.roles || [];
    const userPermissions = session?.user?.permissions || [];

    const hasViewSuppliers =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "view_suppliers");

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

    const { data: suppliersData, isLoading, isFetching } = useSuppliers({
        page,
        per_page: perPage,
        search: debouncedSearch || undefined,
    });

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

    const methods = useForm<SupplierInput>({
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
        methods.reset({
            nama: supplier.nama,
            email: supplier.email || "",
            nomor_telepon: supplier.nomor_telepon || "",
            alamat: supplier.alamat || "",
        });
        setIsDialogOpen(true);
    };

    const handleAddClick = () => {
        setEditingSupplier(null);
        methods.reset({
            nama: "",
            email: "",
            nomor_telepon: "",
            alamat: "",
        });
        setIsDialogOpen(true);
    };

    return (
        <FormProvider {...methods}>
            <div className="space-y-6">
                <SupplierList
                    suppliers={suppliersData?.data || []}
                    meta={suppliersData?.meta}
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

                <SupplierDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    editingSupplier={editingSupplier}
                />
            </div>
        </FormProvider>
    );
}
