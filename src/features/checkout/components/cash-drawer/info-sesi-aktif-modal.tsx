"use client";

import React, { useState, useEffect } from "react";
import { BaseDialog } from "@/components/ui/base-dialog";
import { cn } from "@/lib/utils";
import { useCashDrawerDetail } from "../../api/cash-drawer-api";
import { SessionDetailsView } from "./session-details-view";
import { CashInForm } from "./cash-in-form";
import { CashOutForm } from "./cash-out-form";
import { CloseShiftForm } from "./close-shift-form";

interface InfoSesiAktifModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    sessionId: string | null;
    token?: string;
    onCloseSuccess: () => void;
    isOnline?: boolean;
}

type ModalSubView = "info" | "cash_in" | "cash_out" | "close_shift";

export function InfoSesiAktifModal({
    open,
    onOpenChange,
    sessionId,
    token,
    onCloseSuccess,
    isOnline = true,
}: InfoSesiAktifModalProps) {
    const [subView, setSubView] = useState<ModalSubView>("info");
    const [showHistory, setShowHistory] = useState(false);

    const { data: detailData, isLoading: isDetailLoading, refetch: refetchDetail } =
        useCashDrawerDetail(sessionId, token);

    const activeSession = detailData?.data;

    // Reset subview when modal open status changes
    useEffect(() => {
        if (open) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSubView("info");
            setShowHistory(false);
        }
    }, [open]);

    const handleActionSuccess = () => {
        setSubView("info");
        refetchDetail();
    };

    const handleCloseSuccess = () => {
        onOpenChange(false);
        onCloseSuccess();
    };

    return (
        <BaseDialog
            open={open}
            onOpenChange={(val) => {
                // Only allow closing when on the "info" view and not loading
                if (val && !isDetailLoading) {
                    onOpenChange(true);
                } else if (!val && subView === "info") {
                    onOpenChange(false);
                }
            }}
            className={cn(
                "transition-all duration-300",
                showHistory && subView === "info"
                    ? "max-w-3xl sm:max-w-3xl"
                    : "max-w-lg sm:max-w-lg"
            )}
            showCloseButton={false}
        >
            {subView === "info" && (
                <SessionDetailsView
                    activeSession={activeSession}
                    isLoading={isDetailLoading}
                    onAction={(view) => setSubView(view)}
                    showHistory={showHistory}
                    setShowHistory={setShowHistory}
                    onClose={() => onOpenChange(false)}
                    isOnline={isOnline}
                />
            )}

            {subView === "cash_in" && sessionId && (
                <CashInForm
                    sessionId={sessionId}
                    token={token}
                    onSuccess={handleActionSuccess}
                    onCancel={() => setSubView("info")}
                />
            )}

            {subView === "cash_out" && sessionId && (
                <CashOutForm
                    sessionId={sessionId}
                    token={token}
                    onSuccess={handleActionSuccess}
                    onCancel={() => setSubView("info")}
                />
            )}

            {subView === "close_shift" && sessionId && activeSession && (
                <CloseShiftForm
                    sessionId={sessionId}
                    expectedCash={activeSession.expected_cash}
                    token={token}
                    onSuccess={handleCloseSuccess}
                    onCancel={() => setSubView("info")}
                />
            )}
        </BaseDialog>
    );
}
