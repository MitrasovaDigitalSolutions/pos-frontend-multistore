"use client";

import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IconPlus } from "@tabler/icons-react";
import { toast } from "sonner";
import { productSchema, type ProductInput } from "../schemas/product-schema";
import { useCreateProduct, useUpdateProduct } from "../api/products-api";
import type { Product } from "../types";

interface ProductFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingProduct: Product | null;
}

export function ProductFormDialog({
    open,
    onOpenChange,
    editingProduct,
}: ProductFormDialogProps) {
    const createProduct = useCreateProduct();
    const updateProduct = useUpdateProduct();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ProductInput>({
        resolver: zodResolver(productSchema) as Resolver<ProductInput>,
    });

    // Reset form when editingProduct or open status changes
    useEffect(() => {
        if (open) {
            if (editingProduct) {
                reset({
                    nama: editingProduct.nama,
                    merek: editingProduct.merek,
                    barcode: editingProduct.barcode || "",
                    harga: editingProduct.harga,
                    stok: editingProduct.stok,
                });
            } else {
                reset({
                    nama: "",
                    merek: "",
                    barcode: "",
                    harga: 0,
                    stok: 0,
                });
            }
        }
    }, [editingProduct, open, reset]);

    const isPending = createProduct.isPending || updateProduct.isPending;

    const onSubmit = (data: ProductInput) => {
        if (editingProduct) {
            updateProduct.mutate(
                { id: editingProduct.id, data },
                {
                    onSuccess: (res) => {
                        toast.success(
                            res.message || "Produk berhasil diperbarui!",
                        );
                        onOpenChange(false);
                    },
                    onError: (err) => {
                        toast.error(err.message || "Gagal memperbarui produk.");
                    },
                },
            );
        } else {
            createProduct.mutate(data, {
                onSuccess: (res) => {
                    toast.success(
                        res.message || "Produk berhasil ditambahkan!",
                    );
                    onOpenChange(false);
                },
                onError: (err) => {
                    toast.error(err.message || "Gagal menambahkan produk.");
                },
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-110 bg-white rounded-2xl border-slate-100 p-6">
                <DialogHeader className="pb-4 border-b border-slate-100">
                    <DialogTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <IconPlus size={20} className="text-emerald-500" />
                        <span>
                            {editingProduct
                                ? "Edit Detail Produk"
                                : "Tambah Produk Baru"}
                        </span>
                    </DialogTitle>
                </DialogHeader>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-4 pt-4"
                >
                    {/* Barcode */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            Barcode / SKU
                        </label>
                        <Input
                            type="text"
                            placeholder="Contoh: 8990002004"
                            className="h-10 text-xs border-slate-200 focus-visible:ring-emerald-600 rounded-xl"
                            disabled={isPending}
                            {...register("barcode")}
                        />
                        {errors.barcode && (
                            <p className="text-[10px] text-rose-500 font-medium">
                                {errors.barcode.message}
                            </p>
                        )}
                    </div>

                    {/* Nama Produk */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            Nama Produk
                        </label>
                        <Input
                            type="text"
                            placeholder="Nama produk lengkap..."
                            className="h-10 text-xs border-slate-200 focus-visible:ring-emerald-600 rounded-xl"
                            disabled={isPending}
                            {...register("nama")}
                        />
                        {errors.nama && (
                            <p className="text-[10px] text-rose-500 font-medium">
                                {errors.nama.message}
                            </p>
                        )}
                    </div>

                    {/* Merek */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            Merek
                        </label>
                        <Input
                            type="text"
                            placeholder="Merek produk..."
                            className="h-10 text-xs border-slate-200 focus-visible:ring-emerald-600 rounded-xl"
                            disabled={isPending}
                            {...register("merek")}
                        />
                        {errors.merek && (
                            <p className="text-[10px] text-rose-500 font-medium">
                                {errors.merek.message}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {/* Harga */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                Harga Jual (Rp)
                            </label>
                            <Input
                                type="number"
                                placeholder="3500"
                                className="h-10 text-xs border-slate-200 focus-visible:ring-emerald-600 rounded-xl"
                                disabled={isPending}
                                {...register("harga")}
                            />
                            {errors.harga && (
                                <p className="text-[10px] text-rose-500 font-medium">
                                    {errors.harga.message}
                                </p>
                            )}
                        </div>

                        {/* Stok */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                Stok
                            </label>
                            <Input
                                type="number"
                                placeholder="50"
                                className="h-10 text-xs border-slate-200 focus-visible:ring-emerald-600 rounded-xl"
                                disabled={isPending}
                                {...register("stok")}
                            />
                            {errors.stok && (
                                <p className="text-[10px] text-rose-500 font-medium">
                                    {errors.stok.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white rounded-xl flex items-center justify-center gap-1.5 cursor-pointer mt-4"
                        disabled={isPending}
                    >
                        {isPending ? "Menyimpan..." : "Simpan Produk"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
