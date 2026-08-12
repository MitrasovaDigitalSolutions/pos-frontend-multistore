// ─── Transfer Status (Status Utama) ──────────────────────────────────────────
export const TRANSFER_STATUS = {
  DRAFT: "draft",
  SENT: "sent",
  MENUNGGU_VALIDASI: "menunggu_validasi",
  FINISH: "finish",
  FINISHED: "finished",
  REJECTED: "rejected",
  CANCELLED: "cancelled",
} as const;

export const TRANSFER_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  sent: "Dikirim",
  menunggu_validasi: "Menunggu Validasi",
  finish: "Selesai",
  finished: "Selesai",
  rejected: "Ditolak",
  cancelled: "Dibatalkan",
};

export const TRANSFER_STATUS_CLASSES: Record<string, string> = {
  draft: "bg-slate-50 text-slate-700 border-slate-200",
  sent: "bg-blue-50 text-blue-700 border-blue-200",
  menunggu_validasi: "bg-amber-50 text-amber-700 border-amber-200",
  finish: "bg-emerald-50 text-emerald-700 border-emerald-200",
  finished: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-rose-50 text-rose-700 border-rose-200",
  cancelled: "bg-rose-50 text-rose-700 border-rose-200",
};

// ─── Jenis Validasi ─────────────────────────────────────────────────────────
export const JENIS_VALIDASI = {
  RETUR: "retur",
  KOREKSI: "koreksi",
} as const;
export const JENIS_VALIDASI_LABELS: Record<string, string> = {
  retur: "Retur",
  koreksi: "Koreksi",
};

// ─── Status Penerimaan / Penerimaan ──────────────────────────────────────────
export const TRANSFER_SHIPMENT_STATUS = {
  PENDING: "pending",
  PARTIALLY_RECEIVED: "partially_received",
  RECEIVED: "received",
  REJECTED: "rejected",
} as const;

// Alias export for backward compatibility
export const TRANSFER_RECEIVE_STATUS = TRANSFER_SHIPMENT_STATUS;

export const TRANSFER_SHIPMENT_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  partially_received: "Diterima Sebagian",
  received: "Diterima Penuh",
  rejected: "Ditolak",
};

// Alias export
export const TRANSFER_RECEIVE_STATUS_LABELS = TRANSFER_SHIPMENT_STATUS_LABELS;

export const TRANSFER_SHIPMENT_STATUS_CLASSES: Record<string, string> = {
  pending: "bg-slate-100 text-slate-600 border-slate-200",
  partially_received: "bg-amber-50 text-amber-700 border-amber-200",
  received: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-rose-50 text-rose-700 border-rose-200",
};

// Alias export
export const TRANSFER_RECEIVE_STATUS_CLASSES = TRANSFER_SHIPMENT_STATUS_CLASSES;

// ─── Alasan Selisih ──────────────────────────────────────────────────────────
export const JENIS_SELISIH = {
  SALAH_INPUT: "salah_input",
  RUSAK: "rusak",
  HILANG: "hilang",
} as const;

export const JENIS_SELISIH_LABELS: Record<string, string> = {
  [JENIS_SELISIH.SALAH_INPUT]: "Salah Input",
  [JENIS_SELISIH.RUSAK]: "Rusak",
  [JENIS_SELISIH.HILANG]: "Hilang",
};

export const JENIS_SELISIH_CLASSES: Record<string, string> = {
  [JENIS_SELISIH.SALAH_INPUT]: "bg-amber-50 text-amber-700 border-amber-200",
  [JENIS_SELISIH.RUSAK]: "bg-rose-50 text-rose-700 border-rose-200",
  [JENIS_SELISIH.HILANG]: "bg-slate-50 text-slate-700 border-slate-200",
};