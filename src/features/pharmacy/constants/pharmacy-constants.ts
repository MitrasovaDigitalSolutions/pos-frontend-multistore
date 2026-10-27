// ─── Pharmacy Constants & Configurations ──────────────────────────────────────

export const BATCH_STATUSES = {
    ACTIVE: "active",
    DEPLETED: "depleted",
    EXPIRED: "expired",
} as const;

export type BatchStatus = (typeof BATCH_STATUSES)[keyof typeof BATCH_STATUSES];

export const BATCH_STATUS_LABELS: Record<string, string> = {
    active: "Aktif",
    depleted: "Habis",
    expired: "Kadaluarsa",
};

/**
 * Expiration Thresholds in Days:
 * - DANGER (< 30 days): Red / Immediate risk
 * - WARNING (30 - 90 days): Yellow / Early warning
 * - SAFE (> 90 days): Green / Normal stock
 */
export const EXPIRATION_THRESHOLDS = {
    DANGER_DAYS: 30,
    WARNING_DAYS: 90,
} as const;

export const COMPOUNDED_TYPES = [
    { value: "puyer", label: "Puyer (Serbuk Terbagi)" },
    { value: "kapsul", label: "Kapsul" },
    { value: "salep", label: "Salep / Krim" },
    { value: "sirup", label: "Sirup / Suspensi" },
    { value: "tetes", label: "Obat Tetes" },
    { value: "larutan", label: "Larutan / Gargle" },
] as const;

export type CompoundedType = (typeof COMPOUNDED_TYPES)[number]["value"];

/** Alias for backward compatibility */
export const PHARMACY_DOSAGE_FORMS = COMPOUNDED_TYPES;

export const COMPOUNDED_TYPE_LABELS: Record<string, string> = {
    puyer: "Puyer",
    kapsul: "Kapsul",
    salep: "Salep/Krim",
    sirup: "Sirup",
    tetes: "Tetes",
    larutan: "Larutan",
};

/** Default standard tuslah (dispensing fee) and embalase (packaging fee) */
export const PHARMACY_DEFAULTS = {
    DEFAULT_TUSLAH_FEE: 5000,
    DEFAULT_EMBALASE_FEE: 2000,
    DEFAULT_DOSIS_PRESET: "3x1 Sehari Sesudah Makan",
} as const;

export const FREQUENT_SIGNA_PRESETS = [
    "3 x 1 Sehari Sesudah Makan",
    "3 x 1 Sehari Sebelum Makan",
    "2 x 1 Sehari Sesudah Makan",
    "2 x 1 Sehari Sebelum Makan",
    "1 x 1 Sehari Malam Hari",
    "1 x 1 Sehari Pagi Hari",
    "4 x 1 Sehari Tiap 6 Jam",
    "Bila Perlu / Jika Demam (PRN)",
    "Oleskan Tipis 2-3 x Sehari",
] as const;
