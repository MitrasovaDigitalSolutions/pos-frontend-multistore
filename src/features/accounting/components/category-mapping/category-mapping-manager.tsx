"use client";

import { useState, useMemo } from "react";
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragStartEvent,
} from "@dnd-kit/core";
import { useCategories } from "@/features/master/categories/api/categories-api";
import type { Category } from "@/features/master/categories/types";
import {
    useAssignParentCategory,
    useDeleteParentCategory,
    useParentCategories,
    type ParentCategory,
} from "../../api/parent-categories-api";

import { CategoryMappingHeader } from "./category-mapping-header";
import { CategoryMappingStats } from "./category-mapping-stats";
import { UnassignedCategoryDrawer } from "./unassigned-category-drawer";
import { ParentCategoryCard } from "./parent-category-card";
import { ParentCategoryTreeRow } from "./parent-category-tree-row";
import { ParentCategoryDialog } from "./parent-category-dialog";
import { DraggableCategoryChip } from "./draggable-category-chip";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { IconSearch, IconLayoutGrid, IconListDetails, IconInbox, IconPlus } from "@tabler/icons-react";
import { toast } from "sonner";

export function CategoryMappingManager() {
    const { data: parentCategories, isLoading: isLoadingParents, refetch: refetchParents } = useParentCategories();
    const { data: categoriesRes, isLoading: isLoadingCategories, refetch: refetchCategories } = useCategories({ per_page: 1000 });
    const categories = categoriesRes?.data;
    const deleteMutation = useDeleteParentCategory();
    const assignMutation = useAssignParentCategory();

    const isAssigning = assignMutation.isPending;

    const [searchQuery, setSearchQuery] = useState("");
    const [unassignedSearch, setUnassignedSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState<Category | null>(null);
    const [viewMode, setViewMode] = useState<"grid" | "tree">("grid");

    // Multi-select for Unassigned Bulk Assign
    const [selectedUnassignedUids, setSelectedUnassignedUids] = useState<string[]>([]);

    // Dialog States
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedParent, setSelectedParent] = useState<ParentCategory | null>(null);
    const [deletingParent, setDeletingParent] = useState<ParentCategory | null>(null);

    // Overridden mappings from drag-and-drop actions: categoryUid -> parentUid (null if unassigned)
    const [overrides, setOverrides] = useState<Record<string, string | null>>({});

    // Derive effective mapping from server data + drag overrides
    const effectiveMapping = useMemo(() => {
        const map: Record<string, string | null> = {};

        if (categories) {
            categories.forEach((cat) => {
                map[cat.uid] = cat.parent_category_uid ?? null;
            });
        }

        if (parentCategories) {
            parentCategories.forEach((p) => {
                if (p.categories) {
                    p.categories.forEach((cat) => {
                        map[cat.uid] = p.uid;
                    });
                }
            });
        }

        return { ...map, ...overrides };
    }, [categories, parentCategories, overrides]);

    // DnD Sensors with distance threshold to allow clicking buttons without starting drag
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    // Filtered parent categories and categories based on search
    const filteredCategories = useMemo(() => {
        if (!categories) return [];
        if (!searchQuery.trim()) return categories;
        const q = searchQuery.toLowerCase();
        return categories.filter(
            (c) =>
                c.nama.toLowerCase().includes(q) ||
                (c.deskripsi && c.deskripsi.toLowerCase().includes(q))
        );
    }, [categories, searchQuery]);

    const filteredParentCategories = useMemo(() => {
        if (!parentCategories) return [];
        if (!searchQuery.trim()) return parentCategories;
        const q = searchQuery.toLowerCase();
        return parentCategories.filter((p) =>
            p.nama.toLowerCase().includes(q)
        );
    }, [parentCategories, searchQuery]);

    // Group categories by parentUid using effectiveMapping
    const categoriesByParent = useMemo(() => {
        const map: Record<string, Category[]> = {};
        const unassigned: Category[] = [];

        filteredCategories.forEach((cat) => {
            const pUid = effectiveMapping[cat.uid];
            if (pUid) {
                if (!map[pUid]) map[pUid] = [];
                map[pUid].push(cat);
            } else {
                unassigned.push(cat);
            }
        });

        return { map, unassigned };
    }, [filteredCategories, effectiveMapping]);

    // Unassigned categories filtered by left panel search
    const filteredUnassigned = useMemo(() => {
        if (!unassignedSearch.trim()) return categoriesByParent.unassigned;
        const q = unassignedSearch.toLowerCase();
        return categoriesByParent.unassigned.filter((c) =>
            c.nama.toLowerCase().includes(q)
        );
    }, [categoriesByParent.unassigned, unassignedSearch]);

    // Overall metrics & completion percentage
    const totalParentCount = parentCategories?.length ?? 0;
    const totalCategoryCount = categories?.length ?? 0;
    const assignedCategoryCount = useMemo(
        () => Object.values(effectiveMapping).filter(Boolean).length,
        [effectiveMapping]
    );
    const unassignedCategoryCount = totalCategoryCount - assignedCategoryCount;
    const completionPercent = totalCategoryCount > 0 ? Math.round((assignedCategoryCount / totalCategoryCount) * 100) : 0;

    // Single Category Assign Handler
    const handleAssignCategoryToParent = async (categoryUid: string, targetParentUid: string) => {
        if (isAssigning) return;

        const currentParentUid = effectiveMapping[categoryUid] ?? null;
        if (currentParentUid === targetParentUid) return;

        setOverrides((prev) => ({
            ...prev,
            [categoryUid]: targetParentUid,
        }));

        try {
            const existingInTarget = Object.entries(effectiveMapping)
                .filter(([uid, pUid]) => pUid === targetParentUid && uid !== categoryUid)
                .map(([uid]) => uid);

            const newCategoryUids = [...existingInTarget, categoryUid];

            await assignMutation.mutateAsync({
                parentCategoryUid: targetParentUid,
                categoryUids: newCategoryUids,
            });

            const targetName = parentCategories?.find((p) => p.uid === targetParentUid)?.nama;
            toast.success(`Kategori di-assign ke '${targetName ?? "Kategori Induk"}'`);
            setSelectedUnassignedUids((prev) => prev.filter((id) => id !== categoryUid));
        } catch (err: unknown) {
            setOverrides((prev) => {
                const next = { ...prev };
                delete next[categoryUid];
                return next;
            });
            const msg = err instanceof Error ? err.message : "Gagal meng-assign kategori";
            toast.error(msg);
        }
    };

    // Bulk Assign Handler
    const handleBulkAssign = async (targetParentUid: string) => {
        if (isAssigning || selectedUnassignedUids.length === 0) return;

        const uidsToAssign = [...selectedUnassignedUids];

        setOverrides((prev) => {
            const next = { ...prev };
            uidsToAssign.forEach((uid) => {
                next[uid] = targetParentUid;
            });
            return next;
        });

        try {
            const existingInTarget = Object.entries(effectiveMapping)
                .filter(([uid, pUid]) => pUid === targetParentUid && !uidsToAssign.includes(uid))
                .map(([uid]) => uid);

            const newCategoryUids = [...existingInTarget, ...uidsToAssign];

            await assignMutation.mutateAsync({
                parentCategoryUid: targetParentUid,
                categoryUids: newCategoryUids,
            });

            const targetName = parentCategories?.find((p) => p.uid === targetParentUid)?.nama;
            toast.success(`${uidsToAssign.length} kategori berhasil di-assign ke '${targetName ?? "Kategori Induk"}'`);
            setSelectedUnassignedUids([]);
        } catch (err: unknown) {
            setOverrides((prev) => {
                const next = { ...prev };
                uidsToAssign.forEach((uid) => {
                    delete next[uid];
                });
                return next;
            });
            const msg = err instanceof Error ? err.message : "Gagal memproses assign massal";
            toast.error(msg);
        }
    };

    // DnD Handlers
    const handleDragStart = (event: DragStartEvent) => {
        if (isAssigning) return;
        const cat = event.active.data.current?.category as Category | undefined;
        if (cat) {
            setActiveCategory(cat);
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveCategory(null);

        if (!over || isAssigning) return;

        const catUid = String(active.id).replace("category-", "");
        const overId = String(over.id);

        const currentParentUid = effectiveMapping[catUid] ?? null;

        let targetParentUid: string | null = null;
        if (overId.startsWith("parent-")) {
            targetParentUid = overId.replace("parent-", "");
        } else if (overId === "unassigned") {
            targetParentUid = null;
        }

        if (currentParentUid === targetParentUid) return;

        setOverrides((prev) => ({
            ...prev,
            [catUid]: targetParentUid,
        }));

        try {
            if (targetParentUid) {
                const existingInTarget = Object.entries(effectiveMapping)
                    .filter(([uid, pUid]) => pUid === targetParentUid && uid !== catUid)
                    .map(([uid]) => uid);

                const newCategoryUids = [...existingInTarget, catUid];

                await assignMutation.mutateAsync({
                    parentCategoryUid: targetParentUid,
                    categoryUids: newCategoryUids,
                });

                const targetParentName = parentCategories?.find((p) => p.uid === targetParentUid)?.nama;
                toast.success(`Kategori di-assign ke '${targetParentName ?? "Kategori Induk"}'`);
            } else if (currentParentUid) {
                const remainingInOld = Object.entries(effectiveMapping)
                    .filter(([uid, pUid]) => pUid === currentParentUid && uid !== catUid)
                    .map(([uid]) => uid);

                await assignMutation.mutateAsync({
                    parentCategoryUid: currentParentUid,
                    categoryUids: remainingInOld,
                });

                toast.info("Kategori dipindahkan ke Belum Ter-assign");
            }
        } catch (err: unknown) {
            setOverrides((prev) => {
                const next = { ...prev };
                delete next[catUid];
                return next;
            });
            const msg = err instanceof Error ? err.message : "Gagal meng-assign kategori";
            toast.error(msg);
        }
    };

    // Manual Unassign Button Handler
    const handleUnassignCategory = async (categoryUid: string, currentParentUid: string) => {
        if (isAssigning) return;

        setOverrides((prev) => ({
            ...prev,
            [categoryUid]: null,
        }));

        try {
            const remainingInOld = Object.entries(effectiveMapping)
                .filter(([uid, pUid]) => pUid === currentParentUid && uid !== categoryUid)
                .map(([uid]) => uid);

            await assignMutation.mutateAsync({
                parentCategoryUid: currentParentUid,
                categoryUids: remainingInOld,
            });
            toast.info("Kategori dilepas dari kategori induk");
        } catch (err: unknown) {
            setOverrides((prev) => {
                const next = { ...prev };
                delete next[categoryUid];
                return next;
            });
            const msg = err instanceof Error ? err.message : "Gagal melepas kategori";
            toast.error(msg);
        }
    };

    // Delete Parent Category Handler
    const confirmDelete = async () => {
        if (!deletingParent) return;
        try {
            const targetUid = deletingParent.uid;
            const targetNama = deletingParent.nama;

            await deleteMutation.mutateAsync(targetUid);

            // Clean up any local overrides referencing the deleted parent category
            setOverrides((prev) => {
                const next = { ...prev };
                Object.keys(next).forEach((catUid) => {
                    if (next[catUid] === targetUid) {
                        delete next[catUid];
                    }
                });
                return next;
            });

            // Refetch fresh parent categories and categories from server
            await Promise.all([refetchParents(), refetchCategories()]);

            toast.success(`Kategori Induk '${targetNama}' berhasil dihapus`);
            setDeletingParent(null);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Gagal menghapus kategori induk";
            toast.error(msg);
        }
    };

    const toggleSelectAllUnassigned = () => {
        if (selectedUnassignedUids.length === filteredUnassigned.length) {
            setSelectedUnassignedUids([]);
        } else {
            setSelectedUnassignedUids(filteredUnassigned.map((c) => c.uid));
        }
    };

    const toggleSelectUnassigned = (uid: string) => {
        setSelectedUnassignedUids((prev) =>
            prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
        );
    };

    const isLoading = isLoadingParents || isLoadingCategories;

    if (isLoading) {
        return (
            <div className="space-y-4 animate-pulse p-1">
                <div className="flex flex-col sm:flex-row justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="space-y-1.5">
                        <Skeleton className="h-6 w-56 rounded-lg" />
                        <Skeleton className="h-3.5 w-80 rounded-lg" />
                    </div>
                    <Skeleton className="h-9 w-40 rounded-xl" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-16 rounded-xl" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-5">
                    <Skeleton className="h-80 rounded-2xl" />
                    <Skeleton className="h-80 rounded-2xl" />
                </div>
            </div>
        );
    }

    return (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="space-y-4 pb-16">
                {/* Standard POS Theme Header */}
                <CategoryMappingHeader
                    totalCategoryCount={totalCategoryCount}
                    assignedCategoryCount={assignedCategoryCount}
                    unassignedCategoryCount={unassignedCategoryCount}
                    completionPercent={completionPercent}
                    onRefresh={() => {
                        refetchParents();
                        refetchCategories();
                    }}
                    onAddParent={() => {
                        setSelectedParent(null);
                        setIsCreateOpen(true);
                    }}
                />

                {/* Stat Cards Grid */}
                <CategoryMappingStats
                    totalParentCount={totalParentCount}
                    totalCategoryCount={totalCategoryCount}
                    assignedCategoryCount={assignedCategoryCount}
                    unassignedCategoryCount={unassignedCategoryCount}
                />

                {/* Main Split-View Workspace */}
                <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-5 items-start">
                    {/* LEFT PANEL: Unassigned Categories Drawer */}
                    <UnassignedCategoryDrawer
                        unassignedCategories={filteredUnassigned}
                        allParentCategories={parentCategories ?? []}
                        searchQuery={unassignedSearch}
                        onSearchChange={setUnassignedSearch}
                        selectedUids={selectedUnassignedUids}
                        onToggleSelect={toggleSelectUnassigned}
                        onToggleSelectAll={toggleSelectAllUnassigned}
                        onBulkAssign={handleBulkAssign}
                        onAssignCategoryToParent={handleAssignCategoryToParent}
                        isAssigning={isAssigning}
                    />

                    {/* RIGHT PANEL: Workspace View of Parent Categories */}
                    <div className="space-y-4 min-w-0">
                        {/* Toolbar: Search + View Mode Switcher */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                            <div className="relative max-w-md flex-1">
                                <IconSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <Input
                                    placeholder="Cari Kategori Induk..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 h-8 text-xs rounded-lg border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850"
                                />
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                <div className="bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg flex items-center gap-0.5">
                                    <button
                                        type="button"
                                        onClick={() => setViewMode("grid")}
                                        className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${viewMode === "grid"
                                                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs"
                                                : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                                            }`}
                                    >
                                        <IconLayoutGrid size={13} />
                                        <span>Kartu Grid</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setViewMode("tree")}
                                        className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${viewMode === "tree"
                                                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm"
                                                : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                                            }`}
                                    >
                                        <IconListDetails size={13} />
                                        <span>Tampilan Pohon</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Content View: Grid Cards vs Hierarchical Tree */}
                        {filteredParentCategories.length > 0 ? (
                            viewMode === "grid" ? (
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                    {filteredParentCategories.map((parent) => (
                                        <ParentCategoryCard
                                            key={parent.uid}
                                            parentCategory={parent}
                                            assignedCategories={categoriesByParent.map[parent.uid] ?? []}
                                            unassignedCategories={categoriesByParent.unassigned}
                                            allParentCategories={parentCategories ?? []}
                                            onEdit={(p) => {
                                                setSelectedParent(p);
                                                setIsCreateOpen(true);
                                            }}
                                            onDelete={(p) => setDeletingParent(p)}
                                            onUnassignCategory={handleUnassignCategory}
                                            onAssignCategoryToParent={handleAssignCategoryToParent}
                                            isAssigning={isAssigning}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {filteredParentCategories.map((parent) => (
                                        <ParentCategoryTreeRow
                                            key={parent.uid}
                                            parentCategory={parent}
                                            assignedCategories={categoriesByParent.map[parent.uid] ?? []}
                                            unassignedCategories={categoriesByParent.unassigned}
                                            allParentCategories={parentCategories ?? []}
                                            onEdit={(p) => {
                                                setSelectedParent(p);
                                                setIsCreateOpen(true);
                                            }}
                                            onDelete={(p) => setDeletingParent(p)}
                                            onUnassignCategory={handleUnassignCategory}
                                            onAssignCategoryToParent={handleAssignCategoryToParent}
                                            isAssigning={isAssigning}
                                        />
                                    ))}
                                </div>
                            )
                        ) : (
                            <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center bg-white dark:bg-slate-900 space-y-2">
                                <IconInbox size={36} className="text-slate-400 mx-auto" />
                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                    {searchQuery ? "Kategori Induk tidak ditemukan" : "Belum Ada Kategori Induk"}
                                </p>
                                <p className="text-xs text-slate-400 max-w-md mx-auto">
                                    Klik tombol &quot;Tambah Kategori Induk&quot; di atas untuk membuat kelompok kategori pertama Anda.
                                </p>
                                {!searchQuery && (
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            setSelectedParent(null);
                                            setIsCreateOpen(true);
                                        }}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg mt-2 cursor-pointer h-8 px-3 text-xs"
                                    >
                                        <IconPlus size={15} className="mr-1" />
                                        Tambah Kategori Induk
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Drag Overlay for smooth ghost preview while dragging */}
            <DragOverlay>
                {activeCategory ? (
                    <DraggableCategoryChip category={activeCategory} isOverlay />
                ) : null}
            </DragOverlay>

            {/* BaseDialog Create / Edit */}
            <ParentCategoryDialog
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                parentCategory={selectedParent}
            />

            {/* ConfirmDialog Delete */}
            <ConfirmDialog
                open={!!deletingParent}
                onOpenChange={(open: boolean) => !open && setDeletingParent(null)}
                title="Hapus Kategori Induk?"
                description={`Apakah Anda yakin ingin menghapus kategori induk "${deletingParent?.nama}"? Kategori yang ada di dalamnya tidak akan terhapus, tetapi akan kembali ke status "Belum Ter-assign".`}
                confirmText="Hapus"
                cancelText="Batal"
                variant="danger"
                isLoading={deleteMutation.isPending}
                onConfirm={confirmDelete}
            />
        </DndContext>
    );
}
