"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
    IconChevronRight,
} from "@tabler/icons-react";
import Link from "next/link";
import { useState } from "react";
import type { SidebarSubmenuItem } from "./sidebar-config";

interface SidebarSubmenuProps {
    label: string;
    icon: React.ComponentType<{ size: number }>;
    items: SidebarSubmenuItem[];
    collapsed: boolean;
    pathname: string;
    userRoles: string[];
    userPermissions: string[];
    isActive: (path: string) => boolean;
}

export function SidebarSubmenu({
    label,
    icon: Icon,
    items,
    collapsed,
    pathname,
    userRoles,
    userPermissions,
    isActive,
}: SidebarSubmenuProps) {
    const filteredItems = items.filter((item) =>
        item.permission(userRoles, userPermissions)
    );

    const [isMasterOpen, setIsMasterOpen] = useState(() => {
        return filteredItems.some((i) => pathname === i.path || pathname.startsWith(i.path + "/"));
    });
    const [prevPathname, setPrevPathname] = useState(pathname);

    if (pathname !== prevPathname) {
        setPrevPathname(pathname);
        if (filteredItems.some((i) => pathname === i.path || pathname.startsWith(i.path + "/"))) {
            setIsMasterOpen(true);
        }
    }

    if (filteredItems.length === 0) return null;

    const isAnyActive = filteredItems.some((item) => isActive(item.path));

    const getSubLinkClass = (path: string) => {
        const active = isActive(path);
        return cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg font-bold text-[11px] transition-all duration-200 text-left cursor-pointer border-none bg-transparent outline-none transform",
            active
                ? "bg-emerald-600/20 text-emerald-400 font-extrabold"
                : "text-gray-500 hover:text-gray-200 hover:bg-gray-950 hover:translate-x-0.5"
        );
    };

    const getDropdownItemClass = (path: string) => {
        const active = isActive(path);
        return cn(
            "w-full flex items-center px-2.5 py-2 rounded-lg font-bold text-xs transition-all text-left cursor-pointer border-none bg-transparent outline-none",
            active
                ? "bg-emerald-600 text-white font-extrabold"
                : "text-gray-400 hover:text-white hover:bg-gray-900"
        );
    };

    if (!collapsed) {
        return (
            <div className="space-y-1">
                <button
                    onClick={() => setIsMasterOpen(!isMasterOpen)}
                    className={cn(
                        "w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs transition-all duration-200 text-left cursor-pointer border-none bg-transparent outline-none",
                        isAnyActive
                            ? "text-emerald-400 bg-emerald-950/30"
                            : "text-gray-400 hover:text-white hover:bg-gray-900"
                    )}
                >
                    <div className="flex items-center gap-3">
                        <span className={cn("transition-colors duration-200", isAnyActive && "text-emerald-400")}>
                            <Icon size={18} />
                        </span>
                        <span>{label}</span>
                    </div>
                    <div className="text-gray-500">
                        <IconChevronRight
                            size={14}
                            className={cn(
                                "transition-transform duration-200",
                                isMasterOpen && "rotate-90 text-emerald-400"
                            )}
                        />
                    </div>
                </button>
                {isMasterOpen && (
                    <ul className="pl-4 space-y-0.5 border-l border-gray-900 ml-5 mt-0.5">
                        {filteredItems.map((item) => (
                            <li key={item.path}>
                                <Link
                                    href={item.path}
                                    className={getSubLinkClass(item.path)}
                                >
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        );
    }

    return (
        <div className="flex justify-center">
            <Tooltip>
                <TooltipTrigger asChild>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                className={cn(
                                    "w-10 h-10 flex items-center justify-center rounded-xl transition-all cursor-pointer border-none bg-transparent outline-none",
                                    isAnyActive
                                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/10"
                                        : "text-gray-400 hover:text-white hover:bg-gray-900"
                                )}
                            >
                                <Icon size={18} />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            side="right"
                            align="start"
                            className="w-48 bg-gray-950 text-gray-300 border-gray-800 rounded-xl p-1 shadow-xl"
                        >
                            <DropdownMenuLabel className="text-[10px] font-bold text-gray-500 px-2.5 py-1.5 uppercase tracking-wider">
                                {label}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-gray-900" />
                            {filteredItems.map((item) => (
                                <DropdownMenuItem asChild key={item.path}>
                                    <Link
                                        href={item.path}
                                        className={getDropdownItemClass(item.path)}
                                    >
                                        {item.label}
                                    </Link>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TooltipTrigger>
                <TooltipContent
                    side="right"
                    className="bg-gray-900 border-gray-800 text-white font-bold text-xs"
                >
                    {label}
                </TooltipContent>
            </Tooltip>
        </div>
    );
}
