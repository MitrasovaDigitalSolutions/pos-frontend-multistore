import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Show } from "@/components/ui/show";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import type { Product } from "../types";

export interface UseProductColumnsOptions {
    hasManageProducts: boolean;
    isCentralStore: boolean;
    canEditMasterData: boolean;
    onToggleStatus: (product: Product) => void;
}

export function useProductColumns({
    hasManageProducts,
    isCentralStore,
    canEditMasterData,
    onToggleStatus,
}: UseProductColumnsOptions): ColumnDef<Product>[] {
    return useMemo<ColumnDef<Product>[]>(
        () => [
            {
                accessorKey: "barcode",
                header: "Barcode / SKU",
                cell: ({ row }) => {
                    const barcode = row.original.barcode || "-";
                    return (
                        <TooltipProvider delayDuration={200}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className="font-bold text-slate-900 truncate block max-w-[130px] cursor-default font-mono">
                                        {barcode}
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                    <p className="font-mono text-xs">{barcode}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    );
                },
                size: 130,
            },
            {
                accessorKey: "nama",
                header: "Nama Produk",
                cell: ({ row }) => (
                    <div className="flex flex-col gap-0.5 max-w-[260px] min-w-0">
                        <TooltipProvider delayDuration={200}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className="font-semibold text-slate-800 truncate block cursor-default">
                                        {row.original.nama}
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs">
                                    <p className="text-xs">{row.original.nama}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <div className="flex items-center gap-1">
                            {row.original.is_jasa && (
                                <span className="badge text-[9px] border-none bg-blue-50 text-blue-700 w-fit px-1.5 py-px rounded font-semibold">
                                    Jasa
                                </span>
                            )}
                            {row.original.is_raw_material && (
                                <span className="badge text-[9px] border-none bg-amber-50 text-amber-700 w-fit px-1.5 py-px rounded font-semibold">
                                    Bahan Baku
                                </span>
                            )}
                            {(row.original.unit?.simbol || row.original.satuan) && (
                                <span className="badge text-[9px] border-none bg-emerald-50 text-emerald-700 w-fit px-1.5 py-px rounded font-semibold">
                                    {row.original.unit?.simbol || row.original.satuan}
                                </span>
                            )}
                        </div>
                    </div>
                ),
                size: 260,
            },
            {
                id: "category",
                accessorFn: (row) => row.category?.nama || "",
                header: "Kategori",
                cell: ({ row }) => {
                    const catName = row.original.category?.nama || "-";
                    return (
                        <TooltipProvider delayDuration={200}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className="text-slate-500 text-xs truncate block max-w-[130px] cursor-default">
                                        {catName}
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                    <p className="text-xs">{catName}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    );
                },
                size: 140,
            },
            {
                id: "merek",
                accessorFn: (row) => row.brand?.nama || row.merek || "",
                header: "Merek/Brand",
                cell: ({ row }) => {
                    const brandName = row.original.brand?.nama || row.original.merek || "-";
                    return (
                        <TooltipProvider delayDuration={200}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className="text-slate-500 text-xs truncate block max-w-[130px] cursor-default">
                                        {brandName}
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                    <p className="text-xs">{brandName}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    );
                },
                size: 140,
            },
            {
                accessorKey: "harga_beli",
                header: "Harga Beli",
                meta: {
                    headerClassName: "text-right",
                    cellClassName: "text-right text-slate-500 text-xs",
                },
                size: 120,
                cell: ({ row }) =>
                    row.original.harga_beli !== null && row.original.harga_beli !== undefined
                        ? formatRupiah(row.original.harga_beli)
                        : "-",
            },
            {
                accessorKey: "harga",
                header: "Harga Jual",
                meta: {
                    headerClassName: "text-right",
                    cellClassName: "text-right font-bold text-slate-800",
                },
                size: 140,
                cell: ({ row }) => {
                    const p = row.original;
                    const storeProduct = p.product_stores?.[0];
                    const hargaGrosir = p.harga_grosir ?? storeProduct?.harga_grosir;
                    const minQtyGrosir = p.min_qty_grosir ?? storeProduct?.min_qty_grosir;
                    const isGrosirFlag = p.is_grosir ?? storeProduct?.is_grosir;
                    const hasGrosir = Boolean(isGrosirFlag === true && hargaGrosir && minQtyGrosir);
                    return (
                        <div className="flex flex-col items-end">
                            <span className="font-bold text-slate-800">{formatRupiah(p.harga)}</span>
                            <Show.When isTrue={hasGrosir}>
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50/90 border border-emerald-200/80 px-1.5 py-0.5 rounded-md mt-0.5 whitespace-nowrap leading-none font-mono">
                                    Grosir: {formatRupiah(Number(hargaGrosir))}
                                </span>
                            </Show.When>
                        </div>
                    );
                },
            },
            {
                accessorKey: "margin",
                header: "Margin",
                meta: {
                    headerClassName: "text-right",
                    cellClassName: "text-right text-slate-500 text-xs",
                },
                size: 120,
                cell: ({ row }) =>
                    row.original.margin !== null && row.original.margin !== undefined
                        ? `${row.original.margin}%`
                        : "-",
            },
            {
                accessorKey: "stok",
                header: "Stok",
                meta: {
                    headerClassName: "text-right",
                    cellClassName: "text-right",
                },
                size: 80,
                cell: ({ row }) => {
                    const p = row.original;
                    const unitLabel = p.unit?.simbol || p.satuan || "";
                    return (
                        <span
                            className={`font-bold ${
                                p.stok <= 10 ? "text-amber-500" : "text-slate-800"
                            }`}
                        >
                            {p.stok}
                            {unitLabel ? ` ${unitLabel}` : ""}
                        </span>
                    );
                },
            },
            {
                accessorKey: "status",
                header: "Status",
                meta: {
                    headerClassName: "text-center",
                    cellClassName: "text-center",
                },
                size: 80,
                cell: ({ row }) => {
                    const p = row.original;
                    const canToggleStatus =
                        hasManageProducts && (isCentralStore || canEditMasterData);
                    if (!canToggleStatus) {
                        return (
                            <TooltipProvider delayDuration={200}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span className="inline-block cursor-not-allowed opacity-90">
                                            <StatusBadge status={p.status} />
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                        <p className="text-xs">
                                            Pengubahan status produk dinonaktifkan oleh kebijakan Toko Pusat
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        );
                    }
                    return (
                        <button
                            type="button"
                            onClick={() => onToggleStatus(p)}
                            className="bg-transparent border-none p-0 cursor-pointer focus:outline-none"
                            title="Klik untuk mengubah status produk"
                        >
                            <StatusBadge status={p.status} />
                        </button>
                    );
                },
            },
        ],
        [hasManageProducts, isCentralStore, canEditMasterData, onToggleStatus]
    );
}
