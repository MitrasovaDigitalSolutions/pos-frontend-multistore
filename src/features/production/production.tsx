"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { FilterForm } from "@/components/forms/filter-form";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { FormDatePicker } from "@/components/forms/form-date-picker";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { AccessDeniedState } from "@/components/ui/access-denied-state";
import { Show } from "@/components/ui/show";
import { hasPermission, hasRole } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";
import { useAppRouter } from "@/hooks/use-app-router";
import { IconAssembly, IconPlus } from "@tabler/icons-react";
import { useProductions } from "./api/production-api";
import { ProductionDetailDialog } from "./components/production-detail-dialog";
import { useProductionColumns } from "./components/use-production-columns";
import type { Production } from "./types";

interface ProductionFilterValues {
    q: string;
    status: string;
    dari: string;
    sampai: string;
}

export function ProductionPage() {
    const router = useAppRouter();
    const { data: session } = useSession();
    const userRoles = session?.user?.roles || [];
    const userPermissions = session?.user?.permissions || [];

    const hasViewPermission =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "view_production") ||
        hasPermission(userRoles, userPermissions, "manage_production");

    const hasManagePermission =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "manage_production");

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(15);
    const [sortBy, setSortBy] = useState<string | undefined>("created_at");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>("desc");

    const [filters, setFilters] = useState<{
        q?: string;
        status?: string;
        dari?: string;
        sampai?: string;
    }>({});

    const [selectedProductionUid, setSelectedProductionUid] = useState<string | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const filterMethods = useForm<ProductionFilterValues>({
        defaultValues: {
            q: "",
            status: "all",
            dari: "",
            sampai: "",
        },
    });

    const handleFilterSubmit = (data: ProductionFilterValues) => {
        setFilters({
            q: data.q || undefined,
            status: data.status !== "all" ? data.status : undefined,
            dari: data.dari || undefined,
            sampai: data.sampai || undefined,
        });
        setPage(1);
    };

    const handleFilterReset = () => {
        filterMethods.reset({
            q: "",
            status: "all",
            dari: "",
            sampai: "",
        });
        setFilters({});
        setPage(1);
    };

    const { data: res, isLoading, isFetching } = useProductions({
        page,
        per_page: perPage,
        sort_by: sortBy,
        sort_order: sortOrder,
        ...filters,
    });

    const productions = res?.data || [];
    const meta = res?.meta;

    const handleViewDetail = (item: Production) => {
        setSelectedProductionUid(item.uid);
        setIsDetailOpen(true);
    };

    const columns = useProductionColumns({
        onViewDetail: handleViewDetail,
    });

    if (!hasViewPermission) {
        return (
            <AccessDeniedState
                description="Anda tidak memiliki izin untuk melihat data riwayat produksi harian."
                requiredPermission="view_production"
            />
        );
    }

    const statusOptions = [
        { value: "all", label: "Semua Status" },
        { value: "completed", label: "Selesai (Completed)" },
        { value: "draft", label: "Draft" },
        { value: "void", label: "Dibatalkan (Void)" },
    ];

    return (
        <div className="space-y-6">
            <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/80">
                            <IconAssembly size={22} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">
                                Produksi Harian (Bahan Baku &amp; Konveksi)
                            </h3>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                Catatan pemakaian bahan baku, konversi barang jadi, dan alokasi HPP otomatis.
                            </p>
                        </div>
                    </div>

                    <Show.When isTrue={hasManagePermission}>
                        <Button
                            onClick={() => router.push(ROUTES.ADMIN_PRODUCTION_CREATE)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                            <IconPlus size={16} /> Buat Produksi Baru
                        </Button>
                    </Show.When>
                </div>

                <FilterForm
                    methods={filterMethods}
                    onSubmit={handleFilterSubmit}
                    onReset={handleFilterReset}
                >
                    <FormInput<ProductionFilterValues>
                        name="q"
                        label="Cari Produksi"
                        placeholder="Cari nomor produksi atau catatan..."
                    />
                    <FormSelect<ProductionFilterValues>
                        name="status"
                        label="Status"
                        options={statusOptions}
                        placeholder="Semua Status"
                    />
                    <FormDatePicker<ProductionFilterValues>
                        name="dari"
                        label="Dari Tanggal"
                        placeholder="Pilih tanggal mulai"
                    />
                    <FormDatePicker<ProductionFilterValues>
                        name="sampai"
                        label="Sampai Tanggal"
                        placeholder="Pilih tanggal akhir"
                    />
                </FilterForm>

                <DataTable
                    columns={columns}
                    data={productions}
                    isLoading={isLoading}
                    isFetching={isFetching}
                    emptyMessage="Belum ada riwayat produksi tercatat."
                    page={page}
                    perPage={perPage}
                    onPageChange={setPage}
                    onPerPageChange={setPerPage}
                    meta={meta}
                    entityName="produksi"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSortChange={(by, order) => {
                        setSortBy(by);
                        setSortOrder(order);
                        setPage(1);
                    }}
                />
            </section>

            <ProductionDetailDialog
                productionUid={selectedProductionUid}
                open={isDetailOpen}
                onOpenChange={setIsDetailOpen}
            />
        </div>
    );
}
