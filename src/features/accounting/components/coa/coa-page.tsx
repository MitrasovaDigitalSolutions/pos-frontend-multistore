"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
    IconNotebook,
    IconPlus,
    IconEdit,
    IconTrash,
    IconSearch,
    IconChevronDown,
    IconChevronRight,
    IconList,
    IconHierarchy,
    IconFolderPlus,
    IconAlertCircle,
    IconRefresh
} from "@tabler/icons-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { useChartOfAccounts, useFlatChartOfAccounts, useDeleteChartOfAccount } from "../../api/coa-api";
import { CoaDialog } from "./coa-dialog";
import type { ChartOfAccount, ChartOfAccountType } from "../../types";

// Recursive filter helper for Tree View
function filterTree(nodes: ChartOfAccount[], query: string, typeFilter: string): ChartOfAccount[] {
    const lowerQuery = query.toLowerCase().trim();

    return nodes
        .map((node): ChartOfAccount | null => {
            const matchesType = typeFilter === "all" || node.tipe === typeFilter;
            const matchesSearch =
                !lowerQuery ||
                node.kode.toLowerCase().includes(lowerQuery) ||
                node.nama.toLowerCase().includes(lowerQuery);

            const filteredChildren = node.children
                ? filterTree(node.children, query, typeFilter)
                : [];

            const hasChildrenMatch = filteredChildren.length > 0;

            if ((matchesSearch && matchesType) || hasChildrenMatch) {
                return {
                    ...node,
                    children: filteredChildren,
                };
            }

            return null;
        })
        .filter((node): node is ChartOfAccount => node !== null);
}

export function CoaPage() {
    // ─── States ────────────────────────────────────────────────────────────────
    const [viewMode, setViewMode] = useState<"tree" | "flat">("tree");
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<string>("all");
    const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

    // Dialog States
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<ChartOfAccount | null>(null);
    const [parentForCreate, setParentForCreate] = useState<ChartOfAccount | null>(null);

    // Delete States
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [accountToDelete, setAccountToDelete] = useState<ChartOfAccount | null>(null);

    // ─── API Queries & Mutations ───────────────────────────────────────────────
    const {
        data: treeAccounts,
        isLoading: isLoadingTree,
        isRefetching: isRefetchingTree,
        refetch: refetchTree
    } = useChartOfAccounts();

    const {
        data: flatAccounts,
        isLoading: isLoadingFlat,
        isRefetching: isRefetchingFlat,
        refetch: refetchFlat
    } = useFlatChartOfAccounts();

    const deleteMutation = useDeleteChartOfAccount();

    const isLoading = isLoadingTree || isLoadingFlat;
    const isRefetching = isRefetchingTree || isRefetchingFlat;

    const handleRefetch = () => {
        refetchTree();
        refetchFlat();
    };

    // ─── Expand / Collapse Helpers ─────────────────────────────────────────────
    const toggleExpand = (uid: string) => {
        setExpandedNodes((prev) => ({
            ...prev,
            [uid]: !prev[uid],
        }));
    };

    const expandAll = () => {
        if (!treeAccounts) return;
        const expanded: Record<string, boolean> = {};

        const traverse = (nodes: ChartOfAccount[]) => {
            nodes.forEach((acc) => {
                if (acc.children && acc.children.length > 0) {
                    expanded[acc.uid] = true;
                    traverse(acc.children);
                }
            });
        };

        traverse(treeAccounts);
        setExpandedNodes(expanded);
    };

    const collapseAll = () => {
        setExpandedNodes({});
    };

    const isInitialized = useRef(false);

    // Auto-expand nodes when searching so matched children are visible
    useEffect(() => {
        if (searchQuery.trim() && flatAccounts) {
            const expanded: Record<string, boolean> = {};
            const query = searchQuery.toLowerCase();

            // Find matching nodes and expand their ancestors
            const findAndExpandParent = (nodes: ChartOfAccount[], searchTarget: string): boolean => {
                let hasMatch = false;
                for (const node of nodes) {
                    const selfMatch =
                        node.kode.toLowerCase().includes(searchTarget) ||
                        node.nama.toLowerCase().includes(searchTarget);

                    const childrenMatch = node.children
                        ? findAndExpandParent(node.children, searchTarget)
                        : false;

                    if (selfMatch || childrenMatch) {
                        if (node.children && node.children.length > 0) {
                            expanded[node.uid] = true;
                        }
                        hasMatch = true;
                    }
                }
                return hasMatch;
            };

            if (treeAccounts) {
                findAndExpandParent(treeAccounts, query);
            }
            const timer = setTimeout(() => {
                setExpandedNodes((prev) => ({ ...prev, ...expanded }));
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [searchQuery, flatAccounts, treeAccounts]);

    // Expand top-level accounts with children by default on first load
    useEffect(() => {
        if (treeAccounts && !isInitialized.current && !searchQuery) {
            isInitialized.current = true;
            const expanded: Record<string, boolean> = {};
            treeAccounts.forEach((acc) => {
                if (acc.children && acc.children.length > 0) {
                    expanded[acc.uid] = true;
                }
            });
            const timer = setTimeout(() => {
                setExpandedNodes(expanded);
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [treeAccounts, searchQuery]);

    // ─── Mappings ──────────────────────────────────────────────────────────────
    const typeLabelMap: Record<ChartOfAccountType, string> = {
        asset: "Aset",
        liability: "Kewajiban",
        equity: "Ekuitas",
        revenue: "Pendapatan",
        expense: "Beban",
    };

    const typeBadgeStyles: Record<ChartOfAccountType, string> = {
        asset: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50",
        liability: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50",
        equity: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/50",
        revenue: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/20 dark:text-sky-400 dark:border-sky-900/50",
        expense: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/50",
    };

    const typeBorderStyles: Record<ChartOfAccountType, string> = {
        asset: "border-l-emerald-500",
        liability: "border-l-amber-500",
        equity: "border-l-indigo-500",
        revenue: "border-l-sky-500",
        expense: "border-l-rose-500",
    };

    // Filtered data for Tree View
    const filteredTreeData = useMemo(() => {
        if (!treeAccounts) return [];
        return filterTree(treeAccounts, searchQuery, activeTab);
    }, [treeAccounts, searchQuery, activeTab]);

    // Filtered data for Flat View
    const filteredFlatData = useMemo(() => {
        if (!flatAccounts) return [];
        const lowerQuery = searchQuery.toLowerCase().trim();

        return flatAccounts.filter((acc) => {
            const matchesSearch =
                !lowerQuery ||
                acc.kode.toLowerCase().includes(lowerQuery) ||
                acc.nama.toLowerCase().includes(lowerQuery);

            const matchesType = activeTab === "all" || acc.tipe === activeTab;

            return matchesSearch && matchesType;
        });
    }, [flatAccounts, searchQuery, activeTab]);

    // ─── CRUD Actions ──────────────────────────────────────────────────────────
    const handleCreateClick = () => {
        setSelectedAccount(null);
        setParentForCreate(null);
        setDialogOpen(true);
    };

    const handleCreateSubClick = (parent: ChartOfAccount) => {
        setSelectedAccount(null);
        setParentForCreate(parent);
        setDialogOpen(true);
    };

    const handleEditClick = (account: ChartOfAccount) => {
        setSelectedAccount(account);
        setParentForCreate(null);
        setDialogOpen(true);
    };

    const handleDeleteClick = (account: ChartOfAccount) => {
        setAccountToDelete(account);
        setDeleteOpen(true);
    };

    const confirmDelete = async () => {
        if (!accountToDelete) return;
        try {
            await deleteMutation.mutateAsync(accountToDelete.uid);
            toast.success(`Akun ${accountToDelete.kode} - ${accountToDelete.nama} berhasil dihapus.`);
            setDeleteOpen(false);
            setAccountToDelete(null);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Gagal menghapus akun.";
            toast.error(msg);
        }
    };

    // ─── Render Tree Row (Recursive) ──────────────────────────────────────────
    const renderTreeRows = (nodes: ChartOfAccount[], depth = 0): React.ReactNode => {
        return nodes.map((node) => {
            const hasChildren = node.children && node.children.length > 0;
            const isExpanded = !!expandedNodes[node.uid];
            const displayType = typeLabelMap[node.tipe] || node.tipe;
            const badgeClass = typeBadgeStyles[node.tipe] || "";
            const leftBorder = typeBorderStyles[node.tipe] || "";

            return (
                <div key={node.uid} className="flex flex-col">
                    {/* Row Content */}
                    <div
                        className={cn(
                            "grid grid-cols-12 items-center py-2.5 px-4 text-xs border-b border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors border-l-2",
                            leftBorder,
                            !node.is_active && "opacity-50"
                        )}
                    >
                        {/* Kode & Nama (Indented) */}
                        <div
                            className="col-span-5 flex items-center gap-1 min-w-0"
                            style={{ paddingLeft: `${depth * 1.5}rem` }}
                        >
                            {hasChildren ? (
                                <button
                                    onClick={() => toggleExpand(node.uid)}
                                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-500 transition-colors"
                                >
                                    {isExpanded ? (
                                        <IconChevronDown size={14} className="stroke-[3]" />
                                    ) : (
                                        <IconChevronRight size={14} className="stroke-[3]" />
                                    )}
                                </button>
                            ) : (
                                <div className="w-6" /> // spacer
                            )}
                            <span className="font-extrabold text-slate-800 dark:text-slate-200 tracking-wide font-mono mr-2">
                                {node.kode}
                            </span>
                            <span className={cn(
                                "truncate text-slate-700 dark:text-slate-300",
                                depth === 0 ? "font-bold text-slate-900 dark:text-white text-[13px]" : "font-medium"
                            )}>
                                {node.nama}
                            </span>
                        </div>

                        {/* Tipe Akun */}
                        <div className="col-span-2">
                            <Badge variant="outline" className={cn("px-2 py-0.5 rounded-md text-[10px] uppercase font-bold", badgeClass)}>
                                {displayType}
                            </Badge>
                        </div>

                        {/* Debit / Kredit */}
                        <div className="col-span-1 font-bold text-slate-600 dark:text-slate-400 capitalize">
                            {node.saldo_normal || "-"}
                        </div>

                        {/* Status */}
                        <div className="col-span-1">
                            {node.is_active ? (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 uppercase tracking-wider">
                                    Aktif
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-slate-100 text-slate-600 dark:bg-slate-800/40 dark:text-slate-400 border border-slate-200 dark:border-slate-700 uppercase tracking-wider">
                                    Nonaktif
                                </span>
                            )}
                        </div>

                        {/* Keterangan */}
                        <div className="col-span-2 truncate text-slate-500 dark:text-slate-400 pr-2">
                            {node.keterangan || "-"}
                        </div>

                        {/* Actions */}
                        <div className="col-span-1 flex items-center justify-end gap-1">
                            {/* Add Sub-Account (only if depth < 3 to keep hierarchy manageable) */}
                            {depth < 3 && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleCreateSubClick(node)}
                                    className="h-7 w-7 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-lg"
                                    title="Tambah Sub-Akun"
                                >
                                    <IconFolderPlus size={14} />
                                </Button>
                            )}

                            {/* Edit */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditClick(node)}
                                className="h-7 w-7 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg"
                                title="Ubah Akun"
                            >
                                <IconEdit size={14} />
                            </Button>

                            {/* Delete */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteClick(node)}
                                className="h-7 w-7 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg"
                                title="Hapus Akun"
                            >
                                <IconTrash size={14} />
                            </Button>
                        </div>
                    </div>

                    {/* Children rows (Recursive) */}
                    {hasChildren && isExpanded && (
                        <div className="flex flex-col bg-slate-50/20 dark:bg-slate-900/10">
                            {renderTreeRows(node.children || [], depth + 1)}
                        </div>
                    )}
                </div>
            );
        });
    };

    return (
        <div className="space-y-4">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
                        <IconNotebook className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                        Chart of Accounts (COA)
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Kelola struktur akun perkiraan standar akuntansi untuk pencatatan transaksi jurnal keuangan toko.
                    </p>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleRefetch}
                        disabled={isRefetching}
                        className="h-10 w-10 text-slate-500 rounded-xl"
                        title="Segarkan Data"
                    >
                        <IconRefresh size={16} className={cn(isRefetching && "animate-spin")} />
                    </Button>
                    <Button
                        onClick={handleCreateClick}
                        className="h-10 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer ml-auto md:ml-0"
                    >
                        <IconPlus size={16} />
                        <span>Tambah Akun</span>
                    </Button>
                </div>
            </div>

            {/* Controls Card */}
            <Card className="border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900 rounded-2xl">
                <CardContent className="p-4 space-y-4">
                    {/* Top Filters & Views */}
                    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                        {/* Search Input */}
                        <div className="relative flex-1 max-w-md">
                            <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Cari kode atau nama akun..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 h-10 text-xs bg-slate-50/50 border-slate-200 dark:bg-slate-950/20 dark:border-slate-800 rounded-xl focus-visible:ring-indigo-500 focus-visible:border-indigo-500 focus-visible:bg-white transition-all"
                            />
                        </div>

                        {/* View Switcher & Expand/Collapse */}
                        <div className="flex items-center gap-2">
                            {viewMode === "tree" && (
                                <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden p-0.5 bg-slate-50 dark:bg-slate-950/20">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={expandAll}
                                        className="h-7 text-[10px] font-bold rounded-lg px-2"
                                    >
                                        Expand All
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={collapseAll}
                                        className="h-7 text-[10px] font-bold rounded-lg px-2"
                                    >
                                        Collapse All
                                    </Button>
                                </div>
                            )}

                            <Tabs
                                value={viewMode}
                                onValueChange={(val) => setViewMode(val as "tree" | "flat")}
                                className="w-auto"
                            >
                                <TabsList className="grid grid-cols-2 h-9 p-0.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
                                    <TabsTrigger
                                        value="tree"
                                        className="flex items-center gap-1 text-[10px] font-bold py-1 px-2.5 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-white shadow-none"
                                    >
                                        <IconHierarchy size={12} />
                                        <span>Tree View</span>
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="flat"
                                        className="flex items-center gap-1 text-[10px] font-bold py-1 px-2.5 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-white shadow-none"
                                    >
                                        <IconList size={12} />
                                        <span>Flat View</span>
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                    </div>

                    {/* Account Type Tabs */}
                    <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                        <Tabs
                            value={activeTab}
                            onValueChange={setActiveTab}
                            className="w-full"
                        >
                            <TabsList className="flex flex-wrap h-auto gap-1 bg-transparent p-0">
                                {[
                                    { value: "all", label: "Semua Tipe" },
                                    { value: "asset", label: "Aset" },
                                    { value: "liability", label: "Liabilitas / Utang" },
                                    { value: "equity", label: "Ekuitas / Modal" },
                                    { value: "revenue", label: "Pendapatan" },
                                    { value: "expense", label: "Beban" },
                                ].map((tab) => (
                                    <TabsTrigger
                                        key={tab.value}
                                        value={tab.value}
                                        className="h-8 text-[11px] font-bold px-3 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:border-indigo-600 dark:data-[state=active]:bg-indigo-500 dark:data-[state=active]:text-white transition-all shadow-none"
                                    >
                                        {tab.label}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </Tabs>
                    </div>
                </CardContent>
            </Card>

            {/* Accounts List Table Card */}
            <Card className="border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900 rounded-2xl">
                <CardContent className="p-0">
                    {/* Table Headers */}
                    <div className="grid grid-cols-12 items-center py-3 px-4 text-[10px] font-extrabold uppercase text-slate-500 bg-slate-50/50 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800 tracking-wider">
                        <div className="col-span-5">Kode & Nama Akun</div>
                        <div className="col-span-2">Tipe</div>
                        <div className="col-span-1">Debit / Kredit</div>
                        <div className="col-span-1">Status</div>
                        <div className="col-span-2">Keterangan</div>
                        <div className="col-span-1 text-right">Aksi</div>
                    </div>

                    {/* Data Render Body */}
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400 dark:text-slate-600">
                            <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-indigo-600 dark:border-slate-800 dark:border-t-indigo-400 animate-spin" />
                            <span className="text-xs font-semibold">Memuat data akun perkiraan...</span>
                        </div>
                    ) : viewMode === "tree" ? (
                        filteredTreeData.length > 0 ? (
                            <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800/40">
                                {renderTreeRows(filteredTreeData)}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-slate-400 text-xs gap-2">
                                <IconAlertCircle size={28} className="text-slate-300 dark:text-slate-700" />
                                <span className="font-bold">Tidak ada akun perkiraan ditemukan</span>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500">Coba ubah kata kunci pencarian atau filter tipe.</span>
                            </div>
                        )
                    ) : (
                        // Flat View List Rows
                        filteredFlatData.length > 0 ? (
                            <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800/40">
                                {filteredFlatData.map((node) => {
                                    const displayType = typeLabelMap[node.tipe] || node.tipe;
                                    const badgeClass = typeBadgeStyles[node.tipe] || "";
                                    const leftBorder = typeBorderStyles[node.tipe] || "";

                                    return (
                                        <div
                                            key={node.uid}
                                            className={cn(
                                                "grid grid-cols-12 items-center py-2.5 px-4 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors border-l-2",
                                                leftBorder,
                                                !node.is_active && "opacity-50"
                                            )}
                                        >
                                            {/* Kode & Nama */}
                                            <div className="col-span-5 flex items-center min-w-0 pr-4 pl-1">
                                                <span className="font-extrabold text-slate-800 dark:text-slate-200 tracking-wide font-mono mr-3">
                                                    {node.kode}
                                                </span>
                                                <span className="font-bold text-slate-900 dark:text-white truncate">
                                                    {node.nama}
                                                </span>
                                            </div>

                                            {/* Tipe Akun */}
                                            <div className="col-span-2">
                                                <Badge variant="outline" className={cn("px-2 py-0.5 rounded-md text-[10px] uppercase font-bold", badgeClass)}>
                                                    {displayType}
                                                </Badge>
                                            </div>

                                            {/* Debit / Kredit */}
                                            <div className="col-span-1 font-bold text-slate-600 dark:text-slate-400 capitalize">
                                                {node.saldo_normal || "-"}
                                            </div>

                                            {/* Status */}
                                            <div className="col-span-1">
                                                {node.is_active ? (
                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 uppercase tracking-wider">
                                                        Aktif
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-slate-100 text-slate-600 dark:bg-slate-800/40 dark:text-slate-400 border border-slate-200 dark:border-slate-700 uppercase tracking-wider">
                                                        Nonaktif
                                                    </span>
                                                )}
                                            </div>

                                            {/* Keterangan */}
                                            <div className="col-span-2 truncate text-slate-500 dark:text-slate-400 pr-2">
                                                {node.keterangan || "-"}
                                            </div>

                                            {/* Actions */}
                                            <div className="col-span-1 flex items-center justify-end gap-1">
                                                {/* Edit */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEditClick(node)}
                                                    className="h-7 w-7 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg"
                                                    title="Ubah Akun"
                                                >
                                                    <IconEdit size={14} />
                                                </Button>

                                                {/* Delete */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeleteClick(node)}
                                                    className="h-7 w-7 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg"
                                                    title="Hapus Akun"
                                                >
                                                    <IconTrash size={14} />
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-slate-400 text-xs gap-2">
                                <IconAlertCircle size={28} className="text-slate-300 dark:text-slate-700" />
                                <span className="font-bold">Tidak ada akun perkiraan ditemukan</span>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500">Coba ubah kata kunci pencarian atau filter tipe.</span>
                            </div>
                        )
                    )}
                </CardContent>
            </Card>

            {/* Form Dialog Modal */}
            <CoaDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                account={selectedAccount}
                parentAccount={parentForCreate}
            />

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                title="Hapus Akun Perkiraan"
                description={
                    <div className="space-y-2">
                        <p>
                            Apakah Anda yakin ingin menghapus akun perkiraan{" "}
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                                {accountToDelete?.kode} - {accountToDelete?.nama}
                            </span>
                            ?
                        </p>
                        <p className="text-[10px] text-slate-400">
                            Tindakan ini tidak dapat dibatalkan. Akun hanya bisa dihapus jika tidak memiliki sub-akun dan belum pernah digunakan dalam transaksi apapun.
                        </p>
                    </div>
                }
                confirmText="Ya, Hapus Akun"
                cancelText="Batal"
                onConfirm={confirmDelete}
                isLoading={deleteMutation.isPending}
                variant="danger"
            />
        </div>
    );
}
