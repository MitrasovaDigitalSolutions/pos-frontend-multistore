"use client";

import { useState } from "react";
import { toast } from "sonner";
import { IconTrash } from "@tabler/icons-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
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

export function StoreUsersDialog({ open, onOpenChange, store }: StoreUsersDialogProps) {
    const [selectedUserUids, setSelectedUserUids] = useState<string[]>([]);
    
    // Fetch users for the current store
    const { data: storeUsers = [], isLoading: isLoadingStoreUsers } = useStoreUsers(store?.uid ?? "");
    
    // Fetch all users to populate the multi-select dropdown
    const { data: usersRes, isLoading: isLoadingAllUsers } = useUsers({ per_page: 1000 });
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

    const handleDetach = (userUid: string) => {
        if (!store) return;
        
        if (!confirm("Apakah Anda yakin ingin menghapus user ini dari toko?")) return;

        detachMutation
            .mutateAsync({ storeUid: store.uid, userUid })
            .then(() => {
                toast.success("User berhasil dihapus dari toko");
            })
            .catch((error) => {
                toast.error(error.message || "Gagal menghapus user");
            });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Kelola User - {store?.nama}</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Assignment Section */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium text-slate-700">Tambah User ke Toko</h4>
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
                        <h4 className="text-sm font-medium text-slate-700">User yang Terdaftar</h4>
                        <div className="border border-slate-200 rounded-md overflow-hidden max-h-[300px] overflow-y-auto">
                            {isLoadingStoreUsers ? (
                                <div className="p-4 text-center text-sm text-slate-500">Memuat user...</div>
                            ) : storeUsers.length === 0 ? (
                                <div className="p-4 text-center text-sm text-slate-500">Belum ada user di toko ini</div>
                            ) : (
                                <ul className="divide-y divide-slate-100">
                                    {storeUsers.map((user) => (
                                        <li key={user.uid} className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 transition-colors">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-slate-900">{user.name}</span>
                                                <span className="text-xs text-slate-500">{user.email || user.username}</span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDetach(user.uid)}
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
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Tutup
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}