"use client";

import { useEffect, useRef, useCallback, useMemo } from "react";
import { useTutorialStore } from "@/stores/tutorial-store";
import { useCheckoutStore } from "@/stores/checkout-store";
import { CHECKOUT_TUTORIAL_STEPS } from "../steps/checkout-tutorial-steps";
import {
    executeTutorialAction,
    setInputValueWithEvents,
    type TutorialContextControls,
} from "./tutorial-action-executor";
import type {
    TutorialAction,
    TutorialDialogType,
    TutorialPreSnapshot,
} from "../types/tutorial";
import {
    ACTIONS,
    EVENTS,
    STATUS,
    type EventData,
    type Step,
} from "react-joyride";
import { db, type OfflineTransactionRecord } from "@/lib/db";
import {
    MOCK_PRODUCTS,
    MOCK_HOLD_TRANSACTION,
    MOCK_OFFLINE_TRANSACTION,
    MOCK_MEMBER_WITH_DEBT,
    filterOutMockData,
    isMockCartItem,
    isMockMember,
    isMockHold,
    isMockNamaTransaksi,
} from "../constants/tutorial-constants";

const TOTALS_TAB_TARGETS = [
    "#nama-transaksi-input",
    "#member-selection-card",
    "#member-debt-info",
    "#btn-pay-debt-action",
    "#discount-section",
    "#grand-total-display",
    "#btn-bayar-sekarang",
    "#btn-hold",
    "#btn-recall",
    "#btn-void",
    "#btn-reprint",
];

function getDialogForTarget(target: string): TutorialDialogType | null {
    if (!target || target === "body") return null;
    if (target.startsWith("#cash-drawer-")) return "cash_drawer";
    if (target.startsWith("#pay-debt-")) return "pay_debt";
    if (
        target === "#hold-item-first" ||
        target === "#hold-list-container" ||
        target === "#btn-recall-first"
    )
        return "hold_list";
    if (target === "#btn-confirm-void" || target === "#void-confirm-dialog")
        return "void_confirm";
    if (target.startsWith("#offline-") || target === "#btn-sync-selected")
        return "offline";
    if (
        target.startsWith("#past-transactions-") ||
        target === "#btn-reprint-action-first"
    )
        return "reprint";
    return null;
}

function isStateAction(action?: TutorialAction): action is TutorialAction {
    if (!action) return false;
    if (action.type === "sequence") {
        return action.actions.every(isStateAction);
    }
    return [
        "inject_cart",
        "inject_member",
        "inject_hold",
        "clear_member",
        "clear_cart",
        "clear_hold",
        "set_nama",
        "set_discount",
    ].includes(action.type);
}

async function waitForElement(selector: string, timeout = 1500): Promise<Element | null> {
    if (typeof document === "undefined") return null;
    if (selector === "body") return document.body;
    const start = Date.now();
    while (Date.now() - start < timeout) {
        const el = document.querySelector(selector);
        if (el) return el;
        await new Promise((r) => setTimeout(r, 40));
    }
    return document.querySelector(selector);
}

export function useCheckoutTutorial(controls: TutorialContextControls) {
    const activeTutorial = useTutorialStore((state) => state.activeTutorial);
    const stepIndex = useTutorialStore((state) => state.stepIndex);
    const isRunning = useTutorialStore((state) => state.isRunning);

    const startTutorial = useTutorialStore((state) => state.startTutorial);
    const stopTutorial = useTutorialStore((state) => state.stopTutorial);
    const setStepIndex = useTutorialStore((state) => state.setStepIndex);
    const saveSnapshot = useTutorialStore((state) => state.saveSnapshot);
    const clearSnapshot = useTutorialStore((state) => state.clearSnapshot);
    const updateCursor = useTutorialStore((state) => state.updateCursor);

    // Keep controls in ref safely via useEffect
    const controlsRef = useRef(controls);
    useEffect(() => {
        controlsRef.current = controls;
    }, [controls]);

    // Steps configuration for active tutorial
    const tutorialSteps = useMemo(() => {
        if (!activeTutorial) return [];
        return CHECKOUT_TUTORIAL_STEPS[activeTutorial] || [];
    }, [activeTutorial]);

    // Position animated cursor to target
    const positionCursorAt = useCallback((targetSelector: string) => {
        if (!targetSelector || targetSelector === "body") {
            updateCursor({ visible: false });
            return;
        }
        const el = document.querySelector(targetSelector);
        if (el) {
            const rect = el.getBoundingClientRect();
            updateCursor({
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2,
                visible: true,
            });
        } else {
            updateCursor({ visible: false });
        }
    }, [updateCursor]);

    // Ensure target element is visible on mobile viewports
    const ensureElementVisible = useCallback((targetSelector: string) => {
        if (typeof window === "undefined" || !targetSelector || targetSelector === "body") return;
        if (window.innerWidth < 768 && controlsRef.current.setActiveMobileTab) {
            if (TOTALS_TAB_TARGETS.includes(targetSelector)) {
                controlsRef.current.setActiveMobileTab("totals");
            } else if (targetSelector === "#barcode-input" || targetSelector === "#checkout-cart-table") {
                controlsRef.current.setActiveMobileTab("cart");
            }
        }
    }, []);

    // Purge any stale mock items that might linger in session storage from prior aborted sessions
    useEffect(() => {
        const checkout = useCheckoutStore.getState();
        const hasMockCart = checkout.cart.some(isMockCartItem);
        const hasMockMember = isMockMember(checkout.selectedMember);
        const hasMockHold = checkout.holdList.some(isMockHold);
        const hasMockNama = isMockNamaTransaksi(checkout.namaTransaksi);

        if (hasMockCart || hasMockMember || hasMockHold || hasMockNama) {
            const cleanCart = checkout.cart.filter((i) => !isMockCartItem(i));
            checkout.setCart(cleanCart);
            if (hasMockMember) checkout.setSelectedMember(null);
            if (hasMockNama) checkout.setNamaTransaksi("");
            if (hasMockHold) {
                const cleanHold = checkout.holdList.filter((h) => !isMockHold(h));
                checkout.clearHoldList();
                cleanHold.forEach((h) => checkout.addHoldTransaction(h));
            }
        }
    }, []);

    // Cleanup & Restore Snapshot
    const cleanupAndRestore = useCallback(() => {
        const snap = useTutorialStore.getState().preSnapshot;
        const checkout = useCheckoutStore.getState();

        let restoredNama = "";

        if (snap) {
            const cleanSnap = filterOutMockData(snap);
            checkout.setCart(cleanSnap.cart);
            checkout.setSelectedMember(cleanSnap.selectedMember);
            checkout.setDiscountType(cleanSnap.discountType);
            checkout.setDiscountValue(cleanSnap.discountValue);
            checkout.setNamaTransaksi(cleanSnap.namaTransaksi);
            checkout.clearHoldList();
            cleanSnap.holdList.forEach((h) => checkout.addHoldTransaction(h));
            restoredNama = cleanSnap.namaTransaksi;
            clearSnapshot();
        } else {
            const cleanCart = checkout.cart.filter((item) => !isMockCartItem(item));
            checkout.setCart(cleanCart);
            if (isMockMember(checkout.selectedMember)) {
                checkout.setSelectedMember(null);
            }
            if (isMockNamaTransaksi(checkout.namaTransaksi)) {
                checkout.setNamaTransaksi("");
            }
            checkout.setDiscountType("nominal");
            checkout.setDiscountValue(0);
            const cleanHold = checkout.holdList.filter((h) => !isMockHold(h));
            checkout.clearHoldList();
            cleanHold.forEach((h) => checkout.addHoldTransaction(h));
            restoredNama = checkout.namaTransaksi && !isMockNamaTransaksi(checkout.namaTransaksi) ? checkout.namaTransaksi : "";
        }

        // Close any dialogs that were opened during tutorial
        controlsRef.current.closeDialog("pay");
        controlsRef.current.closeDialog("hold_list");
        controlsRef.current.closeDialog("cash_drawer");
        controlsRef.current.closeDialog("reprint");
        controlsRef.current.closeDialog("offline");
        controlsRef.current.closeDialog("pay_debt");
        controlsRef.current.closeDialog("void_confirm");

        // Clean up mock offline transaction from IndexedDB
        db.offlineTransactions.delete(MOCK_OFFLINE_TRANSACTION.uid).catch(() => {});

        // Clean up DOM input fields
        if (typeof document !== "undefined") {
            // Barcode input
            const barcodeContainer = document.querySelector("#barcode-input");
            const barcodeInput = (barcodeContainer instanceof HTMLInputElement
                ? barcodeContainer
                : barcodeContainer?.querySelector("input")) as HTMLInputElement | null;
            if (barcodeInput) {
                setInputValueWithEvents(barcodeInput, "");
                barcodeInput.blur();
            }

            // Nama transaksi input
            const namaInput = document.querySelector("#nama-transaksi-input") as HTMLInputElement | null;
            if (namaInput) {
                setInputValueWithEvents(namaInput, restoredNama);
                namaInput.blur();
            }

            // Cash drawer opening balance
            const cashInput = document.querySelector("#cash-drawer-opening-balance") as HTMLInputElement | null;
            if (cashInput) {
                setInputValueWithEvents(cashInput, "");
                cashInput.blur();
            }

            // Pay debt cash input
            const payDebtInput = document.querySelector("#pay-debt-cash-input") as HTMLInputElement | null;
            if (payDebtInput) {
                setInputValueWithEvents(payDebtInput, "");
                payDebtInput.blur();
            }

            // Remove any lingering Joyride portal/overlay
            const portal = document.getElementById("react-joyride-portal");
            if (portal) {
                portal.style.display = "none";
                setTimeout(() => portal.remove(), 50);
            }
        }

        updateCursor({ visible: false, clicking: false, label: undefined });
    }, [clearSnapshot, updateCursor]);

    // Reactive termination watchdog: guarantees full cleanup whenever tutorial stops
    const prevIsRunningRef = useRef(isRunning);
    useEffect(() => {
        if (prevIsRunningRef.current && !isRunning) {
            cleanupAndRestore();
        }
        prevIsRunningRef.current = isRunning;
    }, [isRunning, cleanupAndRestore]);

    // Cleanup when component unmounts
    useEffect(() => {
        return () => {
            if (useTutorialStore.getState().isRunning) {
                cleanupAndRestore();
                useTutorialStore.getState().stopTutorial();
            }
        };
    }, [cleanupAndRestore]);

    // Joyride Steps format with fixed viewport strategy, no beacon, and skipBeacon
    const joyrideSteps: Step[] = useMemo(() => {
        return tutorialSteps.map((s, idx) => {
            const isLastStep = idx === tutorialSteps.length - 1;
            const isCentered = isLastStep || s.placement === "center" || s.target === "body";

            return {
                target: isCentered ? "body" : s.target,
                title: s.title,
                content: s.content,
                placement: isCentered ? ("center" as const) : (s.placement || "bottom"),
                skipBeacon: true,
                disableBeacon: true,
                spotlightClicks: false,
                floatingOptions: {
                    strategy: "fixed",
                },
            };
        });
    }, [tutorialSteps]);

    // Initial snapshot and mock injection when tutorial starts
    const hasInitializedRef = useRef(false);
    useEffect(() => {
        if (isRunning && activeTutorial && !hasInitializedRef.current) {
            hasInitializedRef.current = true;

            // Ensure preSnapshot is stored cleanly if not already set by startTutorial
            const currentSnapshot = useTutorialStore.getState().preSnapshot;
            if (!currentSnapshot) {
                const checkout = useCheckoutStore.getState();
                const rawSnapshot: TutorialPreSnapshot = {
                    cart: [...checkout.cart],
                    selectedMember: checkout.selectedMember,
                    discountType: checkout.discountType,
                    discountValue: checkout.discountValue,
                    namaTransaksi: checkout.namaTransaksi,
                    holdList: [...checkout.holdList],
                };
                saveSnapshot(filterOutMockData(rawSnapshot));
            }

            // Inject mock offline record if running offline or reprint tutorial
            if (activeTutorial === "transaksi_offline" || activeTutorial === "cetak_ulang_struk") {
                db.offlineTransactions
                    .put(MOCK_OFFLINE_TRANSACTION as unknown as OfflineTransactionRecord)
                    .catch(() => {});
            }

            // Inject mock member if starting hutang_member tutorial
            if (activeTutorial === "hutang_member") {
                useCheckoutStore.getState().setSelectedMember(MOCK_MEMBER_WITH_DEBT);
            }

            // Inject initial mock cart & nama if starting hold_recall_void tutorial
            if (activeTutorial === "hold_recall_void") {
                const checkout = useCheckoutStore.getState();
                checkout.setCart(MOCK_PRODUCTS.slice(0, 2));
                checkout.setNamaTransaksi("Pelanggan A (Pending)");
            }

            // Ensure first step is visible
            if (tutorialSteps[0]) {
                ensureElementVisible(tutorialSteps[0].target);
            }
        } else if (!isRunning) {
            hasInitializedRef.current = false;
        }
    }, [isRunning, activeTutorial, saveSnapshot, tutorialSteps, ensureElementVisible]);

    // Joyride Event Handler for controlled mode
    const handleJoyrideEvent = useCallback(
        async (data: EventData) => {
            const { action, index, status, type } = data;

            // Controlled step transition handling on next/prev click
            if (type === EVENTS.STEP_AFTER) {
                if (action === ACTIONS.NEXT) {
                    const nextIndex = index + 1;
                    if (nextIndex < tutorialSteps.length) {
                        const currentDialog = getDialogForTarget(tutorialSteps[index]?.target || "");
                        const nextStep = tutorialSteps[nextIndex];
                        const nextDialog = getDialogForTarget(nextStep.target);

                        // Handle dialog opening / closing across steps
                        if (nextDialog && nextDialog !== currentDialog) {
                            controlsRef.current.openDialog(nextDialog);
                        } else if (currentDialog && !nextDialog) {
                            controlsRef.current.closeDialog(currentDialog);
                        }

                        // Pre-inject mock state if next step needs conditional elements
                        if (isStateAction(nextStep.action)) {
                            await executeTutorialAction(nextStep.action, controlsRef.current);
                        }

                        ensureElementVisible(nextStep.target);
                        await waitForElement(nextStep.target, 1500);
                        setStepIndex(nextIndex);
                    } else {
                        // All steps finished!
                        cleanupAndRestore();
                        stopTutorial();
                    }
                } else if (action === ACTIONS.PREV) {
                    const prevIndex = index - 1;
                    if (prevIndex >= 0) {
                        const currentDialog = getDialogForTarget(tutorialSteps[index]?.target || "");
                        const prevStep = tutorialSteps[prevIndex];
                        const prevDialog = getDialogForTarget(prevStep.target);

                        if (prevDialog && prevDialog !== currentDialog) {
                            controlsRef.current.openDialog(prevDialog);
                        } else if (currentDialog && !prevDialog) {
                            controlsRef.current.closeDialog(currentDialog);
                        }

                        if (isStateAction(prevStep.action)) {
                            await executeTutorialAction(prevStep.action, controlsRef.current);
                        } else if (
                            prevStep.target === "#btn-recall-first" ||
                            prevStep.target === "#hold-item-first"
                        ) {
                            useCheckoutStore.getState().addHoldTransaction(MOCK_HOLD_TRANSACTION);
                        }

                        ensureElementVisible(prevStep.target);
                        await waitForElement(prevStep.target, 1500);
                        setStepIndex(prevIndex);
                    }
                }
            }

            // When a step's tooltip is presented
            if (type === EVENTS.TOOLTIP) {
                const step = tutorialSteps[index];
                if (step) {
                    // Position cursor with brief delay to accommodate transitions
                    setTimeout(() => {
                        positionCursorAt(step.target);
                    }, 80);

                    // Run step action (typing simulation, live demo animation, etc.)
                    if (step.action && (index === 0 || !isStateAction(step.action))) {
                        await executeTutorialAction(step.action, controlsRef.current);
                        // Re-target cursor after action
                        setTimeout(() => {
                            positionCursorAt(step.target);
                        }, 80);
                    }
                }
            }

            // Tour termination
            if (
                status === STATUS.FINISHED ||
                status === STATUS.SKIPPED ||
                action === ACTIONS.CLOSE ||
                action === ACTIONS.RESET ||
                type === EVENTS.TOUR_END
            ) {
                cleanupAndRestore();
                stopTutorial();
            }
        },
        [
            tutorialSteps,
            positionCursorAt,
            ensureElementVisible,
            setStepIndex,
            cleanupAndRestore,
            stopTutorial,
        ]
    );

    return {
        activeTutorial,
        isRunning,
        stepIndex,
        joyrideSteps,
        handleJoyrideEvent,
        startTutorial,
        stopTutorial,
    };
}
