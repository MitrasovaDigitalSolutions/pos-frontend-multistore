"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { IconSparkles } from "@tabler/icons-react";
import { usePurchaseTutorialStore } from "@/stores/purchase-tutorial-store";
import { useProductsTutorialStore } from "@/stores/products-tutorial-store";
import { useMembersTutorialStore } from "@/stores/members-tutorial-store";
import { useTutorialStore } from "@/stores/tutorial-store";
import { toast } from "sonner";

interface AdminTutorialButtonProps {
    className?: string;
    onCustomOpen?: () => void;
}

export function AdminTutorialButton({ className = "", onCustomOpen }: AdminTutorialButtonProps) {
    const pathname = usePathname();

    const handleClick = () => {
        if (onCustomOpen) {
            onCustomOpen();
            return;
        }

        // Feature-specific routing for tutorial dialogs
        if (pathname.startsWith("/admin/purchase")) {
            usePurchaseTutorialStore.getState().setMenuOpen(true);
            return;
        }

        if (pathname.startsWith("/admin/products")) {
            useProductsTutorialStore.getState().setMenuOpen(true);
            return;
        }

        if (pathname.startsWith("/admin/members")) {
            useMembersTutorialStore.getState().setMenuOpen(true);
            return;
        }

        if (pathname.startsWith("/admin/checkout") || pathname === "/admin") {
            useTutorialStore.getState().setMenuOpen(true);
            return;
        }

        // Fallback for other modules not yet implemented
        toast.info("Panduan interaktif untuk modul ini sedang dalam persiapan.");
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-200/80 bg-emerald-50/80 hover:bg-emerald-100/90 dark:bg-emerald-950/60 dark:border-emerald-800/80 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 transition-all font-bold text-xs select-none shrink-0 shadow-sm active:scale-95 cursor-pointer group ${className}`}
            title="Pusat Panduan & Tutorial Fitur"
            aria-label="Pusat Panduan & Tutorial"
        >
            <IconSparkles
                size={15}
                className="text-emerald-600 dark:text-emerald-400 group-hover:rotate-12 transition-transform duration-200 animate-pulse"
            />
            <span className="hidden sm:inline font-bold">Panduan</span>
        </button>
    );
}
