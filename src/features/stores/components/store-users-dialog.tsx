"use client";

import { useState } from "react";
import { toast } from "sonner";
import { IconTrash } from "@tabler/icons-react";
import { BaseDialog } from "@/components/ui/base-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/ui/multi-select";
import { useStoreUsers, useAssignStoreUsers, useDetachStoreUser } from "../api/stores-api";
import { useUsers } from "@/features/users/api/users-api";
import type { Store } from "../types";
import type { User } from "@/types/auth";

interface StoreUsersDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    store: Store | null;
}

const getInitials = (name: string) => {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
};

const getAvatarBg = (name: string) => {
    const colors = [
        "bg-red-50 text-red-600 border-red-100 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50",
        "bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-900/50",
        "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50",
        "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50",
        "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50",
        "bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/50",
        "bg-violet-50 text-violet-600 border-violet-100 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-900/50",
        "bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100 dark:bg-fuchsia-950/30 dark:text-fuchsia-400 dark:border-fuchsia-900/50",
        "bg-pink-50 text-pink-600 border-pink-100 dark:bg-pink-950/30 dark:text-pink-400 dark:border-pink-900/50",
    ];
    let sum = 0;
    for (let i = 0; i < name.length; i++) {
        sum += name.charCodeAt(i);
    }
    return colors[sum % colors.length];
};

const getRoleBadge = (roles: string[]) => {
    const role = roles[0] || "kasir";
    const label = role.replace("_", " ");
    
    let style = "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800";
    if (role === "admin") {
        style = "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50";
    } else if (role === "manajer_toko") {
        style = "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50";
    } else if (role === "supervisor") {
        style = "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50";
    }
    
    return (
        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold capitalize border shrink-0 leading-none ${style}`}>
            {label}
        </span>
    );
};

export function StoreUsersDialog({ open, onOpenChange, store }: StoreUsersDialogProps) {
    const [selectedUserUids, setSelectedUserUids] = useState<string[]>([]);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [userUidToDetach, setUserUidToDetach] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    
    // Fetch users for the current store
    const { data: storeUsers = [], isLoading: isLoadingStoreUsers } = useStoreUsers(store?.uid ?? "");
    
    // Fetch all users (across stores) to populate the multi-select dropdown
    const { data: usersRes, isLoading: isLoadingAllUsers } = useUsers({ per_page: 1000, all_stores: true });
    const allUsers: User[] = usersRes?.data ?? [];

    const assignMutation = useAssignStoreUsers();
    const detachMutation = useDetachStoreUser();

    // Filter out users that are already assigned to this store
    const availableUsers = allUsers.filter(
        (user) => !storeUsers.some((storeUser) => storeUser.uid === user.uid)
    );

    const userOptions = availableUsers.map((user) => ({
        label: user.name,
        value: user.uid,
    }));

    const filteredStoreUsers = storeUsers.filter((user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAssign = () => {
        if (!store || selectedUserUids.length === 0) return;

        assignMutation
            .mutateAsync({ storeUid: store.uid, user_uids: selectedUserUids })
            .then(() => {
                toast.success("User berhasil ditambahkan ke toko");
                setSelectedUserUids([]);
            })
            .catch((error) => {
                toast.error(error.message || "Gagal menambahkan user");
            });
    };

    const handleDetachClick = (userUid: string) => {
        setUserUidToDetach(userUid);
        setIsDeleteConfirmOpen(true);
    };

    const handleConfirmDetach = async () => {
        if (!store || !userUidToDetach) return;

        try {
            await detachMutation.mutateAsync({ storeUid: store.uid, userUid: userUidToDetach });
            toast.success("User berhasil dihapus dari toko");
            setIsDeleteConfirmOpen(false);
            setUserUidToDetach(null);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Gagal menghapus user";
            toast.error(message);
        }
    };

    return (
        <>
            <BaseDialog
                open={open}
                onOpenChange={onOpenChange}
                title={`Kelola User - ${store?.nama}`}
                className="max-w-[500px]"
            >
                <div className="space-y-6 pt-4">
                    {/* Assignment Section */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-slate-700">Tambah User ke Toko</h4>
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <MultiSelect
                                    options={userOptions}
                                    value={selectedUserUids}
                                    onChange={setSelectedUserUids}
                                    placeholder="Pilih user..."
                                    disabled={isLoadingAllUsers || availableUsers.length === 0}
                                />
                            </div>
                            <Button
                                onClick={handleAssign}
                                disabled={selectedUserUids.length === 0 || assignMutation.isPending}
                            >
                                Tambah
                            </Button>
                        </div>
                    </div>

                    {/* Current Users List */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-slate-700">User yang Terdaftar</h4>
                            {storeUsers.length > 0 && (
                                <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded-full">
                                    {filteredStoreUsers.length} dari {storeUsers.length}
                                </span>
                            )}
                        </div>

                        {storeUsers.length > 0 && (
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Cari user terdaftar..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full h-8 px-3 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 placeholder-slate-400"
                                />
                            </div>
                        )}

                        <div className="border border-slate-200 rounded-lg overflow-hidden max-h-[300px] overflow-y-auto p-1 bg-white">
                            {isLoadingStoreUsers ? (
                                <div className="p-4 text-center text-sm text-slate-500">Memuat user...</div>
                            ) : storeUsers.length === 0 ? (
                                <div className="p-4 text-center text-sm text-slate-500">Belum ada user di toko ini</div>
                            ) : filteredStoreUsers.length === 0 ? (
                                <div className="p-4 text-center text-sm text-slate-500">Tidak ada user yang cocok</div>
                            ) : (
                                <ul className="space-y-1">
                                    {filteredStoreUsers.map((user) => (
                                        <li key={user.uid} className="flex items-center justify-between p-2.5 hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 rounded-md">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 ${getAvatarBg(user.name)}`}>
                                                    {getInitials(user.name)}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-semibold text-slate-900 truncate">
                                                            {user.name}
                                                        </span>
                                                        {getRoleBadge(user.roles || [])}
                                                    </div>
                                                    <span className="text-xs text-slate-500 truncate">
                                                        {user.email || user.username}
                                                    </span>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDetachClick(user.uid)}
                                                disabled={detachMutation.isPending}
                                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <IconTrash size={16} />
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-100 mt-6">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Tutup
                        </Button>
                    </div>
                </div>
            </BaseDialog>

            <ConfirmDialog
                open={isDeleteConfirmOpen}
                onOpenChange={setIsDeleteConfirmOpen}
                title="Hapus Akses User"
                description="Apakah Anda yakin ingin menghapus akses user ini dari toko?"
                confirmText="Ya, Hapus"
                cancelText="Batal"
                variant="danger"
                isLoading={detachMutation.isPending}
                onConfirm={handleConfirmDetach}
            />
        </>
    );
}