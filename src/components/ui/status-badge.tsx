"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import React from "react";

export type StatusType =
  | "active"
  | "aktif"
  | "inactive"
  | "nonaktif"
  | "archived"
  | "diarsipkan"
  | "completed"
  | "selesai"
  | "finalized"
  | "final"
  | "received"
  | "diterima"
  | "partially_received"
  | "partial_received"
  | "diterima_sebagian"
  | "partially-received"
  | "partial-received"
  | "pending"
  | "menunggu"
  | "processing"
  | "proses"
  | "dalam_proses"
  | "diproses"
  | "ordered"
  | "dipesan"
  | "in_transit"
  | "dikirim"
  | "transit"
  | "canceled"
  | "cancelled"
  | "batal"
  | "dibatalkan"
  | "failed"
  | "gagal"
  | "void"
  | "draft"
  | "approved"
  | "disetujui"
  | "rejected"
  | "ditolak"
  | "paid"
  | "lunas"
  | "unpaid"
  | "belum_bayar"
  | "belum_dibayar"
  | "partial"
  | "sebagian"
  | "debt"
  | "hutang"
  | "jasa"
  | "service"
  | "admin"
  | "administrator"
  | "manajer_toko"
  | "manager"
  | "supervisor"
  | "spv"
  | "kasir"
  | "cashier"
  | "open"
  | "buka"
  | "closed"
  | "tutup"
  | "balanced"
  | "seimbang"
  | "unbalanced"
  | "tidak_seimbang"
  | "posted"
  | "terposting"
  | "cash"
  | "tunai"
  | "card"
  | "edc"
  | "split"
  | "dari_po"
  | "langsung"
  | string;

interface StatusBadgeProps {
  status?: StatusType | null;
  label?: string;
  className?: string;
  showDot?: boolean;
  pulse?: boolean;
  variant?:
    | "success"
    | "danger"
    | "warning"
    | "info"
    | "secondary"
    | "purple"
    | "cyan"
    | "outline"
    | "default";
  icon?: React.ReactNode;
}

export function StatusBadge({
  status,
  label,
  className,
  showDot = true,
  pulse,
  variant,
  icon,
}: StatusBadgeProps) {
  const normalized = (status || "").toLowerCase().trim();

  let resolvedVariant:
    | "success"
    | "danger"
    | "warning"
    | "info"
    | "secondary"
    | "purple"
    | "cyan"
    | "outline"
    | "default" = "secondary";
  let resolvedLabel = label || status || "—";
  let dotColor = "bg-slate-400";
  let shouldPulse = pulse ?? false;

  switch (normalized) {
    // 🟢 SUCCESS & ACTIVE STATES
    case "active":
    case "aktif":
      resolvedVariant = "success";
      if (!label) resolvedLabel = "Aktif";
      dotColor = "bg-emerald-500";
      if (pulse === undefined) shouldPulse = true;
      break;

    case "completed":
    case "selesai":
    case "received":
    case "diterima":
    case "finalized":
    case "final":
    case "paid":
    case "lunas":
    case "approved":
    case "disetujui":
    case "balanced":
    case "seimbang":
      resolvedVariant = "success";
      if (!label) {
        if (normalized === "paid" || normalized === "lunas") resolvedLabel = "Lunas";
        else if (normalized === "approved" || normalized === "disetujui") resolvedLabel = "Disetujui";
        else if (normalized === "received" || normalized === "diterima") resolvedLabel = "Diterima";
        else if (normalized === "balanced" || normalized === "seimbang") resolvedLabel = "Seimbang";
        else resolvedLabel = "Selesai";
      }
      dotColor = "bg-emerald-500";
      break;

    case "open":
    case "buka":
      resolvedVariant = "success";
      if (!label) resolvedLabel = "Buka";
      dotColor = "bg-emerald-500";
      if (pulse === undefined) shouldPulse = true;
      break;

    case "cash":
    case "tunai":
      resolvedVariant = "success";
      if (!label) resolvedLabel = "Tunai";
      dotColor = "bg-emerald-500";
      break;

    // 🔴 DANGER & INACTIVE & VOID & FAILED STATES
    case "inactive":
    case "nonaktif":
      resolvedVariant = "danger";
      if (!label) resolvedLabel = "Nonaktif";
      dotColor = "bg-rose-500";
      break;

    case "canceled":
    case "cancelled":
    case "batal":
    case "dibatalkan":
    case "void":
    case "rejected":
    case "ditolak":
    case "failed":
    case "gagal":
    case "unbalanced":
    case "tidak_seimbang":
      resolvedVariant = "danger";
      if (!label) {
        if (normalized === "rejected" || normalized === "ditolak") resolvedLabel = "Ditolak";
        else if (normalized === "failed" || normalized === "gagal") resolvedLabel = "Gagal";
        else if (normalized === "unbalanced" || normalized === "tidak_seimbang") resolvedLabel = "Tidak Seimbang";
        else resolvedLabel = "Dibatalkan";
      }
      dotColor = "bg-rose-500";
      break;

    case "unpaid":
    case "belum_bayar":
    case "belum_dibayar":
    case "debt":
    case "hutang":
      resolvedVariant = "danger";
      if (!label) resolvedLabel = normalized === "debt" || normalized === "hutang" ? "Hutang" : "Belum Dibayar";
      dotColor = "bg-rose-500";
      break;

    // 🟡 WARNING & PENDING & IN PROCESS & PARTIAL STATES
    case "pending":
    case "menunggu":
      resolvedVariant = "warning";
      if (!label) resolvedLabel = "Menunggu";
      dotColor = "bg-amber-500";
      if (pulse === undefined) shouldPulse = true;
      break;

    case "processing":
    case "proses":
    case "dalam_proses":
    case "diproses":
      resolvedVariant = "warning";
      if (!label) resolvedLabel = "Dalam Proses";
      dotColor = "bg-amber-500";
      if (pulse === undefined) shouldPulse = true;
      break;

    case "draft":
      resolvedVariant = "warning";
      if (!label) resolvedLabel = "Draft";
      dotColor = "bg-amber-500";
      break;

    case "partial":
    case "sebagian":
    case "partially_received":
    case "partial_received":
    case "partially-received":
    case "partial-received":
    case "diterima_sebagian":
      resolvedVariant = "warning";
      if (!label) {
        if (
          normalized.includes("received") ||
          normalized.includes("sebagian")
        ) {
          resolvedLabel = "Diterima Sebagian";
        } else {
          resolvedLabel = "Sebagian";
        }
      }
      dotColor = "bg-amber-500";
      break;

    // 🔵 INFO & IN-TRANSIT & ORDERED STATES
    case "ordered":
    case "dipesan":
      resolvedVariant = "info";
      if (!label) resolvedLabel = "Dipesan";
      dotColor = "bg-blue-500";
      break;

    case "in_transit":
    case "dikirim":
    case "transit":
      resolvedVariant = "info";
      if (!label) resolvedLabel = "Dalam Pengiriman";
      dotColor = "bg-blue-500";
      if (pulse === undefined) shouldPulse = true;
      break;

    case "posted":
    case "terposting":
      resolvedVariant = "info";
      if (!label) resolvedLabel = "Terposting";
      dotColor = "bg-blue-500";
      break;

    case "jasa":
    case "service":
      resolvedVariant = "info";
      if (!label) resolvedLabel = "Jasa";
      dotColor = "bg-blue-500";
      break;

    case "card":
    case "edc":
      resolvedVariant = "info";
      if (!label) resolvedLabel = "EDC / Card";
      dotColor = "bg-blue-500";
      break;

    // 🟣 PURPLE & SPECIAL STATES
    case "admin":
    case "administrator":
      resolvedVariant = "purple";
      if (!label) resolvedLabel = "Admin";
      dotColor = "bg-indigo-500";
      break;

    case "dari_po":
    case "dari po":
      resolvedVariant = "purple";
      if (!label) resolvedLabel = "Dari PO";
      dotColor = "bg-indigo-500";
      break;

    case "split":
      resolvedVariant = "purple";
      if (!label) resolvedLabel = "Split";
      dotColor = "bg-indigo-500";
      break;

    // 🌐 CYAN STATES
    case "manajer_toko":
    case "manager":
      resolvedVariant = "cyan";
      if (!label) resolvedLabel = "Manajer Toko";
      dotColor = "bg-cyan-500";
      break;

    case "supervisor":
    case "spv":
      resolvedVariant = "info";
      if (!label) resolvedLabel = "Supervisor";
      dotColor = "bg-sky-500";
      break;

    // ⚪ SECONDARY / NEUTRAL STATES
    case "kasir":
    case "cashier":
      resolvedVariant = "secondary";
      if (!label) resolvedLabel = "Kasir";
      dotColor = "bg-slate-500";
      break;

    case "closed":
    case "tutup":
      resolvedVariant = "secondary";
      if (!label) resolvedLabel = "Tutup";
      dotColor = "bg-slate-400";
      break;

    case "langsung":
      resolvedVariant = "secondary";
      if (!label) resolvedLabel = "Langsung";
      dotColor = "bg-slate-500";
      break;

    case "archived":
    case "diarsipkan":
      resolvedVariant = "secondary";
      if (!label) resolvedLabel = "Diarsipkan";
      dotColor = "bg-slate-400";
      break;

    default:
      if (variant) resolvedVariant = variant;
      break;
  }

  if (variant) {
    resolvedVariant = variant;
  }

  return (
    <Badge
      variant={resolvedVariant}
      className={cn("inline-flex items-center gap-1.5", className)}
    >
      {showDot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full shrink-0",
            dotColor,
            shouldPulse && "animate-pulse"
          )}
        />
      )}
      {icon}
      <span>{resolvedLabel}</span>
    </Badge>
  );
}
