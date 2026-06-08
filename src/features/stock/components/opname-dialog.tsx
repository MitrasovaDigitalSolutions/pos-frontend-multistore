"use client";

import { useEffect } from "react";
import { useForm, useFieldArray, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IconClipboardCheck } from "@tabler/icons-react";
import { toast } from "sonner";
import { opnameSchema, type OpnameInput } from "../schemas/opname-schema";
import { useCreateOpname, useFinalizeOpname } from "../api/stock-api";
import type { Product } from "@/features/products/types";

interface OpnameDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    products: Product[];
}

export function OpnameDialog({
    open,
    onOpenChange,
    products,
}: OpnameDialogProps) {
    const createOpname = useCreateOpname();
    const finalizeOpname = useFinalizeOpname();

    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<OpnameInput>({
        resolver: zodResolver(opnameSchema) as Resolver<OpnameInput>,
        defaultValues: {
            catatan: "",
            status: "draft",
            items: [],
        },
    });

    const { fields } = useFieldArray({
        control,
        name: "items",
    });

    useEffect(() => {
        if (open) {
            reset({
                catatan: "",
                status: "draft",
                items: products.map((p) => ({
                    product_id: p.id,
                    stok_fisik: p.stok,
                    alasan: "Opname rutin",
                })),
            });
        }
    }, [open, products, reset]);

    const isPending = createOpname.isPending || finalizeOpname.isPending;

    const handleSave = (status: "draft" | "completed") => {
        handleSubmit((data) => {
            const payload = {
                ...data,
                status,
            };

            createOpname.mutate(payload, {
                onSuccess: (res) => {
                    if (status === "completed") {
                        // Finalize it
                        const opnameId = res.data.id;
                        finalizeOpname.mutate(
                            {
                                id: opnameId,
                                data: {
                                    status: "completed",
                                    items: data.items,
                                },
                            },
                            {
                                onSuccess: () => {
                                    toast.success(
                                        "Stock opname berhasil difinalisasi & stok diperbarui!",
                                    );
                                    onOpenChange(false);
                                },
                                onError: () => {
                                    toast.warning(
                                        "Draf opname disimpan, namun gagal finalisasi.",
                                    );
                                    onOpenChange(false);
                                },
                            },
                        );
                    } else {
                        toast.success("Draf stock opname berhasil disimpan.");
                        onOpenChange(false);
                    }
                },
                onError: (err) => {
                    toast.error(err.message || "Gagal menyimpan opname.");
                },
            });
        })();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-fit! bg-white rounded-2xl border-slate-100 p-6 flex flex-col max-h-[90vh]">
                <DialogHeader className="pb-4 border-b border-slate-100 shrink-0">
                    <DialogTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <IconClipboardCheck
                            size={20}
                            className="text-emerald-500"
                        />
                        <span>Stock Opname Fisik Ritel</span>
                    </DialogTitle>
                </DialogHeader>

                <form
                    className="flex flex-col flex-1 overflow-hidden min-h-0 pt-4"
                    onSubmit={(e) => e.preventDefault()}
                >
                    <div className="flex-1 overflow-y-auto pr-1 space-y-4 pb-4">
                        {/* Catatan */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                Catatan Opname
                            </label>
                            <Input
                                type="text"
                                placeholder="Contoh: Opname akhir bulan Juni..."
                                className="h-10 text-xs border-slate-200 focus-visible:ring-emerald-600 rounded-xl"
                                disabled={isPending}
                                {...register("catatan")}
                            />
                            {errors.catatan && (
                                <p className="text-[10px] text-rose-500 font-medium">
                                    {errors.catatan.message}
                                </p>
                            )}
                        </div>

                        {/* Opname Items Grid */}
                        <div className="border-t border-slate-100 pt-2 space-y-2">
                            <h5 className="text-xs font-bold text-slate-800 mb-2">
                                Input Perhitungan Fisik Lapangan
                            </h5>
                            <div className="max-h-75 overflow-y-auto space-y-2.5 pr-1">
                                {fields.map((field, idx) => {
                                    const product = products.find(
                                        (p) => p.id === field.product_id,
                                    );
                                    return (
                                        <div
                                            key={field.id}
                                            className="border border-slate-100 p-3 rounded-xl bg-slate-50/50 grid grid-cols-[1.5fr_1fr_1fr_1.5fr] gap-2 items-center"
                                        >
                                            <span className="text-xs font-bold text-slate-800 truncate">
                                                {product?.nama || "Produk Hilang"}
                                            </span>
                                            <span className="text-xs text-slate-400 text-right">
                                                Sistem: {product?.stok || 0} pcs
                                            </span>
                                            <div>
                                                <Input
                                                    type="number"
                                                    placeholder="Fisik"
                                                    className="h-8 text-xs border-slate-200 focus-visible:ring-emerald-600 rounded-lg text-right"
                                                    disabled={isPending}
                                                    {...register(
                                                        `items.${idx}.stok_fisik`,
                                                    )}
                                                />
                                            </div>
                                            <div>
                                                <Input
                                                    type="text"
                                                    placeholder="Alasan selisih..."
                                                    className="h-8 text-xs border-slate-200 focus-visible:ring-emerald-600 rounded-lg"
                                                    disabled={isPending}
                                                    {...register(
                                                        `items.${idx}.alasan`,
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 shrink-0 bg-white">
                        <Button
                            type="button"
                            onClick={() => handleSave("draft")}
                            className="h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center cursor-pointer border-none"
                            disabled={isPending}
                        >
                            Simpan Sebagai Draf
                        </Button>
                        <Button
                            type="button"
                            onClick={() => handleSave("completed")}
                            className="h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center cursor-pointer shadow-sm shadow-emerald-600/15 border-none"
                            disabled={isPending}
                        >
                            Simpan & Finalisasi Stok
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );

}
