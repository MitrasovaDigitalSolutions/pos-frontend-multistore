"use client";

import { FormProvider } from "react-hook-form";
import { Card } from "@/components/ui/card";
import type { BalanceSheetData, ChartOfAccount } from "@/features/accounting/types";
import type { ManualJournal } from "@/features/accounting/types/manual-journal";
import { useManualJournalEditor } from "@/features/accounting/hooks/use-manual-journal-editor";
import { JournalEditorHeader } from "./journal-editor-header";
import { JournalEditorMetadata } from "./journal-editor-metadata";
import { JournalEditorDesktopTable } from "./journal-editor-desktop-table";
import { JournalEditorMobileList } from "./journal-editor-mobile-list";
import { JournalCounterpartPromptDialog } from "./journal-counterpart-prompt-dialog";

interface BalanceSheetEditorProps {
    asOfDate: string;
    data?: BalanceSheetData;
    flatAccounts: ChartOfAccount[] | undefined;
    journal: ManualJournal | undefined;
    action: string | null;
    journalUid: string | null;
    refetch: () => void;
}

export function BalanceSheetEditor({
    asOfDate,
    flatAccounts = [],
    journal,
    action,
    journalUid,
    refetch,
}: BalanceSheetEditorProps) {
    const {
        methods,
        control,
        setValue,
        fields,
        totalDebit,
        totalCredit,
        difference,
        isBalanced,
        hasValidLines,
        isPending,
        isEditMode,
        generalLinesError,
        linesErrors,
        counterpartPrompt,
        setCounterpartPrompt,
        handleAccountSelect,
        handleSelectOneCounterpart,
        handleApplyAllCounterparts,
        handleAddLine,
        handleCancel,
        handleSave,
        remove,
    } = useManualJournalEditor({
        asOfDate,
        flatAccounts,
        journal,
        action,
        journalUid,
        refetch,
    });

    return (
        <FormProvider {...methods}>
            <div className="space-y-4 max-w-7xl mx-auto pb-16">
                <Card className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
                    {/* Header Action Bar */}
                    <JournalEditorHeader
                        isEditMode={isEditMode}
                        referenceNumber={journal?.reference_number}
                        isPending={isPending}
                        hasValidLines={hasValidLines}
                        isBalanced={isBalanced}
                        onCancel={handleCancel}
                        onSaveDraft={() => handleSave("draft")}
                        onPost={() => handleSave("posted")}
                    />

                    {/* Compact Metadata Inputs */}
                    <JournalEditorMetadata />

                    {/* General Errors Banner */}
                    {generalLinesError && (
                        <div className="mx-4 my-2 p-2.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-xl text-rose-700 dark:text-rose-400 text-xs font-semibold">
                            {generalLinesError}
                        </div>
                    )}

                    {/* Desktop Spreadsheet Table (>=768px) */}
                    <JournalEditorDesktopTable
                        fields={fields}
                        control={control}
                        setValue={setValue}
                        flatAccounts={flatAccounts}
                        errors={linesErrors}
                        totalDebit={totalDebit}
                        totalCredit={totalCredit}
                        difference={difference}
                        isBalanced={isBalanced}
                        onAddLine={handleAddLine}
                        onAccountSelect={handleAccountSelect}
                        onRemoveLine={remove}
                    />

                    {/* Mobile Stacked List (<768px) */}
                    <JournalEditorMobileList
                        fields={fields}
                        control={control}
                        setValue={setValue}
                        flatAccounts={flatAccounts}
                        errors={linesErrors}
                        totalDebit={totalDebit}
                        totalCredit={totalCredit}
                        difference={difference}
                        isBalanced={isBalanced}
                        onAddLine={handleAddLine}
                        onAccountSelect={handleAccountSelect}
                        onRemoveLine={remove}
                    />
                </Card>
            </div>

            {/* Multiple Counterpart Prompt Dialog */}
            <JournalCounterpartPromptDialog
                open={counterpartPrompt.isOpen}
                onOpenChange={(open) =>
                    setCounterpartPrompt((prev) => ({ ...prev, isOpen: open }))
                }
                sourceAccount={counterpartPrompt.sourceAccount}
                counterparts={counterpartPrompt.counterparts}
                onSelectOne={handleSelectOneCounterpart}
                onApplyAll={handleApplyAllCounterparts}
            />
        </FormProvider>
    );
}
