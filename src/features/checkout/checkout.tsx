"use client";

import { useState, useEffect, useCallback } from "react";
import { useCheckoutState } from "@/features/checkout/hooks/use-checkout-state";
import { CheckoutTopBar } from "@/features/checkout/components/checkout-top-bar";
import { CheckoutCartSection } from "@/features/checkout/components/checkout-cart-section";
import { CheckoutTotalsSection } from "@/features/checkout/components/checkout-totals-section";
import { PaymentDialog } from "@/features/checkout/components/payment/payment-dialog";
import { HoldListDialog } from "@/features/checkout/components/hold-list-dialog";
import { ReceiptDialog } from "@/features/checkout/components/receipt-dialog";
import { OfflineTransactionsDialog } from "@/features/checkout/components/offline-transactions-dialog";
import { CashierSettingsDialog } from "@/features/checkout/components/cashier-settings-dialog";
import { BukaShiftModal, InfoSesiAktifModal } from "@/features/checkout/components/cash-drawer";
import { useCurrentCashDrawer } from "@/features/checkout/api/cash-drawer-api";
import { signOut } from "@/lib/auth-helpers";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { IconSettings } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { useOfflineReadiness } from "@/hooks/use-offline-readiness";
import { toast } from "sonner";
import { useSyncEngine } from "@/features/checkout/hooks/use-sync-engine";
import { PrintReceiptLayout } from "@/features/checkout/components/print-receipt-layout";
import type { CashDrawerSession } from "@/features/checkout/types";
import { db } from "@/lib/db";

export function Checkout() {
    const state = useCheckoutState();
    const syncEngine = useSyncEngine();
    const isOnline = useNetworkStatus();
    const offlineReadiness = useOfflineReadiness();

    // Cash Drawer Sesi States
    const [isInfoSesiOpen, setIsInfoSesiOpen] = useState(false);
    const [hasAutoOpened, setHasAutoOpened] = useState(false);
    const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
    const [isOfflineTransactionsOpen, setIsOfflineTransactionsOpen] = useState(false);
    const [activeMobileTab, setActiveMobileTab] = useState<"cart" | "totals">("cart");

    const cashDrawerToken = state.session?.accessToken;

    // Query for active cash drawer
    const {
        data: currentDrawerData,
        isLoading: isDrawerLoading,
        refetch: refetchCurrentDrawer,
    } = useCurrentCashDrawer(cashDrawerToken);

    const [localDrawerSession, setLocalDrawerSession] = useState<CashDrawerSession | null>(null);

    // Update localDrawerSession and save to local DB when online
    useEffect(() => {
        if (isOnline && currentDrawerData?.data) {
            const session = currentDrawerData.data;
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setLocalDrawerSession(session);
            db.cashDrawerSessions.put(session).catch((err) => {
                console.error("Gagal menyimpan sesi laci kasir ke DB lokal:", err);
            });
            if (session.movements) {
                db.cashDrawerMovements.bulkPut(session.movements).catch((err) => {
                    console.error("Gagal menyimpan riwayat laci kasir ke DB lokal:", err);
                });
            }
        }
    }, [isOnline, currentDrawerData]);

    // Load from local DB when offline
    useEffect(() => {
        if (!isOnline && state.session?.cashDrawerSessionId) {
            db.cashDrawerSessions.get(state.session.cashDrawerSessionId).then(async (session) => {
                if (session) {
                    const movements = await db.cashDrawerMovements
                        .where("cash_drawer_session_uid")
                        .equals(session.uid)
                        .toArray();
                    movements.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                    setLocalDrawerSession({
                        ...session,
                        movements,
                    });
                } else {
                    setLocalDrawerSession({ uid: state.session!.cashDrawerSessionId } as CashDrawerSession);
                }
            }).catch((err) => {
                console.error("Gagal memuat sesi laci lokal:", err);
                setLocalDrawerSession({ uid: state.session!.cashDrawerSessionId } as CashDrawerSession);
            });
        } else if (!isOnline && !state.session?.cashDrawerSessionId) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setLocalDrawerSession(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOnline, state.session?.cashDrawerSessionId]);

    const activeDrawerSession = isOnline ? currentDrawerData?.data : localDrawerSession;

    const isSessionLoaded = state.session !== undefined;
    const hasCashDrawerSession = !!state.session?.cashDrawerSessionId;

    const isBukaShiftOpen = isSessionLoaded && (
        !hasCashDrawerSession || (!isDrawerLoading && !activeDrawerSession)
    );

    useEffect(() => {
        if (activeDrawerSession) {
            if (state.session && state.session.cashDrawerSessionId !== activeDrawerSession.uid) {
                state.update({ cashDrawerSessionId: activeDrawerSession.uid });
            }
            if (!hasAutoOpened) {
                const timer = setTimeout(() => {
                    setIsInfoSesiOpen(true);
                    setHasAutoOpened(true);
                }, 0);
                return () => clearTimeout(timer);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeDrawerSession, state.session, state.update, hasAutoOpened]);

    const handleOpenShiftSuccess = async (sessionId: string) => {
        await state.update({ cashDrawerSessionId: sessionId });
        refetchCurrentDrawer();
        setIsInfoSesiOpen(true);
    };

    const handleCloseShiftSuccess = () => {
        setHasAutoOpened(false);
    };

    /**
     * Reprint handler that fetches the last sales transaction UID from
     * the active cash drawer session's movements (type: "cash_sale").
     * Falls back to the default handleReprint (localStorage-based) when
     * no drawer session or sales movement is found.
     */
    const handleReprintFromDrawer = useCallback(() => {
        const movements = activeDrawerSession?.movements;
        if (movements && movements.length > 0) {
            // Find the latest cash_sale movement (movements are sorted newest-first)
            const lastSale = [...movements]
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .find((m) => m.type === "cash_sale");

            if (lastSale?.reference_uid) {
                state.handleReprint(lastSale.reference_uid);
                return;
            }
        }
        // Fallback: use the default handler (localStorage lastTransactionId)
        state.handleReprint();
    }, [activeDrawerSession, state]);

    const handleLogout = () => {
        if (!isOnline) {
            toast.error("Koneksi terputus. Harap sambungkan ke internet sebelum keluar dari akun.");
            return;
        }
        setIsLogoutConfirmOpen(true);
    };

    return (
        <div className="grow flex flex-col h-screen overflow-hidden bg-slate-100 relative pb-0 md:pb-8">
            {/* Top Bar */}
            <CheckoutTopBar
                transactionId={state.transactionId}
                activeDrawerSession={activeDrawerSession}
                hasAccessAdmin={state.hasAccessAdmin}
                onInfoSesiClick={() => setIsInfoSesiOpen(true)}
                onLogout={handleLogout}
                onDashboardClick={() => state.router.push("/admin")}
                isOnline={syncEngine.isOnline}
                pendingCount={syncEngine.pendingCount}
                isSyncing={syncEngine.isSyncing}
                onSyncClick={() => setIsOfflineTransactionsOpen(true)}
                offlineReadiness={offlineReadiness}
                onCatalogSyncRequest={syncEngine.triggerCatalogSync}
                isCatalogSyncing={syncEngine.isCatalogSyncing}
            />

            {/* Mobile Tab Switcher */}
            <div className="flex md:hidden bg-white border-b border-slate-200 shrink-0">
                <button
                    onClick={() => setActiveMobileTab("cart")}
                    className={cn(
                        "flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all outline-none cursor-pointer",
                        activeMobileTab === "cart"
                            ? "border-emerald-600 text-emerald-600"
                            : "border-transparent text-slate-500 hover:text-slate-700"
                    )}
                >
                    Keranjang ({state.cart.length})
                </button>
                <button
                    onClick={() => setActiveMobileTab("totals")}
                    className={cn(
                        "flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all outline-none cursor-pointer",
                        activeMobileTab === "totals"
                            ? "border-emerald-600 text-emerald-600"
                            : "border-transparent text-slate-500 hover:text-slate-700"
                    )}
                >
                    Ringkasan & Bayar
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[60%_40%] lg:grid-cols-[65%_35%] h-[calc(100vh-80px)] md:h-[calc(100vh-72px)] overflow-hidden">
                {/* Left: Cart */}
                <div className={cn("h-full flex flex-col min-h-0", activeMobileTab !== "cart" && "hidden md:flex")}>
                    <CheckoutCartSection
                        isProcessing={state.isProcessing}
                        cart={state.cart}
                        barcodeInputRef={state.barcodeInputRef}
                        onUpdateQty={state.handleUpdateQty}
                        onUpdatePrice={state.handleUpdatePrice}
                        onRemoveItem={state.handleRemoveItem}
                        onAddProduct={state.handleAddProduct}
                        products={state.products}
                    />
                </div>

                {/* Right: Totals & Actions */}
                <div className={cn("h-full min-h-0", activeMobileTab !== "totals" && "hidden md:block")}>
                    <CheckoutTotalsSection
                        transactionId={state.transactionId}
                        cashierName={state.user?.name || ""}
                        trxTime={state.trxTime}
                        subtotal={state.subtotal}
                        ppn={state.ppn}
                        discountType={state.discountType}
                        discountValue={state.discountValue}
                        discountAmount={state.discountAmount}
                        setDiscountType={state.setDiscountType}
                        setDiscountValue={state.setDiscountValue}
                        grandTotal={state.grandTotal}
                        cartLength={state.cart.length}
                        isProcessing={state.isProcessing}
                        selectedMember={state.selectedMember}
                        onMemberChange={state.setSelectedMember}
                        onHold={state.handleHold}
                        onRecallOpen={state.openHoldList}
                        onVoid={state.handleVoidDraft}
                        onPayOpen={() => state.setIsPayModalOpen(true)}
                        onReprint={handleReprintFromDrawer}
                        namaTransaksi={state.namaTransaksi}
                        onNamaTransaksiChange={state.setNamaTransaksi}
                    />
                </div>
            </div>

            {/* Shortcuts Bar */}
            <div className="hidden md:flex absolute left-0 right-0 bottom-0 h-8 bg-slate-900 border-t border-slate-800 text-slate-400 items-center px-6 text-[10px] justify-between font-semibold select-none z-10">
                <div className="flex gap-6 items-center">
                    <div className="flex gap-1.5 items-center">
                        <kbd className="bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded font-mono font-bold shadow border border-slate-700">F1</kbd> Bayar
                    </div>
                    <div className="flex gap-1.5 items-center">
                        <kbd className="bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded font-mono font-bold shadow border border-slate-700">F5</kbd> Hold
                    </div>
                    <div className="flex gap-1.5 items-center">
                        <kbd className="bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded font-mono font-bold shadow border border-slate-700">F6</kbd> Recall
                    </div>
                    <div className="flex gap-1.5 items-center">
                        <kbd className="bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded font-mono font-bold shadow border border-slate-700">F10</kbd> Void
                    </div>
                    <div className="flex gap-1.5 items-center">
                        <kbd className="bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded font-mono font-bold shadow border border-slate-700">Esc</kbd> Tutup
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => state.setIsSettingsOpen(true)}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer bg-transparent border-none outline-none font-bold py-1 px-2.5 rounded hover:bg-slate-800 text-[10px] uppercase tracking-wider"
                >
                    <IconSettings size={12} className="shrink-0" />
                    <span>Pengaturan</span>
                </button>
            </div>

            {/* Mobile Settings Button - Floating bottom-right */}
            <button
                type="button"
                onClick={() => state.setIsSettingsOpen(true)}
                className="flex md:hidden fixed bottom-4 right-4 z-30 items-center justify-center w-9 h-9 rounded-full bg-slate-900 text-white shadow-lg border border-slate-800 cursor-pointer active:scale-95 transition-all"
            >
                <IconSettings size={16} />
            </button>

            {/* Dialogs */}
            <ConfirmDialog
                open={state.isVoidConfirmOpen}
                onOpenChange={state.setIsVoidConfirmOpen}
                title="Batal Transaksi"
                description="Apakah Anda yakin ingin membatalkan seluruh transaksi ini? Keranjang belanja akan dikosongkan."
                confirmText="Ya, Batalkan"
                cancelText="Kembali"
                variant="danger"
                onConfirm={state.handleConfirmVoid}
            />

            <ConfirmDialog
                open={isLogoutConfirmOpen}
                onOpenChange={setIsLogoutConfirmOpen}
                title="Keluar dari Akun"
                description={
                    activeDrawerSession
                        ? "PERHATIAN: Shift laci kasir Anda masih aktif! Keluar hanya akan log out akun, shift laci kasir TIDAK akan ditutup."
                        : "Apakah Anda yakin ingin keluar dari aplikasi?"
                }
                confirmText="Ya, Keluar"
                cancelText="Batal"
                variant="danger"
                onConfirm={async () => {
                    await signOut({ callbackUrl: "/login" });
                }}
            />

            <PaymentDialog
                open={state.isPayModalOpen}
                onOpenChange={state.setIsPayModalOpen}
                grandTotal={state.grandTotal}
                cartItems={state.cart.map((item) => {
                    const payloadItem: {
                        product_uid: string;
                        quantity: number;
                        harga_satuan?: number;
                    } = {
                        product_uid: item.product_uid,
                        quantity: item.qty,
                    };
                    if (item.is_jasa) {
                        payloadItem.harga_satuan = item.price;
                    }
                    return payloadItem;
                })}
                discount={state.discountAmount}
                tax={state.ppn}
                selectedMember={state.selectedMember}
                onPaySuccess={state.handlePaymentSuccess}
                cartList={state.cart}
                onLocalProductsReload={state.reloadLocalProducts}
                namaTransaksi={state.namaTransaksi}
            />

            <HoldListDialog
                open={state.isHoldListOpen}
                onOpenChange={state.setIsHoldListOpen}
                holdList={state.holdList}
                onRecall={state.handleRecall}
                onClearAll={state.handleClearHoldList}
                isProcessing={state.isProcessing}
            />

            <ReceiptDialog
                open={state.isReceiptOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        state.handleNewTransaction();
                    } else {
                        state.setIsReceiptOpen(true);
                    }
                }}
                receipt={state.receipt}
                cashierName={state.user?.name || ""}
                onNewTransaction={state.handleNewTransaction}
                onReprint={state.handleReprint}
            />

            {/* Cash Drawer Dialogs */}
            <BukaShiftModal
                open={isBukaShiftOpen}
                token={cashDrawerToken}
                onSuccess={handleOpenShiftSuccess}
                isLoading={isDrawerLoading}
                isOnline={isOnline}
            />

            <InfoSesiAktifModal
                open={isInfoSesiOpen}
                onOpenChange={setIsInfoSesiOpen}
                sessionId={activeDrawerSession?.uid || null}
                token={cashDrawerToken}
                onCloseSuccess={handleCloseShiftSuccess}
                isOnline={isOnline}
            />

            <OfflineTransactionsDialog
                open={isOfflineTransactionsOpen}
                onOpenChange={setIsOfflineTransactionsOpen}
            />

            <CashierSettingsDialog
                open={state.isSettingsOpen}
                onOpenChange={state.setIsSettingsOpen}
            />

            {/* Hidden Print Receipt container */}
            <PrintReceiptLayout
                receipt={state.receipt}
                cashierName={state.user?.name || ""}
            />
        </div>
    );
}
