"use client";

import { useState } from "react";
import { IconCheck, IconCopy, IconEye, IconEyeOff } from "@tabler/icons-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface LicenseKeyMaskedChipProps {
    licenseKey?: string | null;
    label?: string;
    variant?: "hero" | "compact";
    className?: string;
}

export function LicenseKeyMaskedChip({
    licenseKey,
    label = "License Key:",
    variant = "hero",
    className,
}: LicenseKeyMaskedChipProps) {
    const [showKey, setShowKey] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopy = async (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (!licenseKey) return;

        try {
            await navigator.clipboard.writeText(licenseKey);
            setCopied(true);
            toast.success("License key berhasil disalin");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Gagal menyalin license key");
        }
    };

    const handleToggleShow = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setShowKey((prev) => !prev);
    };

    if (!licenseKey) {
        if (variant === "compact") {
            return (
                <span className="text-[10px] text-slate-500 font-medium truncate">
                    Belum diaktifkan
                </span>
            );
        }

        return (
            <div
                className={cn(
                    "inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 rounded-lg px-2.5 py-1 text-xs text-slate-500 select-none",
                    className
                )}
            >
                <span className="text-slate-400 font-bold text-[9px] uppercase tracking-wider">
                    {label}
                </span>
                <span className="font-medium italic text-[11px]">Belum Diaktifkan</span>
            </div>
        );
    }

    if (variant === "compact") {
        return (
            <div
                className={cn(
                    "flex items-center justify-between gap-1 w-full pt-0.5 select-none",
                    className
                )}
            >
                <div className="flex items-center gap-1 overflow-hidden min-w-0">
                    <span
                        className={cn(
                            "font-mono font-bold text-[11px]",
                            showKey
                                ? "text-slate-800 truncate"
                                : "tracking-widest text-slate-600"
                        )}
                        title={showKey ? licenseKey : "License Key disembunyikan"}
                    >
                        {showKey ? licenseKey : "••••••••••••••••"}
                    </span>
                </div>

                <div className="flex items-center gap-0.5 shrink-0">
                    <button
                        type="button"
                        onClick={handleToggleShow}
                        title={showKey ? "Sembunyikan License Key" : "Tampilkan License Key"}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                        aria-label={showKey ? "Sembunyikan License Key" : "Tampilkan License Key"}
                    >
                        {showKey ? <IconEyeOff size={12} /> : <IconEye size={12} />}
                    </button>

                    <button
                        type="button"
                        onClick={handleCopy}
                        title="Salin License Key"
                        className={cn(
                            "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer",
                            copied
                                ? "bg-emerald-100 text-emerald-800 font-extrabold"
                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                        )}
                        aria-label="Salin License Key"
                    >
                        {copied ? (
                            <>
                                <IconCheck size={11} className="text-emerald-600 shrink-0" />
                                <span>Disalin</span>
                            </>
                        ) : (
                            <>
                                <IconCopy size={11} className="text-slate-400 shrink-0" />
                                <span>Salin</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            className={cn(
                "inline-flex items-center gap-2 border rounded-lg px-2.5 py-1 text-xs transition-colors duration-150 shadow-2xs select-none",
                copied
                    ? "bg-emerald-50/90 border-emerald-200 text-emerald-800"
                    : "bg-slate-50/80 hover:bg-slate-100/90 border-slate-200/80 text-slate-700",
                className
            )}
        >
            <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-bold text-[9px] uppercase tracking-wider shrink-0">
                    {label}
                </span>
                <span
                    className={cn(
                        "font-mono font-bold text-[11px]",
                        showKey
                            ? "text-slate-800 truncate max-w-[160px] sm:max-w-[220px]"
                            : "tracking-widest text-slate-600"
                    )}
                    title={showKey ? licenseKey : "License Key disembunyikan"}
                >
                    {showKey ? licenseKey : "••••••••••••••••"}
                </span>
            </div>

            <div className="flex items-center gap-0.5 border-l border-slate-200/80 pl-1.5 ml-0.5 shrink-0">
                <button
                    type="button"
                    onClick={handleToggleShow}
                    title={showKey ? "Sembunyikan License Key" : "Tampilkan License Key"}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                    aria-label={showKey ? "Sembunyikan License Key" : "Tampilkan License Key"}
                >
                    {showKey ? <IconEyeOff size={13} /> : <IconEye size={13} />}
                </button>

                <button
                    type="button"
                    onClick={handleCopy}
                    title="Salin License Key"
                    className={cn(
                        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer",
                        copied
                            ? "bg-emerald-100/90 text-emerald-700 font-extrabold"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                    )}
                    aria-label="Salin License Key ke Clipboard"
                >
                    {copied ? (
                        <>
                            <IconCheck size={12} className="text-emerald-600 shrink-0" />
                            <span>Disalin</span>
                        </>
                    ) : (
                        <>
                            <IconCopy size={12} className="text-slate-400 group-hover:text-slate-600 shrink-0" />
                            <span>Salin</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
