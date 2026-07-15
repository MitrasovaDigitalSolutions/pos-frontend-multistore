"use client";

import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { FormSwitch } from "@/components/forms/form-switch";
import { IconBuildingStore, IconPlus, IconEdit, IconTrash } from "@tabler/icons-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

import type { Product, ProductStore } from "../types";
import {
    useProductStores,
    useAssignProductStore,
    useUpdateProductStore,
    useDetachProductStore,
} from "../api/product-store-api";
import { useStores } from "@/features/stores/api/stores-api";
import { ApiError } from "@/shared/errors/api-error";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface ProductStoreDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: Product | null;
}

const formSchema = z.object({
    store_uid: z.string().min(1, "Toko wajib dipilih"),
    stok: z.coerce.number().min(0, "Stok tidak boleh negatif").default(0),
    harga_beli: z.coerce.number().min(0).nullable().optional(),
    harga_jual: z.coerce.number().min(0).nullable().optional(),
    margin: z.coerce.number().min(0).nullable().optional(),
    is_active: z.boolean().default(true),
});
type ProductStoreFormValues = z.infer<typeof formSchema>;

export function ProductStoreDialog({ open, onOpenChange, product }: ProductStoreDialogProps) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingStore, setEditingStore] = useState<ProductStore | null>(null);
    const [storeToRemove, setStoreToRemove] = useState<ProductStore | null>(null);

    const { data: assignments = [], isLoading: isLoadingAssignments } = useProductStores(open ? product?.uid : undefined);
    const { data: storesResponse } = useStores();
    const stores = storesResponse || [];

    const assignMutation = useAssignProductStore();
    const updateMutation = useUpdateProductStore();
    const detachMutation = useDetachProductStore();

    const storeMap = useMemo(() => {
        const map = new Map<string, string>();
        stores.forEach(s => map.set(s.uid, s.nama));
        return map;
    }, [stores]);

    const formMethods = useForm<ProductStoreFormValues>({
        resolver: zodResolver(formSchema) as Resolver<ProductStoreFormValues>,
        defaultValues: {
            store_uid: "",
            stok: 0,
            harga_beli: null,
            harga_jual: null,
            margin: null,
            is_active: true,
        },
    });

    const { handleSubmit, reset, setError } = formMethods;

    useEffect(() => {
        if (!isFormOpen) {
            setEditingStore(null);
            reset({
                store_uid: "",
                stok: 0,
                harga_beli: null,
                harga_jual: null,
                margin: null,
                is_active: true,
            });
        }
    }, [isFormOpen, reset]);

    const handleOpenForm = (store?: ProductStore) => {
        if (store) {
            setEditingStore(store);
            reset({
                store_uid: store.store_uid,
                stok: store.stok,
                harga_beli: store.harga_beli,
                harga_jual: store.harga_jual,
                margin: store.margin,
                is_active: store.status === "active",
            });
        } else {
            setEditingStore(null);
            reset({
                store_uid: "",
                stok: 0,
                harga_beli: null,
                harga_jual: null,
                margin: null,
                is_active: true,
            });
        }
        setIsFormOpen(true);
    };

    const onSubmit = (data: ProductStoreFormValues) => {
        if (!product) return;

        const payload = {
            productUid: product.uid,
            store_uid: data.store_uid,
            stok: data.stok,
            harga_beli: data.harga_beli ?? undefined,
            harga_jual: data.harga_jual ?? undefined,
            margin: data.margin ?? undefined,
            status: (data.is_active ? "active" : "inactive") as "active" | "inactive",
        };

        const action = editingStore
            ? updateMutation.mutateAsync({ ...payload, storeUid: editingStore.store_uid })
            : assignMutation.mutateAsync(payload);

        action
            .then(() => {
                toast.success(editingStore ? "Berhasil diperbarui" : "Toko berhasil ditambahkan");
                setIsFormOpen(false);
            })
            .catch((error) => {
                if (error instanceof ApiError && error.errors) {
                    Object.entries(error.errors).forEach(([field, messages]) => {
                        setError(field as keyof ProductStoreFormValues, {
                            type: "server",
                            message: messages[0],
                        });
                    });
                } else {
                    toast.error(error.message || "Terjadi kesalahan");
                }
            });
    };

    const handleRemove = () => {
        if (!product || !storeToRemove) return;

        detachMutation.mutateAsync({ productUid: product.uid, storeUid: storeToRemove.store_uid })
            .then(() => {
                toast.success("Toko berhasil dihapus dari produk");
                setStoreToRemove(null);
            })
            .catch((error) => {
                toast.error(error.message || "Terjadi kesalahan");
            });
    };

    const unassignedStores = stores.filter(
        s => !assignments.some(a => a.store_uid === s.uid) || (editingStore && editingStore.store_uid === s.uid)
    ).map(s => ({ value: s.uid, label: s.nama }));

    return (
        <>
            <Dialog open={open && !isFormOpen} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <IconBuildingStore className="h-5 w-5 text-brand-600" />
                            Kelola Toko: {product?.nama}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="py-4 space-y-4">
                        <div className="flex justify-end">
                            <Button onClick={() => handleOpenForm()} size="sm" className="gap-2">
                                <IconPlus className="h-4 w-4" />
                                Tambah Toko
                            </Button>
                        </div>

                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Toko</TableHead>
                                        <TableHead className="text-right">Stok</TableHead>
                                        <TableHead className="text-right">Harga Jual</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoadingAssignments ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-4">Memuat...</TableCell>
                                        </TableRow>
                                    ) : assignments.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">Belum ada toko yang ditugaskan</TableCell>
                                        </TableRow>
                                    ) : (
                                        assignments.map((store) => (
                                            <TableRow key={store.store_uid}>
                                                <TableCell className="font-medium">{storeMap.get(store.store_uid) || "Unknown"}</TableCell>
                                                <TableCell className="text-right">{store.stok}</TableCell>
                                                <TableCell className="text-right">{store.harga_jual ? formatRupiah(store.harga_jual) : "-"}</TableCell>
                                                <TableCell>
                                                    <Badge variant={store.status === "active" ? "default" : "secondary"}>
                                                        {store.status === "active" ? "Aktif" : "Nonaktif"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" onClick={() => handleOpenForm(store)}>
                                                        <IconEdit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => setStoreToRemove(store)}>
                                                        <IconTrash className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{editingStore ? "Edit Penugasan Toko" : "Tambah Penugasan Toko"}</DialogTitle>
                    </DialogHeader>

                    <FormProvider {...formMethods}>
                        <form id="product-store-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                            <FormSelect<ProductStoreFormValues>
                                name="store_uid"
                                label="Toko"
                                options={unassignedStores}
                                disabled={!!editingStore}
                            />

                            <FormInput<ProductStoreFormValues>
                                name="stok"
                                label="Stok"
                                type="number"
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormInput<ProductStoreFormValues>
                                    name="harga_beli"
                                    label="Harga Beli"
                                    type="number"
                                />
                                <FormInput<ProductStoreFormValues>
                                    name="margin"
                                    label="Margin (%)"
                                    type="number"
                                />
                            </div>

                            <FormInput<ProductStoreFormValues>
                                name="harga_jual"
                                label="Harga Jual"
                                type="number"
                            />

                            <FormSwitch
                                name="is_active"
                                label="Status"
                                description="Toko ini dapat menjual produk ini"
                            />
                        </form>
                    </FormProvider>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsFormOpen(false)} disabled={assignMutation.isPending || updateMutation.isPending}>
                            Batal
                        </Button>
                        <Button type="submit" form="product-store-form" disabled={assignMutation.isPending || updateMutation.isPending}>
                            {(assignMutation.isPending || updateMutation.isPending) ? "Menyimpan..." : "Simpan"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={!!storeToRemove}
                onOpenChange={(o) => { if (!o) setStoreToRemove(null); }}
                onConfirm={handleRemove}
                title="Hapus Toko"
                description={`Apakah Anda yakin ingin menghapus toko ini dari produk ${product?.nama}? Transaksi yang sudah ada tidak akan terpengaruh.`}
                confirmText="Hapus"
                cancelText="Batal"
                variant="danger"
                isLoading={detachMutation.isPending}
            />
        </>
    );
}
