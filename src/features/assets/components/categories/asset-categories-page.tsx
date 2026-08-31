"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { IconCategory, IconPlus, IconRefresh } from "@tabler/icons-react";
import { useAssetCategories } from "../../api/asset-categories-api";
import { AssetCategoriesTable } from "./asset-categories-table";
import { AssetCategoryFormDialog } from "./asset-category-form-dialog";
import type { AssetCategory } from "../../types";

export function AssetCategoriesPage() {
    const { data: categories = [], isLoading, isFetching, refetch } = useAssetCategories();
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
    const [editingCategory, setEditingCategory] = useState<AssetCategory | null>(null);

    const handleCreateClick = () => {
        setEditingCategory(null);
        setIsDialogOpen(true);
    };

    const handleEditClick = (category: AssetCategory) => {
        setEditingCategory(category);
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-4 pb-12">
            {/* Header Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-100 dark:border-indigo-900/40">
                        <IconCategory className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                            Kategori Aset
                        </h1>
                        <p className="text-xs text-slate-500">
                            Kelola kelompok aset tetap perusahaan dan pemetaan akun buku besar (COA).
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refetch()}
                        disabled={isLoading || isFetching}
                        className="h-8.5 px-3 text-xs rounded-xl border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-xs cursor-pointer"
                    >
                        <IconRefresh
                            className={`w-3.5 h-3.5 mr-1 ${isFetching ? "animate-spin" : ""}`}
                        />
                        Segarkan
                    </Button>
                    <Button
                        onClick={handleCreateClick}
                        className="h-8.5 px-3.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                        <IconPlus className="w-4 h-4" />
                        <span>Tambah Kategori</span>
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden p-3.5">
                <AssetCategoriesTable
                    categories={categories}
                    onEdit={handleEditClick}
                    isLoading={isLoading}
                    isFetching={isFetching}
                    onRefetch={refetch}
                />
            </div>

            {/* Modal Dialog */}
            <AssetCategoryFormDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                editingCategory={editingCategory}
            />
        </div>
    );
}
