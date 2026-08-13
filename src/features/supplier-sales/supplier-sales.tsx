"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { hasPermission, hasRole } from "@/constants/roles";
import { AccessDeniedState } from "@/components/ui/access-denied-state";
import { FilterForm } from "@/components/forms/filter-form";
import { FormInput } from "@/components/forms/form-input";
import { useSupplierSales } from "./api/supplier-sales-api";
import { SupplierSalesList } from "./components/supplier-sales-list";
import { SupplierSalesDialog } from "./components/supplier-sales-dialog";
import { SupplierSaleItemsDialog } from "./components/supplier-sales-items-dialog";
import { supplierSalesSchema, type SupplierSalesInput } from "./schemas/supplier-sales-schema";
import type { SupplierSale } from "./types";

interface FilterValues {
    search: string;
}

export function SupplierSales() {
    const { data: session } = useSession();
    const userRoles = session?.user?.roles || [];
    const userPermissions = session?.user?.permissions || [];
    const canAccess =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "view_request_transfers") ||
        hasPermission(userRoles, userPermissions, "manage_request_transfers");

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const filterMethods = useForm<FilterValues>({ defaultValues: { search: "" } });

    const handleFilterSubmit = (data: FilterValues) => {
        setDebouncedSearch(data.search);
        setPage(1);
    };

    const handleFilterReset = () => {
        filterMethods.reset({ search: "" });
        setDebouncedSearch("");
        setPage(1);
    };

    const { data: salesData, isLoading, isFetching } = useSupplierSales({
        page,
        per_page: perPage,
        search: debouncedSearch || undefined,
    });

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSale, setEditingSale] = useState<SupplierSale | null>(null);
    const [itemsSale, setItemsSale] = useState<SupplierSale | null>(null);

    const dialogMethods = useForm<SupplierSalesInput>({
        resolver: zodResolver(supplierSalesSchema) as Resolver<SupplierSalesInput>,
        defaultValues: {
            supplier_uid: "",
            nama: "",
            keterangan: null,
            status: "active",
        },
    });

    if (!canAccess) {
        return (
            <AccessDeniedState description="Halaman katalog sales supplier hanya dapat diakses oleh pengguna dengan akses request transfer." />
        );
    }

    const handleEdit = (sale: SupplierSale) => {
        setEditingSale(sale);
        dialogMethods.reset({
            supplier_uid: sale.supplier_uid,
            nama: sale.nama,
            keterangan: sale.keterangan || null,
            status: sale.status,
        });
        setIsDialogOpen(true);
    };

    const handleAddClick = () => {
        setEditingSale(null);
        dialogMethods.reset({
            supplier_uid: "",
            nama: "",
            keterangan: null,
            status: "active",
        });
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <FormProvider {...dialogMethods}>
                <SupplierSalesList
                    sales={salesData?.data || []}
                    meta={salesData?.meta}
                    page={page}
                    perPage={perPage}
                    onPageChange={setPage}
                    onPerPageChange={setPerPage}
                    onEdit={handleEdit}
                    onManageItems={setItemsSale}
                    onAddClick={handleAddClick}
                    isLoading={isLoading}
                    isFetching={isFetching}
                    filterElement={
                        <FilterForm
                            methods={filterMethods}
                            onSubmit={handleFilterSubmit}
                            onReset={handleFilterReset}
                        >
                            <FormInput<FilterValues>
                                name="search"
                                label="Cari Katalog"
                                placeholder="Cari nama katalog atau supplier..."
                            />
                        </FilterForm>
                    }
                />

                <SupplierSalesDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    editingSale={editingSale}
                />
            </FormProvider>

            <SupplierSaleItemsDialog
                sale={itemsSale}
                open={!!itemsSale}
                onOpenChange={(open) => {
                    if (!open) setItemsSale(null);
                }}
            />
        </div>
    );
}
