"use client";

import { useEffect, useRef, useCallback, useMemo } from "react";
import { useTutorialStore } from "@/stores/tutorial-store";
import { useCheckoutStore } from "@/stores/checkout-store";
import { CHECKOUT_TUTORIAL_STEPS } from "../steps/checkout-tutorial-steps";
import {
    executeTutorialAction,
    type TutorialContextControls,
} from "./tutorial-action-executor";
import type { TutorialPreSnapshot } from "../types/tutorial";
import {
    ACTIONS,
    EVENTS,
    STATUS,
    type EventData,
    type Step,
} from "react-joyride";

const TOTALS_TAB_TARGETS = [
    "#nama-transaksi-input",
    "#member-selection-card",
    "#member-debt-info",
    "#discount-section",
    "#grand-total-display",
    "#btn-bayar-sekarang",
    "#btn-hold",
    "#btn-recall",
    "#btn-void",
    "#btn-reprint",
];

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
        if (typeof window === "undefined") return;
        if (window.innerWidth < 768 && controlsRef.current.setActiveMobileTab) {
            if (TOTALS_TAB_TARGETS.includes(targetSelector)) {
                controlsRef.current.setActiveMobileTab("totals");
            } else if (targetSelector === "#barcode-input" || targetSelector === "#checkout-cart-table") {
                controlsRef.current.setActiveMobileTab("cart");
            }
        }
    }, []);

    // Cleanup & Restore Snapshot
    const cleanupAndRestore = useCallback(() => {
        const snap = useTutorialStore.getState().preSnapshot;
        const checkout = useCheckoutStore.getState();

        if (snap) {
            checkout.setCart(snap.cart);
            checkout.setSelectedMember(snap.selectedMember);
            checkout.setDiscountType(snap.discountType);
            checkout.setDiscountValue(snap.discountValue);
            checkout.setNamaTransaksi(snap.namaTransaksi);
            checkout.clearHoldList();
            snap.holdList.forEach((h) => checkout.addHoldTransaction(h));
            clearSnapshot();
        }

        // Close any dialogs that were opened during tutorial
        controlsRef.current.closeDialog("pay");
        controlsRef.current.closeDialog("hold_list");
        controlsRef.current.closeDialog("cash_drawer");
        controlsRef.current.closeDialog("reprint");

        updateCursor({ visible: false, label: undefined });
    }, [clearSnapshot, updateCursor]);

    // Joyride Steps format with fixed viewport strategy and pre-step hooks
    const joyrideSteps: Step[] = useMemo(() => {
        return tutorialSteps.map((s) => ({
            target: s.target,
            title: s.title,
            content: s.content,
            placement: s.placement || "bottom",
            disableBeacon: true,
            spotlightClicks: false,
            floatingOptions: {
                strategy: "fixed",
            },
            before: async () => {
                // 1. Ensure target element's tab is active on mobile viewports
                ensureElementVisible(s.target);

                // 2. Pre-inject mock state if step depends on conditional DOM elements
                if (
                    s.action &&
                    [
                        "inject_cart",
                        "inject_member",
                        "inject_hold",
                        "clear_member",
                        "clear_cart",
                        "set_nama",
                        "set_discount",
                    ].includes(s.action.type)
                ) {
                    await executeTutorialAction(s.action, controlsRef.current);
                }
            },
        }));
    }, [tutorialSteps, ensureElementVisible]);

    // Initial snapshot when tutorial starts
    const hasInitializedRef = useRef(false);
    useEffect(() => {
        if (isRunning && activeTutorial && !hasInitializedRef.current) {
            hasInitializedRef.current = true;

            const checkout = useCheckoutStore.getState();
            const snapshot: TutorialPreSnapshot = {
                cart: [...checkout.cart],
                selectedMember: checkout.selectedMember,
                discountType: checkout.discountType,
                discountValue: checkout.discountValue,
                namaTransaksi: checkout.namaTransaksi,
                holdList: [...checkout.holdList],
            };
            saveSnapshot(snapshot);

            // Ensure first step is visible
            if (tutorialSteps[0]) {
                ensureElementVisible(tutorialSteps[0].target);
            }
        } else if (!isRunning) {
            hasInitializedRef.current = false;
        }
    }, [isRunning, activeTutorial, saveSnapshot, tutorialSteps, ensureElementVisible]);

    // Joyride Event Handler
    const handleJoyrideEvent = useCallback(
        async (data: EventData) => {
            const { action, index, status, type } = data;

            // When a step's tooltip is presented
            if (type === EVENTS.TOOLTIP) {
                setStepIndex(index);
                const step = tutorialSteps[index];
                if (step) {
                    positionCursorAt(step.target);
                    // Run typing or interactive animation actions
                    if (step.action && step.action.type === "type_text") {
                        await executeTutorialAction(step.action, controlsRef.current);
                    }
                }
            }

            if (type === EVENTS.STEP_BEFORE) {
                setStepIndex(index);
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
