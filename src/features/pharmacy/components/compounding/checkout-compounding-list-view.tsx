"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import {
    IconArrowLeft,
    IconPill,
    IconPlus,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { FilterForm } from "@/components/forms/filter-form";
import { FormInput } from "@/components/forms/form-input";
import { useAppRouter } from "@/hooks/use-app-router";
import { ROUTES } from "@/constants/routes";
import { usePrescriptionTemplates } from "../../api/pharmacy-api";
import type { PrescriptionTemplate } from "../../types";
import { TemplateDetailDialog } from "../templates/template-detail-dialog";
import { useTemplateColumns } from "../templates/use-template-columns";

interface CompoundingFilterValues {
    search: string;
}

export function CheckoutCompoundingListView() {
    const router = useAppRouter();
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(15);
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [selectedTemplate, setSelectedTemplate] = useState<PrescriptionTemplate | null>(null);

    const filterMethods = useForm<CompoundingFilterValues>({
        defaultValues: {
            search: "",
        },
    });

    const handleFilterSubmit = (data: CompoundingFilterValues) => {
        setDebouncedSearch(data.search.trim());
        setPage(1);
    };

    const handleFilterReset = () => {
        filterMethods.reset({ search: "" });
        setDebouncedSearch("");
        setPage(1);
    };

    const { data: response, isLoading, isFetching } = usePrescriptionTemplates({
        search: debouncedSearch || undefined,
        page,
        per_page: perPage,
    });

    const rawData = response?.data;
    const isPaginated = rawData && typeof rawData === "object" && "data" in rawData;
    const items: PrescriptionTemplate[] = isPaginated
        ? (rawData as { data: PrescriptionTemplate[] }).data
        : Array.isArray(rawData)
            ? rawData
            : [];

    const total = isPaginated ? (rawData as { total: number }).total : items.length;
    const lastPage = isPaginated ? (rawData as { last_page: number }).last_page : 1;

    const handleUseTemplate = (template: PrescriptionTemplate) => {
        router.push(`${ROUTES.CHECKOUT_COMPOUNDING_CREATE}?templateId=${template.uid}`);
    };

    const columns = useTemplateColumns();

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-3 sm:p-6 pb-28 sm:pb-8">
            <div className="max-w-[1440px] mx-auto space-y-4">
                {/* Header Navigation & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xs">
                    <div className="flex items-start sm:items-center gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(ROUTES.CHECKOUT)}
                            className="h-8 px-2.5 rounded-xl text-xs font-bold border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center gap-1.5 shrink-0"
                        >
                            <IconArrowLeft size={15} />
                            <span>Kasir</span>
                        </Button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">
                                    Daftar Racikan Obat
                                </h1>
                                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 px-2 py-0.5 rounded-full font-mono">
                                    Kasir Apotek
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Pilih formula racikan yang tersedia atau buat racikan baru bila belum ada di daftar.
                            </p>
                        </div>
                    </div>

                    <Button
                        type="button"
                        onClick={() => router.push(ROUTES.CHECKOUT_COMPOUNDING_CREATE)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 px-3.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-emerald-600/20 shrink-0"
                    >
                        <IconPlus size={16} />
                        <span>Buat Racikan Baru</span>
                    </Button>
                </div>

                {/* Main Table Card */}
                <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-2xs p-4 sm:p-6 space-y-4">
                    {/* Full-width Search Filter */}
                    <div className="w-full">
                        <FilterForm<CompoundingFilterValues>
                            methods={filterMethods}
                            onSubmit={handleFilterSubmit}
                            onReset={handleFilterReset}
                        >
                            <FormInput<CompoundingFilterValues>
                                name="search"
                                label="Cari Template Racikan"
                                placeholder="Cari nama racikan, bentuk sediaan, atau aturan pakai..."
                            />
                        </FilterForm>
                    </div>

                    {/* Table View */}
                    <DataTable
                        columns={columns}
                        data={items}
                        onView={(item) => setSelectedTemplate(item)}
                        extraActions={(item) => (
                            <Button
                                type="button"
                                size="sm"
                                onClick={() => handleUseTemplate(item)}
                                className="h-7 px-2.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer flex items-center gap-1 shadow-2xs shrink-0"
                                title="Gunakan racikan ini di kasir"
                            >
                                <IconPill size={13} />
                                <span>Gunakan</span>
                            </Button>
                        )}
                        isLoading={isLoading}
                        isFetching={isFetching}
                        emptyMessage="Tidak ada formula racikan ditemukan. Klik 'Buat Racikan Baru' untuk meracik formula baru."
                        entityName="racikan obat"
                        virtualize={true}
                        estimateRowHeight={44}
                        page={page}
                        perPage={perPage}
                        onPageChange={(p: number) => setPage(p)}
                        onPerPageChange={(pp: number) => {
                            setPerPage(pp);
                            setPage(1);
                        }}
                        meta={{
                            current_page: page,
                            last_page: lastPage,
                            per_page: perPage,
                            total,
                        }}
                    />
                </section>

                {/* Detail Dialog */}
                <TemplateDetailDialog
                    open={Boolean(selectedTemplate)}
                    onOpenChange={(open) => !open && setSelectedTemplate(null)}
                    template={selectedTemplate}
                    onUse={handleUseTemplate}
                />
            </div>
        </div>
    );
}
