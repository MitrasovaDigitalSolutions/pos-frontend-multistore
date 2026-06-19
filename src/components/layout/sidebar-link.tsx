"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarLinkProps {
    path: string;
    label: string;
    icon: React.ComponentType<{ size: number }>;
    tab?: string;
    collapsed: boolean;
    isActive: boolean;
}

export function SidebarLink({
    path,
    label,
    icon: Icon,
    tab,
    collapsed,
    isActive,
}: SidebarLinkProps) {
    const url = tab ? `${path}?tab=${tab}` : path;
    const linkClass = cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition-all duration-200 text-left cursor-pointer border-none bg-transparent outline-none transform",
        isActive
            ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/10 font-bold"
            : "text-gray-400 hover:text-white hover:bg-gray-900 hover:translate-x-0.5 font-bold",
        collapsed && "justify-center px-0 w-10 h-10 mx-auto hover:translate-x-0"
    );

    const content = (
        <Link href={url} className={linkClass}>
            <Icon size={18} />
            {!collapsed && <span>{label}</span>}
        </Link>
    );

    if (collapsed) {
        return (
            <Tooltip>
                <TooltipTrigger asChild>{content}</TooltipTrigger>
                <TooltipContent
                    side="right"
                    className="bg-gray-900 border-gray-800 text-white font-bold text-xs"
                >
                    {label}
                </TooltipContent>
            </Tooltip>
        );
    }

    return <li>{content}</li>;
}
