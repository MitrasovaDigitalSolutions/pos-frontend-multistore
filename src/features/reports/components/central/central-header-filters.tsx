"use client";

import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { FilterForm } from "@/components/forms/filter-form";
import { FormDatePicker } from "@/components/forms/form-date-picker";
import { FormSelect } from "@/components/forms/form-select";
import { FormMultiSelect } from "@/components/forms/form-multi-select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useStores } from "@/features/stores/api/stores-api";
import {
    IconPrinter,
    IconRefresh,
} from "@tabler/icons-react";
import { PrintConfirmDialog, BasePrintFilterValues } from "../print-confirm-dialog";
import { getCentralPrintStoresUrl } from "../../api/central-reports-api";

export interface CentralFilterValues {
    from: string;
    to: string;
    interval: "daily" | "weekly" | "monthly";
    storeUids: string[];
}

interface CentralPrintFilterValues extends BasePrintFilterValues {
    from: string;
    to: string;
    storeUids: string[];
}

interface CentralHeaderFiltersProps {
    methods: UseFormReturn<CentralFilterValues>;
    onSubmit: (data: CentralFilterValues) => void;
    onReset: () => void;
    onRefetch: () => void;
    isLoading: boolean;
    isFetching: boolean;
    appliedFilters: CentralFilterValues;
}

export function CentralHeaderFilters({
    methods,
    onSubmit,
    onReset,
    onRefetch,
    isLoading,
    isFetching,
    appliedFilters,
}: CentralHeaderFiltersProps) {
    const [isPrintOpen, setIsPrintOpen] = useState(false);
    const { data: storesResponse } = useStores({ per_page: 100 });
    const storesList = storesResponse?.data || [];

    const handlePrintConfirm = () => {
        const url = getCentralPrintStoresUrl(
            appliedFilters.from,
            appliedFilters.to,
            appliedFilters.storeUids
        );
        window.open(url, "_blank");
    };

    const intervalOptions = [
        { value: "daily", label: "Harian" },
        { value: "weekly", label: "Mingguan" },
        { value: "monthly", label: "Bulanan" },
    ];

    const storeOptions = storesList.map((store) => ({
        value: store.uid,
        label: store.nama,
        badge: store.is_central ? "HQ" : undefined,
    }));

    return (
        <>
            <Card className="bg-white border-slate-100 rounded-2xl shadow-sm p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100/60 mb-4">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900">
                            Laporan Konsolidasi HQ (Multi-Store)
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                            Agregasi data penjualan, laba rugi, dan stok lintas seluruh cabang toko.
                        </p>
                    </div>

                    <div className="flex gap-2 shrink-0">
                        <Button
                            variant="outline"
                            onClick={onRefetch}
                            disabled={isLoading || isFetching}
                            className="h-9 border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center gap-1.5"
                            title="Muat Ulang"
                        >
                            <IconRefresh size={16} className={isFetching ? "animate-spin" : ""} />
                        </Button>

                        <Button
                            onClick={() => setIsPrintOpen(true)}
                            disabled={isLoading}
                            className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center gap-1.5 font-bold text-xs"
                        >
                            <IconPrinter size={16} />
                            Cetak PDF
                        </Button>
                    </div>
                </div>

                <FilterForm<CentralFilterValues>
                    methods={methods}
                    onSubmit={onSubmit}
                    onReset={onReset}
                    cols={4}
                    titleLabel="Filter Laporan Konsolidasi"
                >
                    <FormDatePicker<CentralFilterValues>
                        name="from"
                        label="Dari Tanggal"
                        clearable={false}
                    />

                    <FormDatePicker<CentralFilterValues>
                        name="to"
                        label="Sampai Tanggal"
                        clearable={false}
                    />

                    <FormSelect<CentralFilterValues>
                        name="interval"
                        label="Interval"
                        options={intervalOptions}
                    />

                    <FormMultiSelect<CentralFilterValues>
                        name="storeUids"
                        label="Cabang Toko"
                        options={storeOptions}
                        placeholder="Semua Cabang Toko"
                    />
                </FilterForm>
            </Card>

            <PrintConfirmDialog<CentralPrintFilterValues>
                open={isPrintOpen}
                onOpenChange={setIsPrintOpen}
                onConfirm={handlePrintConfirm}
                defaultValues={{
                    paperSize: "A4",
                    orientation: "landscape",
                    from: appliedFilters.from,
                    to: appliedFilters.to,
                    storeUids: appliedFilters.storeUids,
                }}
            />
        </>
    );
}
