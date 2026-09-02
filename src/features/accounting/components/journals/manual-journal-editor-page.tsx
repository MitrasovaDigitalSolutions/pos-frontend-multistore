"use client";

import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { hasRole, hasPermission } from "@/constants/roles";
import { useFlatChartOfAccounts } from "@/features/accounting/api/coa-api";
import { useManualJournalDetail } from "@/features/accounting/api/manual-journal-api";
import { BalanceSheetEditor } from "@/features/accounting/components/balance-sheet/balance-sheet-editor";
import { BalanceSheetDetail } from "@/features/accounting/components/balance-sheet/balance-sheet-detail";
import { BalanceSheetSkeleton } from "@/features/accounting/components/balance-sheet/balance-sheet-skeleton";
import { AccessDeniedState } from "@/components/ui/access-denied-state";
import { todayStr } from "@/lib/date-utils";

export function ManualJournalEditorPage() {
    const { data: session } = useSession();
    const searchParams = useSearchParams();

    const userRoles = session?.user?.roles || [];
    const userPermissions = session?.user?.permissions || [];

    const hasAccess =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "manage_manual_journals") ||
        hasPermission(userRoles, userPermissions, "view_manual_journals") ||
        hasPermission(userRoles, userPermissions, "view_reports");

    const actionParam = searchParams.get("action");
    const journalUid = searchParams.get("uid");

    // Default to "new" mode when accessing the direct manual journal menu without query params
    const action = actionParam || (journalUid ? "edit" : "new");

    const { data: flatAccounts, isLoading: isLoadingCoas } = useFlatChartOfAccounts();

    const isJournalNeeded = (action === "edit" || action === "detail") && !!journalUid;

    const {
        data: journal,
        isLoading: isJournalLoading,
        isFetching: isJournalFetching,
        refetch: refetchJournal,
    } = useManualJournalDetail(isJournalNeeded ? journalUid : null);

    const isPageLoading =
        isLoadingCoas ||
        (isJournalNeeded && (!journal || isJournalLoading || isJournalFetching));

    if (!hasAccess) {
        return (
            <AccessDeniedState
                description="Anda tidak memiliki izin untuk mengelola entri jurnal manual."
                requiredPermission="manage_manual_journals"
            />
        );
    }

    if (isPageLoading) {
        return <BalanceSheetSkeleton />;
    }

    if (action === "detail" && journal && flatAccounts) {
        return <BalanceSheetDetail journal={journal} flatAccounts={flatAccounts} />;
    }

    return (
        <BalanceSheetEditor
            asOfDate={todayStr()}
            flatAccounts={flatAccounts || []}
            journal={journal}
            action={action}
            journalUid={journalUid}
            refetch={() => {
                void refetchJournal();
            }}
        />
    );
}
