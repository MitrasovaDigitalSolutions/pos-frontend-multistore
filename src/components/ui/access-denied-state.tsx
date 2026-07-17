"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { IconShieldLock, IconArrowLeft, IconHome, IconKey } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";

export interface AccessDeniedStateProps {
    title?: string;
    description?: string;
    requiredPermission?: string;
    showHomeButton?: boolean;
    showBackButton?: boolean;
    className?: string;
    compact?: boolean;
}

export function AccessDeniedState({
    title = "Akses Ditolak",
    description = "Anda tidak memiliki izin yang cukup untuk mengakses atau mengelola data pada halaman ini. Hubungi Administrator jika Anda memerlukan akses.",
    requiredPermission,
    showHomeButton = true,
    showBackButton = true,
    className,
    compact = false,
}: AccessDeniedStateProps) {
    const router = useRouter();

    if (compact) {
        return (
            <div
                className={cn(
                    "p-6 flex flex-col items-center justify-center text-center bg-white border border-slate-100 rounded-2xl shadow-sm space-y-3",
                    className
                )}
            >
                <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 text-rose-500 flex items-center justify-center shrink-0">
                    <IconShieldLock size={24} />
                </div>
                <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-800">{title}</h4>
                    <p className="text-xs text-slate-400 max-w-sm leading-relaxed">{description}</p>
                </div>
                {requiredPermission && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono bg-slate-50 border border-slate-200 text-slate-500 px-2 py-0.5 rounded-md">
                        <IconKey size={11} />
                        {requiredPermission}
                    </span>
                )}
            </div>
        );
    }

    return (
        <div
            className={cn(
                "p-8 md:p-12 flex flex-col items-center justify-center text-center min-h-[420px] bg-white rounded-2xl border border-slate-200/80 shadow-sm mx-auto max-w-2xl my-6 space-y-6",
                className
            )}
        >
            {/* Animated Shield Icon Badge */}
            <div className="relative">
                <div className="w-20 h-20 bg-rose-50 border border-rose-100 text-rose-500 rounded-3xl flex items-center justify-center shadow-sm">
                    <IconShieldLock size={40} strokeWidth={1.75} />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-rose-500 border-2 border-white flex items-center justify-center text-white">
                    <IconKey size={12} />
                </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-2 max-w-md">
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    {title}
                </h3>
                <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
                    {description}
                </p>

                {requiredPermission && (
                    <div className="pt-2">
                        <span className="inline-flex items-center gap-1.5 text-xs font-mono bg-rose-50/70 border border-rose-200/60 text-rose-700 px-3 py-1 rounded-lg">
                            <IconKey size={13} />
                            Izin Diperlukan: <strong>{requiredPermission}</strong>
                        </span>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            {(showBackButton || showHomeButton) && (
                <div className="flex items-center justify-center gap-3 pt-2">
                    {showBackButton && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.back()}
                            className="h-9 px-4 text-xs font-bold rounded-xl gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-50"
                        >
                            <IconArrowLeft size={16} />
                            Kembali
                        </Button>
                    )}
                    {showHomeButton && (
                        <Button
                            size="sm"
                            onClick={() => router.push(ROUTES.ADMIN)}
                            className="h-9 px-4 text-xs font-bold rounded-xl gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                        >
                            <IconHome size={16} />
                            Ke Dashboard
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
