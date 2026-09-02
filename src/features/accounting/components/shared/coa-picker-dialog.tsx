"use client";

import { useMemo, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import {
    IconCheck,
    IconNotebook,
    IconSearch,
} from "@tabler/icons-react";
import { BaseDialog } from "@/components/ui/base-dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DataTable, DataTableTextActionButton } from "@/components/ui/data-table";
import { cn } from "@/lib/utils";
import { ACCOUNT_TYPE_CONFIG } from "../../constants/counterpart-constants";
import type { ChartOfAccount, ChartOfAccountType } from "../../types";

export interface CoaPickerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (account: ChartOfAccount) => void;
    accounts?: ChartOfAccount[];
    selectedUid?: string | null;
    excludeUid?: string | null;
    excludeUids?: string[];
    allowedTypes?: ChartOfAccountType[];
    title?: string;
}

export function CoaPickerDialog({
    open,
    onOpenChange,
    onSelect,
    accounts = [],
    selectedUid,
    excludeUid,
    excludeUids,
    allowedTypes,
    title = "Pilih Akun Chart of Accounts (CoA)",
}: CoaPickerDialogProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<string>("all");

    const excludedUidSet = useMemo(() => {
        const set = new Set<string>();
        if (excludeUid) set.add(excludeUid);
        if (excludeUids && Array.isArray(excludeUids)) {
            excludeUids.forEach((uid) => {
                if (uid) set.add(uid);
            });
        }
        return set;
    }, [excludeUid, excludeUids]);

    const activeAccounts = useMemo(() => {
        return accounts
            .filter((a) => a.is_active)
            .filter((a) => !allowedTypes || allowedTypes.includes(a.tipe as ChartOfAccountType))
            .sort((a, b) => (a.kode || "").localeCompare(b.kode || ""));
    }, [accounts, allowedTypes]);

    const filteredAccounts = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();

        return activeAccounts.filter((acc) => {
            const matchesSearch =
                !query ||
                acc.kode.toLowerCase().includes(query) ||
                acc.nama.toLowerCase().includes(query);

            const matchesType = activeTab === "all" || acc.tipe === activeTab;

            return matchesSearch && matchesType;
        });
    }, [activeAccounts, searchQuery, activeTab]);

    const typeTabs: { id: string; label: string }[] = useMemo(() => {
        const baseTabs = [
            { id: "all", label: "Semua Tipe" },
            { id: "asset", label: "Aset" },
            { id: "liability", label: "Kewajiban" },
            { id: "equity", label: "Ekuitas" },
            { id: "revenue", label: "Pendapatan" },
            { id: "expense", label: "Beban" },
        ];

        if (!allowedTypes) return baseTabs;
        return baseTabs.filter(
            (tab) => tab.id === "all" || allowedTypes.includes(tab.id as ChartOfAccountType)
        );
    }, [allowedTypes]);

    const handlePick = (acc: ChartOfAccount) => {
        if (excludedUidSet.has(acc.uid)) return;
        onSelect(acc);
        onOpenChange(false);
    };

    const columns = useMemo<ColumnDef<ChartOfAccount>[]>(() => {
        return [
            {
                accessorKey: "kode",
                header: "Kode Akun",
                size: 90,
                cell: ({ row }) => (
                    <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-200/80 dark:border-blue-900 shrink-0">
                        {row.original.kode}
                    </span>
                ),
            },
            {
                accessorKey: "nama",
                header: "Nama Akun",
                minSize: 180,
                cell: ({ row }) => (
                    <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs line-clamp-1">
                        {row.original.nama}
                    </div>
                ),
            },
            {
                accessorKey: "tipe",
                header: "Tipe",
                size: 100,
                cell: ({ row }) => {
                    const typeConfig = ACCOUNT_TYPE_CONFIG[row.original.tipe as ChartOfAccountType];
                    return typeConfig ? (
                        <Badge
                            variant="outline"
                            className={cn("text-[10px] px-1.5 py-0 font-medium", typeConfig.bg, typeConfig.text, typeConfig.border)}
                        >
                            {typeConfig.label}
                        </Badge>
                    ) : (
                        <span className="text-xs text-slate-500 capitalize">{row.original.tipe}</span>
                    );
                },
            },
            {
                accessorKey: "saldo_normal",
                header: "Saldo Normal",
                size: 90,
                cell: ({ row }) => (
                    <span className="text-xs text-slate-600 dark:text-slate-400 capitalize">
                        {row.original.saldo_normal || "-"}
                    </span>
                ),
            },
            {
                id: "actions",
                header: () => <span className="sr-only">Aksi</span>,
                size: 70,
                cell: ({ row }) => {
                    const acc = row.original;
                    const isSelected = selectedUid === acc.uid;
                    const isExcluded = excludedUidSet.has(acc.uid);

                    if (isExcluded) {
                        return (
                            <span className="text-[10px] text-rose-500 dark:text-rose-400 font-semibold italic bg-rose-50 dark:bg-rose-950/50 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-900">
                                Sudah Terpakai
                            </span>
                        );
                    }

                    if (isSelected) {
                        return (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                                <IconCheck size={14} stroke={2.5} />
                                Terpilih
                            </span>
                        );
                    }

                    return (
                        <DataTableTextActionButton
                            variant="indigo"
                            onClick={() => handlePick(acc)}
                            icon={<IconCheck size={12} />}
                            tooltip="Pilih Akun Ini"
                        >
                            Pilih
                        </DataTableTextActionButton>
                    );
                },
            },
        ];
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedUid, excludedUidSet]);

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            scrollable={false}
            className="w-[95vw] sm:max-w-2xl md:max-w-3xl max-h-[85vh] h-[85vh] flex flex-col p-4 sm:p-6 overflow-hidden"
            title={
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/60 flex items-center justify-center shrink-0">
                        <IconNotebook size={16} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            {title}
                        </p>
                        <p className="text-xs font-normal text-slate-500">
                            Pilih akun dari daftar Chart of Accounts (CoA)
                        </p>
                    </div>
                </div>
            }
        >
            <div className="flex flex-col flex-1 min-h-0 gap-2.5 overflow-hidden pt-1">
                {/* Search and Tabs Bar */}
                <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="relative flex-1">
                        <IconSearch
                            size={14}
                            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari kode atau nama akun..."
                            className="pl-8 pr-3 h-8 text-xs rounded-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                            autoFocus
                        />
                    </div>

                    <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                        {typeTabs.map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${isActive
                                        ? "bg-blue-600 text-white shadow-xs"
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Table Container */}
                <div className="flex-1 min-h-0 border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col">
                    <DataTable
                        columns={columns}
                        data={filteredAccounts}
                        emptyMessage="Tidak ada akun perkiraan yang sesuai."
                        className="h-full max-h-none border-none shadow-none"
                    />
                </div>

                {/* Footer status summary */}
                <div className="shrink-0 flex items-center justify-between text-xs text-slate-400 pt-0.5">
                    <span>Menampilkan {filteredAccounts.length} dari {activeAccounts.length} akun aktif</span>
                    <span>Klik tombol &quot;Pilih&quot; untuk memilih akun</span>
                </div>
            </div>
        </BaseDialog>
    );
}
