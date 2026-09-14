"use client";

import { useEffect, useRef, useCallback, useMemo } from "react";
import { useSettingsTutorialStore } from "@/stores/settings-tutorial-store";
import { SETTINGS_TUTORIAL_STEPS } from "../steps/settings-tutorial-steps";
import type { SettingsTutorialStep } from "../types/settings-tutorial";
import {
    ACTIONS,
    EVENTS,
    STATUS,
    type EventData,
    type Step,
} from "react-joyride";

export interface SettingsTutorialControls {
    resetForm?: () => void;
    setActiveTab?: (tab: string) => void;
}

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

export function useSettingsTutorial(controls: SettingsTutorialControls = {}) {
    const activeTutorial = useSettingsTutorialStore((state) => state.activeTutorial);
    const stepIndex = useSettingsTutorialStore((state) => state.stepIndex);
    const isRunning = useSettingsTutorialStore((state) => state.isRunning);

    const startTutorial = useSettingsTutorialStore((state) => state.startTutorial);
    const stopTutorial = useSettingsTutorialStore((state) => state.stopTutorial);
    const setStepIndex = useSettingsTutorialStore((state) => state.setStepIndex);
    const updateCursor = useSettingsTutorialStore((state) => state.updateCursor);

    const controlsRef = useRef(controls);
    useEffect(() => {
        controlsRef.current = controls;
    }, [controls]);

    const tutorialSteps: SettingsTutorialStep[] = useMemo(() => {
        if (!activeTutorial) return [];
        return SETTINGS_TUTORIAL_STEPS[activeTutorial] || [];
    }, [activeTutorial]);

    const positionCursorAt = useCallback(
        (targetSelector: string) => {
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
        },
        [updateCursor]
    );

    const syncTabForStep = useCallback((step?: SettingsTutorialStep) => {
        if (!step) return;

        // Switch tab if needed
        if (controlsRef.current.setActiveTab) {
            controlsRef.current.setActiveTab(step.tabId);
        } else if (typeof document !== "undefined") {
            const tabBtn = document.querySelector<HTMLButtonElement>(`#settings-tab-${step.tabId}`);
            if (tabBtn) {
                tabBtn.click();
            }
        }
    }, []);

    const cleanupAndRestore = useCallback(() => {
        // Reset form modifications made during tutorial demo
        controlsRef.current.resetForm?.();
        updateCursor({ visible: false, label: undefined });
    }, [updateCursor]);

    const prevIsRunningRef = useRef(isRunning);
    useEffect(() => {
        if (prevIsRunningRef.current && !isRunning) {
            cleanupAndRestore();
        }
        prevIsRunningRef.current = isRunning;
    }, [isRunning, cleanupAndRestore]);

    const joyrideSteps: Step[] = useMemo(() => {
        const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

        return tutorialSteps.map((s) => {
            const isOverlayNav = Boolean(s.overlayNav || s.variant === "overlay_nav" || s.variant === "banner");
            return {
                target: s.target,
                title: s.title,
                content: s.content,
                placement: isMobile && (s.placement === "left" || s.placement === "right")
                    ? "auto"
                    : (s.placement || "bottom"),
                disableBeacon: true,
                skipBeacon: true,
                skipScroll: true,
                spotlightClicks: s.spotlightClicks ?? true,
                spotlightPadding: 6,
                data: {
                    autoFill: s.autoFill,
                    overlayNav: isOverlayNav,
                    variant: s.variant || (isOverlayNav ? "overlay_nav" : "tooltip"),
                },
                floatingOptions: {
                    strategy: "fixed",
                },
                before: async () => {
                    syncTabForStep(s);

                    if (typeof document !== "undefined" && s.target && s.target !== "body") {
                        await waitForElement(s.target, 1500);
                        const el = document.querySelector(s.target);
                        if (el) {
                            el.scrollIntoView({ behavior: "auto", block: "center", inline: "center" });
                            window.dispatchEvent(new Event("resize"));
                        }
                    }

                    await new Promise((res) => setTimeout(res, 80));
                },
            };
        });
    }, [tutorialSteps, syncTabForStep]);

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

    const handleJoyrideEvent = useCallback(
        async (data: EventData) => {
            const { action, index, status, type } = data;

            if (type === EVENTS.STEP_AFTER) {
                if (action === ACTIONS.NEXT) {
                    const nextIndex = index + 1;
                    if (nextIndex < tutorialSteps.length) {
                        const nextStep = tutorialSteps[nextIndex];
                        syncTabForStep(nextStep);
                        const nextTarget = nextStep?.target;
                        if (nextTarget) {
                            await waitForElement(nextTarget, 1500);
                            const el = document.querySelector(nextTarget);
                            if (el) {
                                el.scrollIntoView({ behavior: "auto", block: "center", inline: "center" });
                                window.dispatchEvent(new Event("resize"));
                            }
                        }
                        setStepIndex(nextIndex);
                    } else {
                        cleanupAndRestore();
                        stopTutorial();
                    }
                } else if (action === ACTIONS.PREV) {
                    const prevIndex = index - 1;
                    if (prevIndex >= 0) {
                        const prevStep = tutorialSteps[prevIndex];
                        syncTabForStep(prevStep);
                        const prevTarget = prevStep?.target;
                        if (prevTarget) {
                            await waitForElement(prevTarget, 1500);
                            const el = document.querySelector(prevTarget);
                            if (el) {
                                el.scrollIntoView({ behavior: "auto", block: "center", inline: "center" });
                                window.dispatchEvent(new Event("resize"));
                            }
                        }
                        setStepIndex(prevIndex);
                    }
                }
            }

            if (type === EVENTS.TOOLTIP) {
                setStepIndex(index);
                const step = tutorialSteps[index];
                if (step) {
                    syncTabForStep(step);
                    if (typeof document !== "undefined" && step.target && step.target !== "body") {
                        const el = document.querySelector(step.target);
                        if (el) {
                            const rect = el.getBoundingClientRect();
                            if (rect.top < 80 || rect.bottom > window.innerHeight - 80 || rect.left < 10 || rect.right > window.innerWidth - 10) {
                                el.scrollIntoView({ behavior: "auto", block: "center", inline: "center" });
                                window.dispatchEvent(new Event("resize"));
                            }
                        }
                    }
                    setTimeout(() => {
                        positionCursorAt(step.target);
                    }, 80);
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
            positionCursorAt,
            setStepIndex,
            syncTabForStep,
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
