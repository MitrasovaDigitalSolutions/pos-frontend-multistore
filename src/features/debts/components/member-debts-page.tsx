"use client";

import { FilterForm } from "@/components/forms/filter-form";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { DataTable } from "@/components/ui/data-table";
import { hasPermission, hasRole } from "@/constants/roles";
import { useMemberDebts } from "@/features/members/api/members-api";
import type { Member } from "@/features/members/types";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { IconCash, IconClock, IconUsers } from "@tabler/icons-react";
import type { ColumnDef } from "@tanstack/react-table";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { DebtHistoryDialog } from "./debt-history-dialog";
import { PayDebtDialog } from "./pay-debt-dialog";

interface MemberDebtsFilterValues {
    search: string;
    status: string;
}

export function MemberDebtsPage() {
    const { data: session } = useSession();
    const userRoles = session?.user?.roles || [];
    const userPermissions = session?.user?.permissions || [];

    const hasViewMembers =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "view_members");

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [sortBy, setSortBy] = useState<string | undefined>("hutang");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>("desc");
    const [appliedFilters, setAppliedFilters] = useState<{
        search?: string;
        status?: string;
    }>(() => ({
        status: "active",
    }));

    const filterMethods = useForm<MemberDebtsFilterValues>({
        defaultValues: {
            search: "",
            status: "active",
        },
    });

    const handleFilterSubmit = (data: MemberDebtsFilterValues) => {
        setAppliedFilters({
            search: data.search || undefined,
            status: data.status !== "all" ? data.status : undefined,
        });
        setPage(1);
    };

    const handleFilterReset = () => {
        filterMethods.reset({
            search: "",
            status: "active",
        });
        setAppliedFilters({
            status: "active",
        });
        setPage(1);
    };

    const { data: debtsData, isLoading, isFetching } = useMemberDebts({
        page,
        per_page: perPage,
        sort_by: sortBy,
        sort_order: sortOrder,
        ...appliedFilters,
    });

    const members = debtsData?.data || [];
    const summary = debtsData?.summary || { total_members_with_debt: 0, total_hutang: 0 };

    // Dialog state
    const [payingMember, setPayingMember] = useState<Member | null>(null);
    const [isPayOpen, setIsPayOpen] = useState(false);

    const [historyMember, setHistoryMember] = useState<Member | null>(null);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    if (!hasViewMembers) {
        return (
            <div className="p-8 text-center bg-white border border-slate-100 rounded-2xl shadow-sm">
                <p className="text-sm font-bold text-slate-800">Akses Ditolak</p>
                <p className="text-xs text-slate-400 mt-1">
                    Anda tidak memiliki izin untuk melihat data hutang member.
                </p>
            </div>
        );
    }

    const columns: ColumnDef<Member>[] = [
        {
            accessorKey: "kode",
            header: "Kode Member",
            cell: ({ row }) => (
                <span className="font-bold text-slate-800">{row.original.kode}</span>
            ),
        },
        {
            accessorKey: "nama",
            header: "Nama Member",
            cell: ({ row }) => (
                <span className="font-semibold text-slate-700">{row.original.nama}</span>
            ),
        },
        {
            accessorKey: "nomor_telepon",
            header: "Kontak",
            cell: ({ row }) => (
                <div className="flex flex-col text-[11px] text-slate-500">
                    <span>{row.original.nomor_telepon || "-"}</span>
                    {row.original.email && <span className="text-[10px] text-slate-400">{row.original.email}</span>}
                </div>
            ),
        },
        {
            accessorKey: "hutang",
            header: "Total Hutang",
            meta: {
                headerClassName: "text-right",
                cellClassName: "text-right font-extrabold text-rose-600 tabular-nums",
            },
            cell: ({ row }) => formatRupiah(row.original.hutang || 0),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const isActive = row.original.status === "active";
                return (
                    <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : "bg-slate-50 text-slate-500 border-slate-200"
                            }`}
                    >
                        {isActive ? "Aktif" : "Nonaktif"}
                    </span>
                );
            },
        },
        {
            id: "actions",
            header: "Aksi",
            meta: {
                headerClassName: "text-center w-28",
                cellClassName: "text-center",
            },
            cell: ({ row }) => (
                <div className="flex items-center justify-center gap-1.5">
                    <button
                        onClick={() => {
                            setPayingMember(row.original);
                            setIsPayOpen(true);
                        }}
                        className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 hover:text-emerald-800 border border-emerald-100 rounded-lg text-[10px] font-extrabold flex items-center gap-1 cursor-pointer transition-all active:scale-[0.98]"
                        title="Bayar Hutang"
                    >
                        <IconCash size={12} /> Bayar
                    </button>
                    <button
                        onClick={() => {
                            setHistoryMember(row.original);
                            setIsHistoryOpen(true);
                        }}
                        className="px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-800 border border-slate-200 rounded-lg text-[10px] font-extrabold flex items-center gap-1 cursor-pointer transition-all active:scale-[0.98]"
                        title="Riwayat Mutasi"
                    >
                        <IconClock size={12} /> Riwayat
                    </button>
                </div>
            ),
        },
    ];

    const statusOptions = [
        { value: "all", label: "Semua Status" },
        { value: "active", label: "Aktif" },
        { value: "inactive", label: "Nonaktif" },
    ];

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Summary Card 1 */}
                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-xl pointer-events-none" />
                    <div className="space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Member Berhutang</span>
                        <h3 className="text-2xl font-black text-slate-800 leading-none">{summary.total_members_with_debt}</h3>
                        <span className="text-[9px] text-slate-400 block mt-0.5">Pelanggan aktif dengan sisa hutang &gt; 0</span>
                    </div>
                    <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shrink-0 shadow-sm shadow-rose-100/5">
                        <IconUsers size={20} className="stroke-[2.5]" />
                    </div>
                </div>

                {/* Summary Card 2 */}
                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
                    <div className="space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Akumulasi Piutang</span>
                        <h3 className="text-2xl font-black text-indigo-600 leading-none tabular-nums">{formatRupiah(summary.total_hutang)}</h3>
                        <span className="text-[9px] text-slate-400 block mt-0.5">Akumulasi seluruh sisa saldo hutang member</span>
                    </div>
                    <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shrink-0 shadow-sm shadow-indigo-100/5">
                        <IconCash size={20} className="stroke-[2.5]" />
                    </div>
                </div>
            </div>

            {/* List Table & Filter Section */}
            <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                    <div>
                        <h4 className="text-xs font-bold text-slate-800">Daftar Tagihan Member</h4>
                        <p className="text-[10px] text-slate-400">Gunakan kolom cari untuk mempercepat filter.</p>
                    </div>
                </div>

                <FilterForm
                    methods={filterMethods}
                    onSubmit={handleFilterSubmit}
                    onReset={handleFilterReset}
                >
                    <FormInput<MemberDebtsFilterValues>
                        name="search"
                        label="Cari Member"
                        placeholder="Nama, kode, telepon..."
                    />
                    <FormSelect<MemberDebtsFilterValues>
                        name="status"
                        label="Status Member"
                        options={statusOptions}
                        placeholder="Semua Status"
                    />
                </FilterForm>

                <DataTable
                    columns={columns}
                    data={members}
                    isLoading={isLoading}
                    isFetching={isFetching}
                    emptyMessage="Tidak ada data member berhutang yang ditemukan."
                    page={page}
                    perPage={perPage}
                    onPageChange={setPage}
                    onPerPageChange={(newPerPage) => {
                        setPerPage(newPerPage);
                        setPage(1);
                    }}
                    meta={debtsData?.meta}
                    entityName="hutang member"
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

            {/* Pay Debt Dialog */}
            <PayDebtDialog
                open={isPayOpen}
                onOpenChange={setIsPayOpen}
                member={payingMember}
            />

            {/* Debt History Dialog */}
            <DebtHistoryDialog
                open={isHistoryOpen}
                onOpenChange={setIsHistoryOpen}
                member={historyMember}
            />
        </div>
    );
}

export default MemberDebtsPage;
