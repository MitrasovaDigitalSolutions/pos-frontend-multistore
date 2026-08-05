"use client";

import { useDroppable } from "@dnd-kit/core";
import type { ParentCategory } from "../../api/parent-categories-api";
import type { Category } from "@/features/master/categories/types";
import { DraggableCategoryChip } from "./draggable-category-chip";
import { Button } from "@/components/ui/button";
import { Scrollable } from "@/components/ui/scrollable";
import {
    IconFolder,
    IconPencil,
    IconTrash,
    IconArrowDown,
    IconPlus,
    IconDotsVertical,
    IconTag,
    IconLoader2,
} from "@tabler/icons-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ParentCategoryCardProps {
    parentCategory: ParentCategory;
    assignedCategories: Category[];
    unassignedCategories?: Category[];
    allParentCategories?: ParentCategory[];
    onEdit: (parentCategory: ParentCategory) => void;
    onDelete: (parentCategory: ParentCategory) => void;
    onUnassignCategory: (categoryUid: string, currentParentUid: string) => void;
    onAssignCategoryToParent?: (categoryUid: string, parentUid: string) => void;
    isAssigning?: boolean;
}

export function ParentCategoryCard({
    parentCategory,
    assignedCategories,
    unassignedCategories = [],
    allParentCategories = [],
    onEdit,
    onDelete,
    onUnassignCategory,
    onAssignCategoryToParent,
    isAssigning = false,
}: ParentCategoryCardProps) {
    const { isOver, setNodeRef } = useDroppable({
        id: `parent-${parentCategory.uid}`,
        data: {
            parentCategory,
        },
    });

    return (
        <div
            ref={setNodeRef}
            className={`flex flex-col rounded-xl border transition-all duration-200 bg-white dark:bg-slate-900 shadow-2xs overflow-hidden ${isOver
                    ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/20 scale-[1.005]"
                    : "border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs"
                }`}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850/60">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`p-2 rounded-lg border transition-colors ${isOver
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                            : "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border-slate-200/80 dark:border-slate-750"
                        }`}>
                        <IconFolder size={16} />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                            {parentCategory.nama}
                        </h3>
                        <p className="text-[10px] font-semibold text-slate-400">
                            {assignedCategories.length} kategori
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    {/* Direct Quick Assign Button */}
                    {unassignedCategories.length > 0 && onAssignCategoryToParent && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={isAssigning}
                                    className="h-7 px-2 text-[11px] font-bold border-slate-200 dark:border-slate-800 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg cursor-pointer disabled:opacity-50"
                                    title="Tambah kategori ke sini"
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
                            <DropdownMenuContent align="end" className="w-52 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    Pilih Kategori untuk Di-assign:
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

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-600 rounded-lg">
                                <IconDotsVertical size={15} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                            <DropdownMenuItem onClick={() => onEdit(parentCategory)} className="cursor-pointer font-semibold text-xs">
                                <IconPencil size={14} className="mr-2 text-slate-500" />
                                <span>Edit Nama</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => onDelete(parentCategory)}
                                className="cursor-pointer font-semibold text-xs text-rose-600 dark:text-rose-400 focus:text-rose-600"
                            >
                                <IconTrash size={14} className="mr-2" />
                                <span>Hapus</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Droppable Body Area */}
            <div className="p-3 flex-1 min-h-[90px] space-y-2">
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
                    <div className={`h-full min-h-[75px] rounded-lg border-2 border-dashed flex flex-col items-center justify-center p-2 text-center transition-all ${isOver
                            ? "border-emerald-500 bg-emerald-100/40 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300"
                            : "border-slate-200 dark:border-slate-800 text-slate-400 bg-slate-50/40 dark:bg-slate-900/40"
                        }`}>
                        <IconArrowDown size={16} className={`mb-1 ${isOver ? "animate-bounce text-emerald-600" : "text-slate-400"}`} />
                        <span className="text-[11px] font-bold">
                            {isOver ? "Lepas kategori di sini" : "Tarik kategori ke sini atau klik + Assign"}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
