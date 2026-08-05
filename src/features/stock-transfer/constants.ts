export const TRANSFER_STATUS = {
  DRAFT: "draft",
  SENT: "sent",
  RETUR: "retur",
  FINISHED: "finished",
  CANCELLED: "cancelled",
} as const;

export const TRANSFER_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  sent: "Dikirim",
  retur: "Menunggu Return",
  finished: "Selesai",
  cancelled: "Dibatalkan",
};

export const TRANSFER_STATUS_CLASSES: Record<string, string> = {
  draft: "bg-slate-50 text-slate-700 border-slate-200",
  sent: "bg-blue-50 text-blue-700 border-blue-200",
  retur: "bg-amber-50 text-amber-700 border-amber-200",
  finished: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-rose-50 text-rose-700 border-rose-200",
};

export const TRANSFER_RECEIVE_STATUS = {
  PENDING: "pending",
  PARTIALLY_RECEIVED: "partially_received",
  RECEIVED: "received",
  REJECTED: "rejected",
} as const;

export const TRANSFER_RECEIVE_STATUS_LABELS: Record<string, string> = {
  pending: "Menunggu Diterima",
  partially_received: "Diterima Sebagian",
  received: "Diterima Penuh",
  rejected: "Ditolak",
};

export const TRANSFER_RECEIVE_STATUS_CLASSES: Record<string, string> = {
  pending: "bg-slate-50 text-slate-600 border-slate-200",
  partially_received: "bg-amber-50 text-amber-700 border-amber-200",
  received: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-rose-50 text-rose-700 border-rose-200",
};

export const JENIS_SELISIH_LABELS: Record<string, string> = {
  salah_input: "Salah Input",
  rusak: "Rusak",
  hilang: "Hilang",
};

export const JENIS_SELISIH_CLASSES: Record<string, string> = {
  salah_input: "bg-amber-50 text-amber-700 border-amber-200",
  rusak: "bg-rose-50 text-rose-700 border-rose-200",
  hilang: "bg-slate-50 text-slate-700 border-slate-200",
};