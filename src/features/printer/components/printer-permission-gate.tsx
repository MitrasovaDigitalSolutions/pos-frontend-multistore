"use client";

import { useState, useCallback } from "react";
import { ShieldAlert, ShieldCheck, Loader2, RefreshCw, Printer, SlidersHorizontal, Info } from "lucide-react";
import { AppButton } from "@/components/shared/app-button";
import { useLnaPermission, triggerLnaPermissionRequest } from "@/hooks/use-lna-permission";

interface PrinterPermissionGateProps {
    children: React.ReactNode;
}

/**
 * PrinterPermissionGate
 *
 * Komponen pelindung akses fitur printer / checkout.
 * Memastikan izin Local Network Access ("Aplikasi di perangkat" / Apps on device & Jaringan lokal di Chrome)
 * telah berstatus "granted" sebelum konten utama dapat diakses.
 */
export function PrinterPermissionGate({ children }: PrinterPermissionGateProps) {
    const { status, isGranted, isChecking, recheckPermission } = useLnaPermission();
    const [isTriggeringPermission, setIsTriggeringPermission] = useState(false);
    const [triggerAttempted, setTriggerAttempted] = useState(false);

    const handleRequestPermission = useCallback(async () => {
        setIsTriggeringPermission(true);
        setTriggerAttempted(false);
        try {
            // Memicu fetch ke localhost DAN 127.0.0.1 dari user gesture
            // agar Chrome memunculkan dialog izin "Aplikasi di perangkat" dan "Jaringan lokal"
            await triggerLnaPermissionRequest();
        } finally {
            setIsTriggeringPermission(false);
            setTriggerAttempted(true);
            await recheckPermission();
        }
    }, [recheckPermission]);

    if (isChecking) {
        return (
            <div className="flex min-h-[280px] w-full items-center justify-center p-6 text-slate-400 dark:text-slate-500">
                <div className="flex items-center gap-2.5 text-xs font-medium">
                    <Loader2 size={16} className="animate-spin text-emerald-600 dark:text-emerald-400" />
                    <span>Memeriksa izin printer...</span>
                </div>
            </div>
        );
    }

    if (isGranted) {
        return <>{children}</>;
    }

    // Status "denied": akses diblokir oleh user / browser
    if (status === "denied") {
        return (
            <div className="flex min-h-[360px] w-full items-center justify-center p-4 sm:p-6">
                <div className="w-full max-w-md rounded-2xl border border-rose-200/90 bg-white p-5 shadow-sm dark:border-rose-900/60 dark:bg-slate-900 space-y-4">
                    {/* Header */}
                    <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400">
                            <ShieldAlert size={18} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-800 dark:text-slate-100">
                                Akses Printer Diblokir Browser
                            </h3>
                            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                                Izin <strong>Aplikasi di perangkat</strong> atau <strong>Jaringan lokal</strong> dinonaktifkan di setelan situs browser.
                            </p>
                        </div>
                    </div>

                    {/* Panduan Compact */}
                    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/40 space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Langkah Mengaktifkan:
                        </p>
                        <ol className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300 list-decimal list-inside pl-0.5 leading-snug">
                            <li>
                                Klik ikon setelan situs{" "}
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                                    <SlidersHorizontal size={10} className="text-slate-500" /> kontrol
                                </span>{" "}
                                di samping kiri alamat URL browser
                            </li>
                            <li>
                                Buka <strong>Setelan situs</strong> <em>(Site settings)</em>
                            </li>
                            <li>
                                Ubah <strong>Aplikasi di perangkat</strong> <em>(Apps on device)</em> dan <strong>Jaringan lokal</strong> ke <strong>Izinkan</strong>
                            </li>
                            <li>Muat ulang halaman ini</li>
                        </ol>
                    </div>

                    {/* Aksi */}
                    <AppButton
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full text-xs font-bold"
                        leftIcon={<RefreshCw size={12} />}
                        onClick={() => window.location.reload()}
                    >
                        Muat Ulang Halaman
                    </AppButton>
                </div>
            </div>
        );
    }

    // Status "prompt": izin belum pernah diberikan / belum terhubung, perlu konfirmasi user
    return (
        <div className="flex min-h-[360px] w-full items-center justify-center p-4 sm:p-6">
            <div className="w-full max-w-md rounded-2xl border border-amber-200/90 bg-white p-5 shadow-sm dark:border-amber-800/60 dark:bg-slate-900 space-y-4">
                {/* Header */}
                <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700 border border-amber-100 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-400">
                        <Printer size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="text-xs font-bold uppercase tracking-wide text-slate-800 dark:text-slate-100">
                            Izin Akses Printer Diperlukan
                        </h3>
                        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                            Sistem membutuhkan izin browser untuk terhubung ke aplikasi printer lokal kasir.
                        </p>
                    </div>
                </div>

                {/* Info & Tips */}
                <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3 text-[11px] text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300 space-y-1.5 leading-snug">
                    <div className="flex items-start gap-2">
                        <Info size={13} className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                        <div>
                            <span>
                                Klik <strong>Izinkan Akses Printer</strong> di bawah, lalu pilih <strong>Izinkan</strong> (<em>Allow</em>) pada popup perizinan Chrome (<strong>Aplikasi di perangkat</strong> & <strong>Jaringan lokal</strong>).
                            </span>
                        </div>
                    </div>
                    {triggerAttempted && (
                        <p className="text-[10.5px] text-amber-800 dark:text-amber-300/90 border-t border-amber-200/60 dark:border-amber-900/40 pt-1.5 mt-1.5">
                            Jika popup tidak muncul otomatis, klik ikon setelan kontrol situs{" "}
                            <span className="inline-flex items-center gap-0.5 font-bold">
                                <SlidersHorizontal size={10} className="inline text-amber-700 dark:text-amber-300" />
                            </span>{" "}
                            di samping kiri alamat URL browser, lalu aktifkan izin <strong>Aplikasi di perangkat</strong> dan <strong>Jaringan lokal</strong> secara manual.
                        </p>
                    )}
                </div>

                {/* Tombol Aksi */}
                <div className="space-y-1.5">
                    <AppButton
                        type="button"
                        size="sm"
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs h-9 border-none cursor-pointer"
                        isLoading={isTriggeringPermission}
                        loadingText="Menunggu persetujuan..."
                        leftIcon={!isTriggeringPermission ? <ShieldCheck size={14} /> : undefined}
                        onClick={handleRequestPermission}
                    >
                        Izinkan Akses Printer
                    </AppButton>
                    <p className="text-center text-[10px] text-slate-400 dark:text-slate-500">
                        Pastikan aplikasi <strong>Print Service</strong> lokal telah berjalan
                    </p>
                </div>
            </div>
        </div>
    );
}
