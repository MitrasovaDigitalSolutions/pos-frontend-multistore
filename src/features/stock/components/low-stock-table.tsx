"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { IconAlertTriangle } from "@tabler/icons-react";
import type { Product } from "@/features/products/types";
import { DataTable } from "@/components/ui/data-table";

interface LowStockTableProps {
    products: Product[];
    isLoading?: boolean;
}

export function LowStockTable({
    products,
    isLoading = false,
}: LowStockTableProps) {
    const lowStockProducts = useMemo(() => {
        return products.filter((p) => !p.is_jasa && p.stok <= 10);
    }, [products]);

    const columns = useMemo<ColumnDef<Product>[]>(
        () => [
            {
                accessorKey: "barcode",
                header: "Barcode",
                cell: ({ row }) => (
                    <span className="font-bold">
                        {row.original.barcode || "-"}
                    </span>
                ),
                size: 120,
            },
            {
                accessorKey: "nama",
                header: "Nama Produk",
                cell: ({ row }) => (
                    <span className="font-semibold">{row.original.nama}</span>
                ),
                size: 240,
            },
            {
                accessorKey: "stok",
                header: "Sisa Stok",
                meta: {
                    headerClassName: "text-left",
                    cellClassName: "text-left font-bold text-rose-500",
                },
                cell: ({ row }) => `${row.original.stok} pcs`,
                size: 80,
            },
            {
                id: "status",
                header: "Status",
                cell: () => (
                    <span className="bg-rose-50 text-rose-700 text-[10px] px-2.5 py-1 rounded-full font-bold">
                        Stok Kritis
                    </span>
                ),
                size: 120,
            },
        ],
        [],
    );

    return (
        <div>
            <h4 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                <IconAlertTriangle size={16} className="text-amber-500" />
                <span>Alert: Produk Stok Rendah (&le; 10 pcs)</span>
            </h4>
            <DataTable
                columns={columns}
                data={lowStockProducts}
                isLoading={isLoading}
                emptyMessage="Semua produk memiliki stok di atas batas minimum."
                virtualize={false} // Small warning list, no need to virtualize
            />
        </div>
    );
}
