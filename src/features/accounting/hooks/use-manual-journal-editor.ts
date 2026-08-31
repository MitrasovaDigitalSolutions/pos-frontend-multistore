import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
    useCreateManualJournal,
    useUpdateManualJournal,
} from "@/features/accounting/api/manual-journal-api";
import {
    manualJournalSchema,
    type ManualJournalSchemaInput,
} from "@/features/accounting/schemas/manual-journal-schema";
import type { ChartOfAccount } from "@/features/accounting/types";
import type { ManualJournal } from "@/features/accounting/types/manual-journal";
import { formatUTC, todayStr } from "@/lib/date-utils";
import { useBalanceSheetStore } from "@/stores/balance-sheet-store";
import type { CommandOption } from "@/components/ui/command-select";

interface UseManualJournalEditorParams {
    asOfDate: string;
    flatAccounts?: ChartOfAccount[];
    journal?: ManualJournal;
    action: string | null;
    journalUid: string | null;
    refetch: () => void;
}

export function useManualJournalEditor({
    asOfDate,
    flatAccounts = [],
    journal,
    action,
    journalUid,
    refetch,
}: UseManualJournalEditorParams) {
    const router = useRouter();
    const { reset: resetStore } = useBalanceSheetStore();
    const createJournalMutation = useCreateManualJournal();
    const updateJournalMutation = useUpdateManualJournal();

    const isEditMode = action === "edit" && !!journalUid && !!journal;

    const defaultValues = useMemo<ManualJournalSchemaInput>(() => {
        if (isEditMode && journal) {
            const lines = (journal.lines || []).map((line) => ({
                chart_of_account_uid: line.chart_of_account_uid || line.account?.uid || "",
                description: line.description || "",
                debit: Number(line.debit) || 0,
                credit: Number(line.credit) || 0,
            }));

            return {
                description: journal.description || "Penyesuaian Neraca Keuangan",
                transaction_date: journal.transaction_date
                    ? journal.transaction_date.substring(0, 10)
                    : todayStr(),
                status: (journal.status === "posted" ? "posted" : "draft") as "draft" | "posted",
                lines:
                    lines.length >= 2
                        ? lines
                        : [
                              ...lines,
                              { chart_of_account_uid: "", description: "", debit: 0, credit: 0 },
                              { chart_of_account_uid: "", description: "", debit: 0, credit: 0 },
                          ].slice(0, 2),
            };
        }

        return {
            description: "Penyesuaian Neraca Keuangan",
            transaction_date: asOfDate || todayStr(),
            status: "draft" as const,
            lines: [
                { chart_of_account_uid: "", description: "", debit: 0, credit: 0 },
                { chart_of_account_uid: "", description: "", debit: 0, credit: 0 },
            ],
        };
    }, [isEditMode, journal, asOfDate]);

    const methods = useForm<ManualJournalSchemaInput>({
        resolver: zodResolver(manualJournalSchema),
        defaultValues,
        mode: "onChange",
    });

    const { control, setValue, getValues, trigger, formState: { errors } } = methods;

    const { fields, append, remove } = useFieldArray({
        control,
        name: "lines",
    });

    const accountOptions = useMemo<CommandOption[]>(() => {
        return (flatAccounts || [])
            .filter((coa) => coa.is_active)
            .sort((a, b) => (a.kode || "").localeCompare(b.kode || ""))
            .map((coa) => {
                const tipeLabel = coa.tipe ? coa.tipe.toUpperCase() : "";
                return {
                    value: coa.uid,
                    label: `[${coa.kode}] ${coa.nama}`,
                    description: tipeLabel ? `Kategori: ${tipeLabel}` : undefined,
                };
            });
    }, [flatAccounts]);

    const rawWatchedLines = useWatch({
        control,
        name: "lines",
    });

    const watchedLines = useMemo(() => rawWatchedLines || [], [rawWatchedLines]);

    const { totalDebit, totalCredit, difference, isBalanced } = useMemo(() => {
        let deb = 0;
        let cred = 0;

        watchedLines.forEach((line) => {
            deb += Number(line?.debit) || 0;
            cred += Number(line?.credit) || 0;
        });

        const diff = Math.abs(deb - cred);
        return {
            totalDebit: deb,
            totalCredit: cred,
            difference: diff,
            isBalanced: diff < 0.01 && deb > 0,
        };
    }, [watchedLines]);

    const hasValidLines = useMemo(() => {
        if (watchedLines.length < 2) return false;
        return watchedLines.some(
            (line) =>
                line?.chart_of_account_uid &&
                ((Number(line?.debit) || 0) > 0 || (Number(line?.credit) || 0) > 0)
        );
    }, [watchedLines]);

    const isPending = createJournalMutation.isPending || updateJournalMutation.isPending;

    const handleCancel = () => {
        resetStore();
        if (typeof window !== "undefined" && window.history.length > 1) {
            router.back();
        } else {
            router.push("/admin/accounting/journals");
        }
    };

    const handleAddLine = () => {
        append({
            chart_of_account_uid: "",
            description: "",
            debit: 0,
            credit: 0,
        });
    };

    const handleSave = async (targetStatus: "draft" | "posted") => {
        setValue("status", targetStatus);

        if (targetStatus === "posted") {
            const isValid = await trigger();
            if (!isValid) {
                toast.error("Mohon lengkapi dan seimbangkan semua baris akun jurnal sebelum memposting.");
                return;
            }
        }

        const formData = getValues();

        const filteredLines = (formData.lines || []).filter(
            (line) => line.chart_of_account_uid && ((line.debit || 0) > 0 || (line.credit || 0) > 0)
        );

        if (filteredLines.length < 2) {
            toast.error("Jurnal minimal harus memiliki 2 baris akun yang valid (terisi akun dan nominal).");
            return;
        }

        const payload = {
            transaction_date: formatUTC(formData.transaction_date),
            description: formData.description || "Penyesuaian Neraca Keuangan",
            status: targetStatus,
            lines: filteredLines.map((l) => ({
                chart_of_account_uid: l.chart_of_account_uid,
                description: l.description || formData.description || "Penyesuaian Neraca Keuangan",
                debit: Number(l.debit) || 0,
                credit: Number(l.credit) || 0,
            })),
        };

        try {
            if (isEditMode && journalUid) {
                await updateJournalMutation.mutateAsync({
                    uid: journalUid,
                    data: payload,
                });
                toast.success(
                    targetStatus === "posted"
                        ? "Jurnal penyesuaian berhasil diposting!"
                        : "Draf jurnal penyesuaian berhasil diperbarui!"
                );
            } else {
                await createJournalMutation.mutateAsync(payload);
                toast.success(
                    targetStatus === "posted"
                        ? "Jurnal penyesuaian berhasil diposting!"
                        : "Draf jurnal penyesuaian berhasil disimpan!"
                );
            }

            resetStore();
            refetch();
            router.push("/admin/accounting/journals");
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Gagal menyimpan jurnal.";
            toast.error(msg);
        }
    };

    const linesErrors = errors.lines;
    const generalLinesError = typeof linesErrors?.message === "string" ? linesErrors.message : undefined;

    return {
        methods,
        control,
        setValue,
        fields,
        accountOptions,
        totalDebit,
        totalCredit,
        difference,
        isBalanced,
        hasValidLines,
        isPending,
        isEditMode,
        generalLinesError,
        linesErrors,
        handleAddLine,
        handleCancel,
        handleSave,
        remove,
    };
}
