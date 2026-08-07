"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";

import { FilterForm } from "@/components/forms/filter-form";
import { FormDatePicker } from "@/components/forms/form-date-picker";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";

export interface LedgerFilterValues {
    search: string;
    kategori: string;
    from: string;
    to: string;
}

interface LedgerFilterBarProps {
    methods: UseFormReturn<LedgerFilterValues>;
    onSubmit: (data: LedgerFilterValues) => void;
    onReset: () => void;
}

export function LedgerFilterBar({ methods, onSubmit, onReset }: LedgerFilterBarProps) {
    const kategoriOptions = [
        { value: "", label: "Semua Kategori" },
        { value: "expense", label: "Pengeluaran Operasional" },
        { value: "sales", label: "Penjualan POS" },
        { value: "supplier_payment", label: "Pembayaran Supplier" },
        { value: "purchase_return", label: "Retur Pembelian" },
        { value: "cash_drawer", label: "Mutasi Laci Kas" },
        { value: "stock_receiving", label: "Penerimaan Stok" },
        { value: "member_payment", label: "Pembayaran Member" },
    ];

    return (
        <FilterForm
            methods={methods}
            onSubmit={onSubmit}
            onReset={onReset}
            cols={3}
            className="my-2 bg-white p-4 rounded-xl border border-slate-100 shadow-2xs"
        >
            <FormInput<LedgerFilterValues>
                name="search"
                label="Cari Transaksi"
                placeholder="Cari no pengeluaran, catatan, ref..."
            />
            <FormSelect<LedgerFilterValues>
                name="kategori"
                label="Kategori / Sumber"
                options={kategoriOptions}
                placeholder="Semua Kategori"
            />
            <div className="flex gap-2 items-end w-full">
                <FormDatePicker<LedgerFilterValues>
                    name="from"
                    label="Dari Tanggal"
                    placeholder="Tanggal Mulai"
                />
                <span className="text-slate-400 text-[10px] uppercase font-bold shrink-0 mb-3">s/d</span>
                <FormDatePicker<LedgerFilterValues>
                    name="to"
                    label="Sampai Tanggal"
                    placeholder="Tanggal Akhir"
                />
            </div>
        </FilterForm>
    );
}
