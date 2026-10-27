"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { FilterForm } from "@/components/forms/filter-form";
import { FormInput } from "@/components/forms/form-input";
import { IconPlus } from "@tabler/icons-react";
import { toast } from "sonner";
import { useAppRouter } from "@/hooks/use-app-router";
import { ROUTES } from "@/constants/routes";
import { useDeletePrescriptionTemplate, usePrescriptionTemplates } from "../../api/pharmacy-api";
import type { PrescriptionTemplate } from "../../types";
import { TemplateDetailDialog } from "./template-detail-dialog";
import { useTemplateColumns } from "./use-template-columns";

interface TemplateFilterValues {
    search: string;
}

export function TemplateListTable() {
    const router = useAppRouter();
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(15);
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [selectedTemplate, setSelectedTemplate] = useState<PrescriptionTemplate | null>(null);
    const [templateToDelete, setTemplateToDelete] = useState<PrescriptionTemplate | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const filterMethods = useForm<TemplateFilterValues>({
        defaultValues: {
            search: "",
        },
    });

    const handleFilterSubmit = (data: TemplateFilterValues) => {
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

    const deleteMutation = useDeletePrescriptionTemplate();

    const rawData = response?.data;
    const isPaginated = rawData && typeof rawData === "object" && "data" in rawData;
    const items: PrescriptionTemplate[] = isPaginated
        ? (rawData as { data: PrescriptionTemplate[] }).data
        : Array.isArray(rawData)
            ? rawData
            : [];

    const total = isPaginated ? (rawData as { total: number }).total : items.length;
    const lastPage = isPaginated ? (rawData as { last_page: number }).last_page : 1;

    const handleDeleteClick = (template: PrescriptionTemplate) => {
        setTemplateToDelete(template);
        setIsConfirmOpen(true);
    };

    const handleConfirmDelete = () => {
        if (!templateToDelete) return;

        deleteMutation.mutate(templateToDelete.uid, {
            onSuccess: () => {
                toast.success(`Template "${templateToDelete.nama_racikan}" berhasil dihapus.`);
                setIsConfirmOpen(false);
                setTemplateToDelete(null);
            },
            onError: (err) => {
                toast.error(err.message || "Gagal menghapus template racikan");
            },
        });
    };

    const columns = useTemplateColumns();

    return (
        <section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm p-4 sm:p-6 space-y-3 sm:space-y-4">
            {/* Standard Header Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        Daftar Template Racikan
                    </h3>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                        Formula racikan apotek standar untuk mempercepat proses peracikan kasir.
                    </p>
                </div>

                <Button
                    type="button"
                    onClick={() => router.push(ROUTES.ADMIN_PHARMACY_TEMPLATES_CREATE)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm shadow-emerald-600/20"
                >
                    <IconPlus size={16} />
                    <span>Tambah Template</span>
                </Button>
            </div>

            {/* Filter Form */}
            <div className="w-full">
                <FilterForm<TemplateFilterValues>
                    methods={filterMethods}
                    onSubmit={handleFilterSubmit}
                    onReset={handleFilterReset}
                >
                    <FormInput<TemplateFilterValues>
                        name="search"
                        label="Cari Template Racikan"
                        placeholder="Nama racikan, sediaan, aturan pakai..."
                    />
                </FilterForm>
            </div>

            {/* Data Table */}
            <DataTable
                columns={columns}
                data={items}
                onView={(item) => setSelectedTemplate(item)}
                onDelete={handleDeleteClick}
                isLoading={isLoading}
                isFetching={isFetching}
                emptyMessage="Tidak ada template racikan ditemukan."
                entityName="template racikan"
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

            {/* Template Detail Dialog */}
            <TemplateDetailDialog
                open={Boolean(selectedTemplate)}
                onOpenChange={(open) => !open && setSelectedTemplate(null)}
                template={selectedTemplate}
            />

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={isConfirmOpen}
                onOpenChange={setIsConfirmOpen}
                title="Hapus Template Racikan"
                description={
                    templateToDelete ? (
                        <span>
                            Apakah Anda yakin ingin menghapus template{" "}
                            <strong className="font-semibold text-slate-900 dark:text-slate-100">
                                {templateToDelete.nama_racikan}
                            </strong>
                            ? Tindakan ini tidak dapat dibatalkan.
                        </span>
                    ) : (
                        "Apakah Anda yakin ingin menghapus template racikan ini?"
                    )
                }
                confirmText="Hapus Template"
                cancelText="Batal"
                variant="danger"
                isLoading={deleteMutation.isPending}
                onConfirm={handleConfirmDelete}
            />
        </section>
    );
}

