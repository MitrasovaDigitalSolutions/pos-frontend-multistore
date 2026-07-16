"use client";

import { FilterForm } from "@/components/forms/filter-form";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { hasRole } from "@/constants/roles";
import { IconShieldLock } from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useStores } from "./api/stores-api";
import { StoreFormDialog } from "./components/store-form-dialog";
import { StoreTable } from "./components/store-table";
import { StoreUsersDialog } from "./components/store-users-dialog";
import type { Store } from "./types";

interface StoreFilterValues {
    search: string;
    status: string;
}

export function Stores() {
    const { data: session } = useSession();
    const userRoles = session?.user?.roles ?? [];
    const hasViewStores = hasRole(userRoles, "admin");
    const hasManageStores = hasRole(userRoles, "admin");

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [sortBy, setSortBy] = useState<string | undefined>("nama");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>("asc");
    const [appliedFilters, setAppliedFilters] = useState<{
        search?: string;
        status?: string;
    }>({});

    const filterMethods = useForm<StoreFilterValues>({
        defaultValues: {
            search: "",
            status: "all",
        },
    });

    const handleFilterSubmit = (data: StoreFilterValues) => {
        setAppliedFilters({
            search: data.search || undefined,
            status: data.status !== "all" ? data.status : undefined,
        });
        setPage(1);
    };

    const handleFilterReset = () => {
        filterMethods.reset({
            search: "",
            status: "all",
        });
        setAppliedFilters({});
        setPage(1);
    };

    const { data: storesData, isLoading, isFetching } = useStores({
        page,
        per_page: perPage,
        sort_by: sortBy,
        sort_order: sortOrder,
        ...appliedFilters,
    });

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingStore, setEditingStore] = useState<Store | null>(null);

    const [isUsersOpen, setIsUsersOpen] = useState(false);
    const [managingStoreUsers, setManagingStoreUsers] = useState<Store | null>(null);

    if (!hasViewStores) {
        return (
            <div className="p-8 flex flex-col items-center justify-center text-center min-h-[400px] bg-white rounded-xl border border-slate-200 shadow-sm mx-4 md:mx-8 mt-6">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-4">
                    <IconShieldLock size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Akses Ditolak</h3>
                <p className="text-slate-500 max-w-md">
                    Anda tidak memiliki izin untuk melihat halaman ini. Hubungi administrator
                    sistem jika Anda merasa ini adalah sebuah kesalahan.
                </p>
            </div>
        );
    }

    const handleAdd = () => {
        setEditingStore(null);
        setIsFormOpen(true);
    };

    const handleEdit = (store: Store) => {
        setEditingStore(store);
        setIsFormOpen(true);
    };

    const handleManageUsers = (store: Store) => {
        setManagingStoreUsers(store);
        setIsUsersOpen(true);
    };

    const statusOptions = [
        { value: "all", label: "Semua Status" },
        { value: "active", label: "Aktif" },
        { value: "inactive", label: "Nonaktif" },
    ];

    return (
        <div className="space-y-6">
            <StoreTable
                stores={storesData?.data || []}
                meta={storesData?.meta}
                page={page}
                perPage={perPage}
                onPageChange={setPage}
                onPerPageChange={setPerPage}
                onEdit={handleEdit}
                onManageUsers={handleManageUsers}
                onAddClick={handleAdd}
                hasManageStores={hasManageStores}
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
                        <FormInput<StoreFilterValues>
                            name="search"
                            label="Cari Toko"
                            placeholder="Cari nama, alamat, telepon..."
                        />
                        <FormSelect<StoreFilterValues>
                            name="status"
                            label="Status"
                            options={statusOptions}
                            placeholder="Semua Status"
                        />
                    </FilterForm>
                }
            />

            <StoreFormDialog
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                editingStore={editingStore}
            />

            <StoreUsersDialog
                open={isUsersOpen}
                onOpenChange={setIsUsersOpen}
                store={managingStoreUsers}
            />
        </div>
    );
}