import { AuditLogs } from "@/features/audit/audit";

export const metadata = {
  title: "Audit Logs",
};

export default function AdminAuditPage() {
  return <AuditLogs />;
}
