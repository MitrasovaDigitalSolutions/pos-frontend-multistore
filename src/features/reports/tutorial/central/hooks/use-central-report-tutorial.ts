"use client";

import { useEffect, useRef, useCallback, useMemo } from "react";
import { useCentralReportTutorialStore } from "@/stores/central-report-tutorial-store";
import { CENTRAL_REPORT_TUTORIAL_STEPS } from "../steps/central-report-tutorial-steps";
import type { CentralReportTutorialStep } from "../types/central-report-tutorial";
import {
    ACTIONS,
    EVENTS,
    STATUS,
    type EventData,
    type Step,
} from "react-joyride";

function getVisibleElement(selector: string): Element | null {
    if (typeof document === "undefined" || !selector) return null;
    if (selector === "body") return document.body;
    const elements = Array.from(document.querySelectorAll(selector));
    if (elements.length === 0) return null;

    const visible = elements.find((el) => {
        if (!(el instanceof HTMLElement || el instanceof SVGElement)) return false;
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) return false;
        if (el instanceof HTMLElement && el.offsetParent === null && window.getComputedStyle(el).position !== "fixed") {
            return false;
        }
        return true;
    });

    return visible || elements[0];
}

function triggerSimulateClick(target: string | { selector: string }) {
    if (typeof document === "undefined") return;
    const selector = typeof target === "string" ? target : target?.selector;
    if (!selector) return;
    const el = getVisibleElement(selector) as HTMLElement | null;
    if (el) {
        const isInteractive = el.matches("button, a, input, select, textarea, [role='button']");
        const clickTarget = isInteractive
            ? el
            : el.querySelector<HTMLElement>("button, a, input, [role='button'], select, textarea") || el;
        clickTarget.click();
    }
}

function scrollTargetIntoView(selector: string, preferredPlacement?: string) {
    if (typeof document === "undefined" || !selector || selector === "body") return;
    const el = document.querySelector<HTMLElement>(selector);
    if (!el) return;

    let parent = el.parentElement;
    while (parent && parent !== document.body) {
        const style = window.getComputedStyle(parent);
        const overflowY = style.overflowY;
        const isScrollableY =
            (overflowY === "auto" || overflowY === "scroll") &&
            parent.scrollHeight > parent.clientHeight;

        if (isScrollableY) {
            const parentRect = parent.getBoundingClientRect();
            const elRect = el.getBoundingClientRect();

            if (preferredPlacement === "bottom") {
                const topDiff = elRect.top - parentRect.top;
                if (topDiff > 140 || topDiff < 0) {
                    parent.scrollTo({
                        top: parent.scrollTop + topDiff - 24,
                        behavior: "smooth",
                    });
                }
            } else if (preferredPlacement === "top") {
                const bottomDiff = parentRect.bottom - elRect.bottom;
                if (bottomDiff > 140 || bottomDiff < 0) {
                    parent.scrollTo({
                        top: parent.scrollTop - (bottomDiff - 24),
                        behavior: "smooth",
                    });
                }
            }
            break;
        }
        parent = parent.parentElement;
    }
}

export function useCentralReportTutorial() {
    const activeTutorial = useCentralReportTutorialStore((state) => state.activeTutorial);
    const stepIndex = useCentralReportTutorialStore((state) => state.stepIndex);
    const isRunning = useCentralReportTutorialStore((state) => state.isRunning);

    const startTutorial = useCentralReportTutorialStore((state) => state.startTutorial);
    const stopTutorial = useCentralReportTutorialStore((state) => state.stopTutorial);
    const setStepIndex = useCentralReportTutorialStore((state) => state.setStepIndex);
    const updateCursor = useCentralReportTutorialStore((state) => state.updateCursor);
    const triggerCursorClick = useCentralReportTutorialStore((state) => state.triggerCursorClick);

    const isTransitioningRef = useRef(false);

    const rawSteps: CentralReportTutorialStep[] = useMemo(() => {
        if (!activeTutorial) return [];
        return CENTRAL_REPORT_TUTORIAL_STEPS;
    }, [activeTutorial]);

    // Handle cursor simulation when step specifies simulateClick
    useEffect(() => {
        if (!isRunning || rawSteps.length === 0) return;
        const currentStep = rawSteps[stepIndex];
        if (!currentStep) return;

        if (currentStep.simulateClick) {
            const selector =
                typeof currentStep.simulateClick === "string"
                    ? currentStep.simulateClick
                    : currentStep.simulateClick.selector;

            const timer = setTimeout(() => {
                const el = getVisibleElement(selector);
                if (el) {
                    const rect = el.getBoundingClientRect();
                    const targetX = rect.left + rect.width / 2;
                    const targetY = rect.top + rect.height / 2;

                    updateCursor({
                        x: targetX,
                        y: targetY,
                        visible: true,
                        clicking: false,
                        label: "Klik otomatis",
                    });

                    setTimeout(() => {
                        triggerCursorClick();
                        triggerSimulateClick(currentStep.simulateClick!);
                        setTimeout(() => {
                            updateCursor({ visible: false });
                        }, 500);
                    }, 400);
                }
            }, 300);

            return () => clearTimeout(timer);
        } else {
            updateCursor({ visible: false });
        }
    }, [stepIndex, isRunning, rawSteps, updateCursor, triggerCursorClick]);

    // Smoothly scroll target element into viewport within scrollable main container
    useEffect(() => {
        if (!isRunning || rawSteps.length === 0) return;
        const currentStep = rawSteps[stepIndex];
        if (!currentStep || currentStep.target === "body") return;

        const timer = setTimeout(() => {
            scrollTargetIntoView(currentStep.target, currentStep.placement);
        }, 100);

        return () => clearTimeout(timer);
    }, [stepIndex, isRunning, rawSteps]);

    const joyrideSteps: Step[] = useMemo(() => {
        return rawSteps.map((step) => {
            const isBody = step.target === "body";
            const isOverlayNav = Boolean(step.overlayNav || step.variant === "overlay_nav");
            return {
                target: step.target,
                title: step.title,
                content: step.content,
                placement: step.placement || "bottom",
                disableBeacon: true,
                skipBeacon: true,
                spotlightClicks: step.spotlightClicks ?? false,
                spotlightPadding: 6,
                disableOverlayClose: true,
                hideCloseButton: true,
                hideBackButton: stepIndex === 0 || step.showBack === false,
                data: {
                    rawStep: step,
                    isBody,
                    overlayNav: isOverlayNav,
                    variant: step.variant || (isOverlayNav ? "overlay_nav" : "tooltip"),
                    isLastStep: step.isLastStep,
                    nextLabel: step.nextLabel,
                    showNext: step.showNext,
                    showBack: step.showBack,
                    simulateClick: step.simulateClick,
                },
            };
        });
    }, [rawSteps, stepIndex]);

    const handleJoyrideEvent = useCallback(
        (data: EventData) => {
            const { action, index, status, type } = data;

            if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
                stopTutorial();
                return;
            }

            if (type === EVENTS.STEP_AFTER) {
                if (action === ACTIONS.NEXT) {
                    const nextIdx = index + 1;
                    if (nextIdx >= rawSteps.length) {
                        stopTutorial();
                    } else {
                        setStepIndex(nextIdx);
                    }
                } else if (action === ACTIONS.PREV) {
                    setStepIndex(Math.max(0, index - 1));
                } else if (action === ACTIONS.CLOSE) {
                    stopTutorial();
                }
            } else if (type === EVENTS.TARGET_NOT_FOUND) {
                if (!isTransitioningRef.current) {
                    // Advance to next if element not found
                    if (index + 1 < rawSteps.length) {
                        setStepIndex(index + 1);
                    } else {
                        stopTutorial();
                    }
                }
            }
        },
        [rawSteps.length, setStepIndex, stopTutorial]
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
