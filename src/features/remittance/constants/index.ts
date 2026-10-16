export const REMITTANCE_STATUS = {
  PENDING: "pending",
  VERIFIED: "verified",
  REJECTED: "rejected",
} as const;

export type RemittanceStatus = (typeof REMITTANCE_STATUS)[keyof typeof REMITTANCE_STATUS];

export const REMITTANCE_STATUS_LABELS: Record<RemittanceStatus, string> = {
  pending: "Menunggu Verifikasi",
  verified: "Diverifikasi",
  rejected: "Ditolak",
};

export const REMITTANCE_STATUS_CLASSES: Record<RemittanceStatus, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200/80",
  verified: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
  rejected: "bg-rose-50 text-rose-700 border-rose-200/80",
};

export const REMITTANCE_QUERY_KEYS = {
  all: ["remittances"] as const,
  lists: () => [...REMITTANCE_QUERY_KEYS.all, "list"] as const,
  list: (filters: Record<string, unknown>) => [...REMITTANCE_QUERY_KEYS.lists(), filters] as const,
  unsettled: () => [...REMITTANCE_QUERY_KEYS.all, "unsettled"] as const,
  unsettledItems: (filters: Record<string, unknown>) => [...REMITTANCE_QUERY_KEYS.all, "unsettled-items", filters] as const,
  detail: (uid: string) => [...REMITTANCE_QUERY_KEYS.all, "detail", uid] as const,
  consignmentStock: (filters: Record<string, unknown>) => [...REMITTANCE_QUERY_KEYS.all, "consignment-stock", filters] as const,
};
