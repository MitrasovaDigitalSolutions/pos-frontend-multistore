"use client";

import {
    IconChevronDown,
    IconChevronUp,
    IconLoader,
} from "@tabler/icons-react";
import { AppButton } from "@/components/shared/app-button";
import { RoleWithPermissions } from "../types";
import { PermissionCategoryType } from "./role-permission-types";
import { RolePermissionItem } from "./role-permission-item";

interface RolePermissionCategoryProps {
    category: PermissionCategoryType;
    selectedRole?: RoleWithPermissions;
    searchQuery: string;
    isExpanded: boolean;
    isBulkLoading: boolean;
    pendingToggles: Record<string, boolean>;
    isMutating: boolean;
    permissionMetadata: Record<string, { label: string; desc: string }>;
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
    permissionMetadata,
    onToggleCategory,
    onTogglePermission,
    onBulkAction,
}: RolePermissionCategoryProps) {
    const totalCount = category.items.length;
    const activeCount = category.items.filter((p) =>
        selectedRole?.permissions.some((rp) => rp.name === p.name)
    ).length;

    const Icon = category.icon;

    return (
        <div className="bg-white overflow-hidden transition-all duration-200">
            {/* Category Header */}
            <div
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-4.5 gap-3.5 border-b border-slate-100 select-none ${isExpanded ? "bg-slate-50/50" : "hover:bg-slate-50/40"
                    }`}
            >
                {/* Left Section: Info & Title */}
                <div
                    className="flex items-start gap-3.5 flex-1 cursor-pointer"
                    onClick={onToggleCategory}
                >
                    <div className={`p-2.5 rounded-xl border shrink-0 mt-0.5 ${category.colorClass}`}>
                        <Icon size={18} />
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
                                {category.label}
                            </h4>
                            <span
                                className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${activeCount === totalCount
                                    ? "bg-emerald-100/80 text-emerald-800 border-emerald-200"
                                    : activeCount > 0
                                        ? "bg-amber-100/80 text-amber-800 border-amber-200"
                                        : "bg-slate-100 text-slate-500 border-slate-200"
                                    }`}
                            >
                                {activeCount} dari {totalCount} Aktif
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed max-w-xl">
                            {category.desc}
                        </p>
                    </div>
                </div>

                {/* Right Section: Actions & Toggle */}
                <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                    {isBulkLoading ? (
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pr-1">
                            <IconLoader size={13} className="animate-spin text-emerald-500" />
                            <span>Memproses...</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 shrink-0">
                            {activeCount < totalCount && (
                                <AppButton
                                    variant="ghost"
                                    size="xs"
                                    onClick={() => onBulkAction("assign")}
                                    className="text-[10px] font-extrabold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 h-auto rounded-lg"
                                >
                                    Pilih Semua
                                </AppButton>
                            )}
                            {activeCount > 0 && (
                                <AppButton
                                    variant="ghost"
                                    size="xs"
                                    onClick={() => onBulkAction("revoke")}
                                    className="text-[10px] font-extrabold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200/60 px-2.5 py-1 h-auto rounded-lg"
                                >
                                    Hapus Semua
                                </AppButton>
                            )}
                        </div>
                    )}

                    <AppButton
                        variant="ghost"
                        size="icon-xs"
                        onClick={onToggleCategory}
                        className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                    >
                        {isExpanded ? (
                            <IconChevronUp size={16} />
                        ) : (
                            <IconChevronDown size={16} />
                        )}
                    </AppButton>
                </div>
            </div>

            {/* Collapsible Content */}
            {isExpanded && (
                <div className="divide-y divide-slate-50 bg-slate-50/10 px-4">
                    {category.items.map((perm) => {
                        const meta = permissionMetadata[perm.name] || {
                            label: perm.name.replace("_", " "),
                            desc: "Hak akses sistem tambahan.",
                        };
                        const isAssigned = selectedRole?.permissions.some(
                            (p) => p.name === perm.name
                        ) || false;
                        const isPending = pendingToggles[perm.name];

                        return (
                            <RolePermissionItem
                                key={perm.id}
                                permission={perm}
                                label={meta.label}
                                desc={meta.desc}
                                isAssigned={isAssigned}
                                isPending={isPending}
                                isDisabled={isPending || isBulkLoading || isMutating}
                                searchQuery={searchQuery}
                                onToggle={() => onTogglePermission(perm.name, isAssigned)}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}
