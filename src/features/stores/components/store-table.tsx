"use client";

import { IconEdit, IconUsers } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Store } from "../types";

interface StoreTableProps {
    stores: Store[];
    isLoading: boolean;
    onEdit: (store: Store) => void;
    onManageUsers: (store: Store) => void;
}

export function StoreTable({ stores, isLoading, onEdit, onManageUsers }: StoreTableProps) {
    if (isLoading) {
        return <div className="text-center py-8 text-slate-500">Memuat data toko...</div>;
    }

    if (stores.length === 0) {
        return <div className="text-center py-8 text-slate-500">Belum ada toko yang ditambahkan.</div>;
    }

    return (
        <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50/80 hover:bg-slate-50/80 border-b border-slate-200">
                            <TableHead className="font-semibold text-slate-700 h-11">Nama</TableHead>
                            <TableHead className="font-semibold text-slate-700 h-11">Alamat</TableHead>
                            <TableHead className="font-semibold text-slate-700 h-11">Telepon</TableHead>
                            <TableHead className="font-semibold text-slate-700 h-11 text-center">Jumlah User</TableHead>
                            <TableHead className="font-semibold text-slate-700 h-11">Status</TableHead>
                            <TableHead className="font-semibold text-slate-700 h-11 text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {stores.map((store) => (
                            <TableRow key={store.uid} className="hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors">
                                <TableCell className="font-medium text-slate-900 py-3">{store.nama}</TableCell>
                                <TableCell className="text-slate-600 py-3">{store.alamat || "-"}</TableCell>
                                <TableCell className="text-slate-600 py-3">{store.telepon || "-"}</TableCell>
                                <TableCell className="text-center text-slate-600 py-3">
                                        <div className="inline-flex items-center justify-center min-w-[2rem] h-6 rounded-full bg-slate-100 text-xs font-bold">
                                        {store.users_count ?? 0}
                                    </div>
                                </TableCell>
                                <TableCell className="py-3">
                                    <Badge variant={store.is_active ? "default" : "secondary"}>
                                        {store.is_active ? "Aktif" : "Nonaktif"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right py-3">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onManageUsers(store)}
                                            className="h-8 gap-1.5 px-2.5 text-slate-600 hover:text-brand-600 hover:bg-brand-50 border-slate-200"
                                        >
                                            <IconUsers size={14} />
                                            <span className="hidden sm:inline">Kelola User</span>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onEdit(store)}
                                            className="h-8 gap-1.5 px-2.5 text-slate-600 hover:text-brand-600 hover:bg-brand-50 border-slate-200"
                                        >
                                            <IconEdit size={14} />
                                            <span className="hidden sm:inline">Edit</span>
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}