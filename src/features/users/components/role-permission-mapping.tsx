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
import { RoleListPanel } from "./role-list-panel";
import { RolePermissionCategory } from "./role-permission-category";
import { RolePermissionToolbar } from "./role-permission-toolbar";

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
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pb-28 sm:pb-8">
                {/* Left Column Skeleton */}
                <div className="lg:col-span-4 xl:col-span-4 space-y-4">
                    <Skeleton className="h-80 w-full rounded-2xl" />
                    <Skeleton className="h-28 w-full rounded-xl" />
                </div>

                {/* Right Column Skeleton */}
                <div className="lg:col-span-8 xl:col-span-8 space-y-4">
                    <Skeleton className="h-24 w-full rounded-2xl" />
                    <Skeleton className="h-20 w-full rounded-xl" />
                    <div className="space-y-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
                        ))}
                    </div>
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pb-28 sm:pb-8">
            {/* Left Column: Roles Panel (Sticky on Desktop) */}
            <div className="lg:col-span-4 xl:col-span-4 lg:sticky lg:top-4 self-start space-y-4">
                <RoleListPanel
                    roles={roles}
                    activeRoleName={activeRoleName}
                    onSelectRole={setSelectedRoleName}
                />
            </div>

            {/* Right Column: Role Permissions Workspace */}
            <div className="lg:col-span-8 xl:col-span-8 space-y-4">
                {/* 1. Active Role Summary Banner */}
                {selectedRole && currentRoleMeta && (
                    <div className="bg-gradient-to-r from-emerald-50/80 via-white to-slate-50 border border-emerald-200/80 dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-900 dark:border-emerald-800/40 rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                                <IconKey size={20} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                                        Konfigurasi Hak Akses:{" "}
                                        <span className="text-emerald-700 dark:text-emerald-400 capitalize">
                                            {currentRoleMeta.label}
                                        </span>
                                    </h3>
                                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                                        <IconCheck size={11} strokeWidth={3} />
                                        {selectedRoleStats.assigned} dari {selectedRoleStats.total} Aktif ({selectedRoleStats.percentage}%)
                                    </span>
                                </div>
                                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                    {currentRoleMeta.desc}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium shrink-0 bg-white/80 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200/70 dark:border-slate-700 shadow-2xs">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Tersimpan Otomatis</span>
                        </div>
                    </div>
                )}

                {/* 2. Unified Search & Category Filter Toolbar */}
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

                {/* 3. Permissions Categories Accordion Card */}
                <Card className="border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-2xs bg-white dark:bg-slate-900 overflow-hidden py-0">
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
                            <div className="p-10 sm:p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                    <IconAlertCircle size={24} />
                                </div>
                                <div className="max-w-sm">
                                    <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
                                        Tidak ada hak akses yang sesuai
                                    </p>
                                    <p className="text-[11px] text-slate-400 mt-1">
                                        {searchQuery
                                            ? `Pencarian "${searchQuery}" tidak cocok dengan nama atau kode izin apapun.`
                                            : "Tidak ada izin aktif yang cocok dengan filter yang Anda tentukan."}
                                    </p>
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
        </div>
    );
}
