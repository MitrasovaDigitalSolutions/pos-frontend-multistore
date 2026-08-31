"use client";

import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IconSearch, IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import type { AssetCategory, AssetFilterParams } from "../../types";

interface AssetFilterToolbarProps {
    filters: AssetFilterParams;
    onFiltersChange: (newFilters: AssetFilterParams) => void;
    categories: AssetCategory[];
}

export function AssetFilterToolbar({
    filters,
    onFiltersChange,
    categories,
}: AssetFilterToolbarProps) {
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onFiltersChange({
            ...filters,
            search: e.target.value,
            page: 1,
        });
    };

    const handleCategoryChange = (val: string | null) => {
        onFiltersChange({
            ...filters,
            asset_category_uid: !val || val === "all" ? undefined : val,
            page: 1,
        });
    };

    const handleStatusChange = (val: string | null) => {
        onFiltersChange({
            ...filters,
            status: !val || val === "all" ? undefined : val,
            page: 1,
        });
    };

    const handleSumberChange = (val: string | null) => {
        onFiltersChange({
            ...filters,
            sumber_perolehan: !val || val === "all" ? undefined : val,
            page: 1,
        });
    };

    const handleReset = () => {
        onFiltersChange({
            page: 1,
            per_page: filters.per_page || 15,
        });
    };

    const hasActiveFilters = useMemo(() => {
        return !!(
            filters.search ||
            filters.asset_category_uid ||
            filters.status ||
            filters.sumber_perolehan ||
            filters.date_start ||
            filters.date_end
        );
    }, [filters]);

    return (
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5 bg-slate-50/60 dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                    placeholder="Cari nama, nomor, atau kode aset..."
                    value={filters.search || ""}
                    onChange={handleSearchChange}
                    className="h-8.5 pl-9 text-xs rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                />
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                {/* Category Filter */}
                <Select
                    value={filters.asset_category_uid || "all"}
                    onValueChange={handleCategoryChange}
                >
                    <SelectTrigger className="h-8.5 min-w-[140px] text-xs rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                        <SelectValue placeholder="Kategori" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua Kategori</SelectItem>
                        {categories.map((c) => (
                            <SelectItem key={c.uid} value={c.uid}>
                                {c.nama}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Status Filter */}
                <Select
                    value={filters.status || "all"}
                    onValueChange={handleStatusChange}
                >
                    <SelectTrigger className="h-8.5 min-w-[110px] text-xs rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua Status</SelectItem>
                        <SelectItem value="aktif">Aktif</SelectItem>
                        <SelectItem value="habis_susut">Habis Susut</SelectItem>
                        <SelectItem value="dijual">Dijual</SelectItem>
                    </SelectContent>
                </Select>

                {/* Sumber Perolehan Filter */}
                <Select
                    value={filters.sumber_perolehan || "all"}
                    onValueChange={handleSumberChange}
                >
                    <SelectTrigger className="h-8.5 min-w-[110px] text-xs rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                        <SelectValue placeholder="Sumber Dana" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua Sumber</SelectItem>
                        <SelectItem value="kas">Kas / Bank</SelectItem>
                        <SelectItem value="non_kas">Non-Kas / Modal</SelectItem>
                    </SelectContent>
                </Select>

                {/* Reset Filters */}
                {hasActiveFilters && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleReset}
                        className="h-8.5 px-2.5 text-xs text-slate-500 hover:text-rose-600 rounded-xl cursor-pointer shrink-0"
                    >
                        <IconX className="w-3.5 h-3.5 mr-1" />
                        Reset
                    </Button>
                )}
            </div>
        </div>
    );
}
