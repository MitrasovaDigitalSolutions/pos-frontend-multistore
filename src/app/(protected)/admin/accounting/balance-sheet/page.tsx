import { BalanceSheetReport } from "@/features/accounting/components/balance-sheet";

export default function BalanceSheetPage() {
    return (
        <div className="flex-1 pt-4 space-y-4">
            <BalanceSheetReport />
        </div>
    );
}
