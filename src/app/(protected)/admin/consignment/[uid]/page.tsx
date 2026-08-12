import React from "react";
import { ConsignmentDetailPage } from "@/features/consignment/components/detail/consignment-detail-page";

export default function AdminConsignmentDetailRoutePage({
  params,
}: {
  params: Promise<{ uid: string }>;
}) {
  const resolvedParams = React.use(params);
  return <ConsignmentDetailPage uid={resolvedParams.uid} />;
}
