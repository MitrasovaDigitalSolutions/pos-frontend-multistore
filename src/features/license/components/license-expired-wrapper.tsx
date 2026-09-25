"use client";

import React from "react";
import { IconAlertTriangle, IconRefresh } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { AppButton } from "@/components/shared/app-button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface LicenseExpiredWrapperProps {
    /** Menentukan apakah lisensi kedaluwarsa / terkunci */
    isExpired: boolean;
    /** Elemen yang dibungkus dan diselubungi di bawah overlay */
    children: React.ReactNode;
    /** Judul peringatan utama */
    title?: string;
    /** Deskripsi penjelasan status kedaluwarsa */
    description?: React.ReactNode;
    /** Keterangan tooltip kustom untuk deskripsi (default: isi dari description) */
    tooltipContent?: React.ReactNode;
    /** Label tombol aksi perpanjangan (default: "Perbarui Langganan") */
    actionLabel?: string;
    /** Callback saat tombol perpanjang diklik */
    onRenew?: () => void;
    /** Label tombol aksi sekunder opsional */
    secondaryActionLabel?: string;
    /** Callback untuk tombol aksi sekunder opsional */
    onSecondaryAction?: () => void;
    /** Label badge di atas judul (default: "Langganan Berakhir") */
    badgeLabel?: string;
    /** Custom icon opsional pengganti IconAlertTriangle */
    icon?: React.ReactNode;
    /** Kelas CSS tambahan untuk kontainer pembungkus luar */
    className?: string;
    /** Kelas CSS tambahan untuk kontainer konten anak di bawahnya */
    contentClassName?: string;
    /** Kelas CSS tambahan untuk lapisan overlay transparan */
    overlayClassName?: string;
    /** Kelas CSS tambahan untuk kartu peringatan di tengah */
    cardClassName?: string;
    /** Kelas tinggi minimum saat expired (default: "min-h-[90px]") */
    minHeightClassName?: string;
    /** Intensitas blur backdrop: 'none' | 'subtle' | 'medium' (default: 'subtle') */
    blurIntensity?: "none" | "subtle" | "medium";
    /** Format layout kartu: 'auto' (responsif baris di layar lebar, stacked di mobile) atau 'centered' (selalu terpusat kompak) */
    layout?: "auto" | "centered";
}

const BLUR_CLASSES: Record<NonNullable<LicenseExpiredWrapperProps["blurIntensity"]>, string> = {
    none: "",
    subtle: "backdrop-blur-[2px]",
    medium: "backdrop-blur-sm",
};

/**
 * Reusable wrapper component yang menyelubungi konten / card informasi
 * dengan background transparan (frosted glass) ketika lisensi kedaluwarsa.
 *
 * Desain ultra-compact sehingga tidak terpotong di berbagai ukuran layar,
 * sekaligus membiarkan konten di belakangnya tetap samar terlihat, dilengkapi Tooltip shadcn.
 */
export function LicenseExpiredWrapper({
    isExpired,
    children,
    title = "Masa Langganan Kedaluwarsa",
    description = "Akses operasional dan fitur toko dinonaktifkan sementara. Perbarui langganan sekarang untuk melanjutkan.",
    tooltipContent,
    actionLabel = "Perbarui Langganan",
    onRenew,
    secondaryActionLabel,
    onSecondaryAction,
    badgeLabel = "Langganan Berakhir",
    icon,
    className,
    contentClassName,
    overlayClassName,
    cardClassName,
    minHeightClassName = "min-h-[90px]",
    blurIntensity = "subtle",
    layout = "auto",
}: LicenseExpiredWrapperProps) {
    if (!isExpired) {
        return <div className={cn("w-full", className)}>{children}</div>;
    }

    const blurClass = BLUR_CLASSES[blurIntensity];

    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-2xl w-full",
                minHeightClassName,
                className
            )}
        >
            {/* Konten yang diselubungi di bawah overlay (tetap terlihat samar & non-interaktif) */}
            <div
                className={cn(
                    "w-full h-full select-none pointer-events-none transition-all duration-300",
                    "opacity-65 filter blur-[0.35px] contrast-[0.95]",
                    contentClassName
                )}
                aria-hidden="true"
                tabIndex={-1}
            >
                {children}
            </div>

            {/* Lapisan Transparan Frosted Glass (Non-solid backdrop) */}
            <div
                className={cn(
                    "absolute inset-0 z-20 flex items-center justify-center p-2 sm:p-3",
                    "bg-white/60 dark:bg-slate-950/65",
                    "bg-gradient-to-b from-white/70 via-rose-50/40 to-white/75",
                    "dark:from-slate-950/70 dark:via-rose-950/30 dark:to-slate-950/80",
                    blurClass,
                    "border border-rose-200/80 dark:border-rose-900/50 rounded-2xl",
                    "animate-fade-in transition-all duration-200",
                    overlayClassName
                )}
            >
                {layout === "auto" ? (
                    /* Floating Card: Responsive Compact Bar */
                    <div
                        className={cn(
                            "relative max-w-xl w-full mx-auto",
                            "bg-white/95 dark:bg-slate-900/95 backdrop-blur-md",
                            "border border-rose-200/90 dark:border-rose-800/80",
                            "rounded-xl p-2.5 sm:px-3.5 sm:py-2.5 shadow-md shadow-rose-950/5",
                            "flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3.5 text-center sm:text-left",
                            "animate-fade-in transition-all",
                            cardClassName
                        )}
                    >
                        {/* Kiri: Icon + Judul + Badge + Deskripsi dengan Tooltip */}
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-200 dark:border-rose-800">
                                {icon ?? <IconAlertTriangle size={15} className="stroke-[2.2]" />}
                            </div>
                            <div className="min-w-0 space-y-0.5 text-left">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                                        {title}
                                    </h4>
                                    {badgeLabel && (
                                        <Badge
                                            variant="outline"
                                            className="text-[9px] font-extrabold uppercase bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 px-1.5 py-0"
                                        >
                                            {badgeLabel}
                                        </Badge>
                                    )}
                                </div>
                                {description && (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug line-clamp-1 sm:line-clamp-2 cursor-help hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
                                                {description}
                                            </p>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" align="start" className="max-w-xs text-xs">
                                            {tooltipContent ?? description}
                                        </TooltipContent>
                                    </Tooltip>
                                )}
                            </div>
                        </div>

                        {/* Kanan: Tombol Aksi */}
                        {(onRenew || (secondaryActionLabel && onSecondaryAction)) && (
                            <div className="flex items-center gap-1.5 shrink-0 w-full sm:w-auto justify-end">
                                {secondaryActionLabel && onSecondaryAction && (
                                    <AppButton
                                        variant="outline"
                                        size="sm"
                                        onClick={onSecondaryAction}
                                        className="w-full sm:w-auto text-xs font-semibold h-8 px-2.5 rounded-lg border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
                                    >
                                        {secondaryActionLabel}
                                    </AppButton>
                                )}
                                {onRenew && (
                                    <AppButton
                                        size="sm"
                                        onClick={onRenew}
                                        className="w-full sm:w-auto bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-bold text-xs h-8 px-3 rounded-lg shadow-2xs gap-1.5 cursor-pointer active:scale-98"
                                    >
                                        <IconRefresh size={13} className="stroke-[2.2]" />
                                        <span>{actionLabel}</span>
                                    </AppButton>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    /* Floating Card: Compact Centered */
                    <div
                        className={cn(
                            "relative max-w-sm w-full mx-auto text-center",
                            "bg-white/95 dark:bg-slate-900/95 backdrop-blur-md",
                            "border border-rose-200/90 dark:border-rose-800/80",
                            "rounded-xl p-2.5 sm:p-3 shadow-md shadow-rose-950/5",
                            "space-y-1.5 animate-fade-in transition-all",
                            cardClassName
                        )}
                    >
                        {/* Header Sebaris: Icon + Judul + Badge */}
                        <div className="flex items-center justify-center gap-1.5">
                            <div className="w-5 h-5 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-200 dark:border-rose-800">
                                {icon ?? <IconAlertTriangle size={12} className="stroke-[2.2]" />}
                            </div>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                                {title}
                            </h4>
                            {badgeLabel && (
                                <Badge
                                    variant="outline"
                                    className="text-[8.5px] font-extrabold uppercase bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 px-1.5 py-0"
                                >
                                    {badgeLabel}
                                </Badge>
                            )}
                        </div>

                        {/* Deskripsi Kompak dengan Tooltip */}
                        {description && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug max-w-xs mx-auto line-clamp-2 cursor-help hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
                                        {description}
                                    </p>
                                </TooltipTrigger>
                                <TooltipContent side="top" align="center" className="max-w-xs text-xs text-center">
                                    {tooltipContent ?? description}
                                </TooltipContent>
                            </Tooltip>
                        )}

                        {/* Tombol Aksi */}
                        {onRenew && (
                            <div className="pt-0.5 flex justify-center">
                                <AppButton
                                    size="sm"
                                    onClick={onRenew}
                                    className="bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-bold text-xs h-7.5 px-3 rounded-lg shadow-2xs gap-1.5 cursor-pointer active:scale-98"
                                >
                                    <IconRefresh size={12} className="stroke-[2.2]" />
                                    <span>{actionLabel}</span>
                                </AppButton>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
