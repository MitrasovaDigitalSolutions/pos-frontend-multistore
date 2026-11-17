"use client";

import { useEffect, useCallback, useState } from "react";

/**
 * Status izin Local Network Access (LNA) / "Aplikasi di perangkat" (Apps on device)
 * yang dibutuhkan untuk akses localhost printer service.
 */
export type LnaStatus = "checking" | "granted" | "prompt" | "denied" | "unsupported";

/**
 * Daftar nama permission yang dicoba secara berurutan sesuai implementasi browser.
 *
 * - "local-network-access"  → Chrome 136+ (nama resmi dari W3C spec)
 * - "loopback-network"       → Nama alternatif Chrome (loopback specifically)
 *
 * Browser lain (Firefox, Safari) TIDAK mengimplementasikan LNA permission API
 * → fallback ke "unsupported" → biarkan fetch yang menentukan
 */
const LNA_PERMISSION_NAMES = ["local-network-access", "loopback-network"] as const;

/**
 * Coba query permission LNA dengan fallback ke nama berikutnya jika gagal.
 * Mengembalikan PermissionStatus jika berhasil, null jika semua nama gagal.
 */
async function queryLnaPermission(): Promise<PermissionStatus | null> {
    if (typeof navigator === "undefined" || !navigator.permissions?.query) return null;

    for (const name of LNA_PERMISSION_NAMES) {
        try {
            const status = await navigator.permissions.query({ name: name as PermissionName });
            return status;
        } catch {
            // Nama ini tidak dikenal browser — coba nama berikutnya
        }
    }
    return null;
}

/**
 * Memicu request aktual ke localhost agar browser menampilkan popup izin LNA.
 * Request ini HARUS dipanggil dari event handler user (klik tombol), bukan useEffect,
 * agar browser menganggapnya sebagai "user gesture" dan menampilkan popup.
 *
 * Mengembalikan true jika koneksi berhasil (printer service jalan), false jika gagal.
 */
export async function triggerLnaPermissionRequest(printerServiceUrl = "http://localhost:62000"): Promise<boolean> {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        const res = await fetch(`${printerServiceUrl}/health`, {
            signal: controller.signal,
            cache: "no-store",
        });
        clearTimeout(timeoutId);
        return res.ok;
    } catch {
        // Gagal (service tidak jalan atau permission di-deny) — masih OK untuk tujuan trigger
        return false;
    }
}

function getInitialStatus(): LnaStatus {
    if (typeof window !== "undefined" && typeof window.FlutterBridge?.postMessage === "function") {
        return "granted";
    }
    if (typeof navigator === "undefined" || !navigator.permissions?.query) {
        return "unsupported";
    }
    return "checking";
}

/**
 * Hook untuk memantau status izin LNA "Aplikasi di perangkat" (Apps on device)
 * lintas browser. Auto-detect dan subscribe ke perubahan status real-time.
 */
export function useLnaPermission() {
    const [status, setStatus] = useState<LnaStatus>(getInitialStatus);

    const checkPermission = useCallback(async () => {
        // Flutter WebView tidak terkena batasan LNA
        if (
            typeof window !== "undefined" &&
            typeof window.FlutterBridge?.postMessage === "function"
        ) {
            setStatus("granted");
            return;
        }

        const permStatus = await queryLnaPermission();

        if (!permStatus) {
            // Browser tidak mendukung LNA permission API (Firefox, Safari, dll.)
            // Anggap "unsupported" — biarkan fetch ke localhost yang menentukan
            setStatus("unsupported");
            return;
        }

        setStatus(permStatus.state as LnaStatus);

        // Subscribe real-time: status berubah setelah user klik Allow/Block di popup
        permStatus.onchange = () => {
            setStatus(permStatus.state as LnaStatus);
        };
    }, []);

    useEffect(() => {
        let isCancelled = false;

        if (typeof window !== "undefined" && typeof window.FlutterBridge?.postMessage === "function") {
            return;
        }

        queryLnaPermission()
            .then((permStatus) => {
                if (isCancelled) return;
                if (!permStatus) {
                    setStatus("unsupported");
                    return;
                }

                setStatus(permStatus.state as LnaStatus);

                permStatus.onchange = () => {
                    if (!isCancelled) {
                        setStatus(permStatus.state as LnaStatus);
                    }
                };
            })
            .catch(() => {
                if (!isCancelled) {
                    setStatus("unsupported");
                }
            });

        return () => {
            isCancelled = true;
        };
    }, []);

    const isGranted = status === "granted" || status === "unsupported";
    const isBlocked = status === "denied";
    const needsPrompt = status === "prompt";
    const isChecking = status === "checking";

    return { status, isGranted, isBlocked, needsPrompt, isChecking, recheckPermission: checkPermission };
}
