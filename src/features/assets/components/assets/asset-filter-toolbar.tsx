"use client";

import { useMemo } from "react";
import type { UseFormReturn } from "react-hook-form";
import { FilterForm } from "@/components/forms/filter-form";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { FormDatePicker } from "@/components/forms/form-date-picker";
import type { AssetCategory, AssetFilterParams } from "../../types";

interface AssetFilterToolbarProps {
    methods: UseFormReturn<AssetFilterParams>;
    onSubmit: (data: AssetFilterParams) => void;
    onReset: () => void;
    categories: AssetCategory[];
}

export function AssetFilterToolbar({
    methods,
    onSubmit,
    onReset,
    categories,
}: AssetFilterToolbarProps) {
    const categoryOptions = useMemo(() => [
        { value: "all", label: "Semua Kategori" },
        ...categories.map((c) => ({
            value: c.uid,
            label: `[${c.kode || "-"}] ${c.nama}`,
        })),
    ], [categories]);

    const statusOptions = useMemo(() => [
        { value: "all", label: "Semua Status" },
        { value: "aktif", label: "Aktif" },
        { value: "habis_susut", label: "Habis Susut" },
        { value: "dijual", label: "Dijual" },
    ], []);

    const sumberOptions = useMemo(() => [
        { value: "all", label: "Semua Sumber Dana" },
        { value: "kas", label: "Kas / Bank" },
        { value: "non_kas", label: "Non-Kas / Modal / Utang" },
    ], []);

    return (
        <FilterForm
            methods={methods}
            onSubmit={onSubmit}
            onReset={onReset}
            titleLabel="Filter & Pencarian Aset"
            submitLabel="Terapkan Filter"
            cols={4}
            defaultExpanded={true}
        >
            <FormInput<AssetFilterParams>
                name="search"
                label="Pencarian"
                placeholder="Cari nama, nomor, atau SN..."
            />

            <FormSelect<AssetFilterParams>
                name="asset_category_uid"
                label="Kategori Aset"
                options={categoryOptions}
                placeholder="Semua Kategori"
            />

            <FormSelect<AssetFilterParams>
                name="status"
                label="Status Aset"
                options={statusOptions}
                placeholder="Semua Status"
            />

            <FormSelect<AssetFilterParams>
                name="sumber_perolehan"
                label="Sumber Dana"
                options={sumberOptions}
                placeholder="Semua Sumber"
            />

            <FormDatePicker<AssetFilterParams>
                name="date_start"
                label="Dari Tanggal"
                placeholder="Tanggal awal..."
            />

            <FormDatePicker<AssetFilterParams>
                name="date_end"
                label="Sampai Tanggal"
                placeholder="Tanggal akhir..."
            />
        </FilterForm>
    );
}
