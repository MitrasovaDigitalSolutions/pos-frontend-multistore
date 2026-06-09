"use client";

import { useState, useEffect } from "react";
import { useCheckoutState } from "@/features/checkout/hooks/use-checkout-state";
import { CheckoutTopBar } from "@/features/checkout/components/checkout-top-bar";
import { CheckoutCartSection } from "@/features/checkout/components/checkout-cart-section";
import { CheckoutTotalsSection } from "@/features/checkout/components/checkout-totals-section";
import { CatalogDialog } from "@/features/checkout/components/catalog-dialog";
import { PaymentDialog } from "@/features/checkout/components/payment-dialog";
import { HoldListDialog } from "@/features/checkout/components/hold-list-dialog";
import { ReceiptDialog } from "@/features/checkout/components/receipt-dialog";
import { BukaShiftModal, InfoSesiAktifModal } from "@/features/checkout/components/cash-drawer";
import { useCurrentCashDrawer } from "@/features/checkout/api/cash-drawer-api";
import { signOut } from "next-auth/react";

export default function CheckoutPage() {
    const state = useCheckoutState();

    // Cash Drawer Sesi States
    const [isInfoSesiOpen, setIsInfoSesiOpen] = useState(false);
    const [hasAutoOpened, setHasAutoOpened] = useState(false);

    const cashDrawerToken = state.session?.accessToken;

    // Query for active cash drawer
    const {
        data: currentDrawerData,
        isLoading: isDrawerLoading,
        refetch: refetchCurrentDrawer,
    } = useCurrentCashDrawer(cashDrawerToken);

    const activeDrawerSession = currentDrawerData?.data;

    const isSessionLoaded = state.session !== undefined;
    const hasCashDrawerSession = !!state.session?.cashDrawerSessionId;

    const isBukaShiftOpen = isSessionLoaded && (
        !hasCashDrawerSession || (!isDrawerLoading && !activeDrawerSession)
    );

    useEffect(() => {
        if (activeDrawerSession) {
            if (state.session && state.session.cashDrawerSessionId !== activeDrawerSession.id) {
                state.update({ cashDrawerSessionId: activeDrawerSession.id });
            }
            if (!hasAutoOpened) {
                setIsInfoSesiOpen(true);
                setHasAutoOpened(true);
            }
        }
    }, [activeDrawerSession, state.session, state.update, hasAutoOpened]);

    const handleOpenShiftSuccess = async (sessionId: number) => {
        await state.update({ cashDrawerSessionId: sessionId });
        refetchCurrentDrawer();
        setIsInfoSesiOpen(true);
    };

    const handleCloseShiftSuccess = async () => {
        await state.update({ cashDrawerSessionId: null });
        refetchCurrentDrawer();
        setHasAutoOpened(false);
    };

    const handleLogout = async () => {
        await signOut({ callbackUrl: "/login" });
    };

    return (
        <div className="grow flex flex-col h-screen overflow-hidden bg-slate-100 relative pb-8">
            {/* Top Bar */}
            <CheckoutTopBar
                transactionId={state.transactionId}
                activeDrawerSession={activeDrawerSession}
                hasAccessAdmin={state.hasAccessAdmin}
                onInfoSesiClick={() => setIsInfoSesiOpen(true)}
                onLogout={handleLogout}
                onDashboardClick={() => state.router.push("/admin")}
            />

            <div className="grid grid-cols-[65%_35%] h-[calc(100vh-80px)] overflow-hidden">
                {/* Left: Cart */}
                <CheckoutCartSection
                    barcodeInput={state.barcodeInput}
                    setBarcodeInput={state.setBarcodeInput}
                    isProcessing={state.isProcessing}
                    cart={state.cart}
                    barcodeInputRef={state.barcodeInputRef}
                    onBarcodeSubmit={state.handleBarcodeSubmit}
                    onCatalogOpen={() => state.setIsCatalogOpen(true)}
                    onUpdateQty={state.handleUpdateQty}
                    onRemoveItem={state.handleRemoveItem}
                />

                {/* Right: Totals & Actions */}
                <CheckoutTotalsSection
                    transactionId={state.transactionId}
                    cashierName={state.user?.name || ""}
                    trxTime={state.trxTime}
                    subtotal={state.subtotal}
                    ppn={state.ppn}
                    grandTotal={state.grandTotal}
                    cartLength={state.cart.length}
                    isProcessing={state.isProcessing}
                    onHold={state.handleHold}
                    onRecallOpen={state.openHoldList}
                    onVoid={state.handleVoidDraft}
                    onPayOpen={() => state.setIsPayModalOpen(true)}
                />
            </div>

            {/* Shortcuts Bar */}
            <div className="absolute left-0 right-0 bottom-0 h-8 bg-slate-900 text-slate-400 flex items-center px-6 text-[10px] gap-6 font-semibold select-none z-10">
                <div className="flex gap-1">
                    <span className="bg-slate-800 text-white px-1.5 py-0.5 rounded font-bold">F1</span> Bayar
                </div>
                <div className="flex gap-1">
                    <span className="bg-slate-800 text-white px-1.5 py-0.5 rounded font-bold">F2</span> Katalog
                </div>
                <div className="flex gap-1">
                    <span className="bg-slate-800 text-white px-1.5 py-0.5 rounded font-bold">F5</span> Hold
                </div>
                <div className="flex gap-1">
                    <span className="bg-slate-800 text-white px-1.5 py-0.5 rounded font-bold">F6</span> Recall
                </div>
                <div className="flex gap-1">
                    <span className="bg-slate-800 text-white px-1.5 py-0.5 rounded font-bold">F10</span> Void
                </div>
                <div className="flex gap-1">
                    <span className="bg-slate-800 text-white px-1.5 py-0.5 rounded font-bold">Esc</span> Tutup
                </div>
            </div>

            {/* Dialogs */}
            <CatalogDialog
                open={state.isCatalogOpen}
                onOpenChange={state.setIsCatalogOpen}
                products={state.products || []}
                onAddProduct={state.handleAddProduct}
            />

            <PaymentDialog
                open={state.isPayModalOpen}
                onOpenChange={state.setIsPayModalOpen}
                grandTotal={state.grandTotal}
                transactionId={state.transactionId}
                onPaySuccess={(receiptData) => {
                    state.setReceipt(receiptData);
                    state.setIsReceiptOpen(true);
                    state.refetchProducts();
                }}
            />

            <HoldListDialog
                open={state.isHoldListOpen}
                onOpenChange={state.setIsHoldListOpen}
                holdList={state.holdList}
                onRecall={state.handleRecall}
                isProcessing={state.isProcessing}
            />

            <ReceiptDialog
                open={state.isReceiptOpen}
                onOpenChange={state.setIsReceiptOpen}
                receipt={state.receipt}
                cashierName={state.user?.name || ""}
                onNewTransaction={state.handleNewTransaction}
            />

            {/* Cash Drawer Dialogs */}
            <BukaShiftModal
                open={isBukaShiftOpen}
                token={cashDrawerToken}
                onSuccess={handleOpenShiftSuccess}
            />

            <InfoSesiAktifModal
                open={isInfoSesiOpen}
                onOpenChange={setIsInfoSesiOpen}
                sessionId={activeDrawerSession?.id || null}
                token={cashDrawerToken}
                onCloseSuccess={handleCloseShiftSuccess}
            />
        </div>
    );
}
