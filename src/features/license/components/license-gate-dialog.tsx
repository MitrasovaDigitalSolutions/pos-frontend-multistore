"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { AppButton } from "@/components/shared/app-button";
import {
    IconAlertTriangle,
    IconArrowRight,
    IconLogout,
    IconRefresh,
    IconShieldOff,
    IconShieldX,
    IconWifi,
} from "@tabler/icons-react";
import type { LicenseStatus } from "../types";
import { signOut } from "@/lib/auth-helpers";
import { useAppRouter } from "@/hooks/use-app-router";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface LicenseGateDialogProps {
    open: boolean;
    /** The current (invalid) license status. null = no license at all or network error. */
    licenseStatus: LicenseStatus | null;
}

type StatusKey = "network_error" | "not_activated" | "expired" | "suspended";

const STATUS_MESSAGES: Record<StatusKey, { title: string; description: string }> = {
    network_error: {
        title: "Gagal Menghubungi Server Lisensi",
        description:
            "Aplikasi tidak dapat memvalidasi status lisensi dengan server pusat. Pastikan perangkat terhubung ke internet dan coba refresh halaman.",
    },
    not_activated: {
        title: "Lisensi Belum Diaktifkan",
        description:
            "Instalasi POS ini belum memiliki lisensi operasional aktif. Silakan lakukan aktivasi lisensi untuk memulai operasional toko.",
    },
    expired: {
        title: "Masa Langganan Telah Berakhir",
        description:
            "Masa aktif paket langganan POS Anda telah kedaluwarsa. Silakan perbarui langganan agar operasional kasir dapat dilanjutkan.",
    },
    suspended: {
        title: "Akses Layanan Ditangguhkan",
        description:
            "Akses operasional untuk lisensi ini sementara ditangguhkan oleh administrator sistem. Hubungi tim dukungan pelanggan untuk proses pemulihan akses.",
    },
};

export function LicenseGateDialog({ open, licenseStatus }: LicenseGateDialogProps) {
    const router = useAppRouter();
    const [isRetrying, setIsRetrying] = useState(false);

    const statusKey: StatusKey =
        licenseStatus === null
            ? "network_error"
            : (licenseStatus.status as StatusKey) ?? "not_activated";

    const msg = STATUS_MESSAGES[statusKey] ?? STATUS_MESSAGES.not_activated;
    const isNetworkError = statusKey === "network_error";
    const isSuspended = statusKey === "suspended";
    const isGracePeriod = licenseStatus?.is_grace_period === true;

    const handleRetry = () => {
        setIsRetrying(true);
        // Trigger a full page reload so the login-form re-checks the license
        window.location.reload();
    };

    const handleGoToLicense = () => {
        router.push("/licenses");
    };

    return (
        <Dialog open={open} onOpenChange={() => void 0} disablePointerDismissal>
            <DialogContent
                showCloseButton={false}
                className="max-w-sm p-0 rounded-3xl border-0 shadow-2xl overflow-hidden bg-transparent"
            >
                {/* Clean white modal card matching POS design */}
                <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-2xl">
                    {/* Top Google One-style accent strip */}
                    <div
                        className={cn(
                            "h-1.5 w-full",
                            isNetworkError
                                ? "bg-gradient-to-r from-amber-500 to-orange-500"
                                : isSuspended || statusKey === "expired"
                                    ? "bg-gradient-to-r from-rose-500 via-red-500 to-rose-600"
                                    : "bg-gradient-to-r from-slate-400 to-slate-500"
                        )}
                    />

                    <div className="p-6 sm:p-7 space-y-5">
                        <DialogHeader>
                            <div className="flex flex-col items-center text-center gap-3.5">
                                {/* Status Icon */}
                                <div
                                    className={cn(
                                        "w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xs border",
                                        isNetworkError
                                            ? "bg-amber-50 border-amber-200 text-amber-600"
                                            : isSuspended || statusKey === "expired"
                                                ? "bg-rose-50 border-rose-200 text-rose-600"
                                                : "bg-slate-100 border-slate-200 text-slate-600"
                                    )}
                                >
                                    {isNetworkError ? (
                                        <IconWifi size={28} />
                                    ) : isSuspended ? (
                                        <IconShieldX size={28} />
                                    ) : statusKey === "expired" ? (
                                        <IconAlertTriangle size={28} />
                                    ) : (
                                        <IconShieldOff size={28} />
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <DialogTitle className="text-base font-black text-slate-900 tracking-tight leading-snug">
                                        {msg.title}
                                    </DialogTitle>
                                    <DialogDescription className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                                        {msg.description}
                                    </DialogDescription>
                                </div>

                                {/* Grace period notice */}
                                {isGracePeriod && licenseStatus!.grace_days_remaining > 0 && (
                                    <div className="w-full rounded-2xl bg-rose-50 border border-rose-200 px-4 py-2.5 text-center">
                                        <p className="text-xs font-bold text-rose-800">
                                            Masa Tenggang: Tersisa {licenseStatus!.grace_days_remaining} hari sebelum akses operasional dibatasi.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </DialogHeader>

                        {/* Action Buttons */}
                        <div className="space-y-2.5">
                            {/* Primary CTA — navigate to /licenses */}
                            {!isSuspended && (
                                <AppButton
                                    className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl gap-2 shadow-sm cursor-pointer transition-all"
                                    onClick={handleGoToLicense}
                                >
                                    <span>Kelola Langganan</span>
                                    <IconArrowRight size={14} />
                                </AppButton>
                            )}

                            {/* Network error retry */}
                            {isNetworkError && (
                                <AppButton
                                    className="w-full h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl gap-2 border border-slate-200 cursor-pointer transition-all"
                                    onClick={handleRetry}
                                    disabled={isRetrying}
                                >
                                    <IconRefresh size={14} className={isRetrying ? "animate-spin" : ""} />
                                    {isRetrying ? "Memeriksa Koneksi..." : "Coba Hubungkan Kembali"}
                                </AppButton>
                            )}

                            {/* Suspended — show support info */}
                            {isSuspended && (
                                <div className="rounded-2xl bg-rose-50 border border-rose-200 p-3.5 text-center space-y-1.5">
                                    <p className="text-xs font-bold text-rose-800">
                                        Layanan Dukungan Pelanggan
                                    </p>
                                    <a
                                        href="mailto:support@mitrasovapos.my.id"
                                        className="text-[11px] text-rose-600 hover:text-rose-700 underline font-bold block"
                                    >
                                        support@mitrasovapos.my.id
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Footer: Logout */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                            <button
                                type="button"
                                onClick={() => void signOut({ callbackUrl: "/login" })}
                                className="flex items-center gap-1.5 text-slate-400 hover:text-rose-600 transition-colors py-1 cursor-pointer font-semibold"
                            >
                                <IconLogout size={13} />
                                <span>Keluar Akun</span>
                            </button>
                            <a
                                href="mailto:support@mitrasovapos.my.id"
                                className="text-[11px] text-emerald-600 hover:text-emerald-700 hover:underline font-bold"
                            >
                                Pusat Bantuan
                            </a>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
