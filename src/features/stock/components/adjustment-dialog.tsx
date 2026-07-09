"use client";

import { useEffect, useState, useMemo } from "react";
import { useForm, FormProvider, type Resolver, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BaseDialog } from "@/components/ui/base-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IconActivity } from "@tabler/icons-react";
import { toast } from "sonner";
import { FormNumberInput } from "@/components/forms/form-number-input";
import {
    adjustmentSchema,
    type AdjustmentInput,
} from "../schemas/adjustment-schema";
import { useCreateAdjustment } from "../api/stock-api";
import { useProducts } from "@/features/products/api/products-api";
import type { Product } from "@/features/products/types";
import { FilterForm } from "@/components/forms/filter-form";
import { FormInput } from "@/components/forms/form-input";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";

interface AdjustmentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface ProductSearchValues {
    search: string;
}

export function AdjustmentDialog({
    open,
    onOpenChange,
}: AdjustmentDialogProps) {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [sortBy, setSortBy] = useState<string | undefined>("nama");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>("asc");

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    // Reset states on dialog open/close transitions
    const [prevOpen, setPrevOpen] = useState(open);
    if (open !== prevOpen) {
        setPrevOpen(open);
        if (open) {
            setSearch("");
            setPage(1);
            setSortBy("nama");
            setSortOrder("asc");
            setSelectedProduct(null);
            setIsFormOpen(false);
        }
    }

    const { data: productsData, isLoading: isProductsLoading } = useProducts({
        search: search || undefined,
        page: page,
        per_page: 5,
        sort_by: sortBy,
        sort_order: sortOrder,
    });

    const products = productsData?.data || [];

    const filterMethods = useForm<ProductSearchValues>({
        defaultValues: {
            search: "",
        },
    });

    const handleFilterSubmit = (data: ProductSearchValues) => {
        setSearch(data.search);
        setPage(1);
    };

    const handleFilterReset = () => {
        filterMethods.reset({ search: "" });
        setSearch("");
        setPage(1);
    };

    const columns = useMemo<ColumnDef<Product>[]>(
        () => [
            {
                accessorKey: "barcode",
                header: "Barcode / SKU",
                enableSorting: false,
                cell: ({ row }) => (
                    <span className="font-mono text-slate-500 text-xs">
                        {row.original.barcode || "-"}
                    </span>
                ),
                size: 120,
            },
            {
                accessorKey: "nama",
                header: "Nama Produk",
                cell: ({ row }) => (
                    <span className="font-semibold text-slate-800 text-xs">
                        {row.original.nama}
                    </span>
                ),
                size: 240,
            },
            {
                accessorKey: "stok",
                header: "Stok",
                meta: {
                    headerClassName: "text-right pr-4",
                    cellClassName: "text-right font-semibold text-slate-700 text-xs pr-4",
                },
                size: 80,
                cell: ({ row }) => row.original.stok,
            },
        ],
        []
    );

    return (
        <>
            <BaseDialog
                open={open}
                onOpenChange={onOpenChange}
                title={
                    <>
                        <IconActivity size={20} className="text-amber-500" />
                        <span>Pilih Produk untuk Penyesuaian Stok</span>
                    </>
                }
                className="sm:max-w-3xl"
                scrollable={true}
            >
                <div className="flex flex-col flex-1 overflow-hidden">
                    {/* Reusable FilterForm */}
                    <FilterForm<ProductSearchValues>
                        methods={filterMethods}
                        onSubmit={handleFilterSubmit}
                        onReset={handleFilterReset}
                        className="mt-0"
                    >
                        <FormInput<ProductSearchValues>
                            name="search"
                            placeholder="Cari barcode, nama, atau merek..."
                        />
                    </FilterForm>

                    {/* DataTable */}
                    <div className="min-h-[280px]">
                        <DataTable<Product, unknown>
                            columns={columns}
                            data={products}
                            isLoading={isProductsLoading}
                            page={page}
                            perPage={5}
                            onPageChange={setPage}
                            meta={productsData?.meta}
                            entityName="produk"
                            sortBy={sortBy}
                            sortOrder={sortOrder}
                            onSortChange={(by, order) => {
                                setSortBy(by);
                                setSortOrder(order);
                                setPage(1);
                            }}
                            extraActions={(p) => (
                                <Button
                                    type="button"
                                    onClick={() => {
                                        setSelectedProduct(p);
                                        setIsFormOpen(true);
                                    }}
                                    className="h-8 px-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] rounded-xl cursor-pointer shadow-sm border-none"
                                >
                                    Sesuaikan
                                </Button>
                            )}
                            virtualize={false}
                        />
                    </div>
                </div>
            </BaseDialog>

            {/* Step 2: Form Popup Dialog */}
            <AdjustmentFormDialog
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                product={selectedProduct}
            />
        </>
    );
}

interface AdjustmentFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: Product | null;
}

export function AdjustmentFormDialog({
    open,
    onOpenChange,
    product,
}: AdjustmentFormDialogProps) {
    const createAdjustment = useCreateAdjustment();

    const methods = useForm<AdjustmentInput>({
        resolver: zodResolver(adjustmentSchema) as Resolver<AdjustmentInput>,
        defaultValues: {
            product_uid: "",
            kuantitas: 0,
            alasan: "",
        },
    });

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = methods;

    // Reset values when a new product is selected
    useEffect(() => {
        if (open && product) {
            reset({
                product_uid: product.uid,
                kuantitas: 0,
                alasan: "",
            });
        }
    }, [open, product, reset]);

    const isPending = createAdjustment.isPending;

    const onSubmit = (data: AdjustmentInput) => {
        createAdjustment.mutate(data, {
            onSuccess: () => {
                toast.success("Penyesuaian stok manual berhasil disimpan!");
                onOpenChange(false);
            },
            onError: (err) => {
                toast.error(err.message || "Gagal melakukan penyesuaian.");
            },
        });
    };

    const onErrorSubmit = (formErrors: FieldErrors<AdjustmentInput>) => {
        console.error("Adjustment Form errors:", formErrors);
    };

    if (!product) return null;

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={
                <>
                    <IconActivity size={20} className="text-amber-500" />
                    <span>Sesuaikan Stok</span>
                </>
            }
            className="max-w-md"
        >
            <FormProvider {...methods}>
                <form
                    onSubmit={handleSubmit(onSubmit, onErrorSubmit)}
                    className="space-y-4"
                >
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Produk Terpilih</span>
                        <p className="text-xs font-bold text-slate-800">{product.nama}</p>
                        {product.barcode && (
                            <p className="text-[10px] text-slate-400 font-mono">SKU: {product.barcode}</p>
                        )}
                        <p className="text-[10px] text-slate-500 mt-1">Stok Saat Ini: <strong className="text-slate-800 font-bold">{product.stok}</strong></p>
                    </div>

                    <FormNumberInput<AdjustmentInput>
                        name="kuantitas"
                        label={
                            <>
                                Kuantitas Perubahan (+ / -) <span className="text-rose-500 font-bold">*</span>
                            </>
                        }
                        placeholder="Contoh: -5 untuk kurangi, 10 untuk tambah..."
                        disabled={isPending}
                        allowNegative={true}
                    />

                    {/* Alasan */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            Alasan Penyesuaian <span className="text-rose-500 font-bold">*</span>
                        </label>
                        <Input
                            type="text"
                            placeholder="Contoh: Barang rusak, display hilang..."
                            className="h-10 text-xs border-slate-200 focus-visible:ring-emerald-600 rounded-xl"
                            disabled={isPending}
                            {...register("alasan")}
                        />
                        {errors.alasan && (
                            <p className="text-[10px] text-rose-500 font-medium">
                                {errors.alasan.message}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <Button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            className="w-full h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center cursor-pointer border-none"
                            disabled={isPending}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            className="w-full h-11 bg-amber-600 hover:bg-amber-700 font-bold text-xs text-white rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-amber-600/10 border-none"
                            disabled={isPending}
                        >
                            {isPending ? "Menyimpan..." : "Simpan Penyesuaian"}
                        </Button>
                    </div>
                </form>
            </FormProvider>
        </BaseDialog>
    );
}
