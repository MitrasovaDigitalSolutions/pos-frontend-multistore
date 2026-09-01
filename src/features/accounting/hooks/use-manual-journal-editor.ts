import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
    useCreateManualJournal,
    useUpdateManualJournal,
} from "@/features/accounting/api/manual-journal-api";
import { useCoaCounterpartMappings } from "@/features/accounting/api/counterpart-mapping-api";
import {
    manualJournalSchema,
    type ManualJournalSchemaInput,
} from "@/features/accounting/schemas/manual-journal-schema";
import type { ChartOfAccount } from "@/features/accounting/types";
import type { ManualJournal } from "@/features/accounting/types/manual-journal";
import { formatUTC, todayStr } from "@/lib/date-utils";
import { useBalanceSheetStore } from "@/stores/balance-sheet-store";

interface UseManualJournalEditorParams {
    asOfDate: string;
    flatAccounts?: ChartOfAccount[];
    journal?: ManualJournal;
    action: string | null;
    journalUid: string | null;
    refetch: () => void;
}

interface CounterpartPromptState {
    isOpen: boolean;
    sourceIndex: number;
    sourceAccount: ChartOfAccount | null;
    counterparts: ChartOfAccount[];
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
    const { data: counterpartMappings } = useCoaCounterpartMappings();

    const isEditMode = action === "edit" && !!journalUid && !!journal;

    // Counterpart Prompt State for accounts with >= 2 counterparts
    const [counterpartPrompt, setCounterpartPrompt] = useState<CounterpartPromptState>({
        isOpen: false,
        sourceIndex: -1,
        sourceAccount: null,
        counterparts: [],
    });

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

    // Lookup Map for Counterparts
    const counterpartMap = useMemo(() => {
        const map = new Map<string, ChartOfAccount[]>();
        if (!counterpartMappings || !flatAccounts || flatAccounts.length === 0) return map;

        const accountByUid = new Map<string, ChartOfAccount>(
            flatAccounts.map((a) => [a.uid, a])
        );

        counterpartMappings.forEach((m) => {
            const primaryAccount = accountByUid.get(m.coa_uid);
            const counterpartAccount = accountByUid.get(m.counterpart_coa_uid);

            if (m.coa_uid && counterpartAccount) {
                const existing = map.get(m.coa_uid) || [];
                if (!existing.some((a) => a.uid === counterpartAccount.uid)) {
                    map.set(m.coa_uid, [...existing, counterpartAccount]);
                }
            }

            if (m.counterpart_coa_uid && primaryAccount) {
                const existingRev = map.get(m.counterpart_coa_uid) || [];
                if (!existingRev.some((a) => a.uid === primaryAccount.uid)) {
                    map.set(m.counterpart_coa_uid, [...existingRev, primaryAccount]);
                }
            }
        });

        return map;
    }, [counterpartMappings, flatAccounts]);

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

    /**
     * Account selection handler with automatic counterpart detection
     */
    const handleAccountSelect = (index: number, coaUid: string) => {
        setValue(`lines.${index}.chart_of_account_uid`, coaUid, {
            shouldDirty: true,
            shouldValidate: true,
        });

        if (!coaUid) return;

        const counterparts = counterpartMap.get(coaUid) || [];
        if (counterparts.length === 0) return;

        const currentLines = getValues("lines") || [];
        const targetIndex = index + 1;

        if (counterparts.length === 1) {
            const cp = counterparts[0];
            const srcDebit = Number(currentLines[index]?.debit) || 0;
            const srcCredit = Number(currentLines[index]?.credit) || 0;

            if (targetIndex < currentLines.length) {
                // If next line is empty, auto-fill it
                if (!currentLines[targetIndex]?.chart_of_account_uid) {
                    setValue(`lines.${targetIndex}.chart_of_account_uid`, cp.uid, {
                        shouldDirty: true,
                        shouldValidate: true,
                    });

                    // Auto-balance nominals if source has nominal and target has none
                    const tgtDebit = Number(currentLines[targetIndex]?.debit) || 0;
                    const tgtCredit = Number(currentLines[targetIndex]?.credit) || 0;
                    if (tgtDebit === 0 && tgtCredit === 0) {
                        if (srcDebit > 0) {
                            setValue(`lines.${targetIndex}.credit`, srcDebit, {
                                shouldDirty: true,
                                shouldValidate: true,
                            });
                        } else if (srcCredit > 0) {
                            setValue(`lines.${targetIndex}.debit`, srcCredit, {
                                shouldDirty: true,
                                shouldValidate: true,
                            });
                        }
                    }

                    toast.info(`Akun lawan otomatis terisi: [${cp.kode}] ${cp.nama}`);
                }
            } else {
                // Append new line with the counterpart
                append({
                    chart_of_account_uid: cp.uid,
                    description: currentLines[index]?.description || "",
                    debit: srcCredit > 0 ? srcCredit : 0,
                    credit: srcDebit > 0 ? srcDebit : 0,
                });
                toast.info(`Akun lawan otomatis ditambahkan: [${cp.kode}] ${cp.nama}`);
            }
        } else {
            // >= 2 counterparts: open prompt dialog
            const sourceAcc = flatAccounts.find((a) => a.uid === coaUid) || null;
            setCounterpartPrompt({
                isOpen: true,
                sourceIndex: index,
                sourceAccount: sourceAcc,
                counterparts,
            });
        }
    };

    /**
     * Apply a single counterpart from the prompt dialog
     */
    const handleSelectOneCounterpart = (counterpartUid: string) => {
        const { sourceIndex, counterparts } = counterpartPrompt;
        const cp = counterparts.find((c) => c.uid === counterpartUid);
        if (!cp || sourceIndex < 0) return;

        const currentLines = getValues("lines") || [];
        const targetIndex = sourceIndex + 1;
        const srcDebit = Number(currentLines[sourceIndex]?.debit) || 0;
        const srcCredit = Number(currentLines[sourceIndex]?.credit) || 0;

        if (targetIndex < currentLines.length && !currentLines[targetIndex]?.chart_of_account_uid) {
            setValue(`lines.${targetIndex}.chart_of_account_uid`, cp.uid, {
                shouldDirty: true,
                shouldValidate: true,
            });

            const tgtDebit = Number(currentLines[targetIndex]?.debit) || 0;
            const tgtCredit = Number(currentLines[targetIndex]?.credit) || 0;
            if (tgtDebit === 0 && tgtCredit === 0) {
                if (srcDebit > 0) {
                    setValue(`lines.${targetIndex}.credit`, srcDebit, {
                        shouldDirty: true,
                        shouldValidate: true,
                    });
                } else if (srcCredit > 0) {
                    setValue(`lines.${targetIndex}.debit`, srcCredit, {
                        shouldDirty: true,
                        shouldValidate: true,
                    });
                }
            }
        } else {
            append({
                chart_of_account_uid: cp.uid,
                description: currentLines[sourceIndex]?.description || "",
                debit: srcCredit > 0 ? srcCredit : 0,
                credit: srcDebit > 0 ? srcDebit : 0,
            });
        }

        setCounterpartPrompt((prev) => ({ ...prev, isOpen: false }));
        toast.info(`Akun lawan terpilih: [${cp.kode}] ${cp.nama}`);
    };

    /**
     * Apply all counterparts for compound journal
     */
    const handleApplyAllCounterparts = () => {
        const { sourceIndex, counterparts } = counterpartPrompt;
        if (counterparts.length === 0 || sourceIndex < 0) return;

        const currentLines = getValues("lines") || [];
        const targetIndex = sourceIndex + 1;

        counterparts.forEach((cp, i) => {
            if (i === 0 && targetIndex < currentLines.length && !currentLines[targetIndex]?.chart_of_account_uid) {
                setValue(`lines.${targetIndex}.chart_of_account_uid`, cp.uid, {
                    shouldDirty: true,
                    shouldValidate: true,
                });
            } else {
                append({
                    chart_of_account_uid: cp.uid,
                    description: currentLines[sourceIndex]?.description || "",
                    debit: 0,
                    credit: 0,
                });
            }
        });

        setCounterpartPrompt((prev) => ({ ...prev, isOpen: false }));
        toast.success(`Berhasil menambahkan ${counterparts.length} baris lawan akun untuk jurnal majemuk.`);
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
        flatAccounts,
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
    };
}
