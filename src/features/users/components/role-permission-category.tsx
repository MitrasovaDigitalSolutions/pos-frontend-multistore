"use client";

import {
    IconChevronDown,
    IconChevronUp,
    IconLoader,
} from "@tabler/icons-react";
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
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 border-b border-slate-50 select-none ${isExpanded ? "bg-slate-50/30" : "hover:bg-slate-50/30"
                    }`}
            >
                {/* Left Section: Info & Title */}
                <div
                    className="flex items-start gap-3 flex-1 cursor-pointer"
                    onClick={onToggleCategory}
                >
                    <div className={`p-2 rounded-xl border shrink-0 mt-0.5 ${category.colorClass}`}>
                        <Icon size={18} />
                    </div>
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-xs font-extrabold text-slate-800">
                                {category.label}
                            </h4>
                            <span
                                className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${activeCount === totalCount
                                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200/50"
                                    : activeCount > 0
                                        ? "bg-amber-100 text-amber-800 border border-amber-200/50"
                                        : "bg-slate-100 text-slate-500 border border-slate-200/50"
                                    }`}
                            >
                                {activeCount} dari {totalCount} Aktif
                            </span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-normal max-w-md">
                            {category.desc}
                        </p>
                    </div>
                </div>

                {/* Right Section: Actions & Toggle */}
                <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-50">
                    {isBulkLoading ? (
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 pr-1">
                            <IconLoader size={12} className="animate-spin text-emerald-500" />
                            <span>Memproses...</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 shrink-0">
                            {activeCount < totalCount && (
                                <button
                                    onClick={() => onBulkAction("assign")}
                                    className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100/50 px-2 py-1 rounded-lg border border-emerald-100/40 cursor-pointer transition-colors"
                                >
                                    Pilih Semua
                                </button>
                            )}
                            {activeCount > 0 && (
                                <button
                                    onClick={() => onBulkAction("revoke")}
                                    className="text-[10px] font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-100/50 px-2 py-1 rounded-lg border border-rose-100/40 cursor-pointer transition-colors"
                                >
                                    Hapus Semua
                                </button>
                            )}
                        </div>
                    )}

                    <button
                        onClick={onToggleCategory}
                        className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer shrink-0"
                    >
                        {isExpanded ? (
                            <IconChevronUp size={16} />
                        ) : (
                            <IconChevronDown size={16} />
                        )}
                    </button>
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
