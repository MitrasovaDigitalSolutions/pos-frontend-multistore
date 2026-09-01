import { Suspense } from "react";
import { CoaManagementView } from "@/features/accounting/components/coa/coa-management-view";

export default function CoaMappingPage() {
    return (
        <Suspense fallback={<div className="p-6 animate-pulse bg-white dark:bg-slate-900 rounded-2xl h-96" />}>
            <CoaManagementView defaultTab="transaction-mapping" />
        </Suspense>
    );
}
