"use client";

import { AppButton } from "@/components/shared/app-button";
import { CommandSelect, type CommandOption } from "@/components/ui/command-select";
import { DataTable } from "@/components/ui/data-table";
import { NumberInput } from "@/components/ui/number-input";
import { cn } from "@/lib/utils";
import type { OpnameItem } from "@/features/stock/types";
import { useOpnameUIStore } from "@/stores/opname-items-store";
import {
    IconBarcode,
    IconCategory,
    IconLoader2,
    IconMinus,
    IconPlus,
    IconTag,
} from "@tabler/icons-react";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { OpnameItemMobileCard } from "./opname-item-mobile-card";
import { OpnameItemsSearchBar } from "./opname-items-search-bar";
import type { OpnameItemsSummary } from "../../api/stock-api";

interface OpnameItemsTableProps {
    items: OpnameItem[];
    meta?: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    summary?: OpnameItemsSummary;
    isLoading?: boolean;
    isFetching?: boolean;
    categoryOptions: CommandOption[];
    brandOptions: CommandOption[];
    onUpdateQty: (itemUid: string, qty: number) => void;
    onUpdateField: (itemUid: string, field: "alasan" | "brand_uid" | "category_uid", value: string | null) => void;
    onRemoveItem: (itemUid: string) => void;
    onFocusBarcode?: () => void;
    isSyncing?: boolean;
}

export function OpnameItemsTable({
    items,
    meta,
    summary,
    isLoading = false,
    isFetching = false,
    categoryOptions,
    brandOptions,
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
                    <div id={`opname-item-${item.product_uid}`} className="flex flex-col py-0.5 min-w-[200px] max-w-[280px] sm:max-w-[360px]">
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
            accessorKey: "category_uid",
            header: "Kategori",
            enableSorting: false,
            size: 170,
            cell: ({ row }) => {
                const item = row.original;
                return (
                    <div className="w-38 sm:w-42">
                        <CommandSelect
                            options={categoryOptions}
                            value={item.category_uid || ""}
                            onChange={(val) => onUpdateField(item.uid, "category_uid", val || null)}
                            placeholder="Pilih Kategori"
                            searchPlaceholder="Cari kategori..."
                            emptyMessage="Tidak ditemukan"
                            size="sm"
                            leftIcon={<IconCategory size={12} className="text-slate-400" />}
                            className="h-7.5 text-[11px] bg-white border-slate-200"
                        />
                    </div>
                );
            },
        },
        {
            accessorKey: "brand_uid",
            header: "Brand",
            enableSorting: false,
            size: 160,
            cell: ({ row }) => {
                const item = row.original;
                return (
                    <div className="w-34 sm:w-38">
                        <CommandSelect
                            options={brandOptions}
                            value={item.brand_uid || ""}
                            onChange={(val) => onUpdateField(item.uid, "brand_uid", val || null)}
                            placeholder="Pilih Brand"
                            searchPlaceholder="Cari brand..."
                            emptyMessage="Tidak ditemukan"
                            size="sm"
                            leftIcon={<IconTag size={12} className="text-slate-400" />}
                            className="h-7.5 text-[11px] bg-white border-slate-200"
                        />
                    </div>
                );
            },
        },
        {
            accessorKey: "stok_fisik",
            header: "Stok Fisik",
            enableSorting: true,
            meta: {
                headerClassName: "text-center",
                cellClassName: "text-center",
            },
            cell: ({ row }) => {
                const item = row.original;
                const stokFisik = Number(item.stok_fisik) || 0;
                return (
                    <div className="flex items-center justify-center gap-0.5">
                        <AppButton
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => onUpdateQty(item.uid, Math.max(0, stokFisik - 1))}
                            className="w-6 h-6 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-bold text-xs cursor-pointer"
                        >
                            <IconMinus size={11} />
                        </AppButton>
                        <div className="w-16">
                            <NumberInput
                                id={`opname-qty-${item.product_uid}`}
                                value={stokFisik}
                                onChange={(val) => {
                                    onUpdateQty(item.uid, val === null ? 0 : Math.max(0, val));
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        onFocusBarcode?.();
                                    }
                                }}
                                allowDecimal={false}
                                allowNegative={false}
                                min={0}
                                className="h-7 w-full text-center rounded-md border border-slate-200 p-0 text-xs font-bold font-mono outline-none focus-visible:border-emerald-600 focus-visible:ring-emerald-600/20"
                            />
                        </div>
                        <AppButton
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => onUpdateQty(item.uid, stokFisik + 1)}
                            className="w-6 h-6 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-bold text-xs cursor-pointer"
                        >
                            <IconPlus size={11} />
                        </AppButton>
                    </div>
                );
            },
        },
        {
            accessorKey: "stok_sistem",
            header: "Stok Sistem",
            enableSorting: true,
            meta: {
                headerClassName: "text-right",
                cellClassName: "text-right font-mono text-slate-500",
            },
            cell: ({ row }) => `${row.original.stok_sistem} pcs`,
        },
        {
            accessorKey: "selisih",
            header: "Selisih",
            enableSorting: true,
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
                        onBlur={(e) => onUpdateField(item.uid, "alasan", e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                onUpdateField(item.uid, "alasan", (e.target as HTMLInputElement).value);
                                onFocusBarcode?.();
                            }
                        }}
                        className="h-7.5 w-full min-w-[140px] border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/20 rounded-md text-[11px] px-2 outline-none"
                    />
                );
            },
        },
    ], [brandOptions, categoryOptions, onFocusBarcode, onUpdateField, onUpdateQty]);

    return (
        <div className="w-full">
            {/* Search/Filter Bar — server filter & summary pills */}
            <OpnameItemsSearchBar
                summary={summary}
            />

            {/* Syncing Progress Banner */}
            {isSyncing && (
                <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 bg-emerald-50/90 border-b border-emerald-100 text-emerald-800 text-xs font-semibold animate-in fade-in duration-200">
                    <div className="flex items-center gap-2">
                        <IconLoader2 size={15} className="animate-spin text-emerald-600 shrink-0" />
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
                emptyMessage="Belum ada barang dihitung. Gunakan scanner barcode atau upload Excel di atas."
                entityName="barang"
                onDelete={(item) => onRemoveItem(item.uid)}
                renderCardItem={(row) => (
                    <OpnameItemMobileCard
                        key={row.original.uid}
                        item={row.original}
                        index={row.index}
                        categoryOptions={categoryOptions}
                        brandOptions={brandOptions}
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
