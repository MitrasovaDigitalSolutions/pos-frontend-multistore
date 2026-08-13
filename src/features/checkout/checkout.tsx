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
import { PastTransactionsDialog } from "@/features/checkout/components/past-transactions-dialog";
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
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { Show } from "@/components/ui/show";

export function Checkout() {
    const state = useCheckoutState();
    const syncEngine = useSyncEngine();
    const isOnline = useNetworkStatus();
    const offlineReadiness = useOfflineReadiness();

    // Cash Drawer Sesi States
    const [isInfoSesiOpen, setIsInfoSesiOpen] = useState(false);
    const [hasAutoOpened, setHasAutoOpened] = useState(false);
    const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isOfflineTransactionsOpen, setIsOfflineTransactionsOpen] = useState(false);
    const [isPastTransactionsOpen, setIsPastTransactionsOpen] = useState(false);
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
     * Opens the past transactions dialog so cashiers can search & reprint
     * any sales transaction directly from the cashier screen.
     */
    const handleReprintFromDrawer = useCallback(() => {
        setIsPastTransactionsOpen(true);
    }, []);

    const handleLogout = () => {
        if (!isOnline) {
            toast.error("Koneksi terputus. Harap sambungkan ke internet sebelum keluar dari akun.");
            return;
        }
        setIsLogoutConfirmOpen(true);
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-slate-100 relative">
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
            <div className="flex md:hidden bg-white border-b border-slate-200 shrink-0 z-10 shadow-xs">
                <button
                    type="button"
                    onClick={() => setActiveMobileTab("cart")}
                    className={cn(
                        "flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition-all outline-none cursor-pointer flex items-center justify-center gap-1.5",
                        activeMobileTab === "cart"
                            ? "border-emerald-600 text-emerald-600 bg-emerald-50/40"
                            : "border-transparent text-slate-500 hover:text-slate-700"
                    )}
                >
                    <span>Keranjang</span>
                    <span className="bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold">
                        {state.cart.length}
                    </span>
                </button>
                <button
                    type="button"
                    onClick={() => setActiveMobileTab("totals")}
                    className={cn(
                        "flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition-all outline-none cursor-pointer flex items-center justify-center gap-1.5",
                        activeMobileTab === "totals"
                            ? "border-emerald-600 text-emerald-600 bg-emerald-50/40"
                            : "border-transparent text-slate-500 hover:text-slate-700"
                    )}
                >
                    <span>Ringkasan &amp; Bayar</span>
                    {state.grandTotal > 0 && (
                        <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full text-[10px] font-black">
                            {formatRupiah(state.grandTotal)}
                        </span>
                    )}
                </button>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-[58%_42%] lg:grid-cols-[65%_35%] min-h-0 overflow-hidden">
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
                <div className={cn("h-full flex flex-col min-h-0", activeMobileTab !== "totals" && "hidden md:flex")}>
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

            {/* Shortcuts Bar (Flex child footer - never overlaps content) */}
            <div className="hidden md:flex bg-slate-900 border-t border-slate-800 text-slate-400 items-center px-6 text-[10px] justify-between font-semibold select-none shrink-0 h-8 z-10">
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

            {/* Mobile Settings Button - Floating top-right inside topbar zone */}
            <button
                type="button"
                onClick={() => state.setIsSettingsOpen(true)}
                className="flex md:hidden fixed top-2 right-2 z-40 items-center justify-center w-7 h-7 rounded-lg bg-slate-800 text-slate-300 hover:text-white shadow-xs border border-slate-700 cursor-pointer active:scale-95 transition-all"
                title="Pengaturan Kasir"
            >
                <IconSettings size={15} />
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
                isLoading={isLoggingOut}
                onConfirm={async () => {
                    setIsLoggingOut(true);
                    await signOut({ callbackUrl: "/login" });
                }}
            />

            <Show.When isTrue={state.isPayModalOpen}>
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
            </Show.When>

            <Show.When isTrue={state.isHoldListOpen}>
                <HoldListDialog
                    open={state.isHoldListOpen}
                    onOpenChange={state.setIsHoldListOpen}
                    holdList={state.holdList}
                    onRecall={state.handleRecall}
                    onClearAll={state.handleClearHoldList}
                    isProcessing={state.isProcessing}
                />
            </Show.When>

            <Show.When isTrue={state.isReceiptOpen}>
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
            </Show.When>

            {/* Cash Drawer Dialogs */}
            <BukaShiftModal
                open={isBukaShiftOpen}
                token={cashDrawerToken}
                onSuccess={handleOpenShiftSuccess}
                isLoading={isDrawerLoading}
                isOnline={isOnline}
            />

            <Show.When isTrue={isInfoSesiOpen}>
                <InfoSesiAktifModal
                    open={isInfoSesiOpen}
                    onOpenChange={setIsInfoSesiOpen}
                    sessionId={activeDrawerSession?.uid || null}
                    token={cashDrawerToken}
                    onCloseSuccess={handleCloseShiftSuccess}
                    isOnline={isOnline}
                />
            </Show.When>

            <Show.When isTrue={isOfflineTransactionsOpen}>
                <OfflineTransactionsDialog
                    open={isOfflineTransactionsOpen}
                    onOpenChange={setIsOfflineTransactionsOpen}
                />
            </Show.When>

            <Show.When isTrue={isPastTransactionsOpen}>
                <PastTransactionsDialog
                    open={isPastTransactionsOpen}
                    onOpenChange={setIsPastTransactionsOpen}
                    onReprint={(uid) => {
                        state.handleReprint(uid);
                        setIsPastTransactionsOpen(false);
                    }}
                    lastTransactionId={state.lastTransactionId}
                />
            </Show.When>

            <Show.When isTrue={state.isSettingsOpen}>
                <CashierSettingsDialog
                    open={state.isSettingsOpen}
                    onOpenChange={state.setIsSettingsOpen}
                />
            </Show.When>

            {/* Hidden Print Receipt container */}
            <PrintReceiptLayout
                receipt={state.receipt}
                cashierName={state.user?.name || ""}
            />
        </div>
    );
}
