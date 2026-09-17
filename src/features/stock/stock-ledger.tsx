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
import { AccessDeniedState } from "@/components/ui/access-denied-state";

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
            <AccessDeniedState
                description="Anda tidak memiliki izin untuk melihat kartu stok atau riwayat mutasi inventori."
                requiredPermission="view_inventory"
            />
        );
    }

    const tipeOptions = [
        { value: "all", label: "Semua Tipe" },
        { value: "receive", label: "Penerimaan" },
        { value: "sale", label: "Penjualan" },
        { value: "sale_void", label: "Pembatalan Penjualan" },
        { value: "production_in", label: "Produksi Masuk (Hasil Produksi)" },
        { value: "production_out", label: "Produksi Keluar (Bahan Baku)" },
        { value: "transfer_in", label: "Transfer Masuk (Transfer IN)" },
        { value: "transfer_out", label: "Transfer Keluar (Transfer OUT)" },
        { value: "stock_in", label: "Stok Masuk" },
        { value: "stock_out", label: "Stok Keluar (Pemakaian)" },
        { value: "adjustment", label: "Penyesuaian" },
        { value: "opname", label: "Opname" },
        { value: "retur", label: "Retur" },
        { value: "void", label: "Pembatalan" },
    ];

    return (
        <div className="space-y-4 sm:space-y-6 pb-28 sm:pb-8">
            {/* Header */}
            <section id="stock-ledger-header" className="bg-white border border-slate-100 rounded-2xl shadow-xs p-3.5 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                            Kartu Stok (Buku Mutasi Inventori)
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                            Buku kendali log audit pergerakan keluar-masuk stok barang, riwayat transaksi kasir, dan penyesuaian inventori.
                        </p>
                    </div>
                </div>
            </section>

            {/* Filter Form */}
            <div id="ledger-filter-card">
                <FilterForm
                    methods={filterMethods}
                    onSubmit={handleFilterSubmit}
                    onReset={handleFilterReset}
                >
                    <div id="ledger-search-input">
                        <FormInput<LedgerFilterValues>
                            name="search"
                            label="Cari Produk atau Keterangan"
                            placeholder="Cari nama produk, alasan..."
                        />
                    </div>
                    <div id="ledger-type-filter">
                        <FormSelect<LedgerFilterValues>
                            name="tipe"
                            label="Tipe Perubahan"
                            options={tipeOptions}
                            placeholder="Semua Tipe"
                        />
                    </div>
                </FilterForm>
            </div>

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
