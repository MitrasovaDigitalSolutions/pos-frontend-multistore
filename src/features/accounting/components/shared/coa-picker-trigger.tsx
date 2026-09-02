"use client";

import { useState } from "react";
import { IconSearch, IconChevronDown, IconX } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ACCOUNT_TYPE_CONFIG } from "../../constants/counterpart-constants";
import { CoaPickerDialog } from "./coa-picker-dialog";
import type { ChartOfAccount, ChartOfAccountType } from "../../types";

export interface CoaPickerTriggerProps {
    value?: string | null;
    onChange: (uid: string, account?: ChartOfAccount | null) => void;
    accounts?: ChartOfAccount[];
    allowedTypes?: ChartOfAccountType[];
    placeholder?: string;
    excludeUid?: string | null;
    excludeUids?: string[];
    disabled?: boolean;
    allowClear?: boolean;
    className?: string;
    dialogTitle?: string;
    size?: "sm" | "md";
}

export function CoaPickerTrigger({
    value,
    onChange,
    accounts = [],
    allowedTypes,
    placeholder = "Pilih Akun (CoA)...",
    excludeUid,
    excludeUids,
    disabled = false,
    allowClear = false,
    className,
    dialogTitle,
    size = "sm",
}: CoaPickerTriggerProps) {
    const [open, setOpen] = useState(false);

    const selectedAccount = accounts.find((a) => a.uid === value);
    const typeConfig = selectedAccount?.tipe
        ? ACCOUNT_TYPE_CONFIG[selectedAccount.tipe as ChartOfAccountType]
        : null;

    const handleSelect = (account: ChartOfAccount) => {
        onChange(account.uid, account);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange("", null);
    };

    return (
        <>
            <button
                type="button"
                onClick={() => !disabled && setOpen(true)}
                disabled={disabled}
                className={cn(
                    "w-full text-left rounded-lg border flex items-center justify-between gap-2 px-2.5 transition-all text-xs cursor-pointer",
                    size === "sm" ? "h-8 sm:h-8" : "h-10 sm:h-9",
                    disabled
                        ? "opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500",
                    className
                )}
            >
                {selectedAccount ? (
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <span className="font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded shrink-0">
                            {selectedAccount.kode}
                        </span>
                        <span
                            className="font-semibold text-slate-800 dark:text-slate-200 truncate"
                            title={`${selectedAccount.kode} - ${selectedAccount.nama}`}
                        >
                            {selectedAccount.nama}
                        </span>
                        {typeConfig && (
                            <Badge
                                variant="outline"
                                className={cn("text-[9px] px-1 py-0 font-medium shrink-0 ml-auto hidden sm:inline-flex", typeConfig.bg, typeConfig.text, typeConfig.border)}
                            >
                                {typeConfig.label}
                            </Badge>
                        )}
                    </div>
                ) : (
                    <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                        <IconSearch size={13} className="text-slate-400" />
                        {placeholder}
                    </span>
                )}

                <div className="flex items-center gap-1 shrink-0 ml-1">
                    {allowClear && selectedAccount && !disabled && (
                        <span
                            role="button"
                            tabIndex={0}
                            onClick={handleClear}
                            className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        >
                            <IconX size={13} />
                        </span>
                    )}
                    <IconChevronDown size={14} className="text-slate-400" />
                </div>
            </button>

            <CoaPickerDialog
                open={open}
                onOpenChange={setOpen}
                onSelect={handleSelect}
                accounts={accounts}
                selectedUid={value}
                excludeUid={excludeUid}
                excludeUids={excludeUids}
                allowedTypes={allowedTypes}
                title={dialogTitle}
            />
        </>
    );
}
