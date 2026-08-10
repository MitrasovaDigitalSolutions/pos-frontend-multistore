"use client";

import { FilterForm } from "@/components/forms/filter-form";
import { FormDatePicker } from "@/components/forms/form-date-picker";
import { FormInput } from "@/components/forms/form-input";
import { DataTable } from "@/components/ui/data-table";
import { DataTableTextActionButton } from "@/components/ui/data-table-actions";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { hasPermission, hasRole } from "@/constants/roles";
import { useReceivingDebts } from "@/features/purchase/api/purchase-api";
import { BulkPayDebtDialog } from "@/features/purchase/components/payment/bulk-pay-debt-dialog";
import type { Receiving } from "@/features/purchase/types";
import { useAppRouter } from "@/hooks/use-app-router";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { IconArrowLeft, IconCash, IconFileInvoice, IconReceipt } from "@tabler/icons-react";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { AccessDeniedState } from "@/components/ui/access-denied-state";
import { useActiveStoreStore } from "@/stores/active-store-store";

interface SupplierDebtsFilterValues {
    search: string;
    tanggal_dari: string;
    tanggal_sampai: string;
}

interface SupplierDebtsDetailPageProps {
    supplierUid: string;
    supplierName: string;
}

export function SupplierDebtsDetailPage({ supplierUid, supplierName }: SupplierDebtsDetailPageProps) {
    const { data: session } = useSession();
    const router = useAppRouter();
    const { activeStoreUid } = useActiveStoreStore();
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
        tanggal_dari?: string;
        tanggal_sampai?: string;
    }>({});

    // Bulk selection and dialog states
    const [selectedUids, setSelectedUids] = useState<string[]>([]);
    const [isBulkPayOpen, setIsBulkPayOpen] = useState(false);

    // Reset selections and modal when active store or supplier changes
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedUids([]);
        setIsBulkPayOpen(false);
    }, [activeStoreUid, supplierUid]);

    const filterMethods = useForm<SupplierDebtsFilterValues>({
        defaultValues: {
            search: "",
            tanggal_dari: "",
            tanggal_sampai: "",
        },
    });

    const handleFilterSubmit = (data: SupplierDebtsFilterValues) => {
        setAppliedFilters({
            search: data.search || undefined,
            tanggal_dari: data.tanggal_dari || undefined,
            tanggal_sampai: data.tanggal_sampai || undefined,
        });
        setPage(1);
        setSelectedUids([]);
    };

    const handleFilterReset = () => {
        filterMethods.reset({
            search: "",
            tanggal_dari: "",
            tanggal_sampai: "",
        });
        setAppliedFilters({});
        setPage(1);
        setSelectedUids([]);
    };

    const { data: debtsData, isLoading, isFetching } = useReceivingDebts({
        page,
        per_page: perPage,
        sort_by: sortBy,
        sort_order: sortOrder,
        supplier_uid: supplierUid,
        ...appliedFilters,
    });

    const receivings = debtsData?.data || [];

    // Filter payable (unpaid / partial / pending) receivings
    const payableReceivings = receivings.filter((r) => r.status_pembayaran !== "paid");
    const isAllSelected =
        payableReceivings.length > 0 &&
        payableReceivings.every((r) => selectedUids.includes(r.uid));

    const handleSelectAllToggle = () => {
        if (isAllSelected) {
            setSelectedUids([]);
        } else {
            setSelectedUids(payableReceivings.map((r) => r.uid));
        }
    };

    const handleRowSelectToggle = (uid: string) => {
        setSelectedUids((prev) =>
            prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
        );
    };

    const selectedReceivings = receivings.filter((r) => selectedUids.includes(r.uid));

    // Compute summary from loaded page data
    const totalFaktur = receivings.reduce((sum, r) => sum + (r.nilai_faktur || 0), 0);
    const totalDibayar = receivings.reduce((sum, r) => sum + (r.total_dibayar || 0), 0);
    const totalSisaHutang = receivings.reduce((sum, r) => {
        const sisa = r.sisa_hutang !== undefined
            ? r.sisa_hutang
            : Math.max(0, (r.nilai_faktur || 0) - (r.total_dibayar || 0));
        return sum + sisa;
    }, 0);

    if (!hasViewPurchase) {
        return (
            <AccessDeniedState
                description="Anda tidak memiliki izin untuk melihat detail rincian hutang ke supplier."
                requiredPermission="view_purchases"
            />
        );
    }

    const columns: ColumnDef<Receiving>[] = [
        {
            id: "select",
            size: 36,
            header: () => (
                <div className="flex justify-center items-center">
                    <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={handleSelectAllToggle}
                        disabled={payableReceivings.length === 0}
                        title="Pilih Semua yang Belum Lunas"
                    />
                </div>
            ),
            cell: ({ row }) => {
                const isPaid = row.original.status_pembayaran === "paid";
                const isChecked = selectedUids.includes(row.original.uid);
                return (
                    <div className="flex justify-center items-center">
                        <Checkbox
                            checked={isChecked}
                            disabled={isPaid}
                            onCheckedChange={() => handleRowSelectToggle(row.original.uid)}
                        />
                    </div>
                );
            },
            meta: {
                headerClassName: "w-8 text-center px-1",
                cellClassName: "w-8 text-center px-1",
            },
        },
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
            accessorKey: "nomor_faktur",
            header: "No. Faktur",
            cell: ({ row }) => (
                <span className="text-slate-500 font-medium">{row.original.nomor_faktur || "-"}</span>
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
            accessorKey: "status_pembayaran",
            header: "Status",
            cell: ({ row }) => {
                const status = row.original.status_pembayaran;
                const labels: Record<string, string> = {
                    paid: "Lunas",
                    partial: "Sebagian",
                    unpaid: "Belum Bayar",
                    pending: "Pending",
                };
                return <StatusBadge status={status} label={labels[status] ?? status} />;
            },
        },
        {
            id: "actions",
            header: "Aksi",
            meta: {
                headerClassName: "text-center w-24 sticky right-0 top-0 bg-slate-50 z-30 shadow-[-1px_0_0_0_rgba(241,245,249,1)] border-l border-slate-100",
                cellClassName: "text-center sticky right-0 bg-white group-hover:bg-slate-100 z-10 shadow-[-1px_0_0_0_rgba(241,245,249,1)] border-l border-slate-100 transition-colors",
            },
            cell: ({ row }) => (
                <DataTableTextActionButton
                    variant="emerald"
                    onClick={() =>
                        router.push(
                            `/admin/purchase/payment/new?receiving_uid=${row.original.uid}&from=${encodeURIComponent(`/admin/debts/sales/${supplierUid}?nama=${encodeURIComponent(supplierName)}`)}`
                        )
                    }
                    icon={<IconCash size={14} />}
                    tooltip="Bayar Hutang Single"
                    className="mx-auto"
                >
                    Bayar
                </DataTableTextActionButton>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header with back button */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => router.push("/admin/debts/sales")}
                    className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all shrink-0 cursor-pointer"
                    title="Kembali ke Daftar Hutang"
                >
                    <IconArrowLeft size={15} />
                </button>
                <div>
                    <h3 className="text-sm font-bold text-slate-800">{supplierName}</h3>
                    <p className="text-[10px] text-slate-400">
                        Detail hutang per transaksi penerimaan barang
                    </p>
                </div>
            </div>

            {/* Summary Cards (halaman ini) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-slate-500/5 rounded-full blur-xl pointer-events-none" />
                    <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                            Total Nilai Faktur
                        </span>
                        <p className="text-lg font-black text-slate-800 leading-none tabular-nums">
                            {formatRupiah(totalFaktur)}
                        </p>
                        <span className="text-[9px] text-slate-400 block">Halaman saat ini</span>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-slate-50 text-slate-500 flex items-center justify-center border border-slate-200 shrink-0">
                        <IconFileInvoice size={18} className="stroke-[2.5]" />
                    </div>
                </div>

                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
                    <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                            Total Dibayar
                        </span>
                        <p className="text-lg font-black text-emerald-600 leading-none tabular-nums">
                            {formatRupiah(totalDibayar)}
                        </p>
                        <span className="text-[9px] text-slate-400 block">Halaman saat ini</span>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
                        <IconCash size={18} className="stroke-[2.5]" />
                    </div>
                </div>

                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-rose-500/5 rounded-full blur-xl pointer-events-none" />
                    <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                            Sisa Hutang
                        </span>
                        <p className="text-lg font-black text-rose-600 leading-none tabular-nums">
                            {formatRupiah(totalSisaHutang)}
                        </p>
                        <span className="text-[9px] text-slate-400 block">Halaman saat ini</span>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shrink-0">
                        <IconReceipt size={18} className="stroke-[2.5]" />
                    </div>
                </div>
            </div>

            {/* List Table & Filter Section */}
            <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-4">
                <div className="border-b border-slate-50 pb-3">
                    <h4 className="text-xs font-bold text-slate-800">Daftar Hutang Penerimaan</h4>
                    <p className="text-[10px] text-slate-400">
                        Pilih faktur menggunakan checkbox pada tabel, lalu klik tombol &quot;Pelunasan Sekaligus&quot; untuk melunasi beberapa faktur secara bersamaan.
                    </p>
                </div>

                <FilterForm
                    methods={filterMethods}
                    onSubmit={handleFilterSubmit}
                    onReset={handleFilterReset}
                >
                    <FormInput<SupplierDebtsFilterValues>
                        name="search"
                        label="Cari Transaksi"
                        placeholder="No. penerimaan, faktur..."
                    />
                    <FormDatePicker<SupplierDebtsFilterValues>
                        name="tanggal_dari"
                        label="Tanggal Mulai"
                        placeholder="Pilih tanggal"
                    />
                    <FormDatePicker<SupplierDebtsFilterValues>
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
                    emptyMessage={`Tidak ada data hutang untuk supplier ${supplierName}.`}
                    page={page}
                    perPage={perPage}
                    onPageChange={setPage}
                    onPerPageChange={(newPerPage) => {
                        setPerPage(newPerPage);
                        setPage(1);
                        setSelectedUids([]);
                    }}
                    meta={debtsData?.meta}
                    entityName="hutang penerimaan"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSortChange={(by, order) => {
                        setSortBy(by);
                        setSortOrder(order);
                        setPage(1);
                    }}
                    virtualize={true}
                    estimateRowHeight={48}
                    extraToolbarActions={
                        <div className="flex items-center gap-2">
                            <Button
                                onClick={() => {
                                    if (selectedUids.length === 0 && payableReceivings.length > 0) {
                                        setSelectedUids(payableReceivings.map((r) => r.uid));
                                    }
                                    setIsBulkPayOpen(true);
                                }}
                                disabled={payableReceivings.length === 0}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 px-3.5 rounded-xl flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
                            >
                                <IconCash size={15} />
                                <span>
                                    {selectedUids.length > 0
                                        ? `Pelunasan Sekaligus (${selectedUids.length} Terpilih)`
                                        : "Pelunasan Sekaligus"}
                                </span>
                            </Button>

                            {selectedUids.length > 0 && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setSelectedUids([])}
                                    className="text-xs h-9 border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer rounded-xl bg-white"
                                >
                                    Reset Pilihan
                                </Button>
                            )}
                        </div>
                    }
                />
            </section>

            {/* Bulk Pay Debt Dialog */}
            <BulkPayDebtDialog
                open={isBulkPayOpen}
                onOpenChange={setIsBulkPayOpen}
                supplierName={supplierName}
                selectedReceivings={selectedReceivings}
                onSuccess={() => setSelectedUids([])}
            />
        </div>
    );
}

export default SupplierDebtsDetailPage;
