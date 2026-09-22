"use client";

import { useState } from "react";
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
    IconArrowLeft,
    IconKey,
    IconLogout,
    IconRefresh,
    IconShieldX,
} from "@tabler/icons-react";
import type { LicenseStatus } from "../types";
import { LicenseActivateForm } from "./license-activate-form";
import { signOut } from "@/lib/auth-helpers";

interface LicenseGateDialogProps {
    open: boolean;
    /** The current (invalid) license status. null = no license at all or network error. */
    licenseStatus: LicenseStatus | null;
    /** Called after license is successfully activated or retried */
    onActivated: () => void;
}

const STATUS_MESSAGES: Record<string, { title: string; description: string }> = {
    network_error: {
        title: "Koneksi ke Server Lisensi Terputus",
        description:
            "Aplikasi tidak dapat memvalidasi status langganan dengan server pusat. Pastikan koneksi internet aktif dan server dapat diakses.",
    },
    not_activated: {
        title: "Aplikasi Belum Teraktivasi",
        description:
            "Aplikasi ini belum memiliki lisensi aktif. Masukkan license key resmi yang Anda peroleh untuk mengaktifkan operasional kasir.",
    },
    expired: {
        title: "Masa Aktif Langganan Berakhir",
        description:
            "Masa aktif paket langganan Anda telah habis. Silakan masukkan license key baru atau lakukan perpanjangan agar operasional tetap berjalan.",
    },
    suspended: {
        title: "Akses Layanan Ditangguhkan",
        description:
            "Lisensi aplikasi saat ini dibekukan sementara oleh sistem pusat. Hubungi tim dukungan untuk bantuan pemulihan akses.",
    },
    grace_period: {
        title: "Masa Tenggang Langganan Berjalan",
        description:
            "Masa aktif lisensi telah melewati tanggal jatuh tempo. Segera lakukan perpanjangan agar sistem kasir dan operasional toko tidak terhenti.",
    },
};

type ViewMode = "info" | "activate";

export function LicenseGateDialog({
    open,
    licenseStatus,
    onActivated,
}: LicenseGateDialogProps) {
    const [view, setView] = useState<ViewMode>("info");
    const [isRetrying, setIsRetrying] = useState(false);

    const status = licenseStatus === null ? "network_error" : (licenseStatus.status ?? "not_activated");
    const msg = STATUS_MESSAGES[status] ?? STATUS_MESSAGES.not_activated;

    const isGracePeriod = status === "grace_period";
    const isSuspended = status === "suspended";
    const isNetworkError = status === "network_error";

    const handleRetry = async () => {
        setIsRetrying(true);
        try {
            onActivated();
        } finally {
            setTimeout(() => setIsRetrying(false), 1000);
        }
    };

    return (
        <Dialog open={open} onOpenChange={() => void 0} disablePointerDismissal>
            <DialogContent
                showCloseButton={false}
                className="max-w-md p-6 rounded-2xl border border-slate-200/90 shadow-2xl"
            >
                <DialogHeader>
                    <div className="flex flex-col items-center text-center gap-3">
                        {/* Status Icon Badge */}
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-600 flex items-center justify-center shadow-xs">
                            {isSuspended ? (
                                <IconShieldX size={24} className="text-rose-600" />
                            ) : (
                                <IconAlertTriangle size={24} />
                            )}
                        </div>

                        <div>
                            <DialogTitle className="text-base font-extrabold text-slate-900 tracking-tight">
                                {msg.title}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-slate-500 leading-relaxed mt-1.5 max-w-sm mx-auto">
                                {msg.description}
                            </DialogDescription>
                        </div>

                        {/* Grace period warning strip */}
                        {isGracePeriod && licenseStatus?.grace_days_remaining && licenseStatus.grace_days_remaining > 0 && (
                            <div className="w-full rounded-xl bg-amber-50 border border-amber-200/90 px-3.5 py-2 text-center">
                                <p className="text-xs font-bold text-amber-700">
                                    ⚠ Tersisa {licenseStatus.grace_days_remaining} hari masa tenggang
                                </p>
                            </div>
                        )}
                    </div>
                </DialogHeader>

                <div className="space-y-3 pt-2">
                    {/* Suspended: no activate, show contact info */}
                    {isSuspended ? (
                        <div className="rounded-xl bg-rose-50 border border-rose-200/80 p-3.5 text-center space-y-1.5">
                            <p className="text-xs font-bold text-rose-700">
                                Hubungi Tim Dukungan Mitrasova
                            </p>
                            <p className="text-[11px] text-rose-600">
                                Email:{" "}
                                <a
                                    href="mailto:support@mitrasovapos.my.id"
                                    className="underline font-bold"
                                >
                                    support@mitrasovapos.my.id
                                </a>
                            </p>
                        </div>
                    ) : view === "info" ? (
                        <div className="space-y-2.5">
                            {isNetworkError ? (
                                <AppButton
                                    className="w-full h-10 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl gap-2 shadow-xs cursor-pointer"
                                    onClick={handleRetry}
                                    disabled={isRetrying}
                                >
                                    <IconRefresh size={15} className={isRetrying ? "animate-spin" : ""} />
                                    {isRetrying ? "Memeriksa Koneksi..." : "Hubungkan Ulang"}
                                </AppButton>
                            ) : (
                                <AppButton
                                    className="w-full h-10 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl gap-2 shadow-xs cursor-pointer"
                                    onClick={() => setView("activate")}
                                >
                                    <IconKey size={15} />
                                    <span>
                                        {status === "not_activated"
                                            ? "Masukkan Kunci Lisensi"
                                            : "Aktivasi Kunci Lisensi Baru"}
                                    </span>
                                </AppButton>
                            )}

                            <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs">
                                <button
                                    type="button"
                                    onClick={() => void signOut({ callbackUrl: "/login" })}
                                    className="flex items-center gap-1.5 text-slate-500 hover:text-rose-600 transition-colors py-1 cursor-pointer font-medium"
                                >
                                    <IconLogout size={14} />
                                    <span>Keluar / Ganti Akun</span>
                                </button>
                                <a
                                    href="mailto:support@mitrasovapos.my.id"
                                    className="text-[11px] text-emerald-600 hover:underline font-bold"
                                >
                                    Bantuan Dukungan
                                </a>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <button
                                type="button"
                                onClick={() => setView("info")}
                                className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
                            >
                                <IconArrowLeft size={13} />
                                <span>Kembali ke Informasi</span>
                            </button>
                            <LicenseActivateForm compact onSuccess={onActivated} />
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
