import { TransferDetailPage } from "@/features/stock-transfer/stock-transfer";
import React from "react";

export default function AdminStockTransferDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  return <TransferDetailPage uid={resolvedParams.id} />;
}