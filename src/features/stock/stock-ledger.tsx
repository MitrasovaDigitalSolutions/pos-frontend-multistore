"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { hasRole, hasPermission } from "@/constants/roles";
import { useStockMovements } from "@/features/stock/api/stock-api";
import { MovementLedger } from "@/features/stock/components/movement-ledger";
import { FilterForm } from "@/components/forms/filter-form";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";

interface LedgerFilterValues {
    search: string;
    tipe: string;
}

export function StockLedger() {
    const { data: session } = useSession();
    const userRoles = session?.user?.roles || [];
    const userPermissions = session?.user?.permissions || [];

    const hasViewInventory =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "view_inventory");

    const [page, setPage] = useState(1);
    const [sortBy, setSortBy] = useState<string | undefined>("created_at");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>("desc");
    const [appliedFilters, setAppliedFilters] = useState<{
        search?: string;
        tipe?: string;
    }>({});

    const filterMethods = useForm<LedgerFilterValues>({
        defaultValues: {
            search: "",
            tipe: "all",
        },
    });

    const handleFilterSubmit = (data: LedgerFilterValues) => {
        setAppliedFilters({
            search: data.search || undefined,
            tipe: data.tipe !== "all" ? data.tipe : undefined,
        });
        setPage(1);
    };

    const handleFilterReset = () => {
        filterMethods.reset({
            search: "",
            tipe: "all",
        });
        setAppliedFilters({});
        setPage(1);
    };

    const { data: movementsData, isLoading, isFetching } = useStockMovements({
        page,
        per_page: 10,
        sort_by: sortBy,
        sort_order: sortOrder,
        search: appliedFilters.search,
        tipe: appliedFilters.tipe,
    });

    if (!hasViewInventory) {
        return (
            <div className="p-8 text-center bg-white border border-slate-100 rounded-2xl shadow-sm">
                <p className="text-sm font-bold text-slate-800">Akses Ditolak</p>
                <p className="text-xs text-slate-400 mt-1">
                    Anda tidak memiliki izin untuk melihat kartu stok/mutasi inventori.
                </p>
            </div>
        );
    }

    const tipeOptions = [
        { value: "all", label: "Semua Tipe" },
        { value: "receive", label: "Penerimaan" },
        { value: "sale", label: "Penjualan" },
        { value: "sale_void", label: "Pembatalan Penjualan" },
        { value: "retur", label: "Retur" },
        { value: "void", label: "Pembatalan" },
        { value: "adjustment", label: "Penyesuaian" },
        { value: "opname", label: "Opname" },
    ];

    return (
        <div className="space-y-6">
            <FilterForm
                methods={filterMethods}
                onSubmit={handleFilterSubmit}
                onReset={handleFilterReset}
            >
                <FormInput<LedgerFilterValues>
                    name="search"
                    label="Cari Produk atau Keterangan"
                    placeholder="Cari nama produk, alasan..."
                />
                <FormSelect<LedgerFilterValues>
                    name="tipe"
                    label="Tipe Perubahan"
                    options={tipeOptions}
                    placeholder="Semua Tipe"
                />
            </FilterForm>

            <MovementLedger
                movements={movementsData?.data || []}
                meta={movementsData?.meta}
                page={page}
                onPageChange={setPage}
                isLoading={isLoading}
                isFetching={isFetching}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={(by, order) => {
                    setSortBy(by);
                    setSortOrder(order);
                    setPage(1);
                }}
            />
        </div>
    );
}
