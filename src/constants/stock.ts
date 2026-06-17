// Constants for Stock Opname Statuses
// Centralized mapping to make UI labels and styling easily maintainable.

export const OPNAME_STATUS = {
    DRAFT: "draft",
    PROCESSING: "processing",
    COMPLETED: "completed",
    FAILED: "failed",
} as const;

export type OpnameStatus = typeof OPNAME_STATUS[keyof typeof OPNAME_STATUS];

export const OPNAME_STATUS_LABELS: Record<OpnameStatus, string> = {
    [OPNAME_STATUS.DRAFT]: "Draft",
    [OPNAME_STATUS.PROCESSING]: "Diproses",
    [OPNAME_STATUS.COMPLETED]: "Selesai",
    [OPNAME_STATUS.FAILED]: "Gagal",
};

export const OPNAME_STATUS_CLASSES: Record<OpnameStatus, string> = {
    [OPNAME_STATUS.DRAFT]: "bg-amber-50 text-amber-700 border-amber-100",
    [OPNAME_STATUS.PROCESSING]: "bg-blue-50 text-blue-700 border-blue-100",
    [OPNAME_STATUS.COMPLETED]: "bg-emerald-50 text-emerald-700 border-emerald-100",
    [OPNAME_STATUS.FAILED]: "bg-rose-50 text-rose-700 border-rose-100",
};
