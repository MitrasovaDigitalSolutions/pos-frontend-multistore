"use client";

import { AppButton } from "@/components/shared/app-button";
import { cn } from "@/lib/utils";
import {
    IconChevronDown,
    IconChevronUp,
    IconLoader,
} from "@tabler/icons-react";
import { PERMISSION_METADATA } from "../constants/role-permission-constants";
import type { RoleWithPermissions } from "../types";
import { RolePermissionItemCard } from "./role-permission-item-card";
import type { PermissionCategoryType } from "./role-permission-types";

interface RolePermissionCategoryProps {
    category: PermissionCategoryType;
    selectedRole?: RoleWithPermissions;
    searchQuery: string;
    isExpanded: boolean;
    isBulkLoading: boolean;
    pendingToggles: Record<string, boolean>;
    isMutating: boolean;
    onToggleCategory: () => void;
    onTogglePermission: (permissionName: string, isAssigned: boolean) => void;
    onBulkAction: (action: "assign" | "revoke") => void;
}

export function RolePermissionCategory({
    category,
    selectedRole,
    searchQuery,
    isExpanded,
    isBulkLoading,
    pendingToggles,
    isMutating,
    onToggleCategory,
    onTogglePermission,
    onBulkAction,
}: RolePermissionCategoryProps) {
    const totalCount = category.items.length;
    const activeCount = category.items.filter((p) =>
        selectedRole?.permissions.some((rp) => rp.name === p.name)
    ).length;

    const Icon = category.icon;
    const isAllActive = activeCount === totalCount && totalCount > 0;
    const isNoneActive = activeCount === 0;

    return (
        <div className="border-b border-slate-100 dark:border-slate-800/80 last:border-b-0 transition-colors">
            {/* Category Header */}
            <div
                className={cn(
                    "flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 gap-3 select-none transition-colors",
                    isExpanded
                        ? "bg-slate-50/70 dark:bg-slate-900/40"
                        : "hover:bg-slate-50/40 dark:hover:bg-slate-900/20"
                )}
            >
                {/* Left Section: Icon & Info */}
                <div
                    className="flex items-start gap-3 flex-1 cursor-pointer"
                    onClick={onToggleCategory}
                >
                    <div
                        className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border mt-0.5 shadow-2xs",
                            category.colorClass
                        )}
                    >
                        <Icon size={16} />
                    </div>

                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                                {category.label}
                            </h4>
                            <span
                                className={cn(
                                    "text-[10px] font-bold px-2 py-0.2 rounded-full border font-mono",
                                    isAllActive
                                        ? "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800"
                                        : activeCount > 0
                                          ? "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800"
                                          : "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                                )}
                            >
                                {activeCount} / {totalCount} Aktif
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug line-clamp-1">
                            {category.desc}
                        </p>
                    </div>
                </div>

                {/* Right Section: Bulk Actions & Chevron */}
                <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800">
                    {isBulkLoading ? (
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pr-1">
                            <IconLoader size={13} className="animate-spin text-emerald-500" />
                            <span>Memproses...</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 shrink-0">
                            {!isAllActive && (
                                <AppButton
                                    type="button"
                                    variant="ghost"
                                    size="xs"
                                    onClick={() => onBulkAction("assign")}
                                    className="h-7 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-100/70 border border-emerald-200/80 px-2.5 rounded-lg dark:text-emerald-400 dark:border-emerald-900/60 dark:hover:bg-emerald-950/40"
                                >
                                    Pilih Semua
                                </AppButton>
                            )}
                            {!isNoneActive && (
                                <AppButton
                                    type="button"
                                    variant="ghost"
                                    size="xs"
                                    onClick={() => onBulkAction("revoke")}
                                    className="h-7 text-[11px] font-bold text-rose-700 hover:text-rose-800 hover:bg-rose-100/70 border border-rose-200/80 px-2.5 rounded-lg dark:text-rose-400 dark:border-rose-900/60 dark:hover:bg-rose-950/40"
                                >
                                    Cabut Semua
                                </AppButton>
                            )}
                        </div>
                    )}

                    <AppButton
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={onToggleCategory}
                        className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg h-7 w-7"
                    >
                        {isExpanded ? <IconChevronUp size={15} /> : <IconChevronDown size={15} />}
                    </AppButton>
                </div>
            </div>

            {/* Collapsible Content: 2-Column Grid */}
            {isExpanded && (
                <div className="p-3 sm:p-4 bg-slate-50/40 dark:bg-slate-900/20 border-t border-slate-100 dark:border-slate-800">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {category.items.map((perm) => {
                            const meta = PERMISSION_METADATA[perm.name] || {
                                label: perm.name.replace("_", " "),
                                desc: "Hak akses operasional sistem.",
                                actionType: "view",
                                categoryId: category.id,
                            };
                            const isAssigned =
                                selectedRole?.permissions.some((p) => p.name === perm.name) || false;
                            const isPending = pendingToggles[perm.name] || false;

                            return (
                                <RolePermissionItemCard
                                    key={perm.id}
                                    permission={perm}
                                    label={meta.label}
                                    desc={meta.desc}
                                    actionType={meta.actionType}
                                    isAssigned={isAssigned}
                                    isPending={isPending}
                                    isDisabled={isMutating}
                                    searchQuery={searchQuery}
                                    onToggle={() => onTogglePermission(perm.name, isAssigned)}
                                />
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
