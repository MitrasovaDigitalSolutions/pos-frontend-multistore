"use client";

import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import type { ParentCategory } from "../../api/parent-categories-api";
import type { Category } from "@/features/master/categories/types";
import { DraggableCategoryChip } from "./draggable-category-chip";
import { Button } from "@/components/ui/button";
import { IconFolder, IconPlus, IconChevronRight, IconTag, IconLoader2 } from "@tabler/icons-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Scrollable } from "@/components/ui/scrollable";

interface ParentCategoryTreeRowProps {
    parentCategory: ParentCategory;
    assignedCategories: Category[];
    unassignedCategories: Category[];
    allParentCategories: ParentCategory[];
    onEdit: (parentCategory: ParentCategory) => void;
    onDelete: (parentCategory: ParentCategory) => void;
    onUnassignCategory: (categoryUid: string, currentParentUid: string) => void;
    onAssignCategoryToParent: (categoryUid: string, parentUid: string) => void;
    isAssigning?: boolean;
}

export function ParentCategoryTreeRow({
    parentCategory,
    assignedCategories,
    unassignedCategories,
    allParentCategories,
    onEdit,
    onDelete,
    onUnassignCategory,
    onAssignCategoryToParent,
    isAssigning = false,
}: ParentCategoryTreeRowProps) {
    const { isOver, setNodeRef } = useDroppable({
        id: `parent-${parentCategory.uid}`,
    });

    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <div
            ref={setNodeRef}
            className={`rounded-xl border transition-all duration-200 bg-white dark:bg-slate-900 overflow-hidden ${isOver
                    ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/20"
                    : "border-slate-200/80 dark:border-slate-800"
                }`}
        >
            <div className="flex items-center justify-between p-3 bg-slate-50/60 dark:bg-slate-850/60 border-b border-slate-100 dark:border-slate-800">
                <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-2.5 font-bold text-xs text-slate-900 dark:text-slate-100 hover:text-emerald-600 transition-colors text-left min-w-0 cursor-pointer"
                >
                    <IconChevronRight size={15} className={`text-slate-400 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                    <IconFolder size={16} className="text-emerald-600 shrink-0" />
                    <span className="truncate">{parentCategory.nama}</span>
                    <span className="text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full ml-1 shrink-0">
                        {assignedCategories.length} kategori
                    </span>
                </button>

                <div className="flex items-center gap-1.5">
                    {unassignedCategories.length > 0 && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={isAssigning}
                                    className="h-7 px-2 text-[11px] font-bold border-slate-200 dark:border-slate-800 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg disabled:opacity-50"
                                >
                                    {isAssigning ? (
                                        <IconLoader2 size={12} className="animate-spin" />
                                    ) : (
                                        <>
                                            <IconPlus size={13} className="mr-1" />
                                            <span>Assign</span>
                                        </>
                                    )}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    Pilih Kategori:
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <Scrollable className="max-h-56">
                                    {unassignedCategories.map((cat) => (
                                        <DropdownMenuItem
                                            key={cat.uid}
                                            disabled={isAssigning}
                                            onClick={() => onAssignCategoryToParent(cat.uid, parentCategory.uid)}
                                            className="cursor-pointer text-xs font-semibold"
                                        >
                                            <IconTag size={14} className="mr-2 text-slate-400" />
                                            <span className="truncate">{cat.nama}</span>
                                        </DropdownMenuItem>
                                    ))}
                                </Scrollable>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(parentCategory)}
                        className="h-7 px-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                        Edit
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(parentCategory)}
                        className="h-7 px-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
                    >
                        Hapus
                    </Button>
                </div>
            </div>

            {isExpanded && (
                <div className="p-3 bg-white dark:bg-slate-900">
                    {assignedCategories.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                            {assignedCategories.map((cat) => (
                                <DraggableCategoryChip
                                    key={cat.uid}
                                    category={cat}
                                    parentUid={parentCategory.uid}
                                    allParentCategories={allParentCategories}
                                    onUnassign={onUnassignCategory}
                                    onAssignToParent={onAssignCategoryToParent}
                                    isAssigning={isAssigning}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="py-3 text-center text-xs text-slate-400 font-medium italic">
                            Belum ada kategori yang ter-assign di sini
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
