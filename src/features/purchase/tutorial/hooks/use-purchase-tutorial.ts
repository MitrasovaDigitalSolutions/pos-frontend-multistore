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
import {
    isMockPurchaseItem,
    MOCK_PO_ITEMS,
    MOCK_PO_NOTES,
    MOCK_RECEIVING_ITEMS,
    MOCK_RETURN_ITEMS,
} from "../constants/purchase-tutorial-constants";
import { useAppRouter } from "@/hooks/use-app-router";

function getVisibleElement(selector: string): Element | null {
    if (typeof document === "undefined") return null;
    if (!selector || selector === "body") return document.body;

    const elements = document.querySelectorAll(selector);
    if (elements.length === 0) return null;

    // Prioritize element with visible bounding rect (> 0)
    for (let i = 0; i < elements.length; i++) {
        const el = elements[i];
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
            return el;
        }
    }

    return elements[0] || null;
}

async function waitForElement(selector: string, timeout = 2500): Promise<Element | null> {
    if (typeof document === "undefined") return null;
    if (selector === "body") return document.body;
    const start = Date.now();
    while (Date.now() - start < timeout) {
        const el = getVisibleElement(selector);
        if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) return el;
        }
        await new Promise((r) => setTimeout(r, 50));
    }
    return getVisibleElement(selector);
}

async function runPurchaseAction(
    action: PurchaseTutorialAction,
    routerPush: (url: string) => void
): Promise<void> {
    const poStore = getPurchaseItemsStore("new", "po");
    const recStore = getPurchaseItemsStore("new", "receiving");
    const retStore = getPurchaseItemsStore("new", "return");

    switch (action.type) {
        case "inject_po_items": {
            poStore.setState({
                items: [...action.items],
                lastUpdated: Date.now(),
            });
            break;
        }

        case "clear_po_items": {
            poStore.getState().clearAll();
            break;
        }

        case "inject_receiving_items": {
            recStore.setState({
                items: [...action.items],
                lastUpdated: Date.now(),
            });
            break;
        }

        case "clear_receiving_items": {
            recStore.getState().clearAll();
            break;
        }

        case "inject_return_items": {
            retStore.setState({
                items: action.items && action.items.length > 0 ? [...action.items] : [...MOCK_RETURN_ITEMS],
                lastUpdated: Date.now(),
            });
            break;
        }

        case "clear_return_items": {
            retStore.getState().clearAll();
            break;
        }

        case "set_return_field": {
            if (typeof window !== "undefined") {
                window.dispatchEvent(
                    new CustomEvent("purchase-tutorial-set-return-field", {
                        detail: { field: action.field, value: action.value },
                    })
                );
            }
            await new Promise((r) => setTimeout(r, 150));
            break;
        }

        case "open_dialog": {
            usePurchaseTutorialStore.getState().setActiveDialog(action.dialog);
            await new Promise((r) => setTimeout(r, 150));
            break;
        }

        case "close_dialog": {
            usePurchaseTutorialStore.getState().setActiveDialog(null);
            await new Promise((r) => setTimeout(r, 150));
            break;
        }

        case "set_payment_field": {
            if (typeof window !== "undefined") {
                window.dispatchEvent(
                    new CustomEvent("purchase-tutorial-set-payment-field", {
                        detail: { field: action.field, value: action.value },
                    })
                );
            }
            await new Promise((r) => setTimeout(r, 150));
            break;
        }

        case "inject_payment_data": {
            if (typeof window !== "undefined") {
                window.dispatchEvent(
                    new CustomEvent("purchase-tutorial-inject-payment-data", {
                        detail: action.data,
                    })
                );
            }
            await new Promise((r) => setTimeout(r, 150));
            break;
        }

        case "clear_payment_data": {
            if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("purchase-tutorial-clear-payment-data"));
            }
            await new Promise((r) => setTimeout(r, 150));
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
        const el = getVisibleElement(targetSelector);
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

    // Ensure target element is scrolled into view immediately
    const ensureElementVisible = useCallback((targetSelector: string) => {
        if (typeof document === "undefined" || !targetSelector || targetSelector === "body") return;
        const el = getVisibleElement(targetSelector);
        if (el) {
            el.scrollIntoView({ behavior: "auto", block: "center", inline: "center" });
            window.dispatchEvent(new Event("resize"));
        }
    }, []);

    // Cleanup & Restore Snapshot
    const cleanupAndRestore = useCallback(() => {
        const activeTut = usePurchaseTutorialStore.getState().activeTutorial;

        if (activeTut === "po_create" || activeTut === "receiving_create" || activeTut === "return_create") {
            const scope = activeTut === "receiving_create" ? "receiving" : activeTut === "return_create" ? "return" : "po";
            const snap = usePurchaseTutorialStore.getState().preSnapshot;
            const store = getPurchaseItemsStore("new", scope);

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
                const currentHeader = store.getState().headerData;
                const isMockCatatan = currentHeader?.catatan === MOCK_PO_NOTES || currentHeader?.catatan?.includes("Mohon dikirim sebelum hari Jumat");
                store.setState({
                    items: cleanItems,
                    ...(isMockCatatan ? { headerData: null } : {}),
                    lastUpdated: Date.now(),
                });
            }
        }

        if (activeTut === "payment_create") {
            if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("purchase-tutorial-clear-payment-data"));
            }
            clearSnapshot();
        }

        if (activeTut === "return_create") {
            if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("purchase-tutorial-clear-return-data"));
            }
        }

        // Clean up DOM input fields
        if (typeof document !== "undefined") {
            const poNotesInput = document.querySelector("#po-notes-input") as HTMLInputElement | null;
            if (poNotesInput) {
                setInputValueWithEvents(poNotesInput, "");
                poNotesInput.blur();
            }

            const recBarcodeInput = document.querySelector("#rec-barcode-input") as HTMLInputElement | null;
            if (recBarcodeInput) {
                setInputValueWithEvents(recBarcodeInput, "");
                recBarcodeInput.blur();
            }

            const payRefInput = document.querySelector("#pay-ref-input") as HTMLInputElement | null;
            if (payRefInput) {
                setInputValueWithEvents(payRefInput, "");
                payRefInput.blur();
            }

            const payNotesInput = document.querySelector("#pay-notes-input") as HTMLInputElement | null;
            if (payNotesInput) {
                setInputValueWithEvents(payNotesInput, "");
                payNotesInput.blur();
            }

            const retNotesInput = document.querySelector("#ret-notes-input") as HTMLInputElement | null;
            if (retNotesInput) {
                setInputValueWithEvents(retNotesInput, "");
                retNotesInput.blur();
            }

            // Remove any lingering Joyride portal
            const portal = document.getElementById("react-joyride-portal");
            if (portal) {
                portal.style.display = "none";
                setTimeout(() => portal.remove(), 50);
            }
        }

        usePurchaseTutorialStore.getState().setActiveDialog(null);
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
        const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

        return tutorialSteps.map((s, idx) => {
            const isLastStep = idx === tutorialSteps.length - 1;
            const isCentered = isLastStep || s.placement === "center" || s.target === "body";
            const isOverlayNav = Boolean(s.overlayNav || s.variant === "overlay_nav" || s.variant === "banner");

            return {
                target: isCentered ? "body" : s.target,
                title: s.title,
                content: s.content,
                placement: isCentered
                    ? ("center" as const)
                    : isMobile && (s.placement === "left" || s.placement === "right")
                    ? "auto"
                    : (s.placement || "bottom"),
                skipBeacon: true,
                disableBeacon: true,
                skipScroll: true,
                spotlightClicks: false,
                floatingOptions: {
                    strategy: "fixed",
                },
                data: {
                    overlayNav: isOverlayNav,
                    variant: s.variant || (isOverlayNav ? "overlay_nav" : "tooltip"),
                },
            };
        });
    }, [tutorialSteps]);

    // Keep Joyride spotlight in sync with mobile/tablet scroll in <main> and inner containers
    useEffect(() => {
        if (!isRunning) return;
        const handleScroll = () => {
            window.dispatchEvent(new Event("resize"));
        };
        window.addEventListener("scroll", handleScroll, { capture: true, passive: true });
        return () => {
            window.removeEventListener("scroll", handleScroll, { capture: true });
        };
    }, [isRunning]);

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

                        // Pre-inject mock state or handle dialogs if next step needs them
                        if (
                            nextStep.action &&
                            [
                                "inject_po_items",
                                "clear_po_items",
                                "inject_receiving_items",
                                "clear_receiving_items",
                                "inject_return_items",
                                "clear_return_items",
                                "set_payment_field",
                                "inject_payment_data",
                                "clear_payment_data",
                                "set_return_field",
                                "open_dialog",
                                "close_dialog",
                            ].includes(nextStep.action.type)
                        ) {
                            await executeAction(nextStep.action);
                        } else if (
                            usePurchaseTutorialStore.getState().activeDialog &&
                            !nextStep.target.includes("dialog") &&
                            !nextStep.target.includes("finalize") &&
                            !nextStep.target.includes("price-alert")
                        ) {
                            usePurchaseTutorialStore.getState().setActiveDialog(null);
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

                        if (prevStep.action?.type === "open_dialog") {
                            await executeAction(prevStep.action);
                        } else if (
                            usePurchaseTutorialStore.getState().activeDialog &&
                            !prevStep.target.includes("dialog") &&
                            !prevStep.target.includes("finalize") &&
                            !prevStep.target.includes("price-alert")
                        ) {
                            usePurchaseTutorialStore.getState().setActiveDialog(null);
                        }

                        if (prevIndex < tutorialSteps.length - 1) {
                            const activeTut = usePurchaseTutorialStore.getState().activeTutorial;
                            const scope = activeTut === "receiving_create" ? "receiving" : activeTut === "return_create" ? "return" : "po";
                            const store = getPurchaseItemsStore("new", scope);
                            if (store.getState().items.length === 0) {
                                store.setState({
                                    items: scope === "receiving" ? [...MOCK_RECEIVING_ITEMS] : scope === "return" ? [...MOCK_RETURN_ITEMS] : [...MOCK_PO_ITEMS],
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
                        !["clear_po_items", "clear_receiving_items", "clear_return_items", "clear_payment_data", "navigate"].includes(step.action.type)
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
