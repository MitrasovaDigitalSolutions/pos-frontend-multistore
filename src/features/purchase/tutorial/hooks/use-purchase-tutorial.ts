"use client";

import { useEffect, useRef, useCallback, useMemo } from "react";
import { usePurchaseTutorialStore } from "@/stores/purchase-tutorial-store";
import { PURCHASE_TUTORIAL_STEPS } from "../steps/purchase-tutorial-steps";
import {
    setInputValueWithEvents,
    simulateTyping,
} from "@/features/tutorial/hooks/tutorial-action-executor";
import type { PurchaseTutorialAction } from "../types/purchase-tutorial";
import {
    ACTIONS,
    EVENTS,
    STATUS,
    type EventData,
    type Step,
} from "react-joyride";
import { getPurchaseItemsStore } from "@/stores/purchase-items-store";
import { isMockPurchaseItem, MOCK_PO_ITEMS } from "../constants/purchase-tutorial-constants";
import { useAppRouter } from "@/hooks/use-app-router";

async function waitForElement(selector: string, timeout = 2500): Promise<Element | null> {
    if (typeof document === "undefined") return null;
    if (selector === "body") return document.body;
    const start = Date.now();
    while (Date.now() - start < timeout) {
        const el = document.querySelector(selector);
        if (el) return el;
        await new Promise((r) => setTimeout(r, 50));
    }
    return document.querySelector(selector);
}

async function runPurchaseAction(
    action: PurchaseTutorialAction,
    routerPush: (url: string) => void
): Promise<void> {
    const store = getPurchaseItemsStore("new", "po");

    switch (action.type) {
        case "inject_po_items": {
            store.setState({
                items: [...action.items],
                lastUpdated: Date.now(),
            });
            break;
        }

        case "clear_po_items": {
            store.getState().clearAll();
            break;
        }

        case "set_po_notes": {
            const el = document.querySelector("#po-notes-input") as HTMLInputElement | null;
            if (el) {
                usePurchaseTutorialStore.getState().updateCursor({ label: "Mengetik..." });
                await simulateTyping(el, action.notes);
                usePurchaseTutorialStore.getState().updateCursor({ label: undefined });
            }
            break;
        }

        case "navigate": {
            if (typeof window !== "undefined" && window.location.pathname !== action.url) {
                routerPush(action.url);
                await new Promise((r) => setTimeout(r, 600));
            }
            break;
        }

        case "type_text": {
            const container = document.querySelector(action.target);
            const el = (container instanceof HTMLInputElement
                ? container
                : container?.querySelector("input")) as HTMLInputElement | null;
            if (el) {
                usePurchaseTutorialStore.getState().updateCursor({ label: "Mengetik..." });
                await simulateTyping(el, action.text);
                usePurchaseTutorialStore.getState().updateCursor({ label: undefined });
            }
            break;
        }

        case "clear_input": {
            const container = document.querySelector(action.target);
            const el = (container instanceof HTMLInputElement
                ? container
                : container?.querySelector("input")) as HTMLInputElement | null;
            if (el) {
                setInputValueWithEvents(el, "");
                el.blur();
            }
            break;
        }

        case "click": {
            const el = document.querySelector(action.target) as HTMLElement | null;
            if (el) {
                usePurchaseTutorialStore.getState().triggerCursorClick();
                await new Promise((r) => setTimeout(r, 200));
                el.click();
            }
            break;
        }

        case "wait": {
            await new Promise((r) => setTimeout(r, action.ms));
            break;
        }

        case "sequence": {
            for (const subAction of action.actions) {
                await runPurchaseAction(subAction, routerPush);
                await new Promise((r) => setTimeout(r, 200));
            }
            break;
        }
    }
}

export function usePurchaseTutorial() {
    const router = useAppRouter();
    const activeTutorial = usePurchaseTutorialStore((state) => state.activeTutorial);
    const stepIndex = usePurchaseTutorialStore((state) => state.stepIndex);
    const isRunning = usePurchaseTutorialStore((state) => state.isRunning);

    const startTutorial = usePurchaseTutorialStore((state) => state.startTutorial);
    const stopTutorial = usePurchaseTutorialStore((state) => state.stopTutorial);
    const setStepIndex = usePurchaseTutorialStore((state) => state.setStepIndex);
    const clearSnapshot = usePurchaseTutorialStore((state) => state.clearSnapshot);
    const updateCursor = usePurchaseTutorialStore((state) => state.updateCursor);

    // Steps configuration for active tutorial
    const tutorialSteps = useMemo(() => {
        if (!activeTutorial) return [];
        return PURCHASE_TUTORIAL_STEPS[activeTutorial] || [];
    }, [activeTutorial]);

    // Position cursor helper
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

    // Ensure target element is smoothly scrolled into view if needed
    const ensureElementVisible = useCallback((targetSelector: string) => {
        if (typeof document === "undefined" || !targetSelector || targetSelector === "body") return;
        const el = document.querySelector(targetSelector);
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, []);

    // Cleanup & Restore Snapshot
    const cleanupAndRestore = useCallback(() => {
        const snap = usePurchaseTutorialStore.getState().preSnapshot;
        const store = getPurchaseItemsStore("new", "po");

        if (snap) {
            const cleanItems = snap.items.filter((i) => !isMockPurchaseItem(i));
            store.setState({
                items: cleanItems,
                headerData: snap.headerData,
                lastUpdated: Date.now(),
            });
            clearSnapshot();
        } else {
            const cleanItems = store.getState().items.filter((i) => !isMockPurchaseItem(i));
            store.setState({
                items: cleanItems,
                lastUpdated: Date.now(),
            });
        }

        // Clean up DOM input fields
        if (typeof document !== "undefined") {
            const notesInput = document.querySelector("#po-notes-input") as HTMLInputElement | null;
            if (notesInput) {
                setInputValueWithEvents(notesInput, "");
                notesInput.blur();
            }

            // Remove any lingering Joyride portal
            const portal = document.getElementById("react-joyride-portal");
            if (portal) {
                portal.style.display = "none";
                setTimeout(() => portal.remove(), 50);
            }
        }

        updateCursor({ visible: false, clicking: false, label: undefined });
    }, [clearSnapshot, updateCursor]);

    // Watchdog for abrupt stopping
    const prevIsRunningRef = useRef(isRunning);
    useEffect(() => {
        if (prevIsRunningRef.current && !isRunning) {
            cleanupAndRestore();
        }
        prevIsRunningRef.current = isRunning;
    }, [isRunning, cleanupAndRestore]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (usePurchaseTutorialStore.getState().isRunning) {
                cleanupAndRestore();
                usePurchaseTutorialStore.getState().stopTutorial();
            }
        };
    }, [cleanupAndRestore]);

    // Joyride Steps format with center placement for last step
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

    // Action executor
    const executeAction = useCallback(
        async (action: PurchaseTutorialAction) => {
            await runPurchaseAction(action, router.push);
        },
        [router]
    );


    // Handle Joyride events
    const handleJoyrideEvent = useCallback(
        async (data: EventData) => {
            const { action, index, status, type } = data;

            if (type === EVENTS.STEP_AFTER) {
                if (action === ACTIONS.NEXT) {
                    const nextIndex = index + 1;
                    if (nextIndex < tutorialSteps.length) {
                        const nextStep = tutorialSteps[nextIndex];

                        // Handle page navigation if step contains navigate action
                        if (nextStep.action?.type === "navigate") {
                            await executeAction(nextStep.action);
                        }

                        // Pre-inject mock state if next step needs conditional items
                        if (
                            nextStep.action &&
                            ["inject_po_items", "clear_po_items"].includes(nextStep.action.type)
                        ) {
                            await executeAction(nextStep.action);
                        }

                        ensureElementVisible(nextStep.target);
                        await waitForElement(nextStep.target, 2000);
                        setStepIndex(nextIndex);
                    } else {
                        cleanupAndRestore();
                        stopTutorial();
                    }
                } else if (action === ACTIONS.PREV) {
                    const prevIndex = index - 1;
                    if (prevIndex >= 0) {
                        const prevStep = tutorialSteps[prevIndex];
                        if (prevIndex < tutorialSteps.length - 1) {
                            const store = getPurchaseItemsStore("new", "po");
                            if (store.getState().items.length === 0) {
                                store.setState({
                                    items: [...MOCK_PO_ITEMS],
                                    lastUpdated: Date.now(),
                                });
                            }
                        }
                        ensureElementVisible(prevStep.target);
                        await waitForElement(prevStep.target, 2000);
                        setStepIndex(prevIndex);
                    }
                }
            }

            if (type === EVENTS.TOOLTIP) {
                const step = tutorialSteps[index];
                if (step) {
                    setTimeout(() => {
                        positionCursorAt(step.target);
                    }, 80);

                    // Execute step action (sequence, seeder typing, notes, etc.)
                    if (
                        step.action &&
                        !["clear_po_items", "navigate"].includes(step.action.type)
                    ) {
                        await executeAction(step.action);
                        setTimeout(() => {
                            positionCursorAt(step.target);
                        }, 80);
                    }
                }
            }

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
            executeAction,
            ensureElementVisible,
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
