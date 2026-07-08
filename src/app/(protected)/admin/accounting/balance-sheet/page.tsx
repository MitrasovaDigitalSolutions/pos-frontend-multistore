import { BalanceSheetReport } from "@/features/reports/components/balance-sheet/balance-sheet-report";

export default function BalanceSheetPage() {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <BalanceSheetReport />
        </div>
    );
}
