"use client";

import React from "react";
import { ConsignmentCreatePage } from "@/features/consignment/components/create/consignment-create-page";
import { useConsignmentReceivingDetail } from "@/features/consignment/api/consignment-api";

export default function AdminConsignmentEditRoutePage({
  params,
}: {
  params: Promise<{ uid: string }>;
}) {
  const resolvedParams = React.use(params);
  const { data: item, isLoading } = useConsignmentReceivingDetail(resolvedParams.uid);

  if (isLoading) {
    return <div className="p-12 text-center text-xs text-slate-500 font-semibold">Memuat data draft konsinyasi...</div>;
  }

  if (!item) {
    return <div className="p-12 text-center text-xs text-slate-500 font-semibold">Data draft tidak ditemukan.</div>;
  }

  return <ConsignmentCreatePage initialData={item} />;
}
