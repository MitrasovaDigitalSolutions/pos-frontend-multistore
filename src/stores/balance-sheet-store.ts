import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ChartOfAccount } from "@/features/accounting/types";
import type { ManualJournal, ManualJournalLine } from "@/features/accounting/types/manual-journal";
import { todayStr } from "@/lib/date-utils";

export interface ManualJournalLineDraft {
    id: string;
    chart_of_account_uid: string;
    description: string;
    debit: number;
    credit: number;
}

const createEmptyLine = (): ManualJournalLineDraft => ({
    id: `line-${Math.random().toString(36).substring(2, 9)}`,
    chart_of_account_uid: "",
    description: "",
    debit: 0,
    credit: 0,
});

interface BalanceSheetStoreState {
    isEditing: boolean;
    description: string;
    transactionDate: string;
    lines: ManualJournalLineDraft[];

    setEditing: (editing: boolean) => void;
    setDescription: (desc: string) => void;
    setTransactionDate: (date: string) => void;
    setLines: (lines: ManualJournalLineDraft[]) => void;
    addLine: (line?: Partial<ManualJournalLineDraft>) => void;
    updateLine: (id: string, updates: Partial<ManualJournalLineDraft>) => void;
    removeLine: (id: string) => void;
    initializeNew: () => void;
    initializeFromJournal: (journal: ManualJournal, _coaList?: ChartOfAccount[]) => void;
    reset: () => void;
}

export const useBalanceSheetStore = create<BalanceSheetStoreState>()(
    persist(
        (set) => ({
            isEditing: false,
            description: "",
            transactionDate: "",
            lines: [],

            setEditing: (editing) => set({ isEditing: editing }),
            setDescription: (desc) => set({ description: desc }),
            setTransactionDate: (date) => set({ transactionDate: date }),
            setLines: (lines) => set({ lines }),

            addLine: (line) =>
                set((state) => ({
                    lines: [
                        ...state.lines,
                        {
                            id: line?.id || `line-${Math.random().toString(36).substring(2, 9)}`,
                            chart_of_account_uid: line?.chart_of_account_uid || "",
                            description: line?.description || "",
                            debit: line?.debit || 0,
                            credit: line?.credit || 0,
                        },
                    ],
                })),

            updateLine: (id, updates) =>
                set((state) => ({
                    lines: state.lines.map((line) =>
                        line.id === id ? { ...line, ...updates } : line
                    ),
                })),

            removeLine: (id) =>
                set((state) => ({
                    lines: state.lines.filter((line) => line.id !== id),
                })),

            initializeNew: () =>
                set({
                    isEditing: true,
                    description: "Penyesuaian Neraca Keuangan",
                    transactionDate: todayStr(),
                    lines: [createEmptyLine(), createEmptyLine()],
                }),

            initializeFromJournal: (journal) => {
                const initialLines: ManualJournalLineDraft[] = (journal.lines || []).map(
                    (line: ManualJournalLine, idx) => ({
                        id: `line-${line.id || idx}-${Math.random().toString(36).substring(2, 7)}`,
                        chart_of_account_uid: line.chart_of_account_uid || line.account?.uid || "",
                        description: line.description || "",
                        debit: Number(line.debit) || 0,
                        credit: Number(line.credit) || 0,
                    })
                );

                set({
                    isEditing: true,
                    description: journal.description || "Penyesuaian Neraca Keuangan",
                    transactionDate: journal.transaction_date
                        ? journal.transaction_date.substring(0, 10)
                        : todayStr(),
                    lines: initialLines.length >= 2 ? initialLines : [createEmptyLine(), createEmptyLine()],
                });
            },

            reset: () =>
                set({
                    isEditing: false,
                    description: "",
                    transactionDate: "",
                    lines: [],
                }),
        }),
        {
            name: "manual-journal-edit-storage",
        }
    )
);

