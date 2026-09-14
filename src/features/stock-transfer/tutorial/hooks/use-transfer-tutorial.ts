"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { type Step, ACTIONS, EVENTS, STATUS, type EventData } from "react-joyride";
import { useTransferTutorialStore } from "@/stores/transfer-tutorial-store";
import { TRANSFER_TUTORIAL_STEPS } from "../steps/transfer-tutorial-steps";
import type { TransferTutorialAction } from "../types/transfer-tutorial";
import { useAppRouter } from "@/hooks/use-app-router";

import { MOCK_INCOMING_SUMMARY_UID } from "../constants/transfer-tutorial-constants";

function setInputValueWithEvents(input: HTMLInputElement | HTMLTextAreaElement, value: string) {
    const proto =
        input instanceof HTMLTextAreaElement
            ? window.HTMLTextAreaElement.prototype
            : window.HTMLInputElement.prototype;
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
    if (nativeInputValueSetter) {
        nativeInputValueSetter.call(input, value);
    } else {
        input.value = value;
    }
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
}

async function simulateTyping(el: HTMLInputElement | HTMLTextAreaElement, text: string) {
    el.focus();
    setInputValueWithEvents(el, "");
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        setInputValueWithEvents(el, el.value + char);
        await new Promise((r) => setTimeout(r, 35));
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

async function runTransferAction(
    action: TransferTutorialAction,
    routerPush: (url: string) => void
): Promise<void> {
    switch (action.type) {
        case "set_field": {
            if (typeof window !== "undefined") {
                window.dispatchEvent(
                    new CustomEvent("transfer-tutorial-set-field", {
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
                    new CustomEvent("transfer-tutorial-inject-items", {
                        detail: { items: action.items },
                    })
                );
            }
            await new Promise((r) => setTimeout(r, 200));
            break;
        }

        case "clear_items": {
            if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("transfer-tutorial-clear-items"));
            }
            await new Promise((r) => setTimeout(r, 150));
            break;
        }

        case "type_text": {
            const container = document.querySelector(action.target);
            const el = (container instanceof HTMLInputElement || container instanceof HTMLTextAreaElement
                ? container
                : container?.querySelector("input, textarea")) as HTMLInputElement | HTMLTextAreaElement | null;
            if (el) {
                useTransferTutorialStore.getState().updateCursor({ label: "Mengetik..." });
                await simulateTyping(el, action.text);
                useTransferTutorialStore.getState().updateCursor({ label: undefined });
            }
            break;
        }

        case "clear_input": {
            const container = document.querySelector(action.target);
            const el = (container instanceof HTMLInputElement || container instanceof HTMLTextAreaElement
                ? container
                : container?.querySelector("input, textarea")) as HTMLInputElement | HTMLTextAreaElement | null;
            if (el) {
                setInputValueWithEvents(el, "");
                el.blur();
            }
            break;
        }

        case "click": {
            const el = document.querySelector(action.target) as HTMLElement | null;
            if (el) {
                useTransferTutorialStore.getState().triggerCursorClick();
                await new Promise((r) => setTimeout(r, 200));
                el.click();
            }
            break;
        }

        case "navigate": {
            if (typeof window !== "undefined") {
                const current = window.location.pathname + window.location.search;
                if (current !== action.url) {
                    routerPush(action.url);
                    await new Promise((r) => setTimeout(r, 600));
                }
            }
            break;
        }

        case "wait": {
            await new Promise((r) => setTimeout(r, action.ms));
            break;
        }

        case "sequence": {
            for (const subAction of action.actions) {
                await runTransferAction(subAction, routerPush);
            }
            break;
        }
    }
}

export function useTransferTutorial() {
    const router = useAppRouter();
    const routerRef = useRef(router);
    useEffect(() => {
        routerRef.current = router;
    }, [router]);

    const activeTutorial = useTransferTutorialStore((state) => state.activeTutorial);
    const isRunning = useTransferTutorialStore((state) => state.isRunning);
    const stepIndex = useTransferTutorialStore((state) => state.stepIndex);
    const setStepIndex = useTransferTutorialStore((state) => state.setStepIndex);
    const startTutorial = useTransferTutorialStore((state) => state.startTutorial);
    const stopTutorial = useTransferTutorialStore((state) => state.stopTutorial);
    const updateCursor = useTransferTutorialStore((state) => state.updateCursor);
    const clearSnapshot = useTransferTutorialStore((state) => state.clearSnapshot);

    const tutorialSteps = useMemo(() => {
        if (!activeTutorial) return [];
        return TRANSFER_TUTORIAL_STEPS[activeTutorial] || [];
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
            const isTall = el.offsetHeight > 250;
            el.scrollIntoView({ behavior: "smooth", block: isTall ? "start" : "center" });
        }
    }, []);

    // Cleanup & Restore Snapshot
    const cleanupAndRestore = useCallback(() => {
        const snap = useTransferTutorialStore.getState().preSnapshot;
        if (snap) {
            if (typeof window !== "undefined") {
                window.dispatchEvent(
                    new CustomEvent("transfer-tutorial-restore-snapshot", {
                        detail: snap,
                    })
                );
            }
            clearSnapshot();
        } else {
            if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("transfer-tutorial-clear-items"));
            }
        }

        if (typeof window !== "undefined" && window.location.search.includes(MOCK_INCOMING_SUMMARY_UID)) {
            routerRef.current.push("/admin/request-transfer/incoming");
        }
    }, [clearSnapshot]);

    const prevIsRunningRef = useRef(isRunning);
    useEffect(() => {
        if (prevIsRunningRef.current && !isRunning) {
            cleanupAndRestore();
        }
        prevIsRunningRef.current = isRunning;
    }, [isRunning, cleanupAndRestore]);

    // Joyride Steps format
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

    const isIncomingListTarget = useCallback((target: string) => {
        return [
            "#req-incoming-list-header",
            "#req-incoming-btn-generate-link",
            "#req-incoming-filter",
            "#req-incoming-row-0",
            "#req-incoming-summary-table",
        ].includes(target);
    }, []);

    // Action executor
    const executeAction = useCallback(
        async (action: TransferTutorialAction) => {
            await runTransferAction(action, routerRef.current.push);
        },
        []
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

                        // Transition from List page to Detail page (e.g. step 4 -> step 5)
                        if (
                            isIncomingListTarget(currentStep.target) &&
                            !isIncomingListTarget(nextStep.target) &&
                            nextStep.target.startsWith("#req-incoming-")
                        ) {
                            routerRef.current.push(`/admin/request-transfer/incoming/detail?summary_uid=${MOCK_INCOMING_SUMMARY_UID}`);
                            await new Promise((r) => setTimeout(r, 600));
                        }

                        // Ensure matrix view is active if target is matrix
                        if (nextStep.target.startsWith("#req-incoming-matrix")) {
                            if (typeof window !== "undefined") {
                                window.dispatchEvent(new CustomEvent("transfer-tutorial-set-matrix-view"));
                            }
                        }

                        // Pre-inject mock state if next step needs them
                        if (
                            nextStep.action &&
                            ["inject_items", "clear_items", "set_field"].includes(nextStep.action.type)
                        ) {
                            await executeAction(nextStep.action);
                        }

                        ensureElementVisible(nextStep.target);
                        await waitForElement(nextStep.target, 2500);
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

                        // Transition BACK from Detail page to List page (e.g. step 5 -> step 4)
                        if (
                            !isIncomingListTarget(currentStep.target) &&
                            isIncomingListTarget(prevStep.target) &&
                            currentStep.target.startsWith("#req-incoming-")
                        ) {
                            routerRef.current.push("/admin/request-transfer/incoming");
                            await new Promise((r) => setTimeout(r, 600));
                        }

                        // Ensure matrix view is active if target is matrix
                        if (prevStep.target.startsWith("#req-incoming-matrix")) {
                            if (typeof window !== "undefined") {
                                window.dispatchEvent(new CustomEvent("transfer-tutorial-set-matrix-view"));
                            }
                        }

                        ensureElementVisible(prevStep.target);
                        await waitForElement(prevStep.target, 2500);
                        setStepIndex(prevIndex);
                    }
                }
            }

            if (type === EVENTS.TOOLTIP) {
                const step = tutorialSteps[index];
                if (step) {
                    if (step.target.startsWith("#req-incoming-matrix")) {
                        if (typeof window !== "undefined") {
                            window.dispatchEvent(new CustomEvent("transfer-tutorial-set-matrix-view"));
                        }
                    }

                    setTimeout(() => {
                        positionCursorAt(step.target);
                    }, 80);

                    // Execute step action
                    if (step.action && !["clear_items", "navigate"].includes(step.action.type)) {
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
