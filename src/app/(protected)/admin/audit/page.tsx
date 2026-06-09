import { AuditLogs } from "@/features/audit/audit";

export const metadata = {
  title: "Audit Logs - MSG POS",
};

export default function AdminAuditPage() {
  return <AuditLogs />;
}
