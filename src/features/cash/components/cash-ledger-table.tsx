"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { IconX } from "@tabler/icons-react";

import { DataTable } from "@/components/ui/data-table";
import { useCashFlow, type CashLedger, type CashAccount } from "../api/cash-api";
import { LedgerFilterBar, type LedgerFilterValues } from "./ledger/ledger-filter-bar";
import { LedgerDetailModal } from "./ledger/ledger-detail-modal";
import { useLedgerColumns } from "./ledger/use-ledger-columns";

interface CashLedgerTableProps {
    cashAccountUid?: string;
    onClearSelection: () => void;
    accounts: CashAccount[];
}

export function CashLedgerTable({
    cashAccountUid,
    onClearSelection,
    accounts,
}: CashLedgerTableProps) {
    const [selectedMovement, setSelectedMovement] = useState<CashLedger | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // Ledger filter states
    const [ledgerFilters, setLedgerFilters] = useState({
        page: 1,
        per_page: 15,
        cash_account_uid: cashAccountUid,
        kategori: "" as string,
        search: "" as string,
        from: "" as string,
        to: "" as string,
    });

    const filterMethods = useForm<LedgerFilterValues>({
        defaultValues: {
            search: "",
            kategori: "",
            from: "",
            to: "",
        },
    });

    const handleFilterSubmit = (data: LedgerFilterValues) => {
        setLedgerFilters((prev) => ({
            ...prev,
            page: 1,
            search: data.search,
            kategori: data.kategori,
            from: data.from,
            to: data.to,
        }));
    };

    const handleFilterReset = () => {
        filterMethods.reset({
            search: "",
            kategori: "",
            from: "",
            to: "",
        });
        setLedgerFilters((prev) => ({
            ...prev,
            page: 1,
            search: "",
            kategori: "",
            from: "",
            to: "",
        }));
    };

    const { data: ledgerData, isLoading: ledgerLoading, isFetching: ledgerFetching } = useCashFlow({
        page: ledgerFilters.page,
        per_page: ledgerFilters.per_page,
        cash_account_uid: ledgerFilters.cash_account_uid || undefined,
        kategori: ledgerFilters.kategori || undefined,
        search: ledgerFilters.search || undefined,
        from: ledgerFilters.from || undefined,
        to: ledgerFilters.to || undefined,
    });

    const rawList = ledgerData?.data || [];
    const selectedAccountName = accounts.find((a) => a.uid === cashAccountUid)?.nama;

    const columns = useLedgerColumns();

    return (
        <div className="space-y-4">
            {/* Account Filter Active Indicator */}
            {cashAccountUid && (
                <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-slate-600">
                        Filter Akun: <strong className="text-slate-900">{selectedAccountName}</strong>
                    </span>
                    <button
                        onClick={onClearSelection}
                        className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full font-bold cursor-pointer transition-colors flex items-center gap-1 border border-slate-200"
                    >
                        Tampilkan Semua
                        <IconX size={11} />
                    </button>
                </div>
            )}

            {/* Filter Controls */}
            <LedgerFilterBar
                methods={filterMethods}
                onSubmit={handleFilterSubmit}
                onReset={handleFilterReset}
            />

            {/* DataTable View with Fixed Table Layout & Column Widths */}
            <DataTable
                columns={columns}
                data={rawList}
                isLoading={ledgerLoading}
                isFetching={ledgerFetching}
                tableClassName="table-fixed min-w-[900px]"
                emptyMessage="Tidak ada data mutasi arus kas yang ditemukan."
                paginationMode="server"
                page={ledgerFilters.page}
                perPage={ledgerFilters.per_page}
                onPageChange={(page) => setLedgerFilters((prev) => ({ ...prev, page }))}
                onView={(movement) => {
                    setSelectedMovement(movement);
                    setIsDetailOpen(true);
                }}
                meta={
                    ledgerData?.meta
                        ? {
                              current_page: ledgerData.meta.current_page,
                              last_page: ledgerData.meta.last_page,
                              per_page: ledgerData.meta.per_page,
                              total: ledgerData.meta.total,
                          }
                        : undefined
                }
            />

            {/* Detail Audit Dialog Modal */}
            <LedgerDetailModal
                open={isDetailOpen}
                onOpenChange={setIsDetailOpen}
                movement={selectedMovement}
            />
        </div>
    );
}
