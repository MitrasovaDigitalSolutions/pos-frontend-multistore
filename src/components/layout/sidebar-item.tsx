"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { IconChevronRight } from "@tabler/icons-react";
import {
    type NavItem,
    isNavItemActive,
    hasActiveChild,
} from "./sidebar-config";

interface SidebarItemProps {
    item: NavItem;
    depth?: number;
    collapsed: boolean;
    pathname: string;
    currentTab?: string;
    searchParams?: URLSearchParams | null;
    onItemClick?: () => void;
}

export function SidebarItem({
    item,
    depth = 0,
    collapsed,
    pathname,
    currentTab,
    searchParams,
    onItemClick,
}: SidebarItemProps) {
    const isSelfActive = isNavItemActive(item, pathname, currentTab, searchParams);
    const isChildActive = hasActiveChild(item, pathname, currentTab, searchParams);
    const isActive = isSelfActive || isChildActive;

    const hasChildren = Boolean(item.children && item.children.length > 0);

    const [isManualExpanded, setIsManualExpanded] = useState<boolean | null>(null);
    const isOpen = isManualExpanded !== null ? isManualExpanded : (isSelfActive || isChildActive);

    const Icon = item.icon;
    const url = item.path ? (item.tab ? `${item.path}?tab=${item.tab}` : item.path) : undefined;

    // ─── Render Badge ────────────────────────────────────────────────────────
    const renderBadge = () => {
        if (!item.badge) return null;
        const variantClasses = {
            emerald: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
            amber: "bg-amber-500/20 text-amber-400 border-amber-500/30",
            rose: "bg-rose-500/20 text-rose-400 border-rose-500/30",
            blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
            slate: "bg-slate-800 text-slate-300 border-slate-700",
        }[item.badgeVariant || "emerald"];

        return (
            <span
                className={cn(
                    "px-1.5 py-0.2 rounded-full text-[9px] font-extrabold border shrink-0",
                    variantClasses
                )}
            >
                {item.badge}
            </span>
        );
    };

    // ─── Collapsed Mode (Icons + Tooltips / Popover Dropdown) ──────────────────
    if (collapsed && depth === 0) {
        if (!hasChildren && url) {
            return (
                <li>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Link
                                href={url}
                                onClick={onItemClick}
                                className={cn(
                                    "w-10 h-10 mx-auto flex items-center justify-center rounded-xl transition-all cursor-pointer outline-none group",
                                    isSelfActive
                                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/50 font-bold"
                                        : "text-slate-400 hover:text-white hover:bg-slate-900"
                                )}
                            >
                                {Icon ? <Icon size={18} /> : <span className="w-2 h-2 rounded-full bg-slate-500 group-hover:bg-white" />}
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent
                            side="right"
                            className="bg-slate-900 border-slate-800 text-white font-bold text-xs"
                        >
                            {item.label}
                        </TooltipContent>
                    </Tooltip>
                </li>
            );
        }

        // Parent item with children in collapsed mode -> Dropdown Menu
        return (
            <li>
                <DropdownMenu>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <DropdownMenuTrigger asChild>
                                <button
                                    type="button"
                                    className={cn(
                                        "w-10 h-10 mx-auto flex items-center justify-center rounded-xl transition-all cursor-pointer border-none bg-transparent outline-none",
                                        isActive
                                            ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40"
                                            : "text-slate-400 hover:text-white hover:bg-slate-900"
                                    )}
                                >
                                    {Icon ? <Icon size={18} /> : <span className="w-2 h-2 rounded-full bg-slate-500" />}
                                </button>
                            </DropdownMenuTrigger>
                        </TooltipTrigger>
                        <TooltipContent
                            side="right"
                            className="bg-slate-900 border-slate-800 text-white font-bold text-xs"
                        >
                            {item.label}
                        </TooltipContent>
                    </Tooltip>

                    <DropdownMenuContent
                        side="right"
                        align="start"
                        sideOffset={12}
                        className="bg-slate-950 border border-slate-800 text-slate-300 w-56 p-1.5 shadow-2xl rounded-2xl z-50 animate-in fade-in-0 zoom-in-95"
                    >
                        <DropdownMenuLabel className="px-3 py-1.5 text-[11px] font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                            {Icon && <Icon size={14} className="text-emerald-400" />}
                            <span>{item.label}</span>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-slate-800/80 my-1" />

                        <div className="max-h-[70vh] overflow-y-auto space-y-0.5 py-0.5">
                            {item.children?.map((child) => (
                                <CollapsedDropdownSubItem
                                    key={child.label + (child.path || "")}
                                    item={child}
                                    pathname={pathname}
                                    currentTab={currentTab}
                                    searchParams={searchParams}
                                    onItemClick={onItemClick}
                                />
                            ))}
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>
            </li>
        );
    }

    // ─── Expanded Mode (Accordion / Multi-Level Tree) ─────────────────────────

    // Case A: Leaf Link (No children)
    if (!hasChildren && url) {
        return (
            <li className="list-none">
                <Link
                    href={url}
                    onClick={onItemClick}
                    className={cn(
                        "group w-full flex items-center justify-between rounded-xl font-bold transition-all duration-200 text-left cursor-pointer outline-none",
                        depth === 0
                            ? isSelfActive
                                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/10 px-3 py-2.5 text-xs"
                                : "text-gray-400 hover:text-white hover:bg-gray-900 px-3 py-2.5 text-xs hover:translate-x-0.5"
                            : isSelfActive
                            ? "bg-emerald-600/20 text-emerald-400 font-extrabold px-3 py-2 text-[11px] rounded-lg"
                            : "text-gray-500 hover:text-gray-200 hover:bg-gray-950 px-3 py-2 text-[11px] rounded-lg hover:translate-x-0.5"
                    )}
                >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        {Icon && (
                            <span
                                className={cn(
                                    "shrink-0 transition-colors",
                                    isSelfActive ? (depth === 0 ? "text-white" : "text-emerald-400") : "text-gray-400 group-hover:text-white"
                                )}
                            >
                                <Icon size={depth === 0 ? 18 : 14} />
                            </span>
                        )}
                        <span className="truncate">{item.label}</span>
                    </div>

                    {renderBadge()}
                </Link>
            </li>
        );
    }

    // Case B: Parent Accordion (Has children)
    return (
        <li className="list-none space-y-0.5">
            <button
                type="button"
                onClick={() => setIsManualExpanded(!isOpen)}
                className={cn(
                    "group w-full flex items-center justify-between rounded-xl font-bold transition-all duration-200 text-left cursor-pointer border-none outline-none",
                    depth === 0
                        ? isActive
                            ? "text-emerald-400 bg-emerald-950/30 px-3 py-2.5 text-xs"
                            : "text-gray-400 hover:text-white hover:bg-gray-900 px-3 py-2.5 text-xs"
                        : isActive
                        ? "text-emerald-400 bg-emerald-950/20 px-3 py-2 text-[11px] rounded-lg font-extrabold"
                        : "text-gray-500 hover:text-gray-200 hover:bg-gray-950 px-3 py-2 text-[11px] rounded-lg"
                )}
            >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    {Icon && (
                        <span
                            className={cn(
                                "shrink-0 transition-colors",
                                isActive ? "text-emerald-400" : "text-gray-400 group-hover:text-white"
                            )}
                        >
                            <Icon size={depth === 0 ? 18 : 14} />
                        </span>
                    )}
                    <span className="truncate">{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 text-gray-500">
                    {renderBadge()}
                    <IconChevronRight
                        size={14}
                        className={cn(
                            "transition-transform duration-200 shrink-0",
                            isOpen && "rotate-90 text-emerald-400"
                        )}
                    />
                </div>
            </button>

            {/* Recursive Nested Sub-Tree */}
            {isOpen && item.children && (
                <ul
                    className={cn(
                        "space-y-0.5 transition-all pl-4 border-l border-gray-900 ml-5 mt-0.5"
                    )}
                >
                    {item.children.map((child) => (
                        <SidebarItem
                            key={child.label + (child.path || "")}
                            item={child}
                            depth={depth + 1}
                            collapsed={collapsed}
                            pathname={pathname}
                            currentTab={currentTab}
                            searchParams={searchParams}
                            onItemClick={onItemClick}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
}

// ─── Helper Component: Nested Items in Collapsed Dropdown ─────────────────────
function CollapsedDropdownSubItem({
    item,
    pathname,
    currentTab,
    searchParams,
    onItemClick,
}: {
    item: NavItem;
    pathname: string;
    currentTab?: string;
    searchParams?: URLSearchParams | null;
    onItemClick?: () => void;
}) {
    const isSelfActive = isNavItemActive(item, pathname, currentTab, searchParams);

    const Icon = item.icon;
    const url = item.path ? (item.tab ? `${item.path}?tab=${item.tab}` : item.path) : undefined;
    const hasChildren = Boolean(item.children && item.children.length > 0);

    if (hasChildren) {
        return (
            <div className="space-y-0.5 pt-1">
                <div className="px-2 py-1 text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    {Icon && <Icon size={12} className="text-gray-400" />}
                    <span>{item.label}</span>
                </div>
                <div className="pl-2 border-l border-gray-800 ml-2 space-y-0.5">
                    {item.children?.map((child) => (
                        <CollapsedDropdownSubItem
                            key={child.label + (child.path || "")}
                            item={child}
                            pathname={pathname}
                            currentTab={currentTab}
                            searchParams={searchParams}
                            onItemClick={onItemClick}
                        />
                    ))}
                </div>
            </div>
        );
    }

    if (!url) return null;

    return (
        <DropdownMenuItem asChild>
            <Link
                href={url}
                onClick={onItemClick}
                className={cn(
                    "w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all",
                    isSelfActive
                        ? "bg-emerald-600 text-white font-bold"
                        : "text-gray-400 hover:text-white hover:bg-gray-900"
                )}
            >
                <div className="flex items-center gap-2 min-w-0">
                    {Icon ? (
                        <Icon size={14} className={isSelfActive ? "text-white" : "text-gray-400"} />
                    ) : (
                        <span
                            className={cn(
                                "w-1.5 h-1.5 rounded-full shrink-0",
                                isSelfActive ? "bg-white" : "bg-gray-600"
                            )}
                        />
                    )}
                    <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/50">
                        {item.badge}
                    </span>
                )}
            </Link>
        </DropdownMenuItem>
    );
}
