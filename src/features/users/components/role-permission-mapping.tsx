"use client";

import { AppButton } from "@/components/shared/app-button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    IconAlertCircle,
    IconCheck,
    IconKey,
    IconLock,
    IconRotateClockwise,
} from "@tabler/icons-react";
import { ROLE_METADATA } from "../constants/role-permission-constants";
import { useRolePermissions } from "../hooks/use-role-permissions";
import { RolePermissionCategory } from "./role-permission-category";
import { RolePermissionToolbar } from "./role-permission-toolbar";
import { RoleSelectorBar } from "./role-selector-bar";

export function RolePermissionMapping() {
    const {
        roles,
        activeRoleName,
        selectedRole,
        selectedRoleStats,
        categories,
        filteredCategories,
        totalPermissionsCount,
        visiblePermissionsCount,
        searchQuery,
        setSearchQuery,
        selectedCategoryId,
        setSelectedCategoryId,
        onlyAssigned,
        setOnlyAssigned,
        isLoading,
        isError,
        isMutating,
        pendingToggles,
        bulkLoadingCategories,
        setSelectedRoleName,
        handleTogglePermission,
        handleBulkCategoryAction,
        isCategoryExpanded,
        toggleCategory,
        handleExpandAll,
        handleCollapseAll,
        refetchRoles,
        refetchPermissions,
    } = useRolePermissions();

    if (isLoading) {
        return (
            <div className="space-y-4 pb-28 sm:pb-8">
                {/* Role bar skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-24 w-full rounded-xl" />
                    ))}
                </div>

                {/* Toolbar skeleton */}
                <Skeleton className="h-20 w-full rounded-xl" />

                {/* Categories skeleton */}
                <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full rounded-2xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-3 max-w-md mx-auto my-8">
                <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 flex items-center justify-center mx-auto">
                    <IconLock size={24} />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        Gagal Memuat Data Hak Akses
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                        Terjadi kendala saat mengambil data peran atau permissions dari server.
                    </p>
                </div>
                <AppButton
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        refetchRoles();
                        refetchPermissions();
                    }}
                    className="gap-1.5"
                >
                    <IconRotateClockwise size={14} />
                    <span>Coba Lagi</span>
                </AppButton>
            </div>
        );
    }

    const currentRoleMeta = activeRoleName
        ? ROLE_METADATA[activeRoleName] || {
              label: activeRoleName.replace("_", " "),
              desc: "Hak akses yang ditentukan oleh sistem.",
              colorClass: "",
              icon: IconKey,
          }
        : null;

    return (
        <div className="space-y-4 pb-28 sm:pb-8">
            {/* 1. Compact Role Selector Bar */}
            <RoleSelectorBar
                roles={roles}
                activeRoleName={activeRoleName}
                onSelectRole={setSelectedRoleName}
            />

            {/* 2. Active Role Summary Card */}
            {selectedRole && currentRoleMeta && (
                <div className="bg-gradient-to-r from-emerald-50/70 via-white to-slate-50 border border-emerald-200/80 dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-900 dark:border-emerald-800/40 rounded-xl p-3.5 sm:p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                            <IconKey size={18} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                    Konfigurasi Hak Akses:{" "}
                                    <span className="text-emerald-700 dark:text-emerald-400">
                                        {currentRoleMeta.label}
                                    </span>
                                </h3>
                                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                                    <IconCheck size={11} strokeWidth={3} />
                                    {selectedRoleStats.assigned} dari {selectedRoleStats.total} Aktif ({selectedRoleStats.percentage}%)
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                                {currentRoleMeta.desc}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium self-end sm:self-center">
                        <span>Perubahan otomatis tersimpan</span>
                    </div>
                </div>
            )}

            {/* 3. Compact Search & Category Filter Toolbar */}
            <RolePermissionToolbar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                categories={categories}
                selectedCategoryId={selectedCategoryId}
                onSelectCategory={setSelectedCategoryId}
                onlyAssigned={onlyAssigned}
                onToggleOnlyAssigned={setOnlyAssigned}
                visibleCount={visiblePermissionsCount}
                totalCount={totalPermissionsCount}
                onExpandAll={handleExpandAll}
                onCollapseAll={handleCollapseAll}
            />

            {/* 4. Permissions Categories Accordion Card */}
            <Card className="border-slate-200/80 dark:border-slate-800 rounded-xl shadow-2xs bg-white dark:bg-slate-900 overflow-hidden py-0">
                <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredCategories.length > 0 ? (
                        filteredCategories.map((cat) => {
                            const isExpanded = isCategoryExpanded(cat.id);
                            const isBulkLoading = bulkLoadingCategories[cat.id] || false;

                            return (
                                <RolePermissionCategory
                                    key={cat.id}
                                    category={cat}
                                    selectedRole={selectedRole}
                                    searchQuery={searchQuery}
                                    isExpanded={isExpanded}
                                    isBulkLoading={isBulkLoading}
                                    pendingToggles={pendingToggles}
                                    isMutating={isMutating}
                                    onToggleCategory={() => toggleCategory(cat.id)}
                                    onTogglePermission={handleTogglePermission}
                                    onBulkAction={(action) =>
                                        handleBulkCategoryAction(cat.id, cat.items, action)
                                    }
                                />
                            );
                        })
                    ) : (
                        <div className="p-10 text-center text-slate-400 flex flex-col items-center justify-center gap-2.5">
                            <IconAlertCircle size={32} className="text-slate-300 dark:text-slate-600" />
                            <div>
                                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Tidak ada hak akses yang sesuai filter
                                </p>
                                {searchQuery && (
                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                        Pencarian &ldquo;{searchQuery}&rdquo; tidak cocok dengan nama atau kode izin apapun.
                                    </p>
                                )}
                            </div>
                            {(searchQuery || selectedCategoryId !== "all" || onlyAssigned) && (
                                <AppButton
                                    type="button"
                                    variant="outline"
                                    size="xs"
                                    onClick={() => {
                                        setSearchQuery("");
                                        setSelectedCategoryId("all");
                                        setOnlyAssigned(false);
                                    }}
                                    className="text-xs mt-1"
                                >
                                    Reset Semua Filter
                                </AppButton>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
