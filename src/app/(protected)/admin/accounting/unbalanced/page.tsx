import { UnbalancedEntriesView } from "@/features/accounting/components/unbalanced/unbalanced-entries-view";

export default function AdminUnbalancedPage() {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <UnbalancedEntriesView />
        </div>
    );
}
