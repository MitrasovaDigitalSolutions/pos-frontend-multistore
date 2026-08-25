import { AppButton } from "@/components/shared/app-button";
import { CommandSelect, type CommandOption } from "@/components/ui/command-select";
import { DataTable } from "@/components/ui/data-table";
import { NumberInput } from "@/components/ui/number-input";
import { cn } from "@/lib/utils";
import type { OpnameItemLocal } from "@/stores/opname-items-store";
import {
    IconBarcode,
    IconCategory,
    IconLoader2,
    IconMinus,
    IconPlus,
    IconTag,
} from "@tabler/icons-react";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { OpnameItemMobileCard } from "./opname-item-mobile-card";
import { OpnameItemsSearchBar } from "./opname-items-search-bar";

interface OpnameItemsTableProps {
    items: OpnameItemLocal[];
    categoryOptions: CommandOption[];
    brandOptions: CommandOption[];
    updateItem: (productUid: string, data: Partial<Pick<OpnameItemLocal, "stok_fisik" | "alasan" | "brand_uid" | "category_uid">>) => void;
    removeItem: (productUid: string) => void;
    onFocusBarcode?: () => void;
    isSyncing?: boolean;
}

/** Client-side search filter — matches by product name or barcode */
function filterItems(items: OpnameItemLocal[], query: string): OpnameItemLocal[] {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return items;

    const queryWords = trimmed.split(/\s+/);
    return items.filter((item) => {
        const barcodeMatch = item.barcode?.toLowerCase().includes(trimmed) ?? false;
        const nameWordsMatch = queryWords.every((word) => item.nama.toLowerCase().includes(word));
        return barcodeMatch || nameWordsMatch;
    });
}

export function OpnameItemsTable({
    items,
    categoryOptions,
    brandOptions,
    updateItem,
    removeItem,
    onFocusBarcode,
    isSyncing = false,
}: OpnameItemsTableProps) {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredItems = useMemo(
        () => filterItems(items, searchQuery),
        [items, searchQuery]
    );

    const columns = useMemo<ColumnDef<OpnameItemLocal>[]>(() => [
        {
            accessorKey: "nama",
            header: "Nama Produk",
            enableSorting: true,
            size: 280,
            cell: ({ row }) => {
                const item = row.original;
                return (
                    <div id={`opname-item-${item.product_uid}`} className="flex flex-col py-0.5 min-w-[200px] max-w-[280px] sm:max-w-[360px]">
                        <span
                            className="text-xs font-bold text-slate-900 leading-tight truncate block"
                            title={item.nama}
                        >
                            {item.nama}
                        </span>
                        {item.barcode && (
                            <span className="inline-flex items-center gap-0.5 font-mono text-[9.5px] text-slate-400 bg-slate-50 px-1 py-0.2 rounded mt-0.5 w-fit">
                                <IconBarcode size={11} className="opacity-70" />
                                {item.barcode}
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
                            onChange={(val) => updateItem(item.product_uid, { category_uid: val || null })}
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
                            onChange={(val) => updateItem(item.product_uid, { brand_uid: val || null })}
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
                return (
                    <div className="flex items-center justify-center gap-0.5">
                        <AppButton
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => updateItem(item.product_uid, { stok_fisik: Math.max(0, (Number(item.stok_fisik) || 0) - 1) })}
                            className="w-6 h-6 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-bold text-xs cursor-pointer"
                        >
                            <IconMinus size={11} />
                        </AppButton>
                        <div className="w-16">
                            <NumberInput
                                id={`opname-qty-${item.product_uid}`}
                                value={item.stok_fisik}
                                onChange={(val) => {
                                    updateItem(item.product_uid, { stok_fisik: val === null ? 0 : Math.max(0, val) });
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
                            onClick={() => updateItem(item.product_uid, { stok_fisik: (Number(item.stok_fisik) || 0) + 1 })}
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
            id: "selisih",
            header: "Selisih",
            accessorFn: (row) => (Number(row.stok_fisik) || 0) - (Number(row.stok_sistem) || 0),
            enableSorting: true,
            meta: {
                headerClassName: "text-right",
                cellClassName: "text-right",
            },
            cell: ({ row }) => {
                const item = row.original;
                const diff = (Number(item.stok_fisik) || 0) - (Number(item.stok_sistem) || 0);
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
                        value={item.alasan || ""}
                        placeholder="Alasan selisih..."
                        onChange={(e) => {
                            updateItem(item.product_uid, { alasan: e.target.value });
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                onFocusBarcode?.();
                            }
                        }}
                        className="h-7.5 w-full min-w-[140px] border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/20 rounded-md text-[11px] px-2 outline-none"
                    />
                );
            },
        },
    ], [brandOptions, categoryOptions, onFocusBarcode, updateItem]);

    return (
        <div className="w-full">
            {/* Search/Filter Bar — always visible when items exist */}
            <OpnameItemsSearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                totalCount={items.length}
                filteredCount={filteredItems.length}
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

            <DataTable<OpnameItemLocal, unknown>
                columns={columns}
                data={filteredItems}
                isLoading={isSyncing}
                clientPagination={true}
                perPage={10}
                virtualize={false}
                showViewToggle={true}
                emptyMessage={
                    isSyncing
                        ? "Sedang memuat data produk..."
                        : searchQuery.trim()
                            ? `Tidak ada item yang cocok dengan "${searchQuery}". Coba kata kunci lain.`
                            : "Belum ada barang dihitung. Gunakan scanner barcode atau autocomplete di atas."
                }
                entityName="barang"
                onDelete={(item) => removeItem(item.product_uid)}
                renderCardItem={(row) => (
                    <OpnameItemMobileCard
                        key={row.original.product_uid}
                        item={row.original}
                        index={row.index}
                        categoryOptions={categoryOptions}
                        brandOptions={brandOptions}
                        updateItem={updateItem}
                        removeItem={removeItem}
                        onFocusBarcode={onFocusBarcode}
                    />
                )}
            />
        </div>
    );
}
