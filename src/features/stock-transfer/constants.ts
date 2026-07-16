export const TRANSFER_STATUS = {
  DRAFT: "draft",
  IN_TRANSIT: "in_transit",
  RECEIVED: "received",
  CANCELLED: "cancelled",
} as const;

export const TRANSFER_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  in_transit: "Dalam Pengiriman",
  received: "Diterima",
  cancelled: "Dibatalkan",
};

export const TRANSFER_STATUS_CLASSES: Record<string, string> = {
  draft: "bg-slate-50 text-slate-700 border-slate-200",
  in_transit: "bg-blue-50 text-blue-700 border-blue-200",
  received: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-rose-50 text-rose-700 border-rose-200",
};