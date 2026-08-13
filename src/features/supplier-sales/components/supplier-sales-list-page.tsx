"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { hasPermission, hasRole } from "@/constants/roles";
import { AccessDeniedState } from "@/components/ui/access-denied-state";
import { FilterForm } from "@/components/forms/filter-form";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { useAllSuppliers } from "@/features/master/suppliers/api/suppliers-api";
import { useSupplierSales } from "../api/supplier-sales-api";
import { SupplierSalesList } from "./supplier-sales-list";
import { SupplierSalesDialog } from "./supplier-sales-dialog";
import { SupplierSaleItemsDialog } from "./supplier-sales-items-dialog";
import { supplierSalesSchema, type SupplierSalesInput } from "../schemas/supplier-sales-schema";
import type { SupplierSale } from "../types";

interface FilterValues {
    search: string;
    supplier_uid: string;
}

export function SupplierSalesListPage() {
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
    const [supplierUid, setSupplierUid] = useState("");

    const { data: suppliers, isLoading: isLoadingSuppliers } = useAllSuppliers();

    const filterMethods = useForm<FilterValues>({ defaultValues: { search: "", supplier_uid: "" } });

    const handleFilterSubmit = (data: FilterValues) => {
        setDebouncedSearch(data.search);
        setSupplierUid(data.supplier_uid);
        setPage(1);
    };

    const handleFilterReset = () => {
        filterMethods.reset({ search: "", supplier_uid: "" });
        setDebouncedSearch("");
        setSupplierUid("");
        setPage(1);
    };

    const { data: salesData, isLoading, isFetching } = useSupplierSales({
        page,
        per_page: perPage,
        search: debouncedSearch || undefined,
        supplier_uid: supplierUid || undefined,
    });

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSale, setEditingSale] = useState<SupplierSale | null>(null);
    const [itemsSale, setItemsSale] = useState<SupplierSale | null>(null);

    const dialogMethods = useForm<SupplierSalesInput>({
        resolver: zodResolver(supplierSalesSchema) as Resolver<SupplierSalesInput>,
        defaultValues: {
            supplier_uid: "",
            nama: "",
            keterangan: "",
            status: "active",
        },
    });

    if (!canAccess) {
        return (
            <AccessDeniedState description="Halaman sales supplier hanya dapat diakses oleh pengguna dengan akses request transfer." />
        );
    }

    const handleEdit = (sale: SupplierSale) => {
        setEditingSale(sale);
        dialogMethods.reset({
            supplier_uid: sale.supplier_uid,
            nama: sale.nama,
            keterangan: sale.keterangan || "",
            status: sale.status,
        });
        setIsDialogOpen(true);
    };

    const handleAddClick = () => {
        setEditingSale(null);
        dialogMethods.reset({
            supplier_uid: "",
            nama: "",
            keterangan: "",
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
                                label="Cari Sales"
                                placeholder="Cari nama sales..."
                            />
                            <FormSelect<FilterValues>
                                name="supplier_uid"
                                label="Supplier"
                                placeholder="Semua supplier"
                                searchPlaceholder="Cari supplier..."
                                isLoading={isLoadingSuppliers}
                                options={[
                                    { value: "", label: "Semua Supplier" },
                                    ...(suppliers || []).map((s) => ({ value: s.uid, label: s.nama })),
                                ]}
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
