import type { LicenseStatus } from "../types";

export interface LicenseTimeMetrics {
    /** Apakah lisensi benar-benar sudah kedaluwarsa secara waktu dan status */
    isExpired: boolean;
    /** Apakah lisensi saat ini berada di hari terakhir aktif (< 24 jam tersisa) */
    isLastDay: boolean;
    /** Sisa hari yang dinormalisasi (minimal 1 jika masih aktif dan belum lewat jam kadaluwarsa) */
    effectiveDays: number;
    /** Sisa jam perkiraan */
    hoursRemaining: number;
    /** Persentase progress meter (1 - 100), selalu ada minimum visual width jika belum expired */
    progressPercent: number;
    /** Teks ringkas representasi sisa waktu (contoh: "1 Hari", "< 24 Jam", "Masa Aktif Berakhir") */
    timeRemainingLabel: string;
    /** Teks detail deskriptif */
    timeRemainingDescription: string;
    /** Level urgensi untuk styling warna */
    urgencyLevel: "healthy" | "warning" | "critical" | "expired";
}

/**
 * Menghitung metrik waktu lisensi secara presisi dengan membandingkan
 * `expires_at`, `days_remaining` dari backend, serta status operasional lisensi.
 */
export function getLicenseTimeMetrics(license?: LicenseStatus | null): LicenseTimeMetrics {
    if (!license) {
        return {
            isExpired: true,
            isLastDay: false,
            effectiveDays: 0,
            hoursRemaining: 0,
            progressPercent: 0,
            timeRemainingLabel: "Tidak Ada Lisensi",
            timeRemainingDescription: "Lisensi belum terdaftar",
            urgencyLevel: "expired",
        };
    }

    const { status, expires_at, days_remaining, can_operate, is_grace_period, subscription_type } = license;

    // Jika lisensi seumur hidup / tidak ada batas waktu
    if (!expires_at) {
        const isSuspended = status === "suspended";
        return {
            isExpired: isSuspended,
            isLastDay: false,
            effectiveDays: 999,
            hoursRemaining: 9999,
            progressPercent: 100,
            timeRemainingLabel: isSuspended ? "Ditangguhkan" : "Permanen",
            timeRemainingDescription: isSuspended ? "Lisensi ditangguhkan" : "Tanpa batas masa aktif",
            urgencyLevel: isSuspended ? "critical" : "healthy",
        };
    }

    const now = new Date();
    const expiry = new Date(expires_at);
    const diffMs = expiry.getTime() - now.getTime();

    // Waktu kadaluwarsa sudah terlewati secara detik
    const isPastTime = diffMs <= 0;

    // Lisensi dianggap benar-benar expired jika statusnya expired/suspended ATAU waktu sudah lewat dan tidak bisa operate
    const isActuallyExpired =
        status === "expired" ||
        status === "suspended" ||
        (isPastTime && !can_operate && !is_grace_period);

    if (isActuallyExpired) {
        return {
            isExpired: true,
            isLastDay: false,
            effectiveDays: 0,
            hoursRemaining: 0,
            progressPercent: 0,
            timeRemainingLabel: "Kedaluwarsa",
            timeRemainingDescription: "Masa berlaku langganan telah berakhir",
            urgencyLevel: "expired",
        };
    }

    // Jika masih dalam masa tenggang (grace period)
    if (is_grace_period || status === "grace_period") {
        return {
            isExpired: false,
            isLastDay: false,
            effectiveDays: license.grace_days_remaining ?? 0,
            hoursRemaining: (license.grace_days_remaining ?? 0) * 24,
            progressPercent: Math.max(5, Math.round(((license.grace_days_remaining ?? 1) / 14) * 100)),
            timeRemainingLabel: `Masa Tenggang (${license.grace_days_remaining} Hari)`,
            timeRemainingDescription: `Tersisa ${license.grace_days_remaining} hari masa tenggang`,
            urgencyLevel: "critical",
        };
    }

    // Hitung sisa hari dengan pembulatan ke atas (ceiling)
    // Jika diffMs = 10 jam (misal berakhir besok 00:00), 10 jam / 24 jam = 0.41 -> ceil = 1 hari
    const calendarDaysCeil = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const hoursRemaining = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));

    // Apakah hari terakhir (< 24 jam tersisa dan belum expired)
    const isLastDay = diffMs > 0 && diffMs <= 24 * 60 * 60 * 1000;

    // Normalisasi hari:
    // Backend sering mem-floor sisa jam sehingga mengirim days_remaining: 0 ketika < 24 jam.
    // Jika lisensi masih aktif dan belum lewat expiry, minimal tersisa 1 hari .
    let effectiveDays = days_remaining ?? calendarDaysCeil;
    if (effectiveDays <= 0 && diffMs > 0 && (status === "active" || can_operate)) {
        effectiveDays = 1;
    }

    // Total siklus durasi (tahunan: 365 hari, bulanan: 30 hari)
    const totalCycle = subscription_type === "annual" ? 365 : 30;

    // Hitung progress bar (berdasarkan fraksi hari sebenarnya)
    const exactDaysFraction = Math.max(0.1, diffMs / (1000 * 60 * 60 * 24));
    const rawProgress = (exactDaysFraction / totalCycle) * 100;
    // Berikan minimal 3% visual width agar bar tidak hilang/kosong selama lisensi masih aktif
    const progressPercent = Math.min(100, Math.max(3, Math.round(rawProgress)));

    // Level urgensi:
    // - critical: hari terakhir (< 24 jam atau sisa 1 hari)
    // - warning: H-3 sebelum berakhir (sisa <= 3 hari)
    // - healthy: masih lebih dari 3 hari tersisa (sehat & aktif)
    const urgencyLevel: "healthy" | "warning" | "critical" =
        isLastDay || effectiveDays <= 1
            ? "critical"
            : effectiveDays <= 3
                ? "warning"
                : "healthy";

    const timeRemainingLabel = isLastDay
        ? "1 Hari"
        : `${effectiveDays} Hari`;

    const timeRemainingDescription = isLastDay
        ? hoursRemaining > 0
            ? `Tersisa ~${hoursRemaining} jam`
            : "Berakhir hari ini"
        : `Tersisa ${effectiveDays} hari`;

    return {
        isExpired: false,
        isLastDay,
        effectiveDays,
        hoursRemaining,
        progressPercent,
        timeRemainingLabel,
        timeRemainingDescription,
        urgencyLevel,
    };
}
