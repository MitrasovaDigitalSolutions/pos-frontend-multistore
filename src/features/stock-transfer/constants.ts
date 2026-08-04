export const TRANSFER_STATUS = {
  DRAFT: "draft",
  IN_TRANSIT: "in_transit",
  PARTIALLY_RECEIVED: "partially_received",
  RECEIVED: "received",
  CANCELLED: "cancelled",
} as const;

export const TRANSFER_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  in_transit: "Dalam Pengiriman",
  partially_received: "Diterima Sebagian",
  received: "Diterima",
  cancelled: "Dibatalkan",
};

export const TRANSFER_STATUS_CLASSES: Record<string, string> = {
  draft: "bg-slate-50 text-slate-700 border-slate-200",
  in_transit: "bg-blue-50 text-blue-700 border-blue-200",
  partially_received: "bg-amber-50 text-amber-700 border-amber-200",
  received: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-rose-50 text-rose-700 border-rose-200",
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