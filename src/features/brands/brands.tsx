"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { hasRole, hasPermission } from "@/constants/roles";
import { useBrands } from "./api/brands-api";
import { BrandList } from "./components/brand-list";
import { BrandDialog } from "./components/brand-dialog";
import { brandSchema, type BrandInput } from "./schemas/brand-schema";
import type { Brand } from "./types";

export function Brands() {
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

    const { data: brandsData, isLoading, isFetching } = useBrands({
        page,
        per_page: perPage,
        search: debouncedSearch || undefined,
    });

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

    const methods = useForm<BrandInput>({
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
        methods.reset({
            nama: brand.nama,
            deskripsi: brand.deskripsi || "",
        });
        setIsDialogOpen(true);
    };

    const handleAddClick = () => {
        setEditingBrand(null);
        methods.reset({
            nama: "",
            deskripsi: "",
        });
        setIsDialogOpen(true);
    };

    return (
        <FormProvider {...methods}>
            <div className="space-y-6">
                <BrandList
                    brands={brandsData?.data || []}
                    meta={brandsData?.meta}
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

                <BrandDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    editingBrand={editingBrand}
                />
            </div>
        </FormProvider>
    );
}
