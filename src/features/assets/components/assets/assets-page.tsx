"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
    IconBuildingWarehouse,
    IconPlus,
    IconRefresh,
    IconLayersLinked,
} from "@tabler/icons-react";
import { useAssets, useAssetSummary } from "../../api/assets-api";
import { useAssetCategories } from "../../api/asset-categories-api";
import { AssetMetricsSummary } from "./asset-metrics-summary";
import { AssetFilterToolbar } from "./asset-filter-toolbar";
import { AssetTable } from "./asset-table";
import { AssetFormDialog } from "./asset-form-dialog";
import { AssetDetailSheet } from "./asset-detail-sheet";
import { AssetBulkPenyusutanDialog } from "./asset-bulk-penyusutan-dialog";
import type { Asset, AssetFilterParams } from "../../types";

export function AssetsPage() {
    const [filters, setFilters] = useState<AssetFilterParams>({
        page: 1,
        per_page: 50,
    });

    const filterMethods = useForm<AssetFilterParams>({
        defaultValues: {
            search: "",
            asset_category_uid: "all",
            status: "all",
            sumber_perolehan: "all",
            date_start: "",
            date_end: "",
        },
    });

    const { data: assetsData, isLoading, isFetching, refetch } = useAssets(filters);
    const { data: summary, isLoading: isLoadingSummary } = useAssetSummary();
    const { data: categories = [] } = useAssetCategories();

    // Dialog States
    const [isFormDialogOpen, setIsFormDialogOpen] = useState<boolean>(false);
    const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

    const [isDetailSheetOpen, setIsDetailSheetOpen] = useState<boolean>(false);
    const [selectedAssetUid, setSelectedAssetUid] = useState<string | null>(null);
    const [detailMode, setDetailMode] = useState<"history" | "form">("history");

    const [isBulkPenyusutanOpen, setIsBulkPenyusutanOpen] = useState<boolean>(false);

    // Handlers
    const handleFilterSubmit = useCallback((values: AssetFilterParams) => {
        setFilters((prev) => ({
            ...prev,
            page: 1,
            search: values.search?.trim() ? values.search.trim() : undefined,
            asset_category_uid:
                !values.asset_category_uid || values.asset_category_uid === "all"
                    ? undefined
                    : values.asset_category_uid,
            status: !values.status || values.status === "all" ? undefined : values.status,
            sumber_perolehan:
                !values.sumber_perolehan || values.sumber_perolehan === "all"
                    ? undefined
                    : values.sumber_perolehan,
            date_start: values.date_start || undefined,
            date_end: values.date_end || undefined,
        }));
    }, []);

    const handleFilterReset = useCallback(() => {
        filterMethods.reset({
            search: "",
            asset_category_uid: "all",
            status: "all",
            sumber_perolehan: "all",
            date_start: "",
            date_end: "",
        });
        setFilters({
            page: 1,
            per_page: 50,
        });
    }, [filterMethods]);

    const handleCreateClick = () => {
        setEditingAsset(null);
        setIsFormDialogOpen(true);
    };

    const handleEditClick = (asset: Asset) => {
        setEditingAsset(asset);
        setIsFormDialogOpen(true);
    };

    const handleDetailClick = (asset: Asset) => {
        setSelectedAssetUid(asset.uid);
        setDetailMode("history");
        setIsDetailSheetOpen(true);
    };

    const handleDepreciateClick = (asset: Asset) => {
        setSelectedAssetUid(asset.uid);
        setDetailMode("form");
        setIsDetailSheetOpen(true);
    };

    const assetsList = assetsData?.data || [];

    return (
        <div className="space-y-4 pb-12">
            {/* Header Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-100 dark:border-indigo-900/40">
                        <IconBuildingWarehouse className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                            Manajemen Aset Perusahaan
                        </h1>
                        <p className="text-xs text-slate-500">
                            Kelola inventaris aset tetap, kapitalisasi modal, penyusutan periodik, dan nilai buku akuntansi.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
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
                        type="button"
                        variant="outline"
                        onClick={() => setIsBulkPenyusutanOpen(true)}
                        className="h-8.5 px-3 text-xs font-bold border-amber-300 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 hover:bg-amber-100/60 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                        <IconLayersLinked className="w-4 h-4 text-amber-500" />
                        <span>Penyusutan Masal</span>
                    </Button>

                    <Button
                        onClick={handleCreateClick}
                        className="h-8.5 px-3.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                        <IconPlus className="w-4 h-4" />
                        <span>Catat Aset Baru</span>
                    </Button>
                </div>
            </div>

            {/* Metrics Summary Tiles */}
            <AssetMetricsSummary summary={summary} isLoading={isLoadingSummary} />

            {/* Main Table & Filter Container */}
            <div className="space-y-3">
                {/* Reusable Filter Form */}
                <AssetFilterToolbar
                    methods={filterMethods}
                    onSubmit={handleFilterSubmit}
                    onReset={handleFilterReset}
                    categories={categories}
                />

                {/* Table */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden p-3.5">
                    <AssetTable
                        assets={assetsList}
                        onDetail={handleDetailClick}
                        onDepreciate={handleDepreciateClick}
                        onEdit={handleEditClick}
                        isLoading={isLoading}
                        isFetching={isFetching}
                        onRefetch={refetch}
                    />
                </div>
            </div>

            {/* Dialog: Create / Edit Asset */}
            <AssetFormDialog
                key={isFormDialogOpen ? (editingAsset?.uid ?? "create-dialog") : "closed-dialog"}
                open={isFormDialogOpen}
                onOpenChange={setIsFormDialogOpen}
                editingAsset={editingAsset}
                categories={categories}
            />

            {/* Dialog: Bulk Asset Depreciation */}
            <AssetBulkPenyusutanDialog
                key={isBulkPenyusutanOpen ? "bulk-open" : "bulk-closed"}
                open={isBulkPenyusutanOpen}
                onOpenChange={setIsBulkPenyusutanOpen}
                activeAssets={assetsList}
            />

            {/* Modal: Asset Detail & In-Dialog Depreciation History/Form */}
            <AssetDetailSheet
                key={isDetailSheetOpen ? `${selectedAssetUid}-${detailMode}` : "detail-closed"}
                open={isDetailSheetOpen}
                onOpenChange={setIsDetailSheetOpen}
                assetUid={selectedAssetUid}
                initialMode={detailMode}
            />
        </div>
    );
}
