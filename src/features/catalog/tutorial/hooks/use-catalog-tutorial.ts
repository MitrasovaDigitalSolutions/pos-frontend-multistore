"use client";

import { useEffect, useRef, useCallback, useMemo } from "react";
import { useCatalogTutorialStore } from "@/stores/catalog-tutorial-store";
import {
    CATALOG_CREATE_TUTORIAL_STEPS,
    CATALOG_ASSIGN_TUTORIAL_STEPS,
} from "../steps";
import type { CatalogTutorialStep } from "../types/catalog-tutorial";
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

function scrollTargetIntoView(selector: string) {
    if (typeof document === "undefined" || !selector || selector === "body") return;
    const el = document.querySelector<HTMLElement>(selector);
    if (!el) return;

    let parent = el.parentElement;
    while (parent) {
        const isViewport = parent.hasAttribute("data-slot") && parent.getAttribute("data-slot") === "scrollable-viewport";
        const isMain = parent.tagName.toLowerCase() === "main";
        const style = window.getComputedStyle(parent);
        const overflowY = style.overflowY;
        const isScrollableY =
            isViewport ||
            isMain ||
            ((overflowY === "auto" || overflowY === "scroll") && parent.scrollHeight > parent.clientHeight);

        if (isScrollableY && parent.scrollHeight > parent.clientHeight) {
            const parentRect = parent.getBoundingClientRect();
            const elRect = el.getBoundingClientRect();

            const isClippedTop = elRect.top < parentRect.top;
            const isClippedBottom = elRect.bottom > parentRect.bottom;

            if (isClippedTop) {
                parent.scrollTo({
                    top: parent.scrollTop + (elRect.top - parentRect.top) - 24,
                    behavior: "smooth",
                });
            } else if (isClippedBottom) {
                parent.scrollTo({
                    top: parent.scrollTop + (elRect.bottom - parentRect.bottom) + 24,
                    behavior: "smooth",
                });
            }
            break;
        }
        if (parent === document.body) break;
        parent = parent.parentElement;
    }
}

export function useCatalogTutorial() {
    const activeTutorial = useCatalogTutorialStore((state) => state.activeTutorial);
    const stepIndex = useCatalogTutorialStore((state) => state.stepIndex);
    const isRunning = useCatalogTutorialStore((state) => state.isRunning);

    const startTutorial = useCatalogTutorialStore((state) => state.startTutorial);
    const stopTutorial = useCatalogTutorialStore((state) => state.stopTutorial);
    const setStepIndex = useCatalogTutorialStore((state) => state.setStepIndex);
    const updateCursor = useCatalogTutorialStore((state) => state.updateCursor);
    const triggerCursorClick = useCatalogTutorialStore((state) => state.triggerCursorClick);

    const isTransitioningRef = useRef(false);

    const rawSteps: CatalogTutorialStep[] = useMemo(() => {
        if (!activeTutorial) return [];
        if (activeTutorial === "pembuatan_katalog") {
            return CATALOG_CREATE_TUTORIAL_STEPS;
        }
        if (activeTutorial === "distribusi_toko") {
            return CATALOG_ASSIGN_TUTORIAL_STEPS;
        }
        return [];
    }, [activeTutorial]);

    // Keep joyride spotlight position synchronized when any container scrolls,
    // and forward mouse wheel scrolling over Joyride overlay to active modal viewport
    useEffect(() => {
        if (!isRunning) return;
        const handleScroll = () => {
            window.dispatchEvent(new Event("resize"));
        };
        const handleWheel = (e: WheelEvent) => {
            const target = e.target as HTMLElement | null;
            if (!target) return;
            if (target.closest(".react-joyride__overlay")) {
                const scrollViewport = document.querySelector<HTMLElement>(
                    "#catalog-assign-form [data-slot='scrollable-viewport'], #product-form-scrollable [data-slot='scrollable-viewport'], [data-slot='scrollable-viewport']"
                );
                if (scrollViewport) {
                    scrollViewport.scrollTop += e.deltaY;
                }
            }
        };
        window.addEventListener("scroll", handleScroll, { capture: true, passive: true });
        window.addEventListener("wheel", handleWheel, { passive: true });
        return () => {
            window.removeEventListener("scroll", handleScroll, { capture: true });
            window.removeEventListener("wheel", handleWheel);
        };
    }, [isRunning]);

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

    // Smoothly scroll target elements into viewport for each tutorial phase
    useEffect(() => {
        if (!isRunning || rawSteps.length === 0) return;
        const currentStep = rawSteps[stepIndex];
        if (!currentStep || currentStep.target === "body") return;

        // Step 1 of distribution tutorial: Scroll <main> down so sample row is comfortably in view
        if (currentStep.id === "cat-assign-step-1") {
            const timer = setTimeout(() => {
                const rowEl = document.querySelector<HTMLElement>("#catalog-table-sample-row");
                const mainEl = document.querySelector<HTMLElement>("main") || document.documentElement;
                if (rowEl && mainEl) {
                    const rowRect = rowEl.getBoundingClientRect();
                    const mainRect = mainEl.getBoundingClientRect();
                    // Position sample row around 130px below top of main
                    const targetScroll = mainEl.scrollTop + (rowRect.top - mainRect.top) - 130;
                    mainEl.scrollTo({
                        top: Math.max(0, targetScroll),
                        behavior: "smooth",
                    });
                    setTimeout(() => {
                        window.dispatchEvent(new Event("resize"));
                    }, 300);
                }
            }, 100);
            return () => clearTimeout(timer);
        }

        // Steps 3 & 4 of distribution tutorial: Ensure modal dialog viewport is at top (scrollTop: 0)
        if (currentStep.id === "cat-assign-step-3" || currentStep.id === "cat-assign-step-4") {
            const timer = setTimeout(() => {
                const scrollViewport = document.querySelector<HTMLElement>(
                    "#catalog-assign-form [data-slot='scrollable-viewport'], #catalog-assign-form .overflow-y-auto"
                );
                if (scrollViewport) {
                    scrollViewport.scrollTo({ top: 0, behavior: "smooth" });
                    setTimeout(() => {
                        window.dispatchEvent(new Event("resize"));
                    }, 200);
                }
            }, 80);
            return () => clearTimeout(timer);
        }

        // Step 5 of distribution tutorial: Scroll modal viewport down so global wholesale scheme is in view
        if (currentStep.id === "cat-assign-step-5") {
            const timer = setTimeout(() => {
                const el = document.querySelector<HTMLElement>("#catalog-assign-global-wholesale");
                const scrollViewport = document.querySelector<HTMLElement>(
                    "#catalog-assign-form [data-slot='scrollable-viewport'], #catalog-assign-form .overflow-y-auto"
                );
                if (el && scrollViewport) {
                    const elRect = el.getBoundingClientRect();
                    const viewportRect = scrollViewport.getBoundingClientRect();
                    const targetScroll = scrollViewport.scrollTop + (elRect.top - viewportRect.top) - 35;
                    scrollViewport.scrollTo({
                        top: Math.max(0, targetScroll),
                        behavior: "smooth",
                    });
                    setTimeout(() => {
                        window.dispatchEvent(new Event("resize"));
                    }, 250);
                }
            }, 80);
            return () => clearTimeout(timer);
        }

        // Step 6 of distribution tutorial: Scroll modal viewport down so store toolbar & search are in view
        if (currentStep.id === "cat-assign-step-6") {
            const timer = setTimeout(() => {
                const el = document.querySelector<HTMLElement>("#catalog-assign-stores-toolbar");
                const scrollViewport = document.querySelector<HTMLElement>(
                    "#catalog-assign-form [data-slot='scrollable-viewport'], #catalog-assign-form .overflow-y-auto"
                );
                if (el && scrollViewport) {
                    const elRect = el.getBoundingClientRect();
                    const viewportRect = scrollViewport.getBoundingClientRect();
                    const targetScroll = scrollViewport.scrollTop + (elRect.top - viewportRect.top) - 35;
                    scrollViewport.scrollTo({
                        top: Math.max(0, targetScroll),
                        behavior: "smooth",
                    });
                    setTimeout(() => {
                        window.dispatchEvent(new Event("resize"));
                    }, 250);
                }
            }, 80);
            return () => clearTimeout(timer);
        }

        // Steps 7, 8 & 9 of distribution tutorial: Scroll modal viewport down so store row, preview and custom button are in view
        if (
            currentStep.id === "cat-assign-step-7" ||
            currentStep.id === "cat-assign-step-8" ||
            currentStep.id === "cat-assign-step-9"
        ) {
            const timer = setTimeout(() => {
                const rowEl = document.querySelector<HTMLElement>("#catalog-assign-store-row-sample");
                const scrollViewport = document.querySelector<HTMLElement>(
                    "#catalog-assign-form [data-slot='scrollable-viewport'], #catalog-assign-form .overflow-y-auto"
                );
                if (rowEl && scrollViewport) {
                    const rowRect = rowEl.getBoundingClientRect();
                    const viewportRect = scrollViewport.getBoundingClientRect();
                    const targetScroll = scrollViewport.scrollTop + (rowRect.top - viewportRect.top) - 45;
                    scrollViewport.scrollTo({
                        top: Math.max(0, targetScroll),
                        behavior: "smooth",
                    });
                    setTimeout(() => {
                        window.dispatchEvent(new Event("resize"));
                    }, 250);
                }
            }, 100);
            return () => clearTimeout(timer);
        }

        // Step 10 of distribution tutorial: Scroll modal viewport down so custom form accordion is in view
        if (currentStep.id === "cat-assign-step-10") {
            const timer = setTimeout(() => {
                const formEl = document.querySelector<HTMLElement>("#catalog-assign-store-custom-form-sample");
                const scrollViewport = document.querySelector<HTMLElement>(
                    "#catalog-assign-form [data-slot='scrollable-viewport'], #catalog-assign-form .overflow-y-auto"
                );
                if (formEl && scrollViewport) {
                    const formRect = formEl.getBoundingClientRect();
                    const viewportRect = scrollViewport.getBoundingClientRect();
                    const targetScroll = scrollViewport.scrollTop + (formRect.top - viewportRect.top) - 30;
                    scrollViewport.scrollTo({
                        top: Math.max(0, targetScroll),
                        behavior: "smooth",
                    });
                    setTimeout(() => {
                        window.dispatchEvent(new Event("resize"));
                    }, 250);
                }
            }, 150);
            return () => clearTimeout(timer);
        }

        if (currentStep.skipScroll) {
            return;
        }

        const timer = setTimeout(() => {
            scrollTargetIntoView(currentStep.target);
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
                skipScroll: true,
                disableScrolling: true,
                spotlightClicks: step.spotlightClicks ?? false,
                spotlightPadding: 6,
                disableOverlayClose: true,
                hideCloseButton: true,
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
    }, [rawSteps]);

    const handleJoyrideEvent = useCallback(
        (data: EventData) => {
            const { action, index, status, type } = data;

            if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
                stopTutorial();
                return;
            }

            if (type === EVENTS.STEP_AFTER) {
                if (action === ACTIONS.NEXT) {
                    if (index < rawSteps.length - 1) {
                        setStepIndex(index + 1);
                    } else {
                        stopTutorial();
                    }
                } else if (action === ACTIONS.PREV) {
                    if (index > 0) {
                        setStepIndex(index - 1);
                    }
                } else if (action === ACTIONS.CLOSE) {
                    stopTutorial();
                }
            } else if (type === EVENTS.TARGET_NOT_FOUND) {
                const current = rawSteps[index];
                if (current?.fallbackTarget && !isTransitioningRef.current) {
                    isTransitioningRef.current = true;
                    setTimeout(() => {
                        isTransitioningRef.current = false;
                    }, 500);
                }
            }
        },
        [rawSteps, setStepIndex, stopTutorial]
    );

    return {
        activeTutorial,
        isRunning,
        stepIndex,
        rawSteps,
        joyrideSteps,
        startTutorial,
        stopTutorial,
        setStepIndex,
        handleJoyrideEvent,
    };
}
