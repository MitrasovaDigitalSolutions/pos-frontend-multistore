import { TransferCreatePage } from "@/features/stock-transfer/components/transfer-create-page";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TransferCreatePage editUid={id} />;
}
