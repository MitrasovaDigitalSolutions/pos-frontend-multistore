"use client";

import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { FilterForm } from "@/components/forms/filter-form";
import { FormDatePicker } from "@/components/forms/form-date-picker";
import { FormSelect } from "@/components/forms/form-select";
import { FormMultiSelect } from "@/components/forms/form-multi-select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStores } from "@/features/stores/api/stores-api";
import {
    IconPrinter,
    IconRefresh,
    IconBuildingStore,
    IconBox,
    IconChevronDown,
} from "@tabler/icons-react";
import { PrintConfirmDialog, BasePrintFilterValues } from "../print-confirm-dialog";
import {
    getCentralPrintStoresUrl,
    getCentralPrintProductsUrl,
} from "../../api/central-reports-api";
import { STORE_BADGE_HQ } from "@/constants/store";

export interface CentralFilterValues {
    from: string;
    to: string;
    interval: "daily" | "weekly" | "monthly";
    storeUids: string[];
}

interface CentralPrintFilterValues extends BasePrintFilterValues {
    reportType: "stores" | "products";
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
    const [selectedReportType, setSelectedReportType] = useState<"stores" | "products">("stores");
    const { data: storesResponse } = useStores({ per_page: 100 });
    const storesList = storesResponse?.data || [];

    const handleOpenPrint = (type: "stores" | "products") => {
        setSelectedReportType(type);
        setIsPrintOpen(true);
    };

    const handlePrintConfirm = (data: CentralPrintFilterValues) => {
        let url = "";
        if (data.reportType === "products") {
            url = getCentralPrintProductsUrl(
                data.storeUids,
                data.paperSize,
                data.orientation,
                data.from,
                data.to
            );
        } else {
            url = getCentralPrintStoresUrl(
                data.from,
                data.to,
                data.storeUids,
                data.paperSize,
                data.orientation
            );
        }
        window.open(url, "_blank");
    };

    const intervalOptions = [
        { value: "daily", label: "Harian" },
        { value: "weekly", label: "Mingguan" },
        { value: "monthly", label: "Bulanan" },
    ];

    const reportTypeOptions = [
        { value: "stores", label: "Perbandingan Cabang Toko" },
        { value: "products", label: "Daftar Produk Per Cabang" },
    ];

    const storeOptions = storesList.map((store) => ({
        value: store.uid,
        label: store.nama,
        badge: store.is_central ? STORE_BADGE_HQ : undefined,
    }));

    return (
        <>
            <Card className="bg-white border-slate-100 rounded-2xl shadow-sm p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100/60 mb-4">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900">
                            Laporan Konsolidasi
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

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    disabled={isLoading}
                                    className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center gap-1.5 font-bold text-xs cursor-pointer"
                                >
                                    <IconPrinter size={16} />
                                    <span>Cetak PDF</span>
                                    <IconChevronDown size={14} className="opacity-80" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="w-56 bg-white border border-slate-200 p-1.5 shadow-lg rounded-2xl z-50"
                            >
                                <DropdownMenuLabel className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2.5 py-1">
                                    Pilih Jenis Cetak PDF
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-slate-100" />
                                <DropdownMenuItem
                                    onClick={() => handleOpenPrint("stores")}
                                    className="w-full text-xs font-semibold py-2 px-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 hover:bg-slate-100 text-slate-700"
                                >
                                    <IconBuildingStore size={16} className="text-blue-600 shrink-0" />
                                    <span>Perbandingan Cabang</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => handleOpenPrint("products")}
                                    className="w-full text-xs font-semibold py-2 px-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 hover:bg-slate-100 text-slate-700"
                                >
                                    <IconBox size={16} className="text-emerald-600 shrink-0" />
                                    <span>Produk Per Cabang</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
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
                    reportType: selectedReportType,
                    paperSize: "A4",
                    orientation: "landscape",
                    from: appliedFilters.from,
                    to: appliedFilters.to,
                    storeUids: appliedFilters.storeUids,
                }}
            >
                <FormSelect<CentralPrintFilterValues>
                    name="reportType"
                    label="Jenis Laporan PDF"
                    options={reportTypeOptions}
                />
            </PrintConfirmDialog>
        </>
    );
}

