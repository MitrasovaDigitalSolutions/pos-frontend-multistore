"use client";

import { useDroppable } from "@dnd-kit/core";
import type { Category } from "@/features/master/categories/types";
import type { ParentCategory } from "../../api/parent-categories-api";
import { DraggableCategoryChip } from "./draggable-category-chip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Scrollable } from "@/components/ui/scrollable";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    IconInbox,
    IconSearch,
    IconCheckbox,
    IconSquare,
    IconChevronRight,
    IconFolder,
    IconLoader2,
} from "@tabler/icons-react";

interface UnassignedCategoryDrawerProps {
    unassignedCategories: Category[];
    allParentCategories: ParentCategory[];
    searchQuery: string;
    onSearchChange: (query: string) => void;
    selectedUids: string[];
    onToggleSelect: (uid: string) => void;
    onToggleSelectAll: () => void;
    onBulkAssign: (targetParentUid: string) => void;
    onAssignCategoryToParent: (categoryUid: string, targetParentUid: string) => void;
    isAssigning?: boolean;
}

export function UnassignedCategoryDrawer({
    unassignedCategories,
    allParentCategories,
    searchQuery,
    onSearchChange,
    selectedUids,
    onToggleSelect,
    onToggleSelectAll,
    onBulkAssign,
    onAssignCategoryToParent,
    isAssigning = false,
}: UnassignedCategoryDrawerProps) {
    const { isOver, setNodeRef } = useDroppable({
        id: "unassigned",
    });

    const isAllSelected =
        selectedUids.length === unassignedCategories.length && unassignedCategories.length > 0;

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3 space-y-3 shadow-xs lg:sticky lg:top-[90px]">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <div className="flex items-center gap-1.5">
                    <IconInbox size={16} className="text-amber-500" />
                    <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                        Belum Ter-assign
                    </h2>
                </div>
                <span className="text-[11px] font-black bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 px-2 py-0.5 rounded-full">
                    {unassignedCategories.length}
                </span>
            </div>

            {/* Search Input for Unassigned Drawer */}
            <div className="relative">
                <IconSearch size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                    placeholder="Cari kategori..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-8 h-8 text-xs rounded-lg border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850"
                />
            </div>

            {/* Bulk Selection Actions Bar */}
            {unassignedCategories.length > 0 && (
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-850 p-2 rounded-xl border border-slate-200/60 dark:border-slate-800">
                    <button
                        type="button"
                        onClick={onToggleSelectAll}
                        disabled={isAssigning}
                        className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer disabled:opacity-50"
                    >
                        {isAllSelected ? (
                            <IconCheckbox size={15} className="text-emerald-600" />
                        ) : (
                            <IconSquare size={15} className="text-slate-400" />
                        )}
                        <span>{selectedUids.length > 0 ? `${selectedUids.length} Dipilih` : "Pilih Semua"}</span>
                    </button>

                    {selectedUids.length > 0 && allParentCategories.length > 0 && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    size="sm"
                                    disabled={isAssigning}
                                    className="h-7 px-2.5 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs cursor-pointer disabled:opacity-60"
                                >
                                    {isAssigning ? (
                                        <>
                                            <IconLoader2 size={12} className="animate-spin mr-1" />
                                            <span>Memproses...</span>
                                        </>
                                    ) : (
                                        <span>Pindahkan ({selectedUids.length})</span>
                                    )}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    Pindahkan ke Kategori Induk:
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <Scrollable className="max-h-56">
                                    {allParentCategories.map((p) => (
                                        <DropdownMenuItem
                                            key={p.uid}
                                            disabled={isAssigning}
                                            onClick={() => onBulkAssign(p.uid)}
                                            className="cursor-pointer text-xs font-semibold"
                                        >
                                            <IconFolder size={14} className="mr-2 text-emerald-600" />
                                            <span className="truncate">{p.nama}</span>
                                        </DropdownMenuItem>
                                    ))}
                                </Scrollable>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            )}

            {/* Droppable List Area */}
            <div
                ref={setNodeRef}
                className={`min-h-[260px] rounded-xl p-1.5 border transition-all duration-200 ${isOver
                        ? "border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/30 dark:bg-amber-950/20"
                        : "border-slate-200/60 dark:border-slate-800/60 bg-slate-50/40 dark:bg-slate-900/40"
                    }`}
            >
                <Scrollable className="max-h-[460px]">
                    {unassignedCategories.length > 0 ? (
                        <div className="space-y-1.5 pr-1">
                            {unassignedCategories.map((cat) => (
                                <div
                                    key={cat.uid}
                                    className={`flex items-center justify-between gap-1.5 p-2 rounded-lg border bg-white dark:bg-slate-900 transition-all ${selectedUids.includes(cat.uid)
                                            ? "border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20 shadow-2xs"
                                            : "border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                                        }`}
                                >
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <button
                                            type="button"
                                            disabled={isAssigning}
                                            onClick={() => onToggleSelect(cat.uid)}
                                            className="text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer disabled:opacity-50"
                                        >
                                            {selectedUids.includes(cat.uid) ? (
                                                <IconCheckbox size={15} className="text-emerald-600" />
                                            ) : (
                                                <IconSquare size={15} className="text-slate-300 dark:text-slate-700" />
                                            )}
                                        </button>

                                        <DraggableCategoryChip
                                            category={cat}
                                            allParentCategories={allParentCategories}
                                            onAssignToParent={onAssignCategoryToParent}
                                            isAssigning={isAssigning}
                                        />
                                    </div>

                                    {/* Quick Assign Dropdown menu button */}
                                    {allParentCategories.length > 0 && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    disabled={isAssigning}
                                                    className="h-6 px-1.5 text-[11px] font-bold text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-md shrink-0 cursor-pointer disabled:opacity-50"
                                                >
                                                    {isAssigning ? (
                                                        <IconLoader2 size={12} className="animate-spin" />
                                                    ) : (
                                                        <>
                                                            <span>Assign</span>
                                                            <IconChevronRight size={12} className="ml-0.5" />
                                                        </>
                                                    )}
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-52 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                                <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                    Assign ke Kategori Induk:
                                                </DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <Scrollable className="max-h-48">
                                                    {allParentCategories.map((parent) => (
                                                        <DropdownMenuItem
                                                            key={parent.uid}
                                                            disabled={isAssigning}
                                                            onClick={() => onAssignCategoryToParent(cat.uid, parent.uid)}
                                                            className="cursor-pointer text-xs font-semibold"
                                                        >
                                                            <IconFolder size={14} className="mr-2 text-emerald-600" />
                                                            <span className="truncate">{parent.nama}</span>
                                                        </DropdownMenuItem>
                                                    ))}
                                                </Scrollable>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-40 flex flex-col items-center justify-center text-center p-3">
                            <IconInbox size={28} className="text-slate-300 dark:text-slate-700 mb-1.5" />
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                {isOver ? "Lepas kategori di sini..." : "Tidak ada kategori yang perlu di-assign"}
                            </span>
                        </div>
                    )}
                </Scrollable>
            </div>
        </div>
    );
}
