"use client";

import React from "react";
import { BaseDialog } from "@/components/ui/base-dialog";
import { IconReceipt } from "@tabler/icons-react";
import { FormProvider } from "react-hook-form";

// Types & Hooks
import type { PaymentDialogProps } from "./types/payment-dialog.types";
import { usePaymentProcess } from "./hooks/use-payment-process";

// Sub-components
import { PaymentModeSelector } from "./components/payment-mode-selector";
import { PaymentSummaryHeader } from "./components/payment-summary-header";
import { CashPaymentForm } from "./cash-payment-form";
import { CardPaymentForm } from "./card-payment-form";
import { DebtPaymentForm } from "./debt-payment-form";

export function PaymentDialog(props: PaymentDialogProps) {
    const {
        open,
        onOpenChange,
        grandTotal,
        discount,
        tax,
        selectedMember,
        cartList,
    } = props;

    const {
        methods,
        payMode,
        setPayMode,
        cashNum,
        totalDp,
        changeValue,
        cardType,
        cardLast4,
        isProcessing,
        isSubmitEnabled,
        handlePaySubmit,
        setValue,
    } = usePaymentProcess(props);

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={
                <div className="flex items-center justify-between w-full pr-6 select-none">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                            <IconReceipt size={18} />
                        </div>
                        <div>
                            <span className="text-sm font-black tracking-tight text-slate-900 block leading-tight">Proses Pembayaran</span>
                            <span className="text-[10px] font-bold text-slate-500 leading-none">{cartList.length} item di keranjang</span>
                        </div>
                    </div>
                </div>
            }
            className="sm:max-w-4xl"
        >
            <div className="mt-3 animate-in fade-in-50 duration-200">
                <FormProvider {...methods}>
                    {/* Payment Mode Selector Tabs */}
                    <PaymentModeSelector
                        payMode={payMode}
                        onSelectMode={(mode) => {
                            setPayMode(mode);
                            setValue("cashReceived", 0);
                        }}
                        isProcessing={isProcessing}
                    />

                    {/* Main Content Split Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                        {/* Left: Input Form Area */}
                        <div className="md:col-span-7 space-y-4">
                            {payMode === "cash" && (
                                <CashPaymentForm
                                    grandTotal={grandTotal}
                                    isProcessing={isProcessing}
                                />
                            )}

                            {payMode === "card" && (
                                <CardPaymentForm
                                    isProcessing={isProcessing}
                                />
                            )}

                            {payMode === "debt" && (
                                <DebtPaymentForm
                                    selectedMember={selectedMember}
                                    grandTotal={grandTotal}
                                    isProcessing={isProcessing}
                                />
                            )}
                        </div>

                        {/* Right: Summary Header & Action Panel */}
                        <div className="md:col-span-5">
                            <PaymentSummaryHeader
                                grandTotal={grandTotal}
                                discount={discount}
                                tax={tax}
                                payMode={payMode}
                                cashNum={cashNum}
                                changeValue={changeValue}
                                cardType={cardType}
                                cardLast4={cardLast4}
                                selectedMember={selectedMember}
                                totalDp={totalDp}
                                isSubmitEnabled={isSubmitEnabled}
                                isProcessing={isProcessing}
                                onSubmit={handlePaySubmit}
                            />
                        </div>
                    </div>
                </FormProvider>
            </div>
        </BaseDialog>
    );
}
