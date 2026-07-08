"use client";

import { FilterForm } from "@/components/forms/filter-form";
import { FormDatePicker } from "@/components/forms/form-date-picker";
import { FormInput } from "@/components/forms/form-input";
import { DataTable } from "@/components/ui/data-table";
import { hasPermission, hasRole } from "@/constants/roles";
import { useReceivingDebts } from "@/features/purchase/api/purchase-api";
import type { Receiving } from "@/features/purchase/types";
import { useAppRouter } from "@/hooks/use-app-router";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { IconCash } from "@tabler/icons-react";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useForm } from "react-hook-form";

interface SalesDebtsFilterValues {
    search: string;
    tanggal_dari: string;
    tanggal_sampai: string;
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
    const [perPage, setPerPage] = useState(10);
    const [sortBy, setSortBy] = useState<string | undefined>("tanggal_terima");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>("asc");
    const [appliedFilters, setAppliedFilters] = useState<{
        search?: string;
        from?: string;
        to?: string;
        tanggal_dari?: string;
        tanggal_sampai?: string;
    }>({});

    const filterMethods = useForm<SalesDebtsFilterValues>({
        defaultValues: {
            search: "",
            tanggal_dari: "",
            tanggal_sampai: "",
        },
    });

    const handleFilterSubmit = (data: SalesDebtsFilterValues) => {
        setAppliedFilters({
            search: data.search || undefined,
            from: data.tanggal_dari || undefined,
            tanggal_dari: data.tanggal_dari || undefined,
            to: data.tanggal_sampai || undefined,
            tanggal_sampai: data.tanggal_sampai || undefined,
        });
        setPage(1);
    };

    const handleFilterReset = () => {
        filterMethods.reset({
            search: "",
            tanggal_dari: "",
            tanggal_sampai: "",
        });
        setAppliedFilters({});
        setPage(1);
    };

    const { data: debtsData, isLoading, isFetching } = useReceivingDebts({
        page,
        per_page: perPage,
        sort_by: sortBy,
        sort_order: sortOrder,
        ...appliedFilters,
    });

    const receivings = debtsData?.data || [];

    if (!hasViewPurchase) {
        return (
            <div className="p-8 text-center bg-white border border-slate-100 rounded-2xl shadow-sm">
                <p className="text-sm font-bold text-slate-800">Akses Ditolak</p>
                <p className="text-xs text-slate-400 mt-1">
                    Anda tidak memiliki izin untuk melihat data hutang sales.
                </p>
            </div>
        );
    }

    const columns: ColumnDef<Receiving>[] = [
        {
            accessorKey: "tanggal_terima",
            header: "Tanggal Terima",
            cell: ({ row }) => {
                const val = row.original.tanggal_terima || row.original.created_at;
                try {
                    return (
                        <span className="font-medium text-slate-600">
                            {format(new Date(val), "dd MMM yyyy", { locale: id })}
                        </span>
                    );
                } catch {
                    return <span className="font-medium text-slate-600">{val}</span>;
                }
            },
        },
        {
            accessorKey: "nomor_penerimaan",
            header: "No. Penerimaan",
            cell: ({ row }) => (
                <span className="font-bold text-slate-800">{row.original.nomor_penerimaan}</span>
            ),
        },
        {
            accessorKey: "supplier",
            header: "Supplier",
            cell: ({ row }) => (
                <span className="font-semibold text-slate-700">
                    {row.original.supplier_relationship?.nama || row.original.supplier || "-"}
                </span>
            ),
        },
        {
            accessorKey: "nilai_faktur",
            header: "Nilai Faktur",
            meta: {
                headerClassName: "text-right",
                cellClassName: "text-right font-semibold text-slate-700 tabular-nums",
            },
            cell: ({ row }) => formatRupiah(row.original.nilai_faktur || 0),
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
            accessorKey: "sisa_hutang",
            header: "Sisa Hutang",
            meta: {
                headerClassName: "text-right",
                cellClassName: "text-right font-extrabold text-rose-600 tabular-nums",
            },
            cell: ({ row }) => {
                const sisa = row.original.sisa_hutang !== undefined
                    ? row.original.sisa_hutang
                    : Math.max(0, (row.original.nilai_faktur || 0) - (row.original.total_dibayar || 0));
                return formatRupiah(sisa);
            },
        },
        {
            accessorKey: "nomor_faktur",
            header: "No. Faktur",
            cell: ({ row }) => (
                <span className="text-slate-500 font-medium">{row.original.nomor_faktur || "-"}</span>
            ),
        },
        {
            id: "actions",
            header: "Aksi",
            meta: {
                headerClassName: "text-center w-24",
                cellClassName: "text-center",
            },
            cell: ({ row }) => (
                <button
                    onClick={() => router.push(`/admin/purchase/payment/new?receiving_uid=${row.original.uid}`)}
                    className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 hover:text-emerald-800 border border-emerald-100 rounded-lg text-[10px] font-extrabold flex items-center gap-1 cursor-pointer transition-all active:scale-[0.98] mx-auto"
                    title="Bayar Hutang"
                >
                    <IconCash size={12} /> Bayar
                </button>
            ),
        },
    ];

    return (
        <div>
            {/* List Table & Filter Section */}
            <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-4">
                <FilterForm
                    methods={filterMethods}
                    onSubmit={handleFilterSubmit}
                    onReset={handleFilterReset}
                >
                    <FormInput<SalesDebtsFilterValues>
                        name="search"
                        label="Cari Transaksi"
                        placeholder="Supplier, no. penerimaan, faktur..."
                    />
                    <FormDatePicker<SalesDebtsFilterValues>
                        name="tanggal_dari"
                        label="Tanggal Mulai"
                        placeholder="Pilih tanggal"
                    />
                    <FormDatePicker<SalesDebtsFilterValues>
                        name="tanggal_sampai"
                        label="Tanggal Selesai"
                        placeholder="Pilih tanggal"
                    />
                </FilterForm>

                <DataTable
                    columns={columns}
                    data={receivings}
                    isLoading={isLoading}
                    isFetching={isFetching}
                    emptyMessage="Tidak ada data hutang sales yang ditemukan."
                    page={page}
                    perPage={perPage}
                    onPageChange={setPage}
                    onPerPageChange={(newPerPage) => {
                        setPerPage(newPerPage);
                        setPage(1);
                    }}
                    meta={debtsData?.meta}
                    entityName="hutang sales"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSortChange={(by, order) => {
                        setSortBy(by);
                        setSortOrder(order);
                        setPage(1);
                    }}
                    virtualize={true}
                    estimateRowHeight={48}
                />
            </section>
        </div>
    );
}

export default SalesDebtsPage;
