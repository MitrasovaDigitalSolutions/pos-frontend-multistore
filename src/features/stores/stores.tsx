"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { IconBuildingStore, IconPlus, IconShieldLock } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { hasPermission, hasRole } from "@/constants/roles";
import { useStores } from "./api/stores-api";
import { StoreTable } from "./components/store-table";
import { StoreFormDialog } from "./components/store-form-dialog";
import { StoreUsersDialog } from "./components/store-users-dialog";
import type { Store } from "./types";

export function Stores() {
    const { data: session } = useSession();
    const userRoles = session?.user?.roles ?? [];
    const userPermissions = session?.user?.permissions ?? [];

    const hasViewStores =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "view_stores") ||
        hasPermission(userRoles, userPermissions, "manage_stores");

    const hasManageStores =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "manage_stores");

    const { data: stores = [], isLoading } = useStores();

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

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center">
                        <IconBuildingStore size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Kelola Toko</h1>
                        <p className="text-sm text-slate-500">Manajemen cabang dan akses toko</p>
                    </div>
                </div>
                {hasManageStores && (
                    <Button onClick={handleAdd} className="gap-2 shadow-sm w-full sm:w-auto">
                        <IconPlus size={18} />
                        <span>Tambah Toko</span>
                    </Button>
                )}
            </div>

            <StoreTable
                stores={stores}
                isLoading={isLoading}
                onEdit={handleEdit}
                onManageUsers={handleManageUsers}
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