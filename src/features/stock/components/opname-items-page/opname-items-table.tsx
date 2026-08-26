"use client";

import { DataTable } from "@/components/ui/data-table";
import { cn } from "@/lib/utils";
import type { OpnameItem } from "@/features/stock/types";
import { useOpnameUIStore } from "@/stores/opname-items-store";
import { IconBarcode, IconLoader2 } from "@tabler/icons-react";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { OpnameItemMobileCard } from "./opname-item-mobile-card";
import { OpnameItemsSearchBar } from "./opname-items-search-bar";
import { OpnameQtyInput } from "./opname-qty-input";
interface OpnameItemsTableProps {
    items: OpnameItem[];
    meta?: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    isLoading?: boolean;
    isFetching?: boolean;
    onUpdateQty: (itemUid: string, qty: number) => void;
    onUpdateField: (itemUid: string, field: "alasan" | "brand_uid" | "category_uid", value: string | null) => void;
    onRemoveItem: (itemUid: string) => void;
    onFocusBarcode?: () => void;
    isSyncing?: boolean;
}

export function OpnameItemsTable({
    items,
    meta,
    isLoading = false,
    isFetching = false,
    onUpdateQty,
    onUpdateField,
    onRemoveItem,
    onFocusBarcode,
    isSyncing = false,
}: OpnameItemsTableProps) {
    const page = useOpnameUIStore((state) => state.page);
    const setPage = useOpnameUIStore((state) => state.setPage);
    const sortBy = useOpnameUIStore((state) => state.sortBy);
    const sortOrder = useOpnameUIStore((state) => state.sortOrder);
    const setSorting = useOpnameUIStore((state) => state.setSorting);

    const columns = useMemo<ColumnDef<OpnameItem>[]>(() => [
        {
            accessorKey: "nama",
            header: "Nama Produk",
            enableSorting: true,
            size: 280,
            cell: ({ row }) => {
                const item = row.original;
                const name = item.nama || item.product?.nama || "Produk";
                const barcode = item.barcode || item.product?.barcode || null;
                return (
                    <div id={`opname-item-${item.product_uid}`} className="flex flex-col py-0.5 min-w-[180px] max-w-[280px] sm:max-w-[360px]">
                        <span
                            className="text-xs font-bold text-slate-900 leading-tight truncate block"
                            title={name}
                        >
                            {name}
                        </span>
                        {barcode && (
                            <span className="inline-flex items-center gap-0.5 font-mono text-[9.5px] text-slate-400 bg-slate-50 px-1 py-0.2 rounded mt-0.5 w-fit">
                                <IconBarcode size={11} className="opacity-70" />
                                {barcode}
                            </span>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: "stok_sistem",
            header: "Stok Sistem",
            enableSorting: true,
            size: 110,
            meta: {
                headerClassName: "text-right",
                cellClassName: "text-right font-mono text-slate-500 text-xs",
            },
            cell: ({ row }) => `${row.original.stok_sistem} pcs`,
        },
        {
            accessorKey: "stok_fisik",
            header: "Stok Fisik",
            enableSorting: true,
            size: 130,
            meta: {
                headerClassName: "text-center",
                cellClassName: "text-center",
            },
            cell: ({ row }) => {
                const item = row.original;
                return (
                    <OpnameQtyInput
                        itemUid={item.uid}
                        productUid={item.product_uid}
                        stokFisik={Number(item.stok_fisik) || 0}
                        onUpdateQty={onUpdateQty}
                        onFocusBarcode={onFocusBarcode}
                        size="sm"
                    />
                );
            },
        },
        {
            accessorKey: "selisih",
            header: "Selisih",
            enableSorting: true,
            size: 100,
            meta: {
                headerClassName: "text-right",
                cellClassName: "text-right",
            },
            cell: ({ row }) => {
                const item = row.original;
                const diff = Number(item.selisih ?? ((Number(item.stok_fisik) || 0) - (Number(item.stok_sistem) || 0)));
                return (
                    <span className={cn(
                        "inline-block font-mono font-bold text-[11px] px-1.5 py-0.5 rounded-md",
                        diff === 0
                            ? "bg-slate-100 text-slate-500"
                            : diff > 0
                                ? "bg-blue-50 text-blue-700 border border-blue-100"
                                : "bg-rose-50 text-rose-700 border border-rose-100"
                    )}>
                        {diff > 0 ? `+${diff}` : diff} pcs
                    </span>
                );
            },
        },
        {
            accessorKey: "alasan",
            header: "Alasan Selisih",
            enableSorting: false,
            cell: ({ row }) => {
                const item = row.original;
                return (
                    <input
                        type="text"
                        defaultValue={item.alasan || ""}
                        placeholder="Alasan selisih..."
                        onBlur={(e) => {
                            const val = e.target.value.trim();
                            if (val !== (item.alasan || "")) {
                                onUpdateField(item.uid, "alasan", val || null);
                            }
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                const val = (e.target as HTMLInputElement).value.trim();
                                if (val !== (item.alasan || "")) {
                                    onUpdateField(item.uid, "alasan", val || null);
                                }
                                (e.target as HTMLInputElement).blur();
                                onFocusBarcode?.();
                            }
                        }}
                        className="h-7 w-full min-w-[120px] border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/20 rounded-md text-[11px] px-2 outline-none transition-all"
                    />
                );
            },
        },
    ], [onFocusBarcode, onUpdateField, onUpdateQty]);

    return (
        <div className="w-full">
            {/* Syncing Progress Banner */}
            {isSyncing && (
                <div className="flex items-center justify-between gap-3 px-3.5 py-2 bg-emerald-50/90 border border-b-0 border-emerald-100 rounded-t-xl text-emerald-800 text-xs font-semibold animate-in fade-in duration-200">
                    <div className="flex items-center gap-2">
                        <IconLoader2 size={14} className="animate-spin text-emerald-600 shrink-0" />
                        <span>Sedang menyinkronkan &amp; mengindeks data produk dari Excel...</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-200/70 text-emerald-900 rounded-full shrink-0">
                        Memproses data...
                    </span>
                </div>
            )}

            <DataTable<OpnameItem, unknown>
                columns={columns}
                data={items}
                isLoading={isLoading || isSyncing}
                isFetching={isFetching}
                clientPagination={false}
                page={page}
                onPageChange={setPage}
                meta={meta}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={(by, order) => {
                    if (by && order) {
                        setSorting(by, order);
                    }
                }}
                virtualize={false}
                showViewToggle={true}
                extraToolbarActions={<OpnameItemsSearchBar />}
                emptyMessage="Belum ada barang dihitung. Gunakan scanner barcode atau upload Excel di atas."
                entityName="barang"
                onDelete={(item) => onRemoveItem(item.uid)}
                renderCardItem={(row) => (
                    <OpnameItemMobileCard
                        key={row.original.uid}
                        item={row.original}
                        index={row.index}
                        onUpdateQty={onUpdateQty}
                        onUpdateField={onUpdateField}
                        onRemoveItem={onRemoveItem}
                        onFocusBarcode={onFocusBarcode}
                    />
                )}
            />
        </div>
    );
}
