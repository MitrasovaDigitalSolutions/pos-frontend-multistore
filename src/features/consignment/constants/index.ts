import type { ConsignmentStatus } from "../types";

export const CONSIGNMENT_STATUS = {
  DRAFT: "draft" as ConsignmentStatus,
  COMPLETED: "completed" as ConsignmentStatus,
  CLOSED: "closed" as ConsignmentStatus,
  VOID: "void" as ConsignmentStatus,
} as const;

export const CONSIGNMENT_STATUS_BADGE: Record<
  ConsignmentStatus,
  { label: string; variant: "secondary" | "success" | "info" | "danger" | "warning" }
> = {
  draft: { label: "Draft", variant: "secondary" },
  completed: { label: "Selesai (Aktif)", variant: "success" },
  closed: { label: "Ditutup & Lunas", variant: "info" },
  void: { label: "Dibatalkan", variant: "danger" },
};
