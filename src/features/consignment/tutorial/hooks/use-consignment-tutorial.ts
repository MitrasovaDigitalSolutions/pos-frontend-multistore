"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { type Step, ACTIONS, EVENTS, STATUS, type EventData } from "react-joyride";
import { useConsignmentTutorialStore } from "@/stores/consignment-tutorial-store";
import { CONSIGNMENT_TUTORIAL_STEPS } from "../steps/consignment-tutorial-steps";
import type { ConsignmentTutorialAction } from "../types/consignment-tutorial";
import { useAppRouter } from "@/hooks/use-app-router";

function setInputValueWithEvents(input: HTMLInputElement, value: string) {
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value"
    )?.set;
    if (nativeInputValueSetter) {
        nativeInputValueSetter.call(input, value);
    } else {
        input.value = value;
    }
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
}

async function simulateTyping(el: HTMLInputElement, text: string) {
    el.focus();
    setInputValueWithEvents(el, "");
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        setInputValueWithEvents(el, el.value + char);
        await new Promise((r) => setTimeout(r, 45));
    }
}

function getVisibleElement(selector: string): HTMLElement | null {
    if (typeof document === "undefined" || !selector || selector === "body") return null;

    const elements = document.querySelectorAll(selector);
    if (elements.length === 0) return null;

    for (let i = 0; i < elements.length; i++) {
        const el = elements[i] as HTMLElement;
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
            return el;
        }
    }

    return (elements[0] as HTMLElement) || null;
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

async function runConsignmentAction(
    action: ConsignmentTutorialAction,
    routerPush: (url: string) => void
): Promise<void> {
    switch (action.type) {
        case "set_field": {
            if (typeof window !== "undefined") {
                window.dispatchEvent(
                    new CustomEvent("consignment-tutorial-set-field", {
                        detail: { field: action.field, value: action.value },
                    })
                );
            }
            await new Promise((r) => setTimeout(r, 150));
            break;
        }

        case "inject_items": {
            if (typeof window !== "undefined") {
                window.dispatchEvent(
                    new CustomEvent("consignment-tutorial-inject-items", {
                        detail: { items: action.items, products: action.products },
                    })
                );
            }
            await new Promise((r) => setTimeout(r, 200));
            break;
        }

        case "clear_items": {
            if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("consignment-tutorial-clear-items"));
            }
            await new Promise((r) => setTimeout(r, 150));
            break;
        }

        case "inject_payment_mock": {
            if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("consignment-payment-tutorial-inject-mock"));
            }
            await new Promise((r) => setTimeout(r, 200));
            break;
        }

        case "clear_payment_mock": {
            if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("consignment-payment-tutorial-clear-mock"));
            }
            await new Promise((r) => setTimeout(r, 150));
            break;
        }

        case "open_payment_modal": {
            if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("consignment-payment-tutorial-open-dialog"));
            }
            await new Promise((r) => setTimeout(r, 350));
            break;
        }

        case "close_payment_modal": {
            if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("consignment-payment-tutorial-close-dialog"));
            }
            await new Promise((r) => setTimeout(r, 200));
            break;
        }

        case "set_payment_field": {
            if (typeof window !== "undefined") {
                window.dispatchEvent(
                    new CustomEvent("consignment-payment-tutorial-set-field", {
                        detail: { field: action.field, value: action.value },
                    })
                );
            }
            await new Promise((r) => setTimeout(r, 150));
            break;
        }

        case "type_text": {
            const container = document.querySelector(action.target);
            const el = (container instanceof HTMLInputElement
                ? container
                : container?.querySelector("input")) as HTMLInputElement | null;
            if (el) {
                useConsignmentTutorialStore.getState().updateCursor({ label: "Mengetik..." });
                await simulateTyping(el, action.text);
                useConsignmentTutorialStore.getState().updateCursor({ label: undefined });
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
                useConsignmentTutorialStore.getState().triggerCursorClick();
                await new Promise((r) => setTimeout(r, 200));
                el.click();
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

        case "wait": {
            await new Promise((r) => setTimeout(r, action.ms));
            break;
        }

        case "sequence": {
            for (const subAction of action.actions) {
                await runConsignmentAction(subAction, routerPush);
            }
            break;
        }
    }
}

export function useConsignmentTutorial() {
    const router = useAppRouter();
    const activeTutorial = useConsignmentTutorialStore((state) => state.activeTutorial);
    const isRunning = useConsignmentTutorialStore((state) => state.isRunning);
    const stepIndex = useConsignmentTutorialStore((state) => state.stepIndex);
    const setStepIndex = useConsignmentTutorialStore((state) => state.setStepIndex);
    const startTutorial = useConsignmentTutorialStore((state) => state.startTutorial);
    const stopTutorial = useConsignmentTutorialStore((state) => state.stopTutorial);
    const updateCursor = useConsignmentTutorialStore((state) => state.updateCursor);
    const clearSnapshot = useConsignmentTutorialStore((state) => state.clearSnapshot);

    const tutorialSteps = useMemo(() => {
        if (!activeTutorial) return [];
        return CONSIGNMENT_TUTORIAL_STEPS[activeTutorial] || [];
    }, [activeTutorial]);

    // Position virtual cursor on target element
    const positionCursorAt = useCallback(
        (targetSelector: string) => {
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
        },
        [updateCursor]
    );

    // Ensure target element is smoothly scrolled into view
    const ensureElementVisible = useCallback((targetSelector: string) => {
        if (typeof document === "undefined" || !targetSelector || targetSelector === "body") return;
        const el = getVisibleElement(targetSelector);
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, []);

    // Cleanup & Restore Snapshot
    const cleanupAndRestore = useCallback(() => {
        const snap = useConsignmentTutorialStore.getState().preSnapshot;
        if (snap) {
            if (typeof window !== "undefined") {
                window.dispatchEvent(
                    new CustomEvent("consignment-tutorial-restore-snapshot", {
                        detail: snap,
                    })
                );
            }
            clearSnapshot();
        } else {
            if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("consignment-tutorial-clear-items"));
            }
        }
        if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("consignment-payment-tutorial-close-dialog"));
            window.dispatchEvent(new CustomEvent("consignment-payment-tutorial-clear-mock"));
        }
    }, [clearSnapshot]);

    const prevIsRunningRef = useRef(isRunning);
    useEffect(() => {
        if (prevIsRunningRef.current && !isRunning) {
            cleanupAndRestore();
        }
        prevIsRunningRef.current = isRunning;
    }, [isRunning, cleanupAndRestore]);

    useEffect(() => {
        return () => {
            if (useConsignmentTutorialStore.getState().isRunning) {
                cleanupAndRestore();
                useConsignmentTutorialStore.getState().stopTutorial();
            }
        };
    }, [cleanupAndRestore]);

    // Joyride Steps format with center placement for last step
    const joyrideSteps: Step[] = useMemo(() => {
        return tutorialSteps.map((s, idx) => {
            const isLastStep = idx === tutorialSteps.length - 1;
            const isCentered = isLastStep || s.placement === "center" || s.target === "body";
            const isOverlayNav = Boolean(s.overlayNav || s.variant === "overlay_nav");

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
                data: {
                    overlayNav: isOverlayNav,
                    variant: s.variant || (isOverlayNav ? "overlay_nav" : "tooltip"),
                },
            };
        });
    }, [tutorialSteps]);

    // Action executor
    const executeAction = useCallback(
        async (action: ConsignmentTutorialAction) => {
            await runConsignmentAction(action, router.push);
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
                        const currentStep = tutorialSteps[index];
                        const nextStep = tutorialSteps[nextIndex];

                        // Handle page navigation if step contains navigate action
                        if (nextStep.action?.type === "navigate") {
                            await executeAction(nextStep.action);
                        }

                        // Pre-inject mock state if next step needs them
                        if (
                            nextStep.action &&
                            [
                                "inject_items",
                                "clear_items",
                                "set_field",
                                "inject_payment_mock",
                                "clear_payment_mock",
                                "set_payment_field",
                            ].includes(nextStep.action.type)
                        ) {
                            await executeAction(nextStep.action);
                        }

                        // Open dialog only when entering dialog steps from a non-dialog step
                        const isEnteringDialog =
                            nextStep.target.startsWith("#cons-dialog-") &&
                            !currentStep.target.startsWith("#cons-dialog-");
                        if (isEnteringDialog) {
                            await executeAction({ type: "open_payment_modal" });
                            await new Promise((r) => setTimeout(r, 350));
                        }

                        // Close dialog when leaving dialog steps to a non-dialog step (e.g. final step)
                        const isLeavingDialog =
                            currentStep.target.startsWith("#cons-dialog-") &&
                            !nextStep.target.startsWith("#cons-dialog-");
                        if (isLeavingDialog) {
                            await executeAction({ type: "close_payment_modal" });
                            await new Promise((r) => setTimeout(r, 200));
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
                        const currentStep = tutorialSteps[index];
                        const prevStep = tutorialSteps[prevIndex];

                        // Close dialog when going BACK from dialog step to non-dialog step
                        const isExitingDialogBackwards =
                            currentStep.target.startsWith("#cons-dialog-") &&
                            !prevStep.target.startsWith("#cons-dialog-");
                        if (isExitingDialogBackwards) {
                            await executeAction({ type: "close_payment_modal" });
                            await new Promise((r) => setTimeout(r, 200));
                        }

                        // Re-open dialog when going BACK from non-dialog step into dialog step
                        const isReEnteringDialogBackwards =
                            !currentStep.target.startsWith("#cons-dialog-") &&
                            prevStep.target.startsWith("#cons-dialog-");
                        if (isReEnteringDialogBackwards) {
                            await executeAction({ type: "open_payment_modal" });
                            await new Promise((r) => setTimeout(r, 350));
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

                    // Execute step action
                    if (
                        step.action &&
                        ![
                            "clear_items",
                            "clear_payment_mock",
                            "open_payment_modal",
                            "close_payment_modal",
                            "navigate",
                        ].includes(step.action.type)
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
