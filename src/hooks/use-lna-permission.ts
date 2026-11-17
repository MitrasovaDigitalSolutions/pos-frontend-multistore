"use client";

import { useEffect, useCallback, useState } from "react";

/**
 * Status izin akses printer lokal (LNA / Local Network Access & Apps on device).
 * - "checking": sedang memeriksa koneksi ke printer service lokal
 * - "granted": akses berhasil diverifikasi dan printer service terhubung
 * - "prompt": memerlukan konfirmasi / klik izin dari pengguna untuk memicu popup Chrome
 * - "denied": akses diblokir di setelan browser
 */
export type LnaStatus = "checking" | "granted" | "prompt" | "denied";

const LNA_PERMISSION_NAMES = ["local-network-access", "loopback-network"] as const;

/**
 * Coba periksa status permission melalui Permissions API jika didukung browser.
 */
async function queryLnaPermission(): Promise<PermissionStatus | null> {
    if (typeof navigator === "undefined" || !navigator.permissions?.query) return null;

    for (const name of LNA_PERMISSION_NAMES) {
        try {
            const status = await navigator.permissions.query({ name: name as PermissionName });
            return status;
        } catch {
            // Permission name belum diimplementasikan di browser ini
        }
    }
    return null;
}

/**
 * Melakukan probe cepat untuk mengecek apakah print service di localhost / 127.0.0.1
 * sudah dapat dihubungi secara langsung tanpa diblokir oleh browser.
 */
export async function probePrinterHealth(): Promise<boolean> {
    const probe = async (url: string) => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);
            const res = await fetch(url, {
                signal: controller.signal,
                cache: "no-store",
            });
            clearTimeout(timeoutId);
            return res.ok;
        } catch {
            return false;
        }
    };

    const [r1, r2] = await Promise.allSettled([
        probe("http://localhost:62000/health"),
        probe("http://127.0.0.1:62000/health"),
    ]);

    const ok1 = r1.status === "fulfilled" && r1.value;
    const ok2 = r2.status === "fulfilled" && r2.value;

    return ok1 || ok2;
}

/**
 * Memicu dialog perizinan browser Chrome di bawah interaksi langsung pengguna (user gesture):
 * 1. Request ke http://localhost:62000/health -> memicu prompt izin "Aplikasi di perangkat" (Apps on device)
 * 2. Request ke http://127.0.0.1:62000/health -> memicu prompt izin "Jaringan lokal" (Local network access)
 *
 * Keduanya dipanggil bersamaan dari event klik agar kedua dialog perizinan Chrome muncul ke user.
 */
export async function triggerLnaPermissionRequest(): Promise<boolean> {
    const triggerUrl = async (url: string) => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 12000);
            const res = await fetch(url, {
                signal: controller.signal,
                cache: "no-store",
                mode: "cors",
            });
            clearTimeout(timeoutId);
            return res.ok;
        } catch {
            return false;
        }
    };

    const [resLocalhost, resLoopback] = await Promise.allSettled([
        triggerUrl("http://localhost:62000/health"),
        triggerUrl("http://127.0.0.1:62000/health"),
    ]);

    const localhostOk = resLocalhost.status === "fulfilled" && resLocalhost.value;
    const loopbackOk = resLoopback.status === "fulfilled" && resLoopback.value;

    return localhostOk || loopbackOk;
}

function isFlutterWebView(): boolean {
    return (
        typeof window !== "undefined" &&
        typeof window.FlutterBridge?.postMessage === "function"
    );
}

/**
 * Hook untuk memantau status izin LNA & konektivitas printer lokal.
 * Selalu menampilkan status "prompt" jika akses belum diverifikasi,
 * sehingga tombol izin selalu muncul jika user mereset permission / data browser.
 */
export function useLnaPermission() {
    const [status, setStatus] = useState<LnaStatus>(() => (isFlutterWebView() ? "granted" : "checking"));

    const verifyAccess = useCallback(async () => {
        if (isFlutterWebView()) {
            setStatus("granted");
            return;
        }

        // Cek status resmi dari Permissions API jika tersedia
        const permStatus = await queryLnaPermission();
        if (permStatus?.state === "denied") {
            setStatus("denied");
            return;
        }

        // Probe langsung ke port printer service
        const isHealthy = await probePrinterHealth();
        if (isHealthy || permStatus?.state === "granted") {
            setStatus("granted");
            return;
        }

        // Jika belum terhubung atau izin belum aktif, set status ke prompt
        // agar tombol pemicu izin selalu tampil untuk pengguna
        setStatus("prompt");
    }, []);

    useEffect(() => {
        if (isFlutterWebView()) return;

        let isCancelled = false;

        void (async () => {
            const permStatus = await queryLnaPermission();
            if (isCancelled) return;

            if (permStatus?.state === "denied") {
                setStatus("denied");
                return;
            }

            const isHealthy = await probePrinterHealth();
            if (isCancelled) return;

            if (isHealthy || permStatus?.state === "granted") {
                setStatus("granted");
            } else {
                setStatus("prompt");
            }

            if (permStatus) {
                permStatus.onchange = () => {
                    if (isCancelled) return;
                    if (permStatus.state === "granted") {
                        setStatus("granted");
                    } else if (permStatus.state === "denied") {
                        setStatus("denied");
                    } else {
                        setStatus("prompt");
                    }
                };
            }
        })();

        return () => {
            isCancelled = true;
        };
    }, []);

    const isGranted = status === "granted";
    const isBlocked = status === "denied";
    const needsPrompt = status === "prompt";
    const isChecking = status === "checking";

    return {
        status,
        isGranted,
        isBlocked,
        needsPrompt,
        isChecking,
        recheckPermission: verifyAccess,
    };
}
