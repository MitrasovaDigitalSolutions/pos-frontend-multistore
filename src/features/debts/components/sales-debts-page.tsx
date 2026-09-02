"use client";

import { FilterForm } from "@/components/forms/filter-form";
import { FormInput } from "@/components/forms/form-input";
import { DataTable } from "@/components/ui/data-table";
import { DataTableTextActionButton } from "@/components/ui/data-table-actions";
import { hasPermission, hasRole } from "@/constants/roles";
import { useReceivingDebtsSummary } from "@/features/purchase/api/purchase-api";
import type { SupplierDebtSummary } from "@/features/purchase/types";
import { useAppRouter } from "@/hooks/use-app-router";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { IconBuilding, IconCash, IconChevronRight } from "@tabler/icons-react";
import type { ColumnDef } from "@tanstack/react-table";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { AccessDeniedState } from "@/components/ui/access-denied-state";

interface SalesDebtsFilterValues {
    search: string;
}

export function SalesDebtsPage() {
    const { data: session } = useSession();
    const router = useAppRouter();
    const userRoles = session?.user?.roles || [];
    const userPermissions = session?.user?.permissions || [];

    const hasViewPurchase =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "view_purchase") ||
        hasPermission(userRoles, userPermissions, "manage_purchase");

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(15);
    const [sortBy, setSortBy] = useState<string | undefined>(undefined);
    const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>(undefined);
    const [appliedFilters, setAppliedFilters] = useState<{ search?: string }>({});

    const filterMethods = useForm<SalesDebtsFilterValues>({
        defaultValues: { search: "" },
    });

    const handleFilterSubmit = (data: SalesDebtsFilterValues) => {
        setAppliedFilters({ search: data.search || undefined });
        setPage(1);
    };

    const handleFilterReset = () => {
        filterMethods.reset({ search: "" });
        setAppliedFilters({});
        setPage(1);
    };

    const { data: summaryData, isLoading, isFetching } = useReceivingDebtsSummary({
        page,
        per_page: perPage,
        sort_by: sortBy,
        sort_order: sortOrder,
        ...appliedFilters,
    });

    const suppliers = summaryData?.data || [];
    const totalSuppliers = summaryData?.meta?.total ?? 0;
    const totalHutang = suppliers.reduce((sum, s) => sum + (s.total_hutang || 0), 0);

    if (!hasViewPurchase) {
        return (
            <AccessDeniedState
                description="Anda tidak memiliki izin untuk melihat data hutang usaha / supplier."
                requiredPermission="view_purchases"
            />
        );
    }

    const columns: ColumnDef<SupplierDebtSummary>[] = [
        {
            accessorKey: "nama_supplier",
            header: "Supplier",
            cell: ({ row }) => (
                <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-slate-800">{row.original.nama_supplier}</span>
                    {row.original.alamat && (
                        <span className="text-[10px] text-slate-400 truncate max-w-[200px]">
                            {row.original.alamat}
                        </span>
                    )}
                </div>
            ),
        },
        {
            accessorKey: "nomor_telepon",
            header: "Kontak",
            cell: ({ row }) => (
                <div className="flex flex-col text-[11px] text-slate-500">
                    <span>{row.original.nomor_telepon || "-"}</span>
                    {row.original.email && (
                        <span className="text-[10px] text-slate-400">{row.original.email}</span>
                    )}
                </div>
            ),
        },
        {
            accessorKey: "total_nilai_faktur",
            header: "Total Nilai Faktur",
            meta: {
                headerClassName: "text-right",
                cellClassName: "text-right font-semibold text-slate-700 tabular-nums",
            },
            cell: ({ row }) => formatRupiah(row.original.total_nilai_faktur || 0),
        },
        {
            accessorKey: "total_dibayar",
            header: "Total Dibayar",
            meta: {
                headerClassName: "text-right",
                cellClassName: "text-right font-semibold text-emerald-600 tabular-nums",
            },
            cell: ({ row }) => formatRupiah(row.original.total_dibayar || 0),
        },
        {
            accessorKey: "total_hutang",
            header: "Sisa Hutang",
            meta: {
                headerClassName: "text-right",
                cellClassName: "text-right font-extrabold text-rose-600 tabular-nums",
            },
            cell: ({ row }) => formatRupiah(row.original.total_hutang || 0),
        },
        {
            id: "actions",
            header: "Aksi",
            meta: {
                headerClassName: "text-center w-24",
                cellClassName: "text-center",
            },
            cell: ({ row }) => (
                <DataTableTextActionButton
                    variant="indigo"
                    onClick={() =>
                        router.push(
                            `/admin/debts/sales/${row.original.supplier_uid}?nama=${encodeURIComponent(row.original.nama_supplier)}`
                        )
                    }
                    icon={<IconChevronRight size={14} />}
                    tooltip="Lihat Detail Hutang"
                    className="mx-auto"
                >
                    Detail
                </DataTableTextActionButton>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            {/* Compact Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-2.5 shadow-xs">
                {/* Card 1: Jumlah Supplier */}
                <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100/60 dark:border-rose-900/30 min-w-0">
                    <div className="p-2 bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 rounded-xl shrink-0">
                        <IconBuilding size={18} className="stroke-[2.5]" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block truncate">
                            Jumlah Supplier
                        </span>
                        <div className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 leading-tight">
                            {isLoading ? (
                                <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded animate-pulse my-0.5" />
                            ) : (
                                <span>
                                    {totalSuppliers}{" "}
                                    <span className="text-[11px] font-medium text-slate-400 font-normal">Supplier</span>
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Card 2: Total Akumulasi Hutang */}
                <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/60 dark:border-indigo-900/30 min-w-0">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 rounded-xl shrink-0">
                        <IconCash size={18} className="stroke-[2.5]" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block truncate">
                            Total Akumulasi Hutang
                        </span>
                        <div className="text-base sm:text-lg font-black text-indigo-600 dark:text-indigo-400 tabular-nums leading-tight">
                            {isLoading ? (
                                <div className="h-5 w-28 bg-slate-200 dark:bg-slate-800 rounded animate-pulse my-0.5" />
                            ) : (
                                formatRupiah(totalHutang)
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* List Table & Filter Section */}
            <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                    <div>
                        <h4 className="text-xs font-bold text-slate-800">Daftar Hutang Per Supplier</h4>
                        <p className="text-[10px] text-slate-400">
                            Klik &quot;Detail&quot; untuk melihat rincian hutang per transaksi penerimaan.
                        </p>
                    </div>
                </div>

                <FilterForm
                    methods={filterMethods}
                    onSubmit={handleFilterSubmit}
                    onReset={handleFilterReset}
                >
                    <FormInput<SalesDebtsFilterValues>
                        name="search"
                        label="Cari Supplier"
                        placeholder="Nama supplier, email, telepon..."
                    />
                </FilterForm>

                <DataTable
                    columns={columns}
                    data={suppliers}
                    isLoading={isLoading}
                    isFetching={isFetching}
                    emptyMessage="Tidak ada data hutang supplier yang ditemukan."
                    page={page}
                    perPage={perPage}
                    onPageChange={setPage}
                    onPerPageChange={(newPerPage) => {
                        setPerPage(newPerPage);
                        setPage(1);
                    }}
                    meta={summaryData?.meta}
                    entityName="supplier"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSortChange={(by, order) => {
                        setSortBy(by);
                        setSortOrder(order);
                        setPage(1);
                    }}
                    virtualize={true}
                    estimateRowHeight={56}
                />
            </section>
        </div>
    );
}

export default SalesDebtsPage;
