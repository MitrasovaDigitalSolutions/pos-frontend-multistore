import { CoaPage } from "@/features/accounting/components/coa/coa-page";

export default function ChartOfAccountsPage() {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 animate-in fade-in duration-300">
            <CoaPage />
        </div>
    );
}
